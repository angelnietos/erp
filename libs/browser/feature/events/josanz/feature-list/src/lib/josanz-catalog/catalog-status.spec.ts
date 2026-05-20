import {
  JOSANZ_CATALOG_EVENT_STATUS_ROWS,
  pillVariantForCatalogStatus,
} from './catalog-status';

describe('catalog status mapping', () => {
  it.each([
    ['Borrador', 'borrador'],
    ['Sin presupuesto', 'sin-presupuesto'],
    ['En presupuesto', 'presupuesto'],
    ['En preparación', 'en-preparacion'],
    ['Confirmado', 'confirmado'],
    ['En producción', 'en-produccion'],
    ['En ejecución', 'en-ejecucion'],
    ['Cerrado', 'cerrado'],
    ['Facturado', 'facturado'],
    ['Cancelado', 'cancelado'],
    ['Incidencia', 'incidencia'],
    ['Inasistencia', 'inasistencia'],
    ['Pospuesto', 'pospuesto'],
    ['Finalizado', 'finalizado'],
    ['Técnico', 'staff-tecnico'],
    ['Prácticas', 'staff-practicas'],
    ['Freelance', 'staff-freelance'],
  ] as const)('maps "%s" to "%s"', (label, variant) => {
    expect(pillVariantForCatalogStatus(label)).toBe(variant);
  });

  it('keeps the Figma catalog sample rows stable', () => {
    expect(JOSANZ_CATALOG_EVENT_STATUS_ROWS).toHaveLength(7);
    expect(JOSANZ_CATALOG_EVENT_STATUS_ROWS.map((row) => row.pillVariant)).toEqual([
      'borrador',
      'presupuesto',
      'confirmado',
      'en-produccion',
      'en-ejecucion',
      'cerrado',
      'facturado',
    ]);
  });
});
