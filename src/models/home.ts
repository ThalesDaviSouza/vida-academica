import type { Atividade, Materia, Presenca, Prova } from './index';

export type HomeSectionItem = {
  type: 'section';
  id: string;
  title: string;
  subtitle?: string;
  variant?: 'header' | 'message';
};

export type HomeAulaItem = {
  type: 'aula';
  id: string;
  materia: Materia;
  data: string; // ISO YYYY-MM-DD
  presenca?: Presenca | null;
};

export type HomeAtividadeItem = {
  type: 'atividade';
  id: string;
  atividade: Atividade;
  materia?: Materia | null;
};

export type HomeProvaItem = {
  type: 'prova';
  id: string;
  prova: Prova;
  materia?: Materia | null;
};

export type HomeItem =
  | HomeSectionItem
  | HomeAulaItem
  | HomeAtividadeItem
  | HomeProvaItem;
