export interface Semestre {
  id: string;
  nome: string;
  dataInicio: string; // ISO string
  dataFim: string;
  ativo: boolean;
}

export interface Materia {
  id: string;
  nome: string;
  cor: string;
  professor?: string;
  diasSemana: number[]; // 0 = domingo, 6 = sábado
  horario: string;
  dataFim: string;
  semestreId: string;
}

export interface Presenca {
  id: string;
  materiaId: string;
  data: string;
  status: 'presente' | 'falta' | 'auto_presente' | 'cancelada';
}

export interface Prova {
  id: string;
  materiaId: string;
  data: string;
  tipo: 'prova' | 'trabalho' | 'seminario';
  peso?: number;
}

export interface Atividade {
  id: string;
  materiaId: string;
  titulo: string;
  dataEntrega: string;
  recorrente: boolean;
  regraRecorrencia?: RecorrenciaRegra;
  status: 'pendente' | 'concluido';
}

export interface RecorrenciaRegra {
  tipo: 'semanal';
  diasSemana?: number[];
}