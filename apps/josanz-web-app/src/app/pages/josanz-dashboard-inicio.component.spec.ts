import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JosanzDashboardInicioComponent } from './josanz-dashboard-inicio.component';
import { provideRouter } from '@angular/router';
import { GlobalAuthStore } from '@josanz-erp/shared-data-access';

describe('JosanzDashboardInicioComponent', () => {
  let fixture: ComponentFixture<JosanzDashboardInicioComponent>;
  let component: JosanzDashboardInicioComponent;
  let globalAuth: InstanceType<typeof GlobalAuthStore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JosanzDashboardInicioComponent],
      providers: [provideRouter([]), GlobalAuthStore],
    }).compileComponents();

    globalAuth = TestBed.inject(GlobalAuthStore);
    globalAuth.setUser({
      id: 'user-alexis',
      email: 'admin@alexis.local',
      name: 'Alexis Admin',
      tenantId: 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a',
      permissions: ['*'],
    });

    fixture = TestBed.createComponent(JosanzDashboardInicioComponent);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have default viewMode', () => {
      expect(component.viewMode).toBe('Técnicos');
    });

    it('should have default period', () => {
      expect(component.period).toBe('Semana');
    });

    it('should have view options', () => {
      expect(component.viewOptions.length).toBe(3);
      expect(component.viewOptions).toContain('Eventos');
      expect(component.viewOptions).toContain('Técnicos');
      expect(component.viewOptions).toContain('Proveedores');
    });

    it('should have period options', () => {
      expect(component.periodOptions.length).toBe(4);
      expect(component.periodOptions).toContain('Día');
      expect(component.periodOptions).toContain('Semana');
      expect(component.periodOptions).toContain('Mes');
      expect(component.periodOptions).toContain('Lista');
    });

    it('should have technicians', () => {
      expect(component.technicians.length).toBe(5);
      expect(component.technicians[0].initials).toBe('S1');
    });

    it('should have days', () => {
      expect(component.days.length).toBe(7);
      expect(component.days).toEqual([
        'Lunes',
        'Martes',
        'Miércoles',
        'Jueves',
        'Viernes',
        'Sábado',
        'Domingo',
      ]);
    });

    it('should have sample event with correct data', () => {
      expect(component.sampleEvent.title).toBe('Evento X');
      expect(component.sampleEvent.client).toBe('Cliente');
      expect(component.sampleEvent.tags.length).toBe(3);
      expect(component.sampleEvent.tags[0].label).toBe('Pagado');
      expect(component.sampleEvent.tags[0].pillKey).toBe('confirmado');
    });

    it('should have schedule cells', () => {
      expect(component.scheduleCells.length).toBeGreaterThan(0);
    });
  });

  describe('cellFor', () => {
    it('should find cell with event correctly', () => {
      const cell = component.cellFor('Lunes', 't1');
      expect(cell).toBeDefined();
      expect(cell?.event).toBeDefined();
      expect(cell?.event?.title).toBe('Evento X');
    });

    it('should find cell without event', () => {
      const cell = component.cellFor('Lunes', 't2');
      expect(cell).toBeDefined();
      expect(cell?.event).toBeUndefined();
    });

    it('should find cells on different days', () => {
      const cell = component.cellFor('Martes', 't2');
      expect(cell).toBeDefined();
      expect(cell?.event?.title).toBe('Evento X');
    });

    it('should return undefined for non-existent cell', () => {
      expect(component.cellFor('Lunes', 'unknown')).toBeUndefined();
    });
  });

  describe('onViewChange', () => {
    it('should change view mode to Eventos', () => {
      component.onViewChange('Eventos');
      expect(component.viewMode).toBe('Eventos');
    });

    it('should change view mode to Proveedores', () => {
      component.onViewChange('Proveedores');
      expect(component.viewMode).toBe('Proveedores');
    });

    it('should ignore invalid view value', () => {
      const original = component.viewMode;
      component.onViewChange('Invalid');
      expect(component.viewMode).toBe(original);
    });
  });

  describe('onPeriodChange', () => {
    it('should change period to Día', () => {
      component.onPeriodChange('Día');
      expect(component.period).toBe('Día');
    });

    it('should change period to Mes', () => {
      component.onPeriodChange('Mes');
      expect(component.period).toBe('Mes');
    });

    it('should change period to Lista', () => {
      component.onPeriodChange('Lista');
      expect(component.period).toBe('Lista');
    });

    it('should ignore invalid period value', () => {
      component.period = 'Semana';
      component.onPeriodChange('Invalid');
      expect(component.period).toBe('Semana');
    });
  });

  describe('isPeriodActive', () => {
    it('should check period active status', () => {
      component.period = 'Semana';
      expect(component.isPeriodActive('Semana')).toBe(true);
      expect(component.isPeriodActive('Día')).toBe(false);
    });
  });

  describe('template', () => {
    beforeEach(() => fixture.detectChanges());

    it('should render welcome title with session user first name', () => {
      const greeting = fixture.nativeElement.querySelector(
        '.josanz-home__greeting',
      );
      const title = fixture.nativeElement.querySelector('h1');
      expect(greeting?.textContent).toContain('Bienvenido/a');
      expect(title?.textContent).toContain('Alexis');
    });

    it('should render session user in header', () => {
      const label = fixture.nativeElement.querySelector(
        '.josanz-home__header-user-label',
      );
      expect(label?.textContent).toContain('Alexis Admin');
    });

    it('should render filter tabs', () => {
      const filterTabs =
        fixture.nativeElement.querySelector('josanz-filter-tabs');
      expect(filterTabs).toBeTruthy();
    });

    it('should render period filter tabs', () => {
      const filterTabs = fixture.nativeElement.querySelectorAll('josanz-filter-tabs');
      expect(filterTabs.length).toBeGreaterThanOrEqual(2);
    });

    it('should render KPI cards', () => {
      const kpiCards = fixture.nativeElement.querySelectorAll(
        '.josanz-home__kpi-card',
      );
      expect(kpiCards.length).toBeGreaterThanOrEqual(3);
    });

    it('should render schedule grid', () => {
      const schedule = fixture.nativeElement.querySelector(
        '.josanz-home__schedule',
      );
      expect(schedule).toBeTruthy();
    });

    it('should call onPeriodChange when period tab is clicked', () => {
      jest.spyOn(component, 'onPeriodChange');
      const periodTabs = fixture.nativeElement.querySelectorAll(
        'josanz-filter-tabs',
      )[1];
      const firstButton = periodTabs?.querySelector('button');
      (firstButton as HTMLElement)?.click();
      expect(component.onPeriodChange).toHaveBeenCalled();
    });

    it('should reflect active period in component state', () => {
      component.period = 'Semana';
      fixture.detectChanges();
      expect(component.period).toBe('Semana');
      expect(component.isPeriodActive('Semana')).toBe(true);
    });
  });
});
