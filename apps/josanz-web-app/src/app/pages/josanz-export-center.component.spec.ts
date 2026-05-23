import { TestBed } from '@angular/core/testing';
import { JosanzExportCenterComponent } from './josanz-export-center.component';
import { provideRouter } from '@angular/router';

describe('JosanzExportCenterComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JosanzExportCenterComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(JosanzExportCenterComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have exports data', () => {
    const fixture = TestBed.createComponent(JosanzExportCenterComponent);
    const component = fixture.componentInstance;
    expect(component.exports.length).toBe(4);
    expect(component.exports[0].id).toBe('clients');
    expect(component.exports[1].id).toBe('budgets');
    expect(component.exports[2].id).toBe('delivery');
    expect(component.exports[3].id).toBe('stock');
  });

  it('should generate download filename', () => {
    const component = TestBed.createComponent(JosanzExportCenterComponent)
      .componentInstance;
    const mockAnchor = { href: '', download: '', click: jest.fn() };
    jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor as unknown as HTMLAnchorElement);
    const originalURL = window.URL;
    Object.defineProperty(window, 'URL', {
      value: {
        createObjectURL: jest.fn().mockReturnValue('blob:url'),
        revokeObjectURL: jest.fn(),
      },
      writable: true,
    });

    component.onDemoDownload('clients');

    expect(mockAnchor.download).toBe('josanz-export-clients.txt');
    Object.defineProperty(window, 'URL', { value: originalURL, writable: true });
  });
});