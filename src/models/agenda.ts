import type { Atividade, Materia, Prova } from './index';

export type AgendaCalendarCell = {
  iso: string;
  day: number;
  inMonth: boolean;
  selected: boolean;
  dots: string[]; // materia colors (unique, capped for UI)
};

export type AgendaDayDetails = {
  iso: string;
  aulas: Materia[];
  provas: Array<{ prova: Prova; materia?: Materia | null }>;
  atividades: Array<{ atividade: Atividade; materia?: Materia | null }>;
};

