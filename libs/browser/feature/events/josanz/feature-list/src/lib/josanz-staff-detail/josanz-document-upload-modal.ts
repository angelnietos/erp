import { Component, EventEmitter, Input, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JosanzThemeService } from '@josanz-erp/josanz-ui';
import { ModalComponent, FileUploadComponent, ButtonComponent, SecondaryButtonComponent } from '@josanz-erp/josanz-ui';

export interface JosanzDocumentUploadData {
  file?: File;
  name?: string;
  description?: string;
}

@Component({
  selector: 'josanz-document-upload-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, FileUploadComponent, ButtonComponent, SecondaryButtonComponent],
  template: `
    @if (open) {
      <josanz-modal
        [title]="title"
        width="520px"
        (close)="cancel()"
        [customColor]="themeService.currentTheme().atmosphere.accent"
      >
        <p class="m-0 text-sm leading-relaxed" style="color: var(--josanz-text-muted);">
          {{ description }}
        </p>

        <div class="mt-6 flex flex-col gap-5">
          <div>
            <div class="block text-[11px] font-bold uppercase tracking-[0.1em] mb-2" style="color: var(--josanz-label-muted);">
              Archivo
            </div>
            <josanz-file-upload
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              [multiple]="false"
              customColor="var(--josanz-primary)"
              title="Arrastra o haz click para seleccionar"
              description=".pdf, .doc, .docx, .jpg, .png"
              (filesSelected)="onFilesSelected($event)"
            />
          </div>

          <div>
            <label for="doc-name" class="block text-[11px] font-bold uppercase tracking-[0.1em] mb-2" style="color: var(--josanz-label-muted);">
              Nombre del documento
            </label>
            <input
              id="doc-name"
              type="text"
              [(ngModel)]="form().name"
              name="docName"
              placeholder="Ej: Contrato indefinido 2026"
              class="h-12 w-full rounded-xl border border-solid px-4 text-sm font-medium outline-none transition-all placeholder:text-[color:var(--josanz-text-muted)]"
              style="background: var(--josanz-field-fill); border-color: var(--josanz-stroke-field); color: var(--josanz-text);"
            />
          </div>

          <div>
            <label for="doc-description" class="block text-[11px] font-bold uppercase tracking-[0.1em] mb-2" style="color: var(--josanz-label-muted);">
              Descripción (opcional)
            </label>
            <textarea
              id="doc-description"
              [(ngModel)]="form().description"
              name="docDescription"
              rows="2"
              placeholder="Añade una descripción del documento..."
              class="min-h-[80px] w-full resize-y rounded-xl border border-solid px-4 py-3 text-sm font-medium outline-none transition-all placeholder:text-[color:var(--josanz-text-muted)]"
              style="background: var(--josanz-field-fill); border-color: var(--josanz-stroke-field); color: var(--josanz-text);"
            ></textarea>
          </div>

          @if (error()) {
            <p class="m-0 text-sm font-medium" style="color: var(--josanz-danger);">{{ error() }}</p>
          }
        </div>

        <div footer-actions class="flex w-full justify-center gap-3">
          <josanz-secondary-button label="Cancelar" (btnClick)="cancel()"></josanz-secondary-button>
          <josanz-button label="{{ confirmLabel }}" variant="primary" [disabled]="saving() || !form().file" (btnClick)="save()"></josanz-button>
        </div>
      </josanz-modal>
    }
  `,
})
export class JosanzDocumentUploadModalComponent {
  public readonly themeService = inject(JosanzThemeService);

  @Input() open = false;
  @Input() title = 'Subir documento';
  @Input() description = 'Selecciona un archivo para subir.';
  @Input() confirmLabel = 'Subir documento';
  @Output() openChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<JosanzDocumentUploadData>();

  readonly form = signal<JosanzDocumentUploadData>({});
  readonly saving = signal(false);
  readonly error = signal('');

  onFilesSelected(files: File[]): void {
    const file = files[0];
    if (file) {
      this.form.update(f => ({ ...f, file }));
      if (!this.form().name) {
        this.form.update(f => ({ ...f, name: file.name }));
      }
    }
  }

  save(): void {
    if (this.form().file) {
      this.saved.emit(this.form());
      this.cancel();
    } else {
      this.error.set('Selecciona un archivo para subir.');
    }
  }

  cancel(): void {
    this.open = false;
    this.form.set({});
    this.openChange.emit(false);
  }
}