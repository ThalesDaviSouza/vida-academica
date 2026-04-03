import {
  View, Text, FlatList, TouchableOpacity,
  Modal, Pressable,
  StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MateriasStackParamList } from '../navigation/MateriasNavigator';
import { usePresencasStore } from '../store/presencasStore';
import { useSemestresStore } from '../store/semestresStore';
import { Presenca } from '../models';
import { gerarTodasAulas, FrequenciaStats } from '../services/presencaService';
import { colors, spacing, radius } from '../theme';
import PageHeader from '../components/PageHeader';

type Props = NativeStackScreenProps<MateriasStackParamList, 'MateriaDetalhe'>;

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

interface AulaItem {
  data: string;
  presenca: Presenca | null;
  passada: boolean;
}

export default function MateriaDetalheScreen({ route, navigation }: Props) {
  const { materia } = route.params;
  const { semestres, semestreAtivo, load: loadSemestres, setAtivo } = useSemestresStore();
  const { presencas, stats, load, toggleStatus, toggleCancelada } = usePresencasStore();
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuItem, setMenuItem] = useState<AulaItem | null>(null);

  const hoje = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadSemestres();
    if (semestreAtivo) load(materia.id, materia, semestreAtivo.dataInicio);
  }, [materia.id]);

  if (!semestreAtivo) return null;

  const presencasMap = new Map(presencas.map((p) => [p.data, p]));
  const todasDatas = gerarTodasAulas(materia, semestreAtivo.dataInicio);
  const aulas: AulaItem[] = todasDatas.map((data) => ({
    data,
    presenca: presencasMap.get(data) ?? null,
    passada: data <= hoje,
  }));

  function handleTap(item: AulaItem) {
    if (!item.passada || !item.presenca) return;
    if (item.presenca.status === 'cancelada') return;
    toggleStatus(item.presenca, materia, semestreAtivo!.dataInicio);
  }

  function handleLongPress(item: AulaItem) {
    setMenuItem(item);
    setMenuVisible(true);
    return;
    const isCancelada = item.presenca?.status === 'cancelada';
    Alert.alert(
      isCancelada ? 'Reativar aula' : 'Cancelar aula',
      isCancelada
        ? 'Deseja reativar esta aula? Ela voltará a contar na frequência.'
        : 'Deseja marcar esta aula como cancelada? Ela não contará na frequência.',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: isCancelada ? 'Reativar' : 'Cancelar aula',
          style: isCancelada ? 'default' : 'destructive',
          onPress: () =>
            toggleCancelada(materia.id, item.data, materia, semestreAtivo!.dataInicio),
        },
      ]
    );
  }

  function fecharMenu() {
    setMenuVisible(false);
    setMenuItem(null);
  }

  function confirmarToggleCancelada(item: AulaItem) {
    const isCancelada = item.presenca?.status === 'cancelada';

    if (isCancelada) {
      toggleCancelada(materia.id, item.data, materia, semestreAtivo!.dataInicio);
      fecharMenu();
      return;
    }

    Alert.alert(
      'Cancelar aula',
      'Deseja marcar esta aula como cancelada? Ela nao contara na frequencia.',
      [
        { text: 'Nao', style: 'cancel' },
        {
          text: 'Cancelar aula',
          style: 'destructive',
          onPress: () => {
            toggleCancelada(materia.id, item.data, materia, semestreAtivo!.dataInicio);
            fecharMenu();
          },
        },
      ]
    );
  }

  function getStatusStyle(item: AulaItem): { label: string; color: string; bg: string } {
    if (item.presenca?.status === 'cancelada') {
      return { label: 'Cancelada', color: colors.textMuted, bg: colors.surfaceHigh };
    }
    if (!item.passada) {
      return { label: 'Futura', color: colors.textMuted, bg: colors.surfaceHigh };
    }
    switch (item.presenca?.status) {
      case 'falta':
        return { label: 'Falta', color: colors.danger, bg: colors.danger + '22' };
      default:
        return { label: 'Presente', color: colors.success, bg: colors.success + '22' };
    }
  }

  function renderItem({ item }: { item: AulaItem }) {
    const s = getStatusStyle(item);
    const [ano, mes, dia] = item.data.split('-');
    const diaSemana = DIAS[new Date(`${item.data}T12:00:00`).getDay()];

    return (
      <TouchableOpacity
        style={[styles.aulaCard, !item.passada && styles.aulaFutura]}
        onPress={() => handleTap(item)}
        onLongPress={() => handleLongPress(item)}
        activeOpacity={item.passada ? 0.7 : 1}
      >
        <View style={[styles.aulaStripe, { backgroundColor: materia.cor }]} />
        <View style={styles.aulaInfo}>
          <Text style={styles.aulaData}>{dia}/{mes}/{ano}</Text>
          <Text style={styles.aulaDiaSemana}>{diaSemana}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
          <Text style={[styles.statusText, { color: s.color }]}>{s.label}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader
        title={materia.nome}
        semestres={semestres}
        semestreAtivoId={semestreAtivo?.id}
        onSelectSemestreAtivo={setAtivo}
        leftAction={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        }
      />

      {materia.professor ? (
        <Text style={styles.profLine}>👤 {materia.professor}</Text>
      ) : null}

      {/* Risco */}
      {stats?.emRisco && (
        <View style={styles.riskBanner}>
          <Text style={styles.riskText}>
            ⚠️ Você atingiu {Math.round(stats.percentualFaltas * 100)}% de faltas! Limite máximo: 30%
          </Text>
        </View>
      )}

      {/* Stats */}
      {stats && <StatsCard stats={stats} cor={materia.cor} />}

      {/* Hint */}
      <Text style={styles.hint}>
        Toque para alternar presença/falta (aulas passadas) • Segure para cancelar/reativar aula
      </Text>

      {/* Lista */}
      <FlatList
        data={aulas}
        keyExtractor={(item) => item.data}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />

      <Modal visible={menuVisible} transparent animationType="fade">
        <Pressable style={styles.menuBackdrop} onPress={fecharMenu} />
        <View style={styles.menuSheet}>
          <Text style={styles.menuTitle}>Opcoes da aula</Text>
          {menuItem ? (
            <Text style={styles.menuSub}>
              {menuItem.data.split('-').reverse().join('/')}
            </Text>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.menuAction,
              menuItem?.presenca?.status === 'cancelada'
                ? styles.menuActionNeutral
                : styles.menuActionDanger,
            ]}
            onPress={() => menuItem && confirmarToggleCancelada(menuItem)}
          >
            <Text
              style={[
                styles.menuActionText,
                menuItem?.presenca?.status === 'cancelada'
                  ? styles.menuActionTextNeutral
                  : styles.menuActionTextDanger,
              ]}
            >
              {menuItem?.presenca?.status === 'cancelada' ? 'Reativar aula' : 'Cancelar aula'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.85} style={styles.menuCancel} onPress={fecharMenu}>
            <Text style={styles.menuCancelText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function StatsCard({ stats, cor }: { stats: FrequenciaStats; cor: string }) {
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.success }]}>{stats.presencas}</Text>
          <Text style={styles.statLabel}>Presenças</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.danger }]}>{stats.faltas}</Text>
          <Text style={styles.statLabel}>Faltas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[
            styles.statValue,
            { color: stats.emRisco ? colors.danger : colors.success }
          ]}>
            {Math.round(stats.percentual * 100)}%
          </Text>
          <Text style={styles.statLabel}>Frequência</Text>
        </View>
      </View>

      {/* Barra de progresso */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, {
          width: `${Math.min(stats.percentual * 100, 100)}%` as any,
          backgroundColor: stats.emRisco ? colors.danger : cor,
        }]} />
        <View style={styles.limiteLine} />
      </View>
      <Text style={styles.progressLabel}>
        Mínimo de frequência: 70%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    gap: spacing.xs,
  },
  backBtn: { color: colors.primary, fontSize: 14, fontWeight: '600', marginBottom: spacing.xs },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: colors.textPrimary },
  headerSub: { fontSize: 13, color: colors.textSecondary },
  backIcon: { color: colors.textPrimary, fontSize: 20, fontWeight: '900' },
  profLine: {
    color: colors.textSecondary,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },

  riskBanner: {
    backgroundColor: colors.danger + '22',
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
    padding: spacing.md,
    margin: spacing.md,
    borderRadius: radius.sm,
  },
  riskText: { color: colors.danger, fontWeight: '600', fontSize: 13 },

  statsContainer: {
    margin: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statCard: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 22, fontWeight: 'bold', color: colors.textPrimary },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },

  progressBg: {
    height: 8,
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.full,
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  limiteLine: {
    position: 'absolute',
    left: '70%',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: colors.warning,
  },
  progressLabel: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'right',
  },

  hint: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },

  list: { padding: spacing.md, gap: spacing.sm },

  aulaCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  aulaFutura: { opacity: 0.5 },
  aulaStripe: { width: 4, alignSelf: 'stretch' },
  aulaInfo: { flex: 1, padding: spacing.md, gap: 2 },
  aulaData: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  aulaDiaSemana: { fontSize: 12, color: colors.textSecondary },
  statusBadge: {
    margin: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    minWidth: 76,
    alignItems: 'center',
  },
  statusText: { fontSize: 12, fontWeight: '700' },

  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  menuSheet: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  menuTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '800' },
  menuSub: { color: colors.textSecondary, fontSize: 13, marginTop: -6 },
  menuAction: {
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  menuActionDanger: {
    backgroundColor: colors.danger + '22',
    borderColor: colors.danger,
  },
  menuActionNeutral: {
    backgroundColor: colors.surfaceHigh,
    borderColor: colors.border,
  },
  menuActionText: { fontWeight: '800' },
  menuActionTextDanger: { color: colors.danger },
  menuActionTextNeutral: { color: colors.textPrimary },
  menuCancel: {
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center',
  },
  menuCancelText: { color: colors.textPrimary, fontWeight: '800' },
});
