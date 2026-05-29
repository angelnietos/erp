import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JosanzReportNewComponent } from './josanz-report-new.component';
import { provideRouter } from '@angular/router';

describe('JosanzReportNewComponent', () => {
  let fixture: ComponentFixture<JosanzReportNewComponent>;
  let component: JosanzReportNewComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JosanzReportNewComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(JosanzReportNewComponent);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have report types', () => {
      expect(component.reportTypes.length).toBe(4);
    });

    it('should have formats', () => {
      expect(component.formats.length).toBe(2);
    });

    it('should default selectedType to first report type', () => {
      expect(component.selectedType()).toBe('Resumen ejecutivo');
    });

    it('should default selectedFormat to PDF', () => {
      expect(component.selectedFormat()).toBe('PDF');
    });

    it('should start with empty message', () => {
      expect(component.message()).toBe('');
    });

    it('should expose theme, shell, and dash injection tokens', () => {
      expect(component.theme).toBeDefined();
      expect(component.shell).toBeDefined();
      expect(component.dash).toBeDefined();
    });
  });

  describe('signal interactions', () => {
    it('should set selected type on signal set', () => {
      component.selectedType.set('Ventas por cliente');
      expect(component.selectedType()).toBe('Ventas por cliente');
    });

    it('should set selected format on signal set', () => {
      component.selectedFormat.set('XLSX');
      expect(component.selectedFormat()).toBe('XLSX');
    });

    it('should accept all valid report types', () => {
      component.reportTypes.forEach((t) => {
        component.selectedType.set(t);
        expect(component.selectedType()).toBe(t);
      });
    });
  });

  describe('onGenerate', () => {
    it('should generate message with defaults', () => {
      component.onGenerate();
      expect(component.message()).toBe(
        'Borrador preparado: Resumen ejecutivo · PDF (demo sin servidor de informes).',
      );
    });

    it('should include type and format in generated message', () => {
      component.selectedType.set('Stock valorado');
      component.selectedFormat.set('XLSX');
      component.onGenerate();
      expect(component.message()).toBe(
        'Borrador preparado: Stock valorado · XLSX (demo sin servidor de informes).',
      );
    });

    it('should match expected message pattern', () => {
      component.selectedType.set('Cobros pendientes');
      component.selectedFormat.set('PDF');
      component.onGenerate();
      expect(component.message()).toContain('Borrador preparado:');
      expect(component.message()).toContain('Cobros pendientes');
      expect(component.message()).toContain('PDF');
      expect(component.message()).toContain('(demo sin servidor de informes).');
    });
  });

  describe('template', () => {
    beforeEach(() => fixture.detectChanges());

    it('should render page title', () => {
      const h1 = fixture.nativeElement.querySelector('h1');
      expect(h1).toBeTruthy();
      expect(h1.textContent).toContain('Nuevo informe');
    });

    it('should render back to dashboard link', () => {
      const links = fixture.nativeElement.querySelectorAll('a');
      const backLink = Array.from(links).find(
        (a: HTMLElement) => a.getAttribute('href') === '/dashboard' || a.textContent?.includes('Volver al panel'),
      );
      expect(backLink).toBeTruthy();
    });

    it('should render three wizard steps', () => {
      const steps = fixture.nativeElement.querySelectorAll('ol li');
      expect(steps.length).toBe(3);
    });

    it('should render report type buttons', () => {
      const typeButtons = fixture.nativeElement.querySelectorAll('li:first-of-type button[type="button"]');
      expect(typeButtons.length).toBe(4);
    });

    it('should render format buttons', () => {
      const allButtonGroups = fixture.nativeElement.querySelectorAll('li:last-of-type button[type="button"]');
      expect(allButtonGroups.length).toBe(2);
    });

    it('should render date inputs', () => {
      const dateInputs = fixture.nativeElement.querySelectorAll('input[type="date"]');
      expect(dateInputs.length).toBe(2);
    });

    it('should render generate button', () => {
      const allButtons = fixture.nativeElement.querySelectorAll('button[type="button"]');
      const generateBtn = Array.from(allButtons).find(
        (btn: HTMLElement) => btn.textContent?.includes('Generar borrador'),
      );
      expect(generateBtn).toBeTruthy();
    });

    it('should render link to export page', () => {
      const links = fixture.nativeElement.querySelectorAll('a');
      const exportLinks = Array.from(links).filter(
        (a: HTMLElement) => a.getAttribute('href') === '/export' || a.textContent?.includes('Ir a exportaciones'),
      );
      expect(exportLinks.length).toBeGreaterThanOrEqual(1);
    });

    it('should call onGenerate when generate button is clicked', () => {
      jest.spyOn(component, 'onGenerate');
      const allButtons = fixture.nativeElement.querySelectorAll('button[type="button"]');
      const generateBtn = Array.from(allButtons).find(
        (btn: HTMLElement) => btn.textContent?.includes('Generar borrador'),
      ) as HTMLElement;
      generateBtn.click();
      expect(component.onGenerate).toHaveBeenCalledTimes(1);
    });

    it('should update selectedType when a report type button is clicked', () => {
      const typeButtons = fixture.nativeElement.querySelectorAll('li:first-of-type button[type="button"]');
      (typeButtons[1] as HTMLElement).click();
      expect(component.selectedType()).toBe('Ventas por cliente');
    });

    it('should update selectedFormat when a format button is clicked', () => {
      const allButtons = fixture.nativeElement.querySelectorAll('li:last-of-type button[type="button"]');
      (allButtons[0] as HTMLElement).click();
      expect(component.selectedFormat()).toBe('PDF');
    });

    it('should hide message when empty', () => {
      component.message.set('');
      fixture.detectChanges();
      const body = fixture.nativeElement.textContent;
      expect(body).not.toContain('Borrador preparado');
    });

    it('should show message after onGenerate', () => {
      component.onGenerate();
      fixture.detectChanges();
      const body = fixture.nativeElement.textContent;
      expect(body).toContain('Borrador preparado');
    });
  });
});
