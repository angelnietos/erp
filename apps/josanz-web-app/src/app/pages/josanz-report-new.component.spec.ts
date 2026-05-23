import { TestBed } from '@angular/core/testing';
import { JosanzReportNewComponent } from './josanz-report-new.component';
import { provideRouter } from '@angular/router';

describe('JosanzReportNewComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JosanzReportNewComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(JosanzReportNewComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have report types', () => {
    const fixture = TestBed.createComponent(JosanzReportNewComponent);
    const component = fixture.componentInstance;
    expect(component.reportTypes.length).toBe(4);
    expect(component.reportTypes).toContain('Resumen ejecutivo');
    expect(component.reportTypes).toContain('Ventas por cliente');
    expect(component.reportTypes).toContain('Stock valorado');
    expect(component.reportTypes).toContain('Cobros pendientes');
  });

  it('should have formats', () => {
    const fixture = TestBed.createComponent(JosanzReportNewComponent);
    const component = fixture.componentInstance;
    expect(component.formats.length).toBe(2);
    expect(component.formats).toContain('PDF');
    expect(component.formats).toContain('XLSX');
  });

  it('should set selected type on click', () => {
    const fixture = TestBed.createComponent(JosanzReportNewComponent);
    const component = fixture.componentInstance;
    component.selectedType.set('Ventas por cliente');
    expect(component.selectedType()).toBe('Ventas por cliente');
  });

  it('should set selected format on click', () => {
    const fixture = TestBed.createComponent(JosanzReportNewComponent);
    const component = fixture.componentInstance;
    component.selectedFormat.set('PDF');
    expect(component.selectedFormat()).toBe('PDF');
  });

  it('should generate message on onGenerate', () => {
    const fixture = TestBed.createComponent(JosanzReportNewComponent);
    const component = fixture.componentInstance;
    component.selectedType.set('Stock valorado');
    component.selectedFormat.set('XLSX');
    component.onGenerate();
    expect(component.message()).toContain('Stock valorado');
    expect(component.message()).toContain('XLSX');
  });
});