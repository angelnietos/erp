import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientsFacade } from '@josanz-erp/clients-data-access';
import { CatalogThemeFacade } from '@josanz-erp/josanz-ui';
import { JosanzClientsListComponent } from './feature-list';
import {
  createCatalogThemeFacadeMock,
  createClientsFacadeMock,
  demoClient,
} from '../../testing/demo-test-helpers';

/** Flujo demo: listado tras crear cliente y feedback al usuario. */
describe('Demo flujo clientes — listado', () => {
  let router: { navigate: jest.Mock };
  let clientsFacade: ReturnType<typeof createClientsFacadeMock>;

  beforeEach(() => {
    router = { navigate: jest.fn() };
    clientsFacade = createClientsFacadeMock([
      demoClient(),
      demoClient({
        id: 'client-demo-2',
        name: 'Hotel Vincci Demo',
        sector: 'Tipo cliente 2',
        tariffLabel: 'Especial 02',
      }),
    ]);
  });

  async function createListWithQuery(query: Record<string, string>) {
    await TestBed.configureTestingModule({
      imports: [JosanzClientsListComponent],
      providers: [
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) => query[key] ?? null,
              },
            },
          },
        },
        { provide: ClientsFacade, useValue: clientsFacade },
        {
          provide: CatalogThemeFacade,
          useValue: createCatalogThemeFacadeMock(),
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(JosanzClientsListComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('muestra toast tras crear cliente (?created=1)', async () => {
    const fixture = await createListWithQuery({ created: '1' });
    const component = fixture.componentInstance;

    expect(component.showSuccessToast()).toBe(true);
    expect(component.successToastMessage()).toContain('creado');
    expect(component.listConfig().rows.length).toBeGreaterThanOrEqual(1);
  });

  it('muestra toast tras editar cliente (?updated=1)', async () => {
    const fixture = await createListWithQuery({ updated: '1' });
    expect(fixture.componentInstance.successToastMessage()).toContain('actualizado');
  });

  it('el listado incluye clientes con operadores en las filas', async () => {
    const fixture = await createListWithQuery({});
    const rows = fixture.componentInstance.listConfig().rows;
    expect(rows.some((row) => row.values.some((v) => v.includes('Operador')))).toBe(true);
  });
});
