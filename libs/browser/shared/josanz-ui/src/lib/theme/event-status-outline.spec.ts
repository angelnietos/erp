import {
  eventOutlineBadgeStyles,
  getEventOutlinePill,
  normalizeEventOutlineKey,
} from './event-status-outline';

describe('event-status-outline', () => {
  it('maps production and execution states to en-proceso palette', () => {
    expect(normalizeEventOutlineKey('en-produccion')).toBe('en-proceso');
    expect(normalizeEventOutlineKey('en-ejecucion')).toBe('en-proceso');
    expect(getEventOutlinePill('en-produccion').text).toBe('#2563EB');
  });

  it('uses orange palette for budget states', () => {
    expect(getEventOutlinePill('presupuesto').border).toBe('#F97316');
    expect(eventOutlineBadgeStyles('presupuesto')['background-color']).toBe('#FFF7ED');
  });

  it('uses indigo palette for invoiced events', () => {
    expect(getEventOutlinePill('facturado').text).toBe('#4338CA');
  });
});
