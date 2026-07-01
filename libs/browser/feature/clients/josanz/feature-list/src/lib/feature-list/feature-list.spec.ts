import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientsFacade } from '@josanz-erp/clients-data-access';
import { CatalogThemeFacade } from '@josanz-erp/josanz-ui';
import { JosanzClientsListComponent } from './feature-list';
import {
  createCatalogThemeFacadeMock,
  createClientsFacadeMock,
  demoClient,
  JOSANZ_CATALOG_CLIENT_TABS,
} from '../../testing/demo-test-helpers';

describe('JosanzClientsListComponent', () => {
  let fixture: ComponentFixture<JosanzClientsListComponent>;
  let component: JosanzClientsListComponent;
  let router: { navigate: jest.Mock };
  let clientsFacade: ReturnType<typeof createClientsFacadeMock>;
  let catalogTheme: ReturnType<typeof createCatalogThemeFacadeMock>;

  beforeEach(async () => {
    router = { navigate: jest.fn() };
    clientsFacade = createClientsFacadeMock([demoClient()]);
    catalogTheme = createCatalogThemeFacadeMock();

    await TestBed.configureTestingModule({
      imports: [JosanzClientsListComponent],
      providers: [
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: { get: () => null } },
          },
        },
        { provide: ClientsFacade, useValue: clientsFacade },
        { provide: CatalogThemeFacade, useValue: catalogTheme },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JosanzClientsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('expone la configuración del listado de clientes', () => {
    const config = component.listConfig();
    expect(config.title).toBe('Clientes');
    expect(config.primaryBtnLabel).toBe('Añadir Cliente');
    expect(config.filterOptions).toEqual(JOSANZ_CATALOG_CLIENT_TABS);
    expect(config.addRoute).toBe('/clients/new');
    expect(config.detailRoute).toBe('/clients');
  });

  it('mapea clientes del facade a filas del catálogo', () => {
    const config = component.listConfig();
    expect(config.rows).toHaveLength(1);
    expect(config.rows[0]?.title).toBe('Demo Cliente S.L.');
  });

  it('carga clientes y tema al iniciar', () => {
    expect(catalogTheme.loadCatalogTheme).toHaveBeenCalled();
    expect(clientsFacade.loadClients).toHaveBeenCalled();
  });

  it('muestra toast de creación y limpia query params', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [JosanzClientsListComponent],
      providers: [
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: { get: (key: string) => (key === 'created' ? '1' : null) },
            },
          },
        },
        { provide: ClientsFacade, useValue: clientsFacade },
        { provide: CatalogThemeFacade, useValue: catalogTheme },
      ],
    }).compileComponents();

    const createdFixture = TestBed.createComponent(JosanzClientsListComponent);
    const createdComponent = createdFixture.componentInstance;
    createdFixture.detectChanges();

    expect(createdComponent.showSuccessToast()).toBe(true);
    expect(createdComponent.successToastMessage()).toBe('Cliente creado correctamente');
    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: expect.any(Object),
      queryParams: {},
      replaceUrl: true,
    });
  });

  it('oculta el toast al descartarlo', () => {
    component.showSuccessToast.set(true);
    component.dismissToast();
    expect(component.showSuccessToast()).toBe(false);
  });
});
