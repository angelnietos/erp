import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JosanzExportCenterComponent } from './josanz-export-center.component';
import { provideRouter } from '@angular/router';

const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;

describe('JosanzExportCenterComponent', () => {
  let fixture: ComponentFixture<JosanzExportCenterComponent>;
  let component: JosanzExportCenterComponent;

  beforeAll(() => {
    URL.createObjectURL = jest.fn().mockReturnValue('blob:test-url');
    URL.revokeObjectURL = jest.fn();
  });

  afterAll(() => {
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JosanzExportCenterComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(JosanzExportCenterComponent);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have exports data', () => {
      expect(component.exports.length).toBe(4);
    });

    it('should have correct export ids', () => {
      const ids = component.exports.map((e) => e.id);
      expect(ids).toEqual(['clients', 'budgets', 'delivery', 'stock']);
    });

    it('should have titles and descriptions', () => {
      expect(component.exports[0].title).toBe('Cartera de clientes');
      expect(component.exports[0].description).toContain('Razón social');
    });

    it('should have module links', () => {
      expect(component.exports[0].moduleLink).toBe('/clients');
      expect(component.exports[1].moduleLink).toBe('/budgets');
    });

    it('should have formats for each export', () => {
      component.exports.forEach((exp) => {
        expect(exp.formats.length).toBeGreaterThan(0);
      });
    });
  });

  describe('onDemoDownload', () => {
    let mockAnchor: { href: string; download: string; click: jest.Mock };

    beforeEach(() => {
      mockAnchor = { href: '', download: '', click: jest.fn() };
      jest
        .spyOn(document, 'createElement')
        .mockReturnValue(mockAnchor as unknown as HTMLAnchorElement);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should set anchor href to blob url', () => {
      component.onDemoDownload('clients');
      expect(mockAnchor.href).toBe('blob:test-url');
    });

    it('should set correct download filename', () => {
      component.onDemoDownload('clients');
      expect(mockAnchor.download).toBe('josanz-export-clients.txt');
    });

    it('should trigger click on anchor', () => {
      component.onDemoDownload('clients');
      expect(mockAnchor.click).toHaveBeenCalledTimes(1);
    });

    it('should set filename with different export id', () => {
      component.onDemoDownload('stock');
      expect(mockAnchor.download).toBe('josanz-export-stock.txt');
    });

    it('should call createObjectURL with a blob', () => {
      (URL.createObjectURL as jest.Mock).mockClear();
      component.onDemoDownload('clients');
      expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
      expect(
        (URL.createObjectURL as jest.Mock).mock.calls[0][0],
      ).toBeInstanceOf(Blob);
    });

    it('should revoke object url after download', () => {
      component.onDemoDownload('clients');
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-url');
    });
  });

  describe('template', () => {
    beforeEach(() => fixture.detectChanges());

    it('should render page title', () => {
      const h1 = fixture.nativeElement.querySelector('h1');
      expect(h1).toBeTruthy();
      expect(h1.textContent).toContain('Exportar datos');
    });

    it('should render back to dashboard link', () => {
      const links = fixture.nativeElement.querySelectorAll('a');
      const backLink = Array.from(links).find((a: HTMLElement) =>
        a.textContent?.includes('Volver al panel'),
      );
      expect(backLink).toBeTruthy();
    });

    it('should render cards for each export', () => {
      const cards = fixture.nativeElement.querySelectorAll('josanz-card');
      expect(cards.length).toBe(4);
    });

    it('should render download buttons', () => {
      const allButtons =
        fixture.nativeElement.querySelectorAll('josanz-button');
      const downloadBtns = Array.from(allButtons).filter((btn: HTMLElement) =>
        btn.textContent?.includes('Descargar (demo)'),
      );
      expect(downloadBtns.length).toBeGreaterThanOrEqual(1);
    });
  });
});
