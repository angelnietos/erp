import { Component, inject } from '@angular/core';
import { ButtonComponent, ModalComponent } from '@josanz-erp/josanz-ui';
import { JosanzEventDetailState } from '../josanz-event-detail.state';

@Component({
  selector: 'josanz-event-upload-modal',
  standalone: true,
  imports: [ModalComponent, ButtonComponent],
  template: `
    @if (state.uploadModalOpen()) {
    <josanz-modal title="Subir documentación" width="480px" (close)="state.closeUploadModal()">
      @if (!state.uploadFileName()) {
      <label
        class="josanz-upload-dropzone"
        (dragover)="state.showBudgetPicker.set(true)"
        (dragleave)="$event.preventDefault(); state.showBudgetPicker.set(false)"
        (drop)="onDrop($event)"
      >
        <input type="file" (change)="state.onUploadFileSelected($event)" hidden />
        <div class="josanz-upload-dropzone__icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <span class="josanz-upload-dropzone__title">Arrastra el archivo aquí</span>
        <span class="josanz-upload-dropzone__hint">o haz click para seleccionar</span>
      </label>
      } @else {
      <div class="josanz-upload-file">
        <div class="josanz-upload-file__icon" aria-hidden="true">
          <span class="josanz-upload-file__ext">{{ getFileExtension() }}</span>
        </div>
        <div class="josanz-upload-file__meta">
          <span class="josanz-upload-file__name">{{ state.uploadFileName() }}</span>
          <span class="josanz-upload-file__size">{{ getFileSize() }}</span>
        </div>
        <button
          type="button"
          class="josanz-upload-file__remove"
          aria-label="Quitar archivo"
          (click)="removeFile()"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      }

      <div footer-actions class="josanz-event-upload-actions">
        <button type="button" class="josanz-event-note-composer__cancel" (click)="state.closeUploadModal()">Cancelar</button>
        <josanz-button
          label="Subir documentación"
          size="lg"
          [showIcon]="false"
          [fullWidth]="true"
          [disabled]="!state.uploadReady()"
          (btnClick)="state.confirmUpload()"
        ></josanz-button>
      </div>
    </josanz-modal>
    }
  `,
  styles: [
    `
      :host {
        display: contents;
      }

      .josanz-upload-dropzone {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 2.5rem 1.25rem;
        border-radius: 16px;
        border: 2px dashed var(--josanz-border);
        background: var(--josanz-surface);
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: center;
      }

      .josanz-upload-dropzone:hover {
        border-color: var(--josanz-primary);
        background: color-mix(in srgb, var(--josanz-primary) 4%, var(--josanz-surface));
      }

      .josanz-upload-dropzone__icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 56px;
        height: 56px;
        border-radius: 16px;
        background: color-mix(in srgb, var(--josanz-primary) 10%, var(--josanz-surface));
        color: var(--josanz-primary);
        transition: transform 0.2s ease;
      }

      .josanz-upload-dropzone:hover .josanz-upload-dropzone__icon {
        transform: translateY(-2px);
      }

      .josanz-upload-dropzone__title {
        font-size: 0.9375rem;
        font-weight: 800;
        color: var(--josanz-text);
        letter-spacing: -0.005em;
      }

      .josanz-upload-dropzone__hint {
        font-size: 0.8125rem;
        color: var(--josanz-text-muted);
      }

      .josanz-upload-file {
        display: flex;
        align-items: center;
        gap: 0.875rem;
        padding: 0.875rem 1rem;
        border-radius: 14px;
        border: 1px solid var(--josanz-border);
        background: color-mix(in srgb, var(--josanz-primary) 4%, var(--josanz-surface));
      }

      .josanz-upload-file__icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: color-mix(in srgb, var(--josanz-primary) 12%, var(--josanz-surface));
        color: var(--josanz-primary);
        font-size: 0.6875rem;
        font-weight: 800;
        letter-spacing: 0.04em;
        flex-shrink: 0;
      }

      .josanz-upload-file__meta {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
        flex: 1;
        min-width: 0;
      }

      .josanz-upload-file__name {
        font-size: 0.875rem;
        font-weight: 700;
        color: var(--josanz-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        letter-spacing: -0.005em;
      }

      .josanz-upload-file__size {
        font-size: 0.75rem;
        color: var(--josanz-text-muted);
        font-weight: 600;
      }

      .josanz-upload-file__remove {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 10px;
        border: 1px solid transparent;
        background: transparent;
        color: var(--josanz-text-muted);
        cursor: pointer;
        transition: all 0.15s ease;
        flex-shrink: 0;
      }

      .josanz-upload-file__remove:hover {
        background: color-mix(in srgb, var(--josanz-danger) 10%, var(--josanz-surface));
        color: var(--josanz-danger);
        border-color: color-mix(in srgb, var(--josanz-danger) 25%, var(--josanz-border));
      }

      .josanz-event-upload-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
        width: 100%;
      }
    `,
  ],
})
export class JosanzEventUploadModalComponent {
  readonly state = inject(JosanzEventDetailState);

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const fakeEvent = { target: { files } } as unknown as Event;
      this.state.onUploadFileSelected(fakeEvent);
    }
  }

  removeFile(): void {
    this.state.uploadFileName.set('');
    this.state.uploadReady.set(false);
    (this.state as unknown as Record<string, unknown>)['uploadFileUrl'] = '';
  }

  getFileExtension(): string {
    const name = this.state.uploadFileName();
    const parts = name.split('.');
    const last = parts.pop();
    return last ? last.toUpperCase() : 'FILE';
  }

  getFileSize(): string {
    const url = (this.state as unknown as Record<string, unknown>)['uploadFileUrl'] as string;
    if (!url) {
      return '';
    }
    const base64 = url.split(',')[1];
    if (!base64) {
      return '';
    }
    const bytes = Math.ceil((base64.length * 3) / 4);
    return this.formatFileSize(bytes);
  }

  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
