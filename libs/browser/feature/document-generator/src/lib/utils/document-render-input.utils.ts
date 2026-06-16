import type { ContentEditorMode, DocumentRenderInput } from '../models/document-render.models';
import type { CoverConfig } from '../document-create/cover-editor.component';
import type { SignatureConfig } from '../document-create/signature-editor.component';
import type { HeaderFooterConfig } from '../document-create/header-footer-editor.component';
import type { WatermarkConfig } from '../document-create/watermark-dialog.component';
import type { PdfStyle } from '../services/templates-registry.service';
import { readPdfBackgroundSettings } from './document-preview-css';

function asEditorMode(value: unknown): ContentEditorMode {
  if (value === 'html' || value === 'plain' || value === 'markdown') {
    return value;
  }
  return 'markdown';
}

/** Reconstruye {@link DocumentRenderInput} desde payload IndexedDB / navegación. */
export function buildRenderInputFromPersisted(
  data: Record<string, unknown>,
  pdfStyles: PdfStyle[],
): DocumentRenderInput {
  const background = readPdfBackgroundSettings(data);
  const coverConfig = data['coverConfig'] as Partial<CoverConfig> | undefined;
  const signatureConfig = data['signatureConfig'] as
    | Partial<SignatureConfig>
    | undefined;
  const headerFooterConfig = data['headerFooterConfig'] as
    | Partial<HeaderFooterConfig>
    | undefined;
  const watermarkConfig = data['watermarkConfig'] as
    | Partial<WatermarkConfig>
    | undefined;

  return {
    content: String(data['content'] ?? ''),
    contentEditorMode: asEditorMode(data['contentEditorMode']),
    customCss: typeof data['customCss'] === 'string' ? data['customCss'] : '',
    selectedPdfStyle:
      typeof data['pdfStyleId'] === 'string' ? data['pdfStyleId'] : 'default',
    selectedQuickStylePreset:
      typeof data['quickStylePreset'] === 'string'
        ? data['quickStylePreset']
        : '',
    pdfStyles,
    backgroundSettings: background,
    coverConfig,
    signatureConfig,
    headerFooterConfig,
    watermarkConfig,
    coverPanelEnabled: coverConfig?.enabled === true,
    signaturePanelEnabled: signatureConfig?.enabled === true,
    headerFooterPanelEnabled: headerFooterConfig?.enabled === true,
    watermarkPanelEnabled: watermarkConfig?.enabled === true,
    documentTitle:
      typeof data['title'] === 'string' ? data['title'] : 'Documento',
  };
}
