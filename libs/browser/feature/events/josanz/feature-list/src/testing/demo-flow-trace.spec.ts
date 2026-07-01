/**
 * Mapa del guion de demo → tests que lo cubren.
 * No ejecuta E2E; documenta la trazabilidad para la reunión.
 */
describe('Demo Alexis — trazabilidad de tests', () => {
  const demoScript = [
    { step: 'Login (admin@alexis.local)', suites: ['josanz-login.component.spec', 'josanz-auth.guard'] },
    { step: 'Crear cliente con 1 operador', suites: ['josanz-client-create.spec'] },
    { step: 'Editar cliente y añadir 2.º operador', suites: ['josanz-client-edit.spec'] },
    { step: 'Toast tras crear/editar en listado', suites: ['feature-list.integration.spec'] },
    { step: 'Crear evento con cliente y operador', suites: ['josanz-event-create.spec'] },
    { step: 'Filtros / tablero eventos', suites: ['josanz-events-feature-list.spec'] },
    { step: 'Guardar detalle (Resumen, Presupuestos…)', suites: ['josanz-event-detail.payload.spec'] },
  ] as const;

  it('cubre los pasos acordados del guion de demo', () => {
    expect(demoScript.map((row) => row.step)).toEqual([
      'Login (admin@alexis.local)',
      'Crear cliente con 1 operador',
      'Editar cliente y añadir 2.º operador',
      'Toast tras crear/editar en listado',
      'Crear evento con cliente y operador',
      'Filtros / tablero eventos',
      'Guardar detalle (Resumen, Presupuestos…)',
    ]);
  });
});
