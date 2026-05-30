import type { CoverConfig } from '../document-create/cover-editor.component';
import type { SignatureConfig } from '../document-create/signature-editor.component';
import type { HeaderFooterConfig } from '../document-create/header-footer-editor.component';
import type { PdfStyle } from '../services/templates-registry.service';
import type { PdfBackgroundSettings } from '../utils/document-preview-css';

export type ContentEditorMode = 'markdown' | 'html' | 'plain';

export type EditorBlockTemplateId =
  | 'paragraph'
  | 'section'
  | 'key-value'
  | 'simple-table'
  | 'timeline'
  | 'budget'
  | 'risks'
  | 'approvals'
  | 'callout'
  | 'signatures';

export interface EditorBlockTemplate {
  id: EditorBlockTemplateId;
  label: string;
  markdown: string;
  html: string;
}

export interface DocumentType {
  id: string;
  name: string;
  description: string;
}

export interface DocumentRenderInput {
  content: string;
  contentEditorMode: ContentEditorMode;
  customCss: string;
  selectedPdfStyle: string;
  selectedQuickStylePreset: string;
  pdfStyles: PdfStyle[];
  backgroundSettings: PdfBackgroundSettings;
  coverConfig?: Partial<CoverConfig>;
  signatureConfig?: Partial<SignatureConfig>;
  headerFooterConfig?: Partial<HeaderFooterConfig>;
  coverPanelEnabled?: boolean;
  signaturePanelEnabled?: boolean;
  headerFooterPanelEnabled?: boolean;
  documentTitle?: string;
  isCorporateCoverEnabled?: boolean;
}

export interface DocumentRenderPayload {
  contentMarkup: string;
  bodyHtml: string;
  previewStylesheet: string;
  exportStylesheet: string;
  fullExportHtml: string;
}
