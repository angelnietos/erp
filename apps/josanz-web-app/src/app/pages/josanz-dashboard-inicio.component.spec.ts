import { TestBed } from '@angular/core/testing';
import { JosanzDashboardInicioComponent } from './josanz-dashboard-inicio.component';
import { provideRouter } from '@angular/router';

describe('JosanzDashboardInicioComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JosanzDashboardInicioComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(JosanzDashboardInicioComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have default viewMode', () => {
    const fixture = TestBed.createComponent(JosanzDashboardInicioComponent);
    const component = fixture.componentInstance;
    expect(component.viewMode).toBe('Técnicos');
  });

  it('should have view options', () => {
    const fixture = TestBed.createComponent(JosanzDashboardInicioComponent);
    const component = fixture.componentInstance;
    expect(component.viewOptions.length).toBe(3);
    expect(component.viewOptions).toContain('Eventos');
    expect(component.viewOptions).toContain('Técnicos');
    expect(component.viewOptions).toContain('Proveedores');
  });

  it('should have period options', () => {
    const fixture = TestBed.createComponent(JosanzDashboardInicioComponent);
    const component = fixture.componentInstance;
    expect(component.periodOptions.length).toBe(4);
    expect(component.periodOptions).toContain('Día');
    expect(component.periodOptions).toContain('Semana');
    expect(component.periodOptions).toContain('Mes');
    expect(component.periodOptions).toContain('Lista');
  });

  it('should have technicians', () => {
    const fixture = TestBed.createComponent(JosanzDashboardInicioComponent);
    const component = fixture.componentInstance;
    expect(component.technicians.length).toBe(5);
    expect(component.technicians[0].initials).toBe('JL');
  });

  it('should have days', () => {
    const fixture = TestBed.createComponent(JosanzDashboardInicioComponent);
    const component = fixture.componentInstance;
    expect(component.days.length).toBe(3);
    expect(component.days).toContain('Lunes');
    expect(component.days).toContain('Martes');
    expect(component.days).toContain('Miércoles');
  });

  it('should find cell correctly', () => {
    const fixture = TestBed.createComponent(JosanzDashboardInicioComponent);
    const component = fixture.componentInstance;
    const cell = component.cellFor('Lunes', 't1');
    expect(cell).toBeDefined();
    expect(cell?.event).toBeDefined();
    expect(cell?.event?.title).toBe('Evento X');
  });

  it('should return undefined for non-existent cell', () => {
    const fixture = TestBed.createComponent(JosanzDashboardInicioComponent);
    const component = fixture.componentInstance;
    const cell = component.cellFor('Lunes', 'unknown');
    expect(cell).toBeUndefined();
  });

  it('should change view mode on onViewChange', () => {
    const fixture = TestBed.createComponent(JosanzDashboardInicioComponent);
    const component = fixture.componentInstance;
    component.onViewChange('Eventos');
    expect(component.viewMode).toBe('Eventos');
  });

  it('should change period on onPeriodChange', () => {
    const fixture = TestBed.createComponent(JosanzDashboardInicioComponent);
    const component = fixture.componentInstance;
    component.onPeriodChange('Día');
    expect(component.period).toBe('Día');
  });

  it('should check period active status', () => {
    const fixture = TestBed.createComponent(JosanzDashboardInicioComponent);
    const component = fixture.componentInstance;
    component.period = 'Semana';
    expect(component.isPeriodActive('Semana')).toBe(true);
    expect(component.isPeriodActive('Día')).toBe(false);
  });
});