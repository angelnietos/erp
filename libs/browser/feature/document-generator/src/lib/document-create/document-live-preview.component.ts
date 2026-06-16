import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-document-live-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="document-editor-column document-editor-column--preview">
      <div class="document-editor-column__bar">
        <span>Vista previa</span>
        <span class="font-mono text-xs opacity-80"
          >WYSIWYG · {{ wordCount() }} palabras ·
          {{ characterCount() }} caracteres</span
        >
      </div>
      @if (previewRenderKey()) {
        <iframe
          title="Vista previa del documento"
          class="document-preview-pane document-preview-pane--iframe w-full min-h-[70vh] border border-[#e2e8f0] rounded-xl bg-[#e8ecf1] shadow-inner"
          [srcdoc]="htmlPreviewSrcdoc()"
        ></iframe>
      }
    </div>
  `,
})
export class DocumentLivePreviewComponent {
  readonly wordCount = input(0);
  readonly characterCount = input(0);
  readonly htmlPreviewSrcdoc = input<SafeHtml | string>('');
  readonly previewRenderKey = input(0);
}
