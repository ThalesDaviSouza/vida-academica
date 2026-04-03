import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Atividade, Prova } from '../models';
import {
  notificacoesRepository,
  NotificacaoTipo,
} from '../storage/notificacoesRepository';

let notificationsEnabled: boolean | null = null;

const ANDROID_CHANNEL_ID = 'default';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function initNotifications(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
        name: 'Default',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const current = await Notifications.getPermissionsAsync();
    if (current.status === 'granted') {
      notificationsEnabled = true;
      return true;
    }

    const requested = await Notifications.requestPermissionsAsync();
    notificationsEnabled = requested.status === 'granted';
    return notificationsEnabled;
  } catch {
    notificationsEnabled = false;
    return false;
  }
}

async function ensureEnabled(): Promise<boolean> {
  if (notificationsEnabled != null) return notificationsEnabled;
  return initNotifications();
}

async function scheduleInSeconds(
  secondsFromNow: number,
  content: Notifications.NotificationContentInput,
  minSeconds: number = 60
): Promise<{ expoId: string; fireAt: string } | null> {
  if (secondsFromNow <= minSeconds) return null;
  const enabled = await ensureEnabled();
  if (!enabled) return null;

  const expoId = await Notifications.scheduleNotificationAsync({
    content,
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.floor(secondsFromNow),
      repeats: false,
    },
  });

  const fireAt = new Date(Date.now() + secondsFromNow * 1000).toISOString();
  return { expoId, fireAt };
}

function secondsUntil(date: Date): number {
  return (date.getTime() - Date.now()) / 1000;
}

function dateAtLocalTime(isoDate: string, hour: number, minute: number): Date {
  // Local time (no TZ suffix) so it respects device timezone.
  const hh = String(hour).padStart(2, '0');
  const mm = String(minute).padStart(2, '0');
  return new Date(`${isoDate}T${hh}:${mm}:00`);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export async function cancelNotificationsByRef(
  tipo: NotificacaoTipo,
  refId: string
): Promise<void> {
  const existing = notificacoesRepository.getByTipoRef(tipo, refId);

  for (const row of existing) {
    try {
      await Notifications.cancelScheduledNotificationAsync(row.expoId);
    } catch {
      // ignore (already delivered/cancelled)
    } finally {
      notificacoesRepository.deleteByExpoId(row.expoId);
    }
  }
}

export async function scheduleAtividadeNotifications(atividade: Atividade): Promise<void> {
  const refId = atividade.id;

  await cancelNotificationsByRef('atividade_prazo', refId);
  if (atividade.status !== 'pendente') return;
  if (!atividade.dataEntrega) return;

  const dueAt = dateAtLocalTime(atividade.dataEntrega, 9, 0);
  const dayBefore = addDays(dueAt, -1);

  const baseTitle = 'Atividade';
  const bodyDue = `${atividade.titulo} vence hoje`;
  const bodyBefore = `${atividade.titulo} vence amanha`;

  const scheduled1 = await scheduleInSeconds(secondsUntil(dayBefore), {
    title: baseTitle,
    body: bodyBefore,
    data: { tipo: 'atividade', atividadeId: atividade.id },
  });
  if (scheduled1) {
    notificacoesRepository.insert('atividade_prazo', refId, scheduled1.expoId, scheduled1.fireAt);
  }

  const scheduled2 = await scheduleInSeconds(secondsUntil(dueAt), {
    title: baseTitle,
    body: bodyDue,
    data: { tipo: 'atividade', atividadeId: atividade.id },
  });
  if (scheduled2) {
    notificacoesRepository.insert('atividade_prazo', refId, scheduled2.expoId, scheduled2.fireAt);
  }
}

export async function scheduleProvaNotifications(prova: Prova): Promise<void> {
  const refId = prova.id;

  await cancelNotificationsByRef('prova_data', refId);
  if (!prova.data) return;

  const provaAt = dateAtLocalTime(prova.data, 9, 0);
  const dayBefore = addDays(provaAt, -1);

  const title = 'Prova';
  const bodyBefore = `Acontece amanha (${prova.tipo})`;
  const bodyToday = `E hoje (${prova.tipo})`;

  const scheduled1 = await scheduleInSeconds(secondsUntil(dayBefore), {
    title,
    body: bodyBefore,
    data: { tipo: 'prova', provaId: prova.id },
  });
  if (scheduled1) {
    notificacoesRepository.insert('prova_data', refId, scheduled1.expoId, scheduled1.fireAt);
  }

  const scheduled2 = await scheduleInSeconds(secondsUntil(provaAt), {
    title,
    body: bodyToday,
    data: { tipo: 'prova', provaId: prova.id },
  });
  if (scheduled2) {
    notificacoesRepository.insert('prova_data', refId, scheduled2.expoId, scheduled2.fireAt);
  }
}

export async function notifyFrequenciaRiscoOnce(
  refId: string,
  materiaNome: string,
  percentualFaltas: number
): Promise<void> {
  const latest = notificacoesRepository.getLatestByTipoRef('frequencia_risco', refId);
  if (latest) {
    // Avoid spamming: one alert per day for the same refId.
    const today = new Date().toISOString().slice(0, 10);
    if (latest.fireAt.slice(0, 10) === today) return;
  }

  const scheduled = await scheduleInSeconds(
    2,
    {
    title: 'Frequencia em risco',
    body: `${materiaNome}: ${Math.round(percentualFaltas * 100)}% de faltas (limite 30%)`,
    data: { tipo: 'frequencia', refId },
    },
    1
  );

  if (scheduled) {
    notificacoesRepository.insert('frequencia_risco', refId, scheduled.expoId, scheduled.fireAt);
  }
}
