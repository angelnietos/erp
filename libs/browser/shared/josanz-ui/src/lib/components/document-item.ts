import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'josanz-document-item',
  standalone: true,
  imports: [],
  template: `
    <div class="josanz-document-item">
      <div class="josanz-document-item__meta">
        <span class="josanz-document-item__dot" [style.backgroundColor]="statusColor"></span>
        <span class="josanz-document-item__name">{{ name }}</span>
      </div>

      <div class="josanz-document-item__actions">
        @if (showView) {
          <button
            type="button"
            class="josanz-icon-btn"
            (click)="onView($event)"
            [attr.aria-label]="'Ver documento ' + name"
            [attr.title]="'Ver documento ' + name"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
        }
        @if (showDownload) {
          <button
            type="button"
            class="josanz-icon-btn"
            (click)="onDownload($event)"
            [attr.aria-label]="'Descargar documento ' + name"
            [attr.title]="'Descargar documento ' + name"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </button>
        }
        @if (showDelete) {
          <button
            type="button"
            class="josanz-icon-btn josanz-icon-btn--danger"
            (click)="onDelete($event)"
            [attr.aria-label]="'Eliminar documento ' + name"
            [attr.title]="'Eliminar documento ' + name"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        }
      </div>
    </div>
  `,
})
export class DocumentItemComponent {
  @Input() name = '';
  @Input() statusColor = 'var(--josanz-success)';
  @Input() showView = false;
  @Input() showDownload = true;
  @Input() showDelete = false;

  @Output() view = new EventEmitter<void>();
  @Output() download = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  onView(event: Event): void {
    event.stopPropagation();
    this.view.emit();
  }

  onDownload(event: Event): void {
    event.stopPropagation();
    this.download.emit();
  }

  onDelete(event: Event): void {
    event.stopPropagation();
    this.delete.emit();
  }
}
