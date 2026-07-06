import { Component, EventEmitter, Input, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JosanzThemeService } from '@josanz-erp/josanz-ui';

export interface JosanzAbsenceFormData {
  type: 'Vacaciones' | 'Permiso' | 'Baja' | 'Otros';
  dateFrom: string;
  dateTo: string;
  reason?: string;
}

@Component({
  selector: 'josanz-absence-register-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (open) {
      <div
        class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="'josanz-absence-title'"
        (click)="onBackdropClick($event)"
      >
        <section
          class="w-full max-w-lg rounded-2xl border border-solid p-6 shadow-2xl"
          [ngStyle]="panelStyles()"
          (click)="$event.stopPropagation()"
        >
          <h2
            id="josanz-absence-title"
            class="m-0 mb-1 text-xl font-bold"
            [style.color]="'var(--josanz-text)'"
          >
            Registrar ausencia
          </h2>
          <p class="m-0 mb-4 text-sm" [style.color]="'var(--josanz-text-muted)'">
            Registra un nuevo periodo de ausencia para el técnico.
          </p>

          <form (ngSubmit)="save()" class="flex flex-col gap-4">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" [style.color]="'var(--josanz-text-muted)'">
                Tipo de ausencia
              </label>
              <select
                [(ngModel)]="form().type"
                name="type"
                required
                class="w-full rounded-lg border border-solid bg-transparent px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2"
                [style.borderColor]="'var(--josanz-border)'"
                [style.backgroundColor]="'var(--josanz-field-fill)'"
                [style.color]="'var(--josanz-text)'"
              >
                <option value="Vacaciones">Vacaciones</option>
                <option value="Permiso">Permiso</option>
                <option value="Baja">Baja médica</option>
                <option value="Otros">Otros</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" [style.color]="'var(--josanz-text-muted)'">
                  Desde
                </label>
                <input
                  type="date"
                  [(ngModel)]="form().dateFrom"
                  name="dateFrom"
                  required
                  class="w-full rounded-lg border border-solid bg-transparent px-3 py-2 text-sm font-medium focus:outline-none"
                  [style.borderColor]="'var(--josanz-border)'"
                  [style.backgroundColor]="'var(--josanz-field-fill)'"
                  [style.color]="'var(--josanz-text)'"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" [style.color]="'var(--josanz-text-muted)'">
                  Hasta
                </label>
                <input
                  type="date"
                  [(ngModel)]="form().dateTo"
                  name="dateTo"
                  required
                  class="w-full rounded-lg border border-solid bg-transparent px-3 py-2 text-sm font-medium focus:outline-none"
                  [style.borderColor]="'var(--josanz-border)'"
                  [style.backgroundColor]="'var(--josanz-field-fill)'"
                  [style.color]="'var(--josanz-text)'"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" [style.color]="'var(--josanz-text-muted)'">
                Motivo (opcional)
              </label>
              <textarea
                [(ngModel)]="form().reason"
                name="reason"
                rows="3"
                placeholder="Describe el motivo de la ausencia..."
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
              [disabled]="saving()"
              (click)="save()"
            >
              @if (saving()) {
                Guardando...
              } @else {
                Registrar ausencia
              }
            </button>
          </div>
        </section>
      </div>
    }
  `,
})
export class JosanzAbsenceRegisterModalComponent {
  private readonly themeService = inject(JosanzThemeService);

  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<JosanzAbsenceFormData>();

  readonly form = signal<JosanzAbsenceFormData>({
    type: 'Vacaciones',
    dateFrom: '',
    dateTo: '',
    reason: '',
  });
  readonly saving = signal(false);
  readonly error = signal('');

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cancel();
    }
  }

  save(): void {
    if (this.form().dateFrom && this.form().dateTo) {
      this.saved.emit(this.form());
      this.cancel();
    } else {
      this.error.set('Selecciona las fechas del periodo de ausencia.');
    }
  }

  cancel(): void {
    this.open = false;
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