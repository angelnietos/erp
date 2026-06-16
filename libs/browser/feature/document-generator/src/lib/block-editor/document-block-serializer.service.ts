import { Injectable } from '@angular/core';
import type { ContentEditorMode } from '../models/document-render.models';

/** Serializa contenido entre TipTap (HTML), Markdown legacy y modos del formulario. */
@Injectable({ providedIn: 'root' })
export class DocumentBlockSerializerService {
  inferModeFromHtml(html: string): ContentEditorMode {
    return /<[a-z][\s\S]*>/i.test(html) ? 'html' : 'markdown';
  }

  /** Normaliza HTML de TipTap/mammoth para el pipeline de render. */
  normalizeEditorHtml(html: string): string {
    return html
      .replace(/<p><\/p>/g, '')
      .replace(/\sdata-pm-slice="[^"]*"/g, '')
      .trim();
  }

  proseMirrorPlaceholder(): Record<string, unknown> {
    return {
      type: 'doc',
      content: [{ type: 'paragraph' }],
    };
  }
}
