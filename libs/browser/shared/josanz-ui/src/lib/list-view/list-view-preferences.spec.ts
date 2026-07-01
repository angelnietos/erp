import {
  defaultGridColumnsForSelection,
  gridDensityForSelection,
  isValidListPageSize,
  normalizeListGridColumns,
  normalizeListPageSize,
  listViewStackClasses,
} from './list-view-preferences';

describe('list-view-preferences', () => {
  it('sugiere columnas distintas por cada modo de cuadrícula', () => {
    expect(defaultGridColumnsForSelection('tarjetas-grid')).toBe(4);
    expect(defaultGridColumnsForSelection('tarjetas-grid-compact')).toBe(5);
    expect(defaultGridColumnsForSelection('tarjetas-grid-dense')).toBe(6);
    expect(defaultGridColumnsForSelection('tabla')).toBeNull();
  });

  it('acepta tamaños de página personalizados dentro del rango', () => {
    expect(isValidListPageSize(10)).toBe(true);
    expect(isValidListPageSize(7)).toBe(true);
    expect(isValidListPageSize(0)).toBe(false);
    expect(normalizeListPageSize(7)).toBe(7);
    expect(normalizeListPageSize(250)).toBe(100);
  });

  it('normaliza columnas de cuadrícula personalizadas', () => {
    expect(normalizeListGridColumns(8)).toBe(8);
    expect(normalizeListGridColumns(0)).toBe(1);
    expect(normalizeListGridColumns(99)).toBe(12);
  });

  it('asigna densidad y clases de stack de forma determinista', () => {
    expect(gridDensityForSelection('tarjetas-grid')).toBe('comfortable');
    expect(listViewStackClasses('tarjetas-grid')).toEqual([
      'josanz-list-view--cards-grid',
      'josanz-list-view--cards-grid-comfortable',
    ]);
    expect(listViewStackClasses('tablero')).toEqual(['josanz-list-view--status-board']);
    expect(listViewStackClasses('tarjetas-grid-dense')).toContain(
      'josanz-list-view--cards-grid-dense',
    );
  });
});
