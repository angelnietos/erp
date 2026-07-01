import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { ClientService, ClientsFacade } from '@josanz-erp/clients-data-access';
import { JosanzClientCreateComponent } from './josanz-client-create';
import {
  activatedRouteWithQuery,
  createClientsFacadeMock,
  demoClient,
} from '../../testing/demo-test-helpers';

describe('JosanzClientCreateComponent', () => {
  let fixture: ComponentFixture<JosanzClientCreateComponent>;
  let component: JosanzClientCreateComponent;
  let router: { navigate: jest.Mock; navigateByUrl: jest.Mock; parseUrl: jest.Mock };
  let clientService: { createClient: jest.Mock };
  let clientsFacade: ReturnType<typeof createClientsFacadeMock>;

  beforeEach(async () => {
    router = {
      navigate: jest.fn(),
      navigateByUrl: jest.fn(),
      parseUrl: jest.fn((url: string) => ({ queryParams: {}, path: url })),
    };
    clientService = {
      createClient: jest.fn(() => of(demoClient({ id: 'new-client-id' }))),
    };
    clientsFacade = createClientsFacadeMock();

    await TestBed.configureTestingModule({
      imports: [JosanzClientCreateComponent],
      providers: [
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: activatedRouteWithQuery() },
        { provide: ClientService, useValue: clientService },
        { provide: ClientsFacade, useValue: clientsFacade },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JosanzClientCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('inicia con un operador y formulario inválido', () => {
    expect(component.form.valid).toBe(false);
    expect(component.operadores.length).toBe(1);
  });

  it('permite añadir un segundo operador (flujo demo)', () => {
    component.addOperator();
    expect(component.operadores.length).toBe(2);
    component.removeOperator(1);
    expect(component.operadores.length).toBe(1);
  });

  it('no envía si faltan campos obligatorios', () => {
    component.onSubmit();
    expect(clientService.createClient).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.validationBanner()).toContain('obligatorios');
  });

  it('crea cliente con operadores y navega al listado con toast', () => {
    component.form.patchValue({
      razonSocial: 'Empresa Demo',
      email: 'demo@empresa.com',
      telefono: '+34 600 000 000',
      tarifa: 'Especial 01',
      colorRail: '#E91E63',
      colorPill: '#F48FB1',
    });
    component.operatorGroup(0).patchValue({
      nombre: 'Operador Demo',
      email: 'operador@empresa.com',
      telefono: '+34 611 111 111',
    });

    component.onSubmit();

    expect(clientService.createClient).toHaveBeenCalledTimes(1);
    const payload = clientService.createClient.mock.calls[0][0];
    expect(payload.contacts).toHaveLength(1);
    expect(payload.contacts[0].name).toBe('Operador Demo');
    expect(clientsFacade.upsertClient).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/clients'], {
      queryParams: { created: '1' },
    });
  });

  it('vuelve al flujo de eventos si viene con returnTo', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [JosanzClientCreateComponent],
      providers: [
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteWithQuery({ returnTo: '/events/new' }),
        },
        { provide: ClientService, useValue: clientService },
        { provide: ClientsFacade, useValue: clientsFacade },
      ],
    }).compileComponents();

    const returnFixture = TestBed.createComponent(JosanzClientCreateComponent);
    const returnComponent = returnFixture.componentInstance;
    returnFixture.detectChanges();

    returnComponent.form.patchValue({
      razonSocial: 'Empresa Demo',
      email: 'demo@empresa.com',
      telefono: '+34 600 000 000',
      tarifa: 'Especial 01',
      colorRail: '#E91E63',
      colorPill: '#F48FB1',
    });
    returnComponent.operatorGroup(0).patchValue({
      nombre: 'Operador Demo',
      email: 'operador@empresa.com',
      telefono: '+34 611 111 111',
    });

    returnComponent.onSubmit();

    expect(router.navigateByUrl).toHaveBeenCalled();
  });
});
