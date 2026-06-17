import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-document-live-preview',
  standalone: true,
  imports: [CommonModule],
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-height: clamp(28rem, 62vh, 52rem);
        min-width: 0;
        height: 100%;
      }

      .document-editor-column--preview {
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        min-height: clamp(28rem, 62vh, 52rem);
        height: 100%;
      }

      .document-preview-pane--iframe {
        flex: 1 1 auto;
        min-height: clamp(22rem, 54vh, 46rem);
        height: clamp(22rem, 54vh, 46rem);
        width: 100%;
      }
    `,
  ],
  template: `
    <div class="document-editor-column document-editor-column--preview">
      <div class="document-editor-column__bar">
        <span>Vista previa</span>
        <span class="editor-stats"
          >WYSIWYG · {{ wordCount() }} pal. · {{ characterCount() }} car.</span
        >
      </div>
      @if (previewRenderKey()) {
        <iframe
          title="Vista previa del documento"
          class="document-preview-pane document-preview-pane--iframe"
          [srcdoc]="htmlPreviewSrcdoc()"
        ></iframe>
      } @else {
        <div
          class="document-preview-pane document-preview-pane--iframe flex items-center justify-center text-muted text-sm"
        >
          Generando vista previa…
        </div>
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
