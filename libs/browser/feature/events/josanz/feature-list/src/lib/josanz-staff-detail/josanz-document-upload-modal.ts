import { Component, EventEmitter, Input, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JosanzThemeService } from '@josanz-erp/josanz-ui';

export interface JosanzDocumentUploadData {
  file?: File;
  name?: string;
  description?: string;
}

@Component({
  selector: 'josanz-document-upload-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (open) {
      <div
        class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="'josanz-doc-upload-title'"
        (click)="onBackdropClick($event)"
      >
        <section
          class="w-full max-w-lg rounded-2xl border border-solid p-6 shadow-2xl"
          [ngStyle]="panelStyles()"
          (click)="$event.stopPropagation()"
        >
          <h2
            id="josanz-doc-upload-title"
            class="m-0 mb-1 text-xl font-bold"
            [style.color]="'var(--josanz-text)'"
          >
            {{ title }}
          </h2>
          <p class="m-0 mb-4 text-sm" [style.color]="'var(--josanz-text-muted)'">
            {{ description }}
          </p>

          <form (ngSubmit)="save()" class="flex flex-col gap-4">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" [style.color]="'var(--josanz-text-muted)'">
                Archivo
              </label>
              <input
                type="file"
                (change)="onFileSelected($event)"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                class="w-full rounded-lg border border-solid bg-transparent p-2 text-sm"
                [style.borderColor]="'var(--josanz-border)'"
                [style.backgroundColor]="'var(--josanz-field-fill)'"
              />
              @if (selectedFileName()) {
                <p class="mt-1.5 text-xs" [style.color]="'var(--josanz-primary)'">{{ selectedFileName() }}</p>
              }
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" [style.color]="'var(--josanz-text-muted)'">
                Nombre del documento
              </label>
              <input
                type="text"
                [(ngModel)]="form().name"
                name="name"
                placeholder="Ej: Contrato indefinido 2026"
                class="w-full rounded-lg border border-solid bg-transparent px-3 py-2 text-sm font-medium focus:outline-none"
                [style.borderColor]="'var(--josanz-border)'"
                [style.backgroundColor]="'var(--josanz-field-fill)'"
                [style.color]="'var(--josanz-text)'"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" [style.color]="'var(--josanz-text-muted)'">
                Descripción (opcional)
              </label>
              <textarea
                [(ngModel)]="form().description"
                name="description"
                rows="2"
                placeholder="Añade una descripción del documento..."
                class="w-full rounded-lg border border-solid bg-transparent px-3 py-2 text-sm font-medium resize-none focus:outline-none"
                [style.borderColor]="'var(--josanz-border)'"
                [style.backgroundColor]="'var(--josanz-field-fill)'"
                [style.color]="'var(--josanz-text)'"
              ></textarea>
            </div>

            @if (error()) {
              <p class="m-0 text-sm text-red-600">{{ error() }}</p>
            }
          </form>

          <div class="mt-6 flex flex-wrap justify-end gap-3 border-t border-solid pt-4" [style.borderColor]="'var(--josanz-border)'">
            <button
              type="button"
              class="rounded-lg border border-solid bg-transparent px-4 py-2 text-sm font-semibold transition-all hover:bg-[color-mix(in_srgb,var(--josanz-surface-muted)_60%,var(--josanz-surface))]"
              [style.borderColor]="'var(--josanz-border)'"
              [style.color]="'var(--josanz-text)'"
              (click)="cancel()"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="rounded-lg border-0 bg-[var(--josanz-primary)] px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
              [disabled]="saving() || !form().file"
              (click)="save()"
            >
              @if (saving()) {
                Guardando...
              } @else {
                {{ confirmLabel }}
              }
            </button>
          </div>
        </section>
      </div>
    }
  `,
})
export class JosanzDocumentUploadModalComponent {
  private readonly themeService = inject(JosanzThemeService);

  @Input() open = false;
  @Input() title = 'Subir documento';
  @Input() description = 'Selecciona un archivo para subir.';
  @Input() confirmLabel = 'Subir documento';
  @Output() openChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<JosanzDocumentUploadData>();

  readonly form = signal<JosanzDocumentUploadData>({});
  readonly saving = signal(false);
  readonly error = signal('');
  readonly selectedFileName = signal('');

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.form.update(f => ({ ...f, file }));
      this.selectedFileName.set(file.name);
      if (!this.form().name) {
        this.form.update(f => ({ ...f, name: file.name }));
      }
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cancel();
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
    this.selectedFileName.set('');
    this.openChange.emit(false);
  }

  panelStyles(): Record<string, string> {
    const atmosphere = this.themeService.currentTheme().atmosphere;
    return {
      backgroundColor: atmosphere.surface,
      borderColor: atmosphere.border,
    };
  }
}