import { Component, EventEmitter, Input, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JosanzThemeService } from '@josanz-erp/josanz-ui';
import { ModalComponent, ButtonComponent, SecondaryButtonComponent } from '@josanz-erp/josanz-ui';

export interface JosanzDocumentUploadData {
  file?: File;
  name?: string;
  description?: string;
}

@Component({
  selector: 'josanz-document-upload-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, ButtonComponent, SecondaryButtonComponent],
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

            @if (!form().file) {
            <label
              class="josanz-upload-dropzone"
              (dragover)="onDragOver($event)"
              (dragleave)="onDragLeave($event)"
              (drop)="onDrop($event)"
            >
              <input
                type="file"
                [accept]="accept"
                [multiple]="false"
                class="sr-only"
                (change)="onFileSelected($event)"
              />
              <div class="josanz-upload-dropzone__icon" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <span class="josanz-upload-dropzone__title">Arrastra el archivo aquí</span>
              <span class="josanz-upload-dropzone__hint">o haz click para seleccionar</span>
              <span class="josanz-upload-dropzone__types">.pdf, .doc, .docx, .jpg, .png</span>
            </label>
            } @else {
            <div class="josanz-upload-file">
              <div class="josanz-upload-file__icon" aria-hidden="true">
                <span class="josanz-upload-file__ext">{{ fileExtension(form().file!.name) }}</span>
              </div>
              <div class="josanz-upload-file__meta">
                <span class="josanz-upload-file__name">{{ form().file!.name }}</span>
                <span class="josanz-upload-file__size">{{ formatFileSize(form().file!.size) }}</span>
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
  styles: [
    `
      .josanz-upload-dropzone {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 2rem 1.25rem;
        border-radius: 16px;
        border: 2px dashed var(--josanz-border);
        background: var(--josanz-surface);
        cursor: pointer;
        transition: all 0.2s ease;
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

      .josanz-upload-dropzone__types {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--josanz-text-muted);
        letter-spacing: 0.02em;
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
    `,
  ],
})
export class JosanzDocumentUploadModalComponent {
  public readonly themeService = inject(JosanzThemeService);

  @Input() open = false;
  @Input() title = 'Subir documento';
  @Input() description = 'Selecciona un archivo para subir.';
  @Input() confirmLabel = 'Subir documento';
  @Input() accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
  @Output() openChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<JosanzDocumentUploadData>();

  readonly form = signal<JosanzDocumentUploadData>({});
  readonly saving = signal(false);
  readonly error = signal('');
  dragOver = signal(false);

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(false);
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFiles(Array.from(files));
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    this.handleFiles(files);
  }

  private handleFiles(files: File[]): void {
    const file = files[0];
    if (!file) {
      return;
    }
    this.form.set({ file });
    if (!this.form().name) {
      this.form.update(f => ({ ...f, name: file.name }));
    }
    this.error.set('');
  }

  removeFile(): void {
    this.form.set({});
    this.error.set('');
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

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  fileExtension(name: string): string {
    const parts = name.split('.');
    const last = parts.pop();
    return last ? last.toUpperCase() : 'FILE';
  }
}