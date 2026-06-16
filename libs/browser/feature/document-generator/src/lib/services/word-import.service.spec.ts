import { WordImportService } from './word-import.service';

describe('WordImportService', () => {
  let service: WordImportService;

  beforeEach(() => {
    service = new WordImportService();
  });

  it('maps docx to html import result', async () => {
    jest.spyOn(service, 'importDocx').mockResolvedValue({
      html: '<h1>Hola</h1><p>Mundo</p>',
      plainText: 'Hola Mundo',
      warnings: [],
    });

    const file = new File(['fake'], 'test.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    const result = await service.toImportResult(file);
    expect(result.success).toBe(true);
    expect(result.blocks[0]?.type).toBe('html');
    expect(result.blocks[0]?.content).toContain('<h1>Hola</h1>');
    expect(result.metadata['source']).toBe('docx');
  });
});
