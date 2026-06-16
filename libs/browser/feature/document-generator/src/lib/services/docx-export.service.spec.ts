import { DocxExportService } from './docx-export.service';

describe('DocxExportService', () => {
  let service: DocxExportService;

  beforeEach(() => {
    service = new DocxExportService();
  });

  it('exports headings and paragraphs to a DOCX blob', async () => {
    const html = '<h1>Título</h1><p>Párrafo con <strong>negrita</strong>.</p>';
    const blob = await service.exportHtml(html, 'Prueba');
    expect(blob.type).toBe(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
    expect(blob.size).toBeGreaterThan(100);
  });

  it('exports tables', async () => {
    const html =
      '<table><tr><th>A</th><th>B</th></tr><tr><td>1</td><td>2</td></tr></table>';
    const blob = await service.exportHtml(html);
    expect(blob.size).toBeGreaterThan(100);
  });
});
