import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { SafeHtml } from '@angular/platform-browser';
import type { ContentEditorMode } from '../models/document-render.models';

@Component({
  selector: 'app-document-live-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="document-editor-column document-editor-column--preview">
      <div class="document-editor-column__bar">
        <span>Vista Previa</span>
        <span class="font-mono">{{ wordCount() }} palabras · {{ characterCount() }} caracteres</span>
      </div>
      @if (contentEditorMode() === 'html') {
        <iframe
          title="Vista previa HTML"
          class="document-preview-pane w-full min-h-[70vh] border border-[#e2e8f0] rounded-xl bg-white shadow-inner"
          [ngStyle]="previewPaneStyle()"
          [srcdoc]="htmlPreviewSrcdoc()"
        ></iframe>
      } @else {
        <div
          class="document-preview-pane w-full px-5 py-4 border border-[#e2e8f0] rounded-xl overflow-auto markdown-preview shadow-inner"
          [class.document-preview-pane--isolated]="pdfBackgroundMode() !== 'theme'"
          [ngStyle]="previewPaneStyle()"
          [innerHTML]="previewHtml()"
        ></div>
      }
    </div>
  `,
})
export class DocumentLivePreviewComponent {
  readonly contentEditorMode = input<ContentEditorMode>('markdown');
  readonly wordCount = input(0);
  readonly characterCount = input(0);
  readonly htmlPreviewSrcdoc = input<SafeHtml | string>('');
  readonly previewHtml = input<SafeHtml | string>('');
  readonly previewPaneStyle = input<Record<string, string>>({});
  readonly pdfBackgroundMode = input<'theme' | 'color' | 'corporate'>('theme');
}
