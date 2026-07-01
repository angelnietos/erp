import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { ClientService, ClientsFacade } from '@josanz-erp/clients-data-access';
import { JosanzDeleteConfirmService } from '@josanz-erp/josanz-ui';
import { JosanzClientEditComponent } from './josanz-client-edit';
import {
  activatedRouteWithQuery,
  createClientsFacadeMock,
  demoClient,
} from '../../testing/demo-test-helpers';

describe('JosanzClientEditComponent', () => {
  let fixture: ComponentFixture<JosanzClientEditComponent>;
  let component: JosanzClientEditComponent;
  let router: { navigate: jest.Mock };
  let clientService: { updateClient: jest.Mock };
  let clientsFacade: ReturnType<typeof createClientsFacadeMock>;

  const clientWithOneOperator = demoClient();

  beforeEach(async () => {
    router = { navigate: jest.fn() };
    clientService = {
      updateClient: jest.fn(() =>
        of(
          demoClient({
            contacts: [
              ...(clientWithOneOperator.contacts ?? []),
              {
                id: 'op-2',
                name: 'Operador Dos',
                email: 'op2@cliente.com',
                phone: '+34 600 555 666',
                position: 'Operador',
                isPrimary: false,
              },
            ],
          }),
        ),
      ),
    };
    clientsFacade = createClientsFacadeMock([clientWithOneOperator]);
    clientsFacade.ensureClient = jest.fn(() => of(clientWithOneOperator));

    await TestBed.configureTestingModule({
      imports: [JosanzClientEditComponent],
      providers: [
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteWithQuery({}, { id: clientWithOneOperator.id }),
        },
        { provide: ClientService, useValue: clientService },
        { provide: ClientsFacade, useValue: clientsFacade },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JosanzClientEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('carga el cliente y muestra un operador inicial', fakeAsync(() => {
    tick();
    expect(component.operadores.length).toBe(1);
    expect(component.form.get('razonSocial')?.value).toBe('Demo Cliente S.L.');
  }));

  it('flujo demo: añadir segundo operador habilita guardar cuando hay cambios', fakeAsync(() => {
    tick();
    expect(component.canSave()).toBe(false);

    component.addOperator();
    component.operatorGroup(1).patchValue({
      nombre: 'Operador Dos',
      email: 'op2@cliente.com',
      telefono: '+34 600 555 666',
    });
    tick();

    expect(component.operadores.length).toBe(2);
    expect(component.hasUnsavedChanges()).toBe(true);
    expect(component.canSave()).toBe(true);
  }));

  it('guarda cambios y navega con ?updated=1', fakeAsync(() => {
    tick();
    component.addOperator();
    component.operatorGroup(1).patchValue({
      nombre: 'Operador Dos',
      email: 'op2@cliente.com',
      telefono: '+34 600 555 666',
    });
    tick();

    component.onSubmit();

    expect(clientService.updateClient).toHaveBeenCalledTimes(1);
    const payload = clientService.updateClient.mock.calls[0][1];
    expect(payload.contacts).toHaveLength(2);
    expect(router.navigate).toHaveBeenCalledWith(['/clients'], {
      queryParams: { updated: '1' },
    });
  }));
});
