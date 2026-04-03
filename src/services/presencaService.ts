import { Materia, Presenca } from '../models';

export function toDateString(date: Date): string {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const dia = String(date.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export function gerarTodasAulas(materia: Materia, semestreDataInicio: string): string[] {
  const inicio = new Date(`${semestreDataInicio}T12:00:00`);
  const fim = new Date(`${materia.dataFim}T12:00:00`);
  const datas: string[] = [];

  const current = new Date(inicio);
  while (current <= fim) {
    if (materia.diasSemana.includes(current.getDay())) {
      datas.push(toDateString(current));
    }
    current.setDate(current.getDate() + 1);
  }

  return datas;
}

export function gerarAulasPassadas(materia: Materia, semestreDataInicio: string): string[] {
  const hoje = toDateString(new Date());
  return gerarTodasAulas(materia, semestreDataInicio).filter((d) => d <= hoje);
}

export interface FrequenciaStats {
  total: number;
  presencas: number;
  faltas: number;
  percentual: number;
  percentualFaltas: number;
  emRisco: boolean;
}

export function calcularFrequencia(
  presencas: Presenca[],
  materia: Materia,
  semestreDataInicio: string,
): FrequenciaStats {
  const todasDatas = gerarTodasAulas(materia, semestreDataInicio);

  const canceladas = new Set(
    presencas.filter((p) => p.status === 'cancelada').map((p) => p.data)
  );

  const total = todasDatas.filter((d) => !canceladas.has(d)).length;
  const presencasCount = presencas.filter(
    (p) => p.status === 'presente' || p.status === 'auto_presente'
  ).length;
  const faltasCount = presencas.filter((p) => p.status === 'falta').length;

  const percentual = total > 0 ? presencasCount / total : 0;
  const percentualFaltas = total > 0 ? faltasCount / total : 0;

  return {
    total,
    presencas: presencasCount,
    faltas: faltasCount,
    percentual,
    percentualFaltas,
    emRisco: total > 0 && percentualFaltas >= 0.3,
  };
}