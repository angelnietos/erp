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
      <label class="josanz-event-upload-dropzone">
        <input type="file" (change)="state.onUploadFileSelected($event)" hidden />
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        @if (state.uploadFileName()) {
        <span class="josanz-event-upload-dropzone__file">● {{ state.uploadFileName() }}</span>
        }
      </label>

      <div footer-actions class="josanz-event-upload-actions">
        <josanz-button
          label="Subir documentación"
          size="lg"
          [showIcon]="false"
          [fullWidth]="true"
          [disabled]="!state.uploadFileName()"
          (btnClick)="state.confirmUpload()"
        ></josanz-button>
        <button type="button" class="josanz-event-note-composer__cancel" (click)="state.closeUploadModal()">
          Cancelar
        </button>
      </div>
    </josanz-modal>
    }
  `,
})
export class JosanzEventUploadModalComponent {
  readonly state = inject(JosanzEventDetailState);
}
