import {
  defaultGridColumnsForSelection,
  gridDensityForSelection,
  listViewStackClasses,
} from './list-view-preferences';

describe('list-view-preferences', () => {
  it('sugiere columnas distintas por cada modo de cuadrícula', () => {
    expect(defaultGridColumnsForSelection('tarjetas-grid')).toBe(4);
    expect(defaultGridColumnsForSelection('tarjetas-grid-compact')).toBe(5);
    expect(defaultGridColumnsForSelection('tarjetas-grid-dense')).toBe(6);
    expect(defaultGridColumnsForSelection('tabla')).toBeNull();
  });

  it('asigna densidad y clases de stack de forma determinista', () => {
    expect(gridDensityForSelection('tarjetas-grid')).toBe('comfortable');
    expect(listViewStackClasses('tarjetas-grid')).toEqual([
      'josanz-list-view--cards-grid',
      'josanz-list-view--cards-grid-comfortable',
    ]);
    expect(listViewStackClasses('tarjetas-grid-dense')).toContain(
      'josanz-list-view--cards-grid-dense',
    );
  });
});
