import { documentGeneratorBackend } from './document-generator-backend';
import { HtmlPdfService } from './application/services/html-pdf.service';

describe('documentGeneratorBackend', () => {
  it('should export module name', () => {
    expect(documentGeneratorBackend()).toEqual('document-generator-backend');
  });
});

describe('HtmlPdfService', () => {
  it('should be defined', () => {
    expect(HtmlPdfService).toBeDefined();
  });
});
