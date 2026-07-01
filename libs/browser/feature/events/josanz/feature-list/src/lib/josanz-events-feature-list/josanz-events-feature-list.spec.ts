import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientsFacade } from '@josanz-erp/clients-data-access';
import { CatalogThemeFacade } from '@josanz-erp/josanz-ui';
import { JosanzEventsFeatureListComponent } from './josanz-events-feature-list';
import { JosanzEventsFacade } from '../services/josanz-events.facade';
import {
  createCatalogThemeFacadeMock,
  createClientsFacadeMockForEvents,
  createEventsFacadeMock,
  demoEvent,
} from '../../testing/demo-test-helpers';

describe('JosanzEventsFeatureListComponent', () => {
  let fixture: ComponentFixture<JosanzEventsFeatureListComponent>;
  let component: JosanzEventsFeatureListComponent;
  let router: { navigate: jest.Mock };
  let eventsFacade: ReturnType<typeof createEventsFacadeMock>;

  beforeEach(async () => {
    router = { navigate: jest.fn() };
    eventsFacade = createEventsFacadeMock();

    await TestBed.configureTestingModule({
      imports: [JosanzEventsFeatureListComponent],
      providers: [
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: { get: () => null } },
          },
        },
        { provide: JosanzEventsFacade, useValue: eventsFacade },
        { provide: ClientsFacade, useValue: createClientsFacadeMockForEvents() },
        { provide: CatalogThemeFacade, useValue: createCatalogThemeFacadeMock() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JosanzEventsFeatureListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('configura el listado de eventos con tablero kanban', () => {
    const config = component.listConfig();
    expect(config.title).toBe('Eventos');
    expect(config.addRoute).toBe('/events/new');
    expect(config.features?.statusBoard).toBe(true);
    expect(config.filterOptions).toEqual(['Todos', 'Externos', 'Hoteles', 'Espacios']);
  });

  it('muestra toast tras crear evento', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [JosanzEventsFeatureListComponent],
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
        { provide: JosanzEventsFacade, useValue: eventsFacade },
        { provide: ClientsFacade, useValue: createClientsFacadeMockForEvents() },
        { provide: CatalogThemeFacade, useValue: createCatalogThemeFacadeMock() },
      ],
    }).compileComponents();

    const createdFixture = TestBed.createComponent(JosanzEventsFeatureListComponent);
    createdFixture.detectChanges();

    expect(createdFixture.componentInstance.showSuccessToast()).toBe(true);
    expect(createdFixture.componentInstance.successToastMessage()).toContain('creado');
    expect(eventsFacade.refreshEvents).toHaveBeenCalled();
  });
});

/** Flujo demo: cambio de estado en tablero. */
describe('Demo flujo eventos — listado y estado', () => {
  let eventsFacade: ReturnType<typeof createEventsFacadeMock>;
  let component: JosanzEventsFeatureListComponent;

  beforeEach(async () => {
    eventsFacade = createEventsFacadeMock([demoEvent({ status: 'DRAFT' })]);

    await TestBed.configureTestingModule({
      imports: [JosanzEventsFeatureListComponent],
      providers: [
        { provide: Router, useValue: { navigate: jest.fn() } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: { get: () => null } } },
        },
        { provide: JosanzEventsFacade, useValue: eventsFacade },
        { provide: ClientsFacade, useValue: createClientsFacadeMockForEvents() },
        { provide: CatalogThemeFacade, useValue: createCatalogThemeFacadeMock() },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(JosanzEventsFeatureListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('persiste cambio de estado y muestra toast de éxito', () => {
    component.onRowStatusChange({
      id: 'event-demo-1',
      status: 'CONFIRMED',
      previousStatus: 'DRAFT',
    });

    expect(eventsFacade.patchEventStatus).toHaveBeenCalledWith(
      'event-demo-1',
      'CONFIRMED',
      expect.anything(),
    );
    expect(eventsFacade.updateEventStatus).toHaveBeenCalled();
    expect(component.showSuccessToast()).toBe(true);
    expect(component.successToastMessage()).toContain('servidor');
  });
});
