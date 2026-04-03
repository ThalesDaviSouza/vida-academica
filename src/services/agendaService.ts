const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Marco',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

export function todayIso(): string {
  return new Date().toISOString().split('T')[0];
}

export function toIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function dateFromIso(iso: string): Date {
  return new Date(`${iso}T12:00:00`);
}

export function startOfMonthIso(iso: string): string {
  const d = dateFromIso(iso);
  d.setDate(1);
  return toIso(d);
}

export function addDaysIso(iso: string, days: number): string {
  const d = dateFromIso(iso);
  d.setDate(d.getDate() + days);
  return toIso(d);
}

export function addMonthsIso(iso: string, months: number): string {
  const d = dateFromIso(iso);
  d.setMonth(d.getMonth() + months);
  return startOfMonthIso(toIso(d));
}

export function monthLabel(iso: string): string {
  const d = dateFromIso(iso);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function weekday(iso: string): number {
  return dateFromIso(iso).getDay();
}

export function sameMonth(aIso: string, bIso: string): boolean {
  return aIso.slice(0, 7) === bIso.slice(0, 7);
}

export function isWithin(iso: string, startIso: string, endIso: string): boolean {
  return iso >= startIso && iso <= endIso;
}

export type MonthGridCell = { iso: string; inMonth: boolean; day: number };

export function buildMonthGrid(monthIso: string): MonthGridCell[] {
  const first = startOfMonthIso(monthIso);
  const firstDow = weekday(first); // 0..6
  const gridStart = addDaysIso(first, -firstDow);

  const cells: MonthGridCell[] = [];
  for (let i = 0; i < 42; i++) {
    const iso = addDaysIso(gridStart, i);
    const d = dateFromIso(iso);
    cells.push({ iso, inMonth: sameMonth(iso, monthIso), day: d.getDate() });
  }
  return cells;
}

export function formatDateBr(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

