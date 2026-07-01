/** Ventana temporal del tablero kanban. */
export type JosanzBoardPeriodKind = 'week' | 'month' | 'quarter' | 'year' | 'all';

export interface JosanzBoardPeriodOption {
  id: JosanzBoardPeriodKind;
  label: string;
}

export const JOSANZ_BOARD_PERIOD_OPTIONS: readonly JosanzBoardPeriodOption[] = [
  { id: 'week', label: 'Semana' },
  { id: 'month', label: 'Mes' },
  { id: 'quarter', label: 'Trimestre' },
  { id: 'year', label: 'Año' },
  { id: 'all', label: 'Todos' },
] as const;

export interface JosanzBoardPeriodRange {
  start: Date;
  end: Date;
  label: string;
}

const MS_PER_DAY = 86_400_000;

export function isValidBoardPeriodKind(value: unknown): value is JosanzBoardPeriodKind {
  return (
    value === 'week' ||
    value === 'month' ||
    value === 'quarter' ||
    value === 'year' ||
    value === 'all'
  );
}

/** Fecha local `YYYY-MM-DD` para persistir el ancla del período. */
export function toBoardPeriodAnchorIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseBoardPeriodAnchor(iso: string | undefined | null, fallback = new Date()): Date {
  if (!iso) {
    return startOfLocalDay(fallback);
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) {
    return startOfLocalDay(fallback);
  }
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const parsed = new Date(year, month, day);
  if (Number.isNaN(parsed.getTime())) {
    return startOfLocalDay(fallback);
  }
  return startOfLocalDay(parsed);
}

export function parseCatalogEventDate(iso: string | undefined | null): Date | null {
  if (!iso?.trim()) {
    return null;
  }
  const trimmed = iso.trim();
  const displayMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
  if (displayMatch) {
    const day = Number(displayMatch[1]);
    const month = Number(displayMatch[2]) - 1;
    const year = Number(displayMatch[3]);
    const parsed = new Date(year, month, day);
    return Number.isNaN(parsed.getTime()) ? null : startOfLocalDay(parsed);
  }

  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (dateOnly) {
    const parsed = new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
    return Number.isNaN(parsed.getTime()) ? null : startOfLocalDay(parsed);
  }
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : startOfLocalDay(parsed);
}

export function startOfLocalDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfLocalDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function startOfWeekMonday(date: Date): Date {
  const d = startOfLocalDay(date);
  const weekday = d.getDay();
  const diff = weekday === 0 ? -6 : 1 - weekday;
  d.setDate(d.getDate() + diff);
  return d;
}

export function endOfWeekSunday(date: Date): Date {
  const start = startOfWeekMonday(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return endOfLocalDay(end);
}

export function startOfMonth(date: Date): Date {
  const d = startOfLocalDay(date);
  d.setDate(1);
  return d;
}

export function endOfMonth(date: Date): Date {
  const d = startOfMonth(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  return endOfLocalDay(d);
}

export function startOfQuarter(date: Date): Date {
  const d = startOfMonth(date);
  const quarterMonth = Math.floor(d.getMonth() / 3) * 3;
  d.setMonth(quarterMonth);
  d.setDate(1);
  return d;
}

export function endOfQuarter(date: Date): Date {
  const start = startOfQuarter(date);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 3);
  end.setDate(0);
  return endOfLocalDay(end);
}

export function startOfYear(date: Date): Date {
  const d = startOfLocalDay(date);
  d.setMonth(0, 1);
  return d;
}

export function endOfYear(date: Date): Date {
  const d = startOfYear(date);
  d.setMonth(11, 31);
  return endOfLocalDay(d);
}

export function getBoardPeriodRange(
  kind: JosanzBoardPeriodKind,
  anchor: Date,
): JosanzBoardPeriodRange | null {
  if (kind === 'all') {
    return null;
  }

  let start: Date;
  let end: Date;

  switch (kind) {
    case 'week':
      start = startOfWeekMonday(anchor);
      end = endOfWeekSunday(anchor);
      break;
    case 'month':
      start = startOfMonth(anchor);
      end = endOfMonth(anchor);
      break;
    case 'quarter':
      start = startOfQuarter(anchor);
      end = endOfQuarter(anchor);
      break;
    case 'year':
      start = startOfYear(anchor);
      end = endOfYear(anchor);
      break;
    default:
      return null;
  }

  return {
    start,
    end,
    label: formatBoardPeriodLabel(kind, start, end),
  };
}

export function formatBoardPeriodLabel(kind: JosanzBoardPeriodKind, start: Date, end: Date): string {
  const monthLong = new Intl.DateTimeFormat('es-ES', { month: 'long' });
  const monthShort = new Intl.DateTimeFormat('es-ES', { month: 'short' });
  const dayMonth = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' });

  switch (kind) {
    case 'week': {
      const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
      if (sameMonth) {
        return `${start.getDate()}–${end.getDate()} ${monthLong.format(start)} ${start.getFullYear()}`;
      }
      return `${dayMonth.format(start)} – ${dayMonth.format(end)} ${end.getFullYear()}`;
    }
    case 'month': {
      const label = monthLong.format(start);
      return `${label.charAt(0).toUpperCase()}${label.slice(1)} ${start.getFullYear()}`;
    }
    case 'quarter': {
      const quarter = Math.floor(start.getMonth() / 3) + 1;
      const endLabel = monthShort.format(end);
      return `T${quarter} ${start.getFullYear()} · ${monthShort.format(start)} – ${endLabel}`;
    }
    case 'year':
      return String(start.getFullYear());
    default:
      return 'Todos los eventos';
  }
}

export function shiftBoardPeriodAnchor(
  anchor: Date,
  kind: JosanzBoardPeriodKind,
  delta: number,
): Date {
  if (kind === 'all' || delta === 0) {
    return startOfLocalDay(anchor);
  }

  const d = startOfLocalDay(anchor);
  switch (kind) {
    case 'week':
      d.setDate(d.getDate() + delta * 7);
      return d;
    case 'month':
      d.setMonth(d.getMonth() + delta);
      return d;
    case 'quarter':
      d.setMonth(d.getMonth() + delta * 3);
      return d;
    case 'year':
      d.setFullYear(d.getFullYear() + delta);
      return d;
    default:
      return d;
  }
}

export function isDateInBoardPeriod(
  eventDateIso: string | undefined | null,
  kind: JosanzBoardPeriodKind,
  anchor: Date,
): boolean {
  if (kind === 'all') {
    return true;
  }

  const eventDate = parseCatalogEventDate(eventDateIso);
  if (!eventDate) {
    return false;
  }

  const range = getBoardPeriodRange(kind, anchor);
  if (!range) {
    return true;
  }

  return eventDate.getTime() >= range.start.getTime() && eventDate.getTime() <= range.end.getTime();
}

export function isAnchorInCurrentBoardPeriod(kind: JosanzBoardPeriodKind, anchor: Date): boolean {
  if (kind === 'all') {
    return true;
  }
  const today = startOfLocalDay(new Date());
  const range = getBoardPeriodRange(kind, anchor);
  if (!range) {
    return true;
  }
  return today.getTime() >= range.start.getTime() && today.getTime() <= range.end.getTime();
}

/** Días hasta el final del período (útil para avisos de carga). */
export function daysRemainingInBoardPeriod(kind: JosanzBoardPeriodKind, anchor: Date): number | null {
  if (kind === 'all') {
    return null;
  }
  const range = getBoardPeriodRange(kind, anchor);
  if (!range) {
    return null;
  }
  const today = startOfLocalDay(new Date());
  const diff = Math.ceil((range.end.getTime() - today.getTime()) / MS_PER_DAY);
  return Math.max(0, diff);
}
