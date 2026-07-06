import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { ClientService, ClientsFacade } from '@josanz-erp/clients-data-access';
import { JosanzEventCreateComponent } from './josanz-event-create';
import { JosanzEventsFacade } from '@josanz-erp/josanz-events-data-access';
import { demoEvent } from '../../testing/demo-test-helpers';

const demoClient = {
  id: 'client-demo-1',
  name: 'Demo Cliente S.L.',
  contact: 'Operador Uno',
  email: 'demo@cliente.com',
  phone: '+34 600 111 222',
  description: '',
  sector: 'Tipo cliente 1',
  contacts: [
    {
      id: 'op-1',
      name: 'Operador Uno',
      email: 'op1@cliente.com',
      phone: '+34 600 333 444',
      position: 'Operador',
      isPrimary: true,
    },
    {
      id: 'op-2',
      name: 'Operador Dos',
      email: 'op2@cliente.com',
      phone: '+34 600 555 666',
      position: 'Operador',
      isPrimary: false,
    },
  ],
};

describe('JosanzEventCreateComponent', () => {
  let fixture: ComponentFixture<JosanzEventCreateComponent>;
  let component: JosanzEventCreateComponent;
  let router: { navigate: jest.Mock };
  let eventsFacade: { createEvent: jest.Mock };

  beforeEach(async () => {
    router = { navigate: jest.fn() };
    eventsFacade = {
      createEvent: jest.fn(() => of(demoEvent({ id: 'new-event-id' }))),
    };

    await TestBed.configureTestingModule({
      imports: [JosanzEventCreateComponent],
      providers: [
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: { get: () => null } } },
        },
        {
          provide: ClientService,
          useValue: { getClients: jest.fn(() => of([demoClient])) },
        },
        {
          provide: ClientsFacade,
          useValue: { clients: () => [demoClient], loadClients: jest.fn() },
        },
        { provide: JosanzEventsFacade, useValue: eventsFacade },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JosanzEventCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('carga clientes y ofrece operadores del cliente seleccionado', () => {
    component.form.patchValue({ clientId: 'client-demo-1' });
    fixture.detectChanges();

    expect(component.clientOptions().length).toBe(1);
    expect(component.operatorOptions().length).toBe(2);
    expect(component.operatorOptions()[0].label).toBe('Operador Uno');
  });

  it('flujo demo: crea evento con cliente y operador', () => {
    component.form.patchValue({
      clientId: 'client-demo-1',
      operatorContactId: 'op-1',
      nombre: 'Congreso Demo 2026',
      localizacion: 'IFEMA Madrid',
    });
    component.eventDateGroup(0).patchValue({
      fecha: '2026-09-10',
      hora: '09:00',
    });

    component.onSave();

    expect(eventsFacade.createEvent).toHaveBeenCalledTimes(1);
    const payload = eventsFacade.createEvent.mock.calls[0][0];
    expect(payload.clientId).toBe('client-demo-1');
    expect(payload.name).toBe('Congreso Demo 2026');
    expect(router.navigate).toHaveBeenCalledWith(['/events'], {
      queryParams: { created: '1' },
    });
  });

  it('no envía si falta el cliente', () => {
    component.form.patchValue({
      nombre: 'Sin cliente',
      localizacion: 'Madrid',
    });
    component.eventDateGroup(0).patchValue({ fecha: '2026-09-10', hora: '09:00' });

    component.onSave();

    expect(eventsFacade.createEvent).not.toHaveBeenCalled();
  });
});
