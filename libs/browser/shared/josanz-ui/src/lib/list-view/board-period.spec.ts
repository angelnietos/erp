import {
  formatBoardPeriodLabel,
  getBoardPeriodRange,
  isDateInBoardPeriod,
  parseBoardPeriodAnchor,
  shiftBoardPeriodAnchor,
  startOfMonth,
  toBoardPeriodAnchorIso,
} from './board-period';

describe('board-period', () => {
  it('filtra eventos por mes', () => {
    const anchor = parseBoardPeriodAnchor('2026-03-15');
    expect(isDateInBoardPeriod('2026-03-01', 'month', anchor)).toBe(true);
    expect(isDateInBoardPeriod('2026-03-31', 'month', anchor)).toBe(true);
    expect(isDateInBoardPeriod('2026-04-01', 'month', anchor)).toBe(false);
    expect(isDateInBoardPeriod('invalid', 'month', anchor)).toBe(false);
  });

  it('muestra todos los eventos con período «all»', () => {
    const anchor = parseBoardPeriodAnchor('2026-03-15');
    expect(isDateInBoardPeriod('2019-01-01', 'all', anchor)).toBe(true);
    expect(isDateInBoardPeriod(undefined, 'all', anchor)).toBe(true);
  });

  it('desplaza el ancla mensual', () => {
    const anchor = parseBoardPeriodAnchor('2026-03-15');
    const next = shiftBoardPeriodAnchor(anchor, 'month', 1);
    expect(toBoardPeriodAnchorIso(startOfMonth(next))).toBe('2026-04-01');
  });

  it('genera etiqueta legible para trimestre', () => {
    const range = getBoardPeriodRange('quarter', parseBoardPeriodAnchor('2026-05-10'));
    expect(range?.label).toContain('T2');
    expect(range?.label).toContain('2026');
  });

  it('interpreta fechas mostradas en listados', () => {
    const anchor = parseBoardPeriodAnchor('2026-03-15');
    expect(isDateInBoardPeriod('15/03/2026', 'month', anchor)).toBe(true);
    expect(isDateInBoardPeriod('01/04/2026', 'month', anchor)).toBe(false);
  });
});
