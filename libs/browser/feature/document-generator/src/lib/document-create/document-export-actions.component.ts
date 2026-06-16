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
      accept=".md,.txt,.html,.htm"
      title="Importar Markdown, HTML o texto plano"
    />
    <div class="flex flex-wrap gap-2">
      <button
        type="button"
        (click)="fileInput.click()"
        class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-brand text-white shadow-md hover:opacity-95 transition-opacity"
      >
        Importar
      </button>
      <button
        type="button"
        (click)="exportFormat.emit('markdown')"
        class="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium border border-soft bg-secondary text-primary hover:bg-surface-hover transition-colors shadow-sm"
      >
        MD
      </button>
      <button
        type="button"
        (click)="exportFormat.emit('pdf-markdown')"
        class="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium border border-soft bg-secondary text-primary hover:bg-surface-hover transition-colors shadow-sm"
        title="Descargar PDF usando la vista previa Markdown"
      >
        PDF MD
      </button>
      <button
        type="button"
        (click)="exportFormat.emit('pdf-html')"
        class="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium border border-soft bg-secondary text-primary hover:bg-surface-hover transition-colors shadow-sm"
        title="Descargar PDF usando la vista previa HTML"
      >
        PDF HTML
      </button>
      <button
        type="button"
        (click)="exportFormat.emit('xlsx')"
        class="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium border border-soft bg-secondary text-primary hover:bg-surface-hover transition-colors shadow-sm"
      >
        Excel
      </button>
      <button
        type="button"
        (click)="exportFormat.emit('html')"
        class="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium border border-soft bg-secondary text-primary hover:bg-surface-hover transition-colors shadow-sm"
      >
        HTML
      </button>
      <button
        type="button"
        (click)="exportFormat.emit('txt')"
        class="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium border border-soft bg-secondary text-primary hover:bg-surface-hover transition-colors shadow-sm"
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
