import { TestBed } from '@angular/core/testing';
import { DocumentRenderService } from '../services/document-render.service';
import type { DocumentRenderInput } from '../models/document-render.models';

function minimalInput(overrides: Partial<DocumentRenderInput> = {}): DocumentRenderInput {
  return {
    content: '<h1>Título</h1><p>Párrafo de prueba.</p>',
    contentEditorMode: 'html',
    customCss: '',
    selectedPdfStyle: 'default',
    selectedQuickStylePreset: '',
    pdfStyles: [],
    backgroundSettings: {
      pdfBackgroundMode: 'theme',
      pdfBackgroundColor: '#ffffff',
      pdfBackgroundImageUrl: '',
      documentPaperColor: '#ffffff',
      documentTextColor: '#1f2937',
      documentMutedColor: '#64748b',
      documentAccentColor: '#2563eb',
      documentBorderColor: '#e2e8f0',
    },
    documentTitle: 'Prueba',
    ...overrides,
  };
}

describe('DocumentRenderService WYSIWYG parity', () => {
  let service: DocumentRenderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentRenderService);
  });

  it('export HTML and preview srcdoc share the same body markup', () => {
    const input = minimalInput();
    const exportHtml = service.buildPdfExportHtml(input);
    const previewSrcdoc = service.buildUnifiedPreviewSrcdoc(input);

    const exportBody = exportHtml.match(
      /<main class="pdf-body-content markdown-preview">([\s\S]*?)<\/main>/,
    )?.[1];
    const previewBody = previewSrcdoc.match(
      /<main class="pdf-body-content markdown-preview">([\s\S]*?)<\/main>/,
    )?.[1];

    expect(exportBody).toBeTruthy();
    expect(previewBody).toBe(exportBody);
  });

  it('preview adds screen overrides without changing export stylesheet base', () => {
    const input = minimalInput();
    const payload = service.buildPayload(input);
    const exportHtml = service.buildPdfExportHtml(input);
    const previewSrcdoc = service.buildUnifiedPreviewSrcdoc(input);

    expect(exportHtml).toContain(payload.exportStylesheet);
    expect(previewSrcdoc).toContain(payload.exportStylesheet);
    expect(previewSrcdoc).toContain('background: #e8ecf1');
    expect(exportHtml).not.toContain('background: #e8ecf1');
  });

  it('fullExportHtml uses pdf-body-content wrapper for print', () => {
    const html = service.buildPdfExportHtml(minimalInput());
    expect(html).toContain('pdf-body-content markdown-preview');
    expect(html).toContain('document-generator-export-css');
    expect(html).toContain('Título');
    expect(html).toContain('Párrafo de prueba');
    expect(html).toContain('@page');
  });
});
