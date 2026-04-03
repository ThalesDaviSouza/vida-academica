export function todayIso(): string {
  return new Date().toISOString().split('T')[0];
}

export function addDaysIso(iso: string, days: number): string {
  const date = new Date(`${iso}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

export function formatDateBr(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function getWeekday(iso: string): number {
  return new Date(`${iso}T12:00:00`).getDay();
}

export function isWithin(iso: string, startIso: string, endIso: string): boolean {
  return iso >= startIso && iso <= endIso;
}

export function provaTipoLabel(tipo: string): string {
  switch (tipo) {
    case 'prova':
      return 'Prova';
    case 'trabalho':
      return 'Trabalho';
    case 'seminario':
      return 'Seminario';
    default:
      return 'Prova';
  }
}

