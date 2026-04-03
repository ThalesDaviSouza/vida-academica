import { useEffect, useMemo, useState } from 'react';
import type { Atividade, Materia, Prova } from '../models';
import type { AgendaCalendarCell, AgendaDayDetails } from '../models/agenda';
import { useAtividadesStore } from '../store/atividadesStore';
import { useMateriasStore } from '../store/materiasStore';
import { useProvasStore } from '../store/provasStore';
import { useSemestresStore } from '../store/semestresStore';
import {
  addDaysIso,
  addMonthsIso,
  buildMonthGrid,
  isWithin,
  monthLabel,
  sameMonth,
  startOfMonthIso,
  todayIso,
  weekday,
} from '../services/agendaService';

function uniqueColors(colors: Array<string | undefined | null>, max: number) {
  const out: string[] = [];
  for (const c of colors) {
    if (!c) continue;
    if (out.includes(c)) continue;
    out.push(c);
    if (out.length >= max) break;
  }
  return out;
}

export function useAgenda() {
  const { semestres, semestreAtivo, load: loadSemestres, setAtivo } = useSemestresStore();
  const { materias, load: loadMaterias } = useMateriasStore();
  const { atividades, load: loadAtividades } = useAtividadesStore();
  const { provas, load: loadProvas } = useProvasStore();

  const [selectedIso, setSelectedIso] = useState<string>(todayIso());
  const [monthIso, setMonthIso] = useState<string>(startOfMonthIso(todayIso()));

  useEffect(() => {
    loadSemestres();
  }, []);

  useEffect(() => {
    if (!semestreAtivo) return;
    loadMaterias(semestreAtivo.id);
    loadAtividades(semestreAtivo.id);
    loadProvas(semestreAtivo.id);
  }, [semestreAtivo]);

  useEffect(() => {
    if (!semestreAtivo) return;
    if (!isWithin(selectedIso, semestreAtivo.dataInicio, semestreAtivo.dataFim)) {
      setSelectedIso(semestreAtivo.dataInicio);
      setMonthIso(startOfMonthIso(semestreAtivo.dataInicio));
    }
  }, [semestreAtivo?.id]);

  const materiasMap = useMemo(
    () => new Map(materias.map((m) => [m.id, m])),
    [materias]
  );

  const pendentesPorDia = useMemo(() => {
    const map = new Map<string, Atividade[]>();
    for (const a of atividades) {
      if (a.status !== 'pendente') continue;
      const list = map.get(a.dataEntrega) ?? [];
      list.push(a);
      map.set(a.dataEntrega, list);
    }
    return map;
  }, [atividades]);

  const provasPorDia = useMemo(() => {
    const map = new Map<string, Prova[]>();
    for (const p of provas) {
      const list = map.get(p.data) ?? [];
      list.push(p);
      map.set(p.data, list);
    }
    return map;
  }, [provas]);

  const aulasPorDia = useMemo(() => {
    const map = new Map<string, Materia[]>();
    if (!semestreAtivo) return map;

    const grid = buildMonthGrid(monthIso);
    const start = grid[0]?.iso ?? monthIso;
    const end = grid[41]?.iso ?? monthIso;

    for (let iso = start; iso <= end; iso = addDaysIso(iso, 1)) {
      const dow = weekday(iso);
      const list: Materia[] = [];
      for (const m of materias) {
        if (!m.diasSemana.includes(dow)) continue;
        if (!isWithin(iso, semestreAtivo.dataInicio, semestreAtivo.dataFim)) continue;
        if (!isWithin(iso, semestreAtivo.dataInicio, m.dataFim)) continue;
        list.push(m);
      }
      if (list.length > 0) {
        list.sort((a, b) => a.horario.localeCompare(b.horario));
        map.set(iso, list);
      }
    }

    return map;
  }, [materias, semestreAtivo, monthIso]);

  const cells: AgendaCalendarCell[] = useMemo(() => {
    const base = buildMonthGrid(monthIso);

    return base.map((c) => {
      const aulas = aulasPorDia.get(c.iso) ?? [];
      const provasDia = provasPorDia.get(c.iso) ?? [];
      const atvDia = pendentesPorDia.get(c.iso) ?? [];

      const colors = uniqueColors(
        [
          ...aulas.map((m) => m.cor),
          ...provasDia.map((p) => materiasMap.get(p.materiaId)?.cor),
          ...atvDia.map((a) => materiasMap.get(a.materiaId)?.cor),
        ],
        4
      );

      return {
        iso: c.iso,
        day: c.day,
        inMonth: c.inMonth,
        selected: c.iso === selectedIso,
        dots: colors,
      };
    });
  }, [monthIso, aulasPorDia, provasPorDia, pendentesPorDia, materiasMap, selectedIso]);

  const details: AgendaDayDetails = useMemo(() => {
    const aulas = aulasPorDia.get(selectedIso) ?? [];
    const provasDia = provasPorDia.get(selectedIso) ?? [];
    const atvDia = pendentesPorDia.get(selectedIso) ?? [];

    return {
      iso: selectedIso,
      aulas,
      provas: provasDia.map((p) => ({ prova: p, materia: materiasMap.get(p.materiaId) ?? null })),
      atividades: atvDia.map((a) => ({ atividade: a, materia: materiasMap.get(a.materiaId) ?? null })),
    };
  }, [selectedIso, aulasPorDia, provasPorDia, pendentesPorDia, materiasMap]);

  function selectDay(iso: string) {
    setSelectedIso(iso);
    if (!sameMonth(iso, monthIso)) {
      setMonthIso(startOfMonthIso(iso));
    }
  }

  return {
    semestres,
    semestreAtivo,
    setAtivo,
    monthIso,
    monthTitle: monthLabel(monthIso),
    goPrevMonth: () => setMonthIso((prev) => addMonthsIso(prev, -1)),
    goNextMonth: () => setMonthIso((prev) => addMonthsIso(prev, 1)),
    selectedIso,
    selectDay,
    cells,
    details,
  };
}

