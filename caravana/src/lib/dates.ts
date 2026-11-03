// Datas de viagem sao datas de calendario (sem hora) no fuso da caravana.

export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(fromIso: string, toIso: string): number {
  const a = Date.parse(`${fromIso}T12:00:00Z`);
  const b = Date.parse(`${toIso}T12:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

export function todayIn(timeZone: string, now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  return parts; // en-CA ja sai como AAAA-MM-DD
}

export type TripPhase =
  | { phase: 'before'; daysToGo: number }
  | { phase: 'during'; dayNumber: number }
  | { phase: 'after'; daysSince: number };

export function tripPhase(startDate: string, endDate: string, today: string): TripPhase {
  if (today < startDate) return { phase: 'before', daysToGo: daysBetween(today, startDate) };
  if (today > endDate) return { phase: 'after', daysSince: daysBetween(endDate, today) };
  return { phase: 'during', dayNumber: daysBetween(startDate, today) + 1 };
}

export type DayState = 'past' | 'today' | 'future';

export function dayState(dayDate: string, today: string): DayState {
  if (dayDate < today) return 'past';
  if (dayDate > today) return 'future';
  return 'today';
}

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const MESES_LONGOS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const SEMANA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

export function formatShort(iso: string): string {
  const [, m, d] = iso.split('-').map(Number);
  return `${d} ${MESES[(m ?? 1) - 1]}`;
}

export function formatLong(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} de ${MESES_LONGOS[(m ?? 1) - 1]} de ${y}`;
}

export function weekday(iso: string): string {
  return SEMANA[new Date(`${iso}T12:00:00Z`).getUTCDay()] ?? '';
}

export function formatRange(start: string, end: string): string {
  const [ys, ms] = start.split('-').map(Number);
  const [ye, me] = end.split('-').map(Number);
  const ds = Number(start.slice(8));
  const de = Number(end.slice(8));
  if (ys === ye && ms === me) return `${ds} a ${de} de ${MESES_LONGOS[(ms ?? 1) - 1]} de ${ys}`;
  if (ys === ye) return `${ds} de ${MESES_LONGOS[(ms ?? 1) - 1]} a ${de} de ${MESES_LONGOS[(me ?? 1) - 1]} de ${ys}`;
  return `${formatLong(start)} a ${formatLong(end)}`;
}
