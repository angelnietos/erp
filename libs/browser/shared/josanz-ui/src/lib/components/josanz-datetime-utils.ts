/** Valor ISO `yyyy-MM-dd` desde Date. */
export function josanzIsoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** Etiqueta visible `dd/mm/yyyy` desde ISO o cadena vacía. */
export function josanzFormatDateLabel(iso: string): string {
  const trimmed = iso.trim();
  if (!trimmed) {
    return '';
  }
  const [year, month, day] = trimmed.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) {
    return trimmed;
  }
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
}

/** Etiqueta visible `HH:mm` desde valor de control. */
export function josanzFormatTimeLabel(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }
  const [hours, minutes] = trimmed.split(':');
  if (hours === undefined) {
    return trimmed;
  }
  return `${hours.padStart(2, '0')}:${(minutes ?? '00').padStart(2, '0')}`;
}

export interface JosanzCalendarCell {
  date: string;
  day: number;
  inCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

export function josanzBuildCalendarMonth(
  monthDate: Date,
  selectedDate: string,
): JosanzCalendarCell[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - startOffset);
  const today = josanzIsoDate(new Date());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const iso = josanzIsoDate(date);
    return {
      date: iso,
      day: date.getDate(),
      inCurrentMonth: date.getMonth() === month,
      isToday: iso === today,
      isSelected: iso === selectedDate,
    };
  });
}

export const JOSANZ_TIME_HOURS = Array.from({ length: 24 }, (_, index) =>
  String(index).padStart(2, '0'),
);

export const JOSANZ_TIME_MINUTES = Array.from({ length: 12 }, (_, index) =>
  String(index * 5).padStart(2, '0'),
);
