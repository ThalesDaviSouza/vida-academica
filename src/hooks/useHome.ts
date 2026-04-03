import { useEffect, useMemo, useState } from 'react';
import * as Crypto from 'expo-crypto';
import { Alert } from 'react-native';
import type { Materia, Presenca } from '../models';
import type { HomeItem } from '../models/home';
import { useAtividadesStore } from '../store/atividadesStore';
import { useMateriasStore } from '../store/materiasStore';
import { useProvasStore } from '../store/provasStore';
import { useSemestresStore } from '../store/semestresStore';
import { presencasRepository } from '../storage/presencasRepository';
import {
  addDaysIso,
  getWeekday,
  isWithin,
  todayIso,
} from '../services/homeService';

export function useHome() {
  const {
    semestres,
    semestreAtivo,
    load: loadSemestres,
    setAtivo: setSemestreAtivo,
  } = useSemestresStore();
  const { materias, load: loadMaterias } = useMateriasStore();
  const { atividades, load: loadAtividades } = useAtividadesStore();
  const { provas, load: loadProvas } = useProvasStore();

  const [dataSelecionada, setDataSelecionada] = useState<string>(todayIso());
  const [presencasDia, setPresencasDia] = useState<Record<string, Presenca | null>>({});

  useEffect(() => {
    loadSemestres();
  }, []);

  useEffect(() => {
    if (!semestreAtivo) return;
    loadMaterias(semestreAtivo.id);
    loadAtividades(semestreAtivo.id);
    loadProvas(semestreAtivo.id);
  }, [semestreAtivo]);

  const materiasMap = useMemo(
    () => new Map(materias.map((m) => [m.id, m])),
    [materias]
  );

  const aulasDoDia = useMemo(() => {
    if (!semestreAtivo) return [];

    const dow = getWeekday(dataSelecionada);
    return materias
      .filter((m) => {
        if (!m.diasSemana.includes(dow)) return false;
        if (!isWithin(dataSelecionada, semestreAtivo.dataInicio, semestreAtivo.dataFim)) return false;
        if (!isWithin(dataSelecionada, semestreAtivo.dataInicio, m.dataFim)) return false;
        return true;
      })
      .sort((a, b) => a.horario.localeCompare(b.horario));
  }, [materias, semestreAtivo, dataSelecionada]);

  useEffect(() => {
    if (!semestreAtivo) return;

    const map: Record<string, Presenca | null> = {};
    for (const materia of aulasDoDia) {
      map[`${materia.id}:${dataSelecionada}`] = presencasRepository.getByMateriaEData(
        materia.id,
        dataSelecionada
      );
    }
    setPresencasDia(map);
  }, [semestreAtivo, aulasDoDia, dataSelecionada]);

  const { atividadesVencendo, provasDoDia, proximasAtividades, proximasProvas } = useMemo(() => {
    const pendentes = atividades.filter((a) => a.status === 'pendente');
    const vencendo = pendentes
      .filter((a) => a.dataEntrega <= dataSelecionada)
      .sort((a, b) => a.dataEntrega.localeCompare(b.dataEntrega));

    const provasHoje = provas
      .filter((p) => p.data === dataSelecionada)
      .sort((a, b) => a.tipo.localeCompare(b.tipo));

    const end = addDaysIso(dataSelecionada, 7);

    const proxAtv = pendentes
      .filter((a) => a.dataEntrega > dataSelecionada && a.dataEntrega <= end)
      .sort((a, b) => a.dataEntrega.localeCompare(b.dataEntrega));

    const proxProvas = provas
      .filter((p) => p.data > dataSelecionada && p.data <= end)
      .sort((a, b) => a.data.localeCompare(b.data));

    return {
      atividadesVencendo: vencendo,
      provasDoDia: provasHoje,
      proximasAtividades: proxAtv,
      proximasProvas: proxProvas,
    };
  }, [atividades, provas, dataSelecionada]);

  const items: HomeItem[] = useMemo(() => {
    const list: HomeItem[] = [];

    list.push({ type: 'section', id: 'sec-aulas', title: 'Aulas do dia', variant: 'header' });
    if (aulasDoDia.length === 0) {
      list.push({
        type: 'section',
        id: 'sec-aulas-empty',
        title: 'Nenhuma aula hoje',
        subtitle: 'Troque a data para ver outros dias',
        variant: 'message',
      });
    } else {
      for (const materia of aulasDoDia) {
        const key = `${materia.id}:${dataSelecionada}`;
        list.push({
          type: 'aula',
          id: `aula-${key}`,
          materia,
          data: dataSelecionada,
          presenca: presencasDia[key],
        });
      }
    }

    list.push({ type: 'section', id: 'sec-vencendo', title: 'Vencendo / Hoje', variant: 'header' });
    if (provasDoDia.length === 0 && atividadesVencendo.length === 0) {
      list.push({
        type: 'section',
        id: 'sec-vencendo-empty',
        title: 'Nada vencendo',
        subtitle: 'Sem atividades pendentes ou provas no dia',
        variant: 'message',
      });
    } else {
      for (const prova of provasDoDia) {
        list.push({
          type: 'prova',
          id: `prova-${prova.id}`,
          prova,
          materia: materiasMap.get(prova.materiaId) ?? null,
        });
      }
      for (const atividade of atividadesVencendo) {
        list.push({
          type: 'atividade',
          id: `atividade-${atividade.id}`,
          atividade,
          materia: materiasMap.get(atividade.materiaId) ?? null,
        });
      }
    }

    list.push({ type: 'section', id: 'sec-proximas', title: 'Proximos 7 dias', variant: 'header' });
    if (proximasAtividades.length === 0 && proximasProvas.length === 0) {
      list.push({
        type: 'section',
        id: 'sec-proximas-empty',
        title: 'Sem proximos itens',
        subtitle: 'Nada agendado para os proximos 7 dias',
        variant: 'message',
      });
    } else {
      for (const prova of proximasProvas) {
        list.push({
          type: 'prova',
          id: `prova-prox-${prova.id}`,
          prova,
          materia: materiasMap.get(prova.materiaId) ?? null,
        });
      }
      for (const atividade of proximasAtividades) {
        list.push({
          type: 'atividade',
          id: `atividade-prox-${atividade.id}`,
          atividade,
          materia: materiasMap.get(atividade.materiaId) ?? null,
        });
      }
    }

    return list;
  }, [
    dataSelecionada,
    aulasDoDia,
    presencasDia,
    provasDoDia,
    atividadesVencendo,
    proximasAtividades,
    proximasProvas,
    materiasMap,
  ]);

  function refreshPresenca(materiaId: string, data: string) {
    setPresencasDia((prev) => ({
      ...prev,
      [`${materiaId}:${data}`]: presencasRepository.getByMateriaEData(materiaId, data),
    }));
  }

  function marcarFalta(materia: Materia, data: string) {
    const hoje = todayIso();
    if (data > hoje) {
      Alert.alert('Atencao', 'Nao e possivel marcar falta em dias futuros.');
      return;
    }

    const existing = presencasRepository.getByMateriaEData(materia.id, data);
    if (!existing) {
      presencasRepository.insert({
        id: Crypto.randomUUID(),
        materiaId: materia.id,
        data,
        status: 'falta',
      });
    } else if (existing.status === 'cancelada') {
      Alert.alert('Atencao', 'Esta aula esta marcada como cancelada.');
      return;
    } else {
      const next: Presenca['status'] = existing.status === 'falta' ? 'presente' : 'falta';
      presencasRepository.updateStatus(existing.id, next);
    }

    refreshPresenca(materia.id, data);
  }

  return {
    semestres,
    semestreAtivo,
    setSemestreAtivo,
    dataSelecionada,
    setDataSelecionada,
    items,
    marcarFalta,
  };
}
