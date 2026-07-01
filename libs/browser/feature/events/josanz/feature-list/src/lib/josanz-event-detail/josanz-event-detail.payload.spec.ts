import { FormBuilder } from '@angular/forms';
import {
  buildEventDetailSavePayload,
  mapTechnicianRoleToPill,
} from './josanz-event-detail.payload';
import { createJosanzEventForm } from '../josanz-event-form.helpers';

describe('josanz-event-detail.payload', () => {
  const fb = new FormBuilder();

  function demoForm() {
    const form = createJosanzEventForm(fb);
    form.patchValue({
      clientId: 'client-1',
      operatorContactId: 'op-1',
      nombre: 'Evento demo reunión',
      localizacion: 'IFEMA Madrid',
      descripcion: 'Notas del evento',
      status: 'DRAFT',
    });
    const dates = form.get('eventDates') as ReturnType<FormBuilder['array']>;
    (dates.at(0) as ReturnType<FormBuilder['group']>).patchValue({
      fecha: '2026-09-15',
      hora: '10:00',
    });
    return form;
  }

  it('flujo demo: arma payload de guardado con resumen y presupuesto', () => {
    const payload = buildEventDetailSavePayload({
      form: demoForm(),
      selectedType: 'Evento externo',
      eventNotes: [{ id: 'n1', text: 'Nota de producción' }],
      staffNotes: [],
      staffMembers: [],
      emails: [{ id: 'e1', date: '2026-09-01', subject: 'Briefing', body: 'Hola' }],
      inspirationFiles: [{ id: 'f1', name: 'moodboard.pdf' }],
      deliveryNotes: [],
      invoices: [],
      reportFiles: [],
      budgetLines: [
        {
          id: 'b1',
          itemId: 'mat-1',
          name: 'Pantalla LED',
          warehouse: 'Madrid',
          status: 'Disponible',
          pillKey: 'stock-disponible',
          units: 2,
          price: 100,
          days: 1,
          coef: 1,
          discount: 0,
        },
      ],
      budgetAddress: 'Calle Demo 1',
      budgetContact: 'Operador Uno',
      budgetObservations: 'IVA no incluido',
    });

    expect(payload.name).toBe('Evento demo reunión');
    expect(payload.clientId).toBe('client-1');
    expect(payload.detailNotes).toEqual([{ kind: 'EVENT', text: 'Nota de producción' }]);
    expect(payload.budgetLines).toHaveLength(1);
    expect(payload.budgetLines?.[0]?.materialName).toBe('Pantalla LED');
    expect(payload.emails?.[0]?.subject).toBe('Briefing');
    expect(payload.attachments?.[0]?.filename).toBe('moodboard.pdf');
  });

  it('mapea roles de técnico a pills del diseño', () => {
    expect(mapTechnicianRoleToPill('TECNICO')).toBe('staff-tecnico');
    expect(mapTechnicianRoleToPill('PRACTICAS')).toBe('staff-practicas');
    expect(mapTechnicianRoleToPill('FREELANCE')).toBe('staff-freelance');
  });
});
