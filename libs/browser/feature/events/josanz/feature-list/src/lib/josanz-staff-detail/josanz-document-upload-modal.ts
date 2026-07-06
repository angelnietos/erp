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
        class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="'josanz-doc-upload-title'"
        (click)="onBackdropClick($event)"
      >
        <section
          class="relative w-full max-w-lg overflow-hidden rounded-2xl border border-solid bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 shadow-2xl"
          [ngStyle]="panelStyles()"
          (click)="$event.stopPropagation()"
        >
          <!-- Header con acento -->
          <div class="relative border-b border-solid border-slate-700/50 px-6 py-5">
            <div class="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>
            <h2
              id="josanz-doc-upload-title"
              class="m-0 text-xl font-bold tracking-tight text-white"
            >
              {{ title }}
            </h2>
            <p class="m-0 mt-1 text-sm font-medium text-slate-400">
              {{ description }}
            </p>
          </div>

          <!-- Formulario -->
          <form (ngSubmit)="save()" class="flex flex-col gap-5 px-6 py-5">
            <div>
              <label class="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">
                Archivo
              </label>
              <div
                class="relative rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/30 p-6 text-center transition-all hover:border-emerald-500/50"
                [class.border-emerald-500]="!!selectedFileName()"
              >
                <input
                  type="file"
                  (change)="onFileSelected($event)"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  class="absolute inset-0 cursor-pointer opacity-0"
                />
                <div class="flex flex-col items-center gap-2">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="text-slate-500" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  @if (selectedFileName()) {
                    <span class="text-sm font-medium text-emerald-400">{{ selectedFileName() }}</span>
                  } @else {
                    <span class="text-sm font-medium text-slate-400">Arrastra o haz click para seleccionar</span>
                  }
                  <span class="text-xs text-slate-500">.pdf, .doc, .docx, .jpg, .png</span>
                </div>
              </div>
            </div>

            <div>
              <label class="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">
                Nombre del documento
              </label>
              <input
                type="text"
                [(ngModel)]="form().name"
                name="name"
                placeholder="Ej: Contrato indefinido 2026"
                class="w-full rounded-lg border border-solid bg-slate-800/50 px-3 py-2.5 text-sm font-medium text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            <div>
              <label class="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">
                Descripción (opcional)
              </label>
              <textarea
                [(ngModel)]="form().description"
                name="description"
                rows="2"
                placeholder="Añade una descripción del documento..."
                class="w-full rounded-lg border border-solid bg-slate-800/50 px-3 py-2.5 text-sm font-medium text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              ></textarea>
            </div>

            @if (error()) {
              <p class="m-0 text-sm font-medium text-red-400">{{ error() }}</p>
            }
          </form>

          <!-- Acciones -->
          <div class="flex justify-between gap-3 border-t border-solid border-slate-700/50 px-6 py-4">
            <button
              type="button"
              class="rounded-lg border border-slate-700 bg-slate-800/50 px-5 py-2.5 text-sm font-semibold text-slate-300 transition-all hover:bg-slate-700/50 hover:text-white"
              (click)="cancel()"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50"
              [disabled]="saving() || !form().file"
              (click)="save()"
            >
              @if (saving()) {
                <span class="opacity-70">Guardando...</span>
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
    const { surface, border } = this.themeService.currentTheme().atmosphere;
    return {
      backgroundColor: surface,
      borderColor: border,
    };
  }
}