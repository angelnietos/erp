import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-document-export-actions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <input
      type="file"
      #fileInput
      hidden
      (change)="importFile.emit($event)"
      accept=".md,.txt,.html,.htm,.docx,.doc,.pdf"
      title="Importar Markdown, HTML, Word, PDF o texto plano"
    />
    <div class="flex flex-wrap gap-2">
      <button
        type="button"
        (click)="fileInput.click()"
        class="dg-btn dg-btn-primary dg-btn-sm"
        title="Word (.docx), PDF, Markdown, HTML o texto"
      >
        Importar
      </button>
      <button
        type="button"
        (click)="exportFormat.emit('markdown')"
        class="dg-btn dg-btn-secondary dg-btn-sm"
      >
        MD
      </button>
      <button
        type="button"
        (click)="exportFormat.emit('docx')"
        class="dg-btn dg-btn-secondary dg-btn-sm"
        title="Exportar Word (.docx) desde el mismo HTML que la vista previa"
      >
        DOCX
      </button>
      <button
        type="button"
        (click)="exportFormat.emit('pdf-markdown')"
        class="dg-btn dg-btn-secondary dg-btn-sm"
        title="Descargar PDF usando la vista previa Markdown"
      >
        PDF MD
      </button>
      <button
        type="button"
        (click)="exportFormat.emit('pdf-html')"
        class="dg-btn dg-btn-secondary dg-btn-sm"
        title="Descargar PDF usando la vista previa HTML"
      >
        PDF HTML
      </button>
      <button
        type="button"
        (click)="exportFormat.emit('xlsx')"
        class="dg-btn dg-btn-secondary dg-btn-sm"
      >
        Excel
      </button>
      <button
        type="button"
        (click)="exportFormat.emit('html')"
        class="dg-btn dg-btn-secondary dg-btn-sm"
      >
        HTML
      </button>
      <button
        type="button"
        (click)="exportFormat.emit('txt')"
        class="dg-btn dg-btn-secondary dg-btn-sm"
      >
        TXT
      </button>
    </div>
  `,
})
export class DocumentExportActionsComponent {
  readonly importFile = output<Event>();
  readonly exportFormat = output<string>();
}
