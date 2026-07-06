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
        class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="'josanz-absence-title'"
        (click)="onBackdropClick($event)"
      >
        <section
          class="relative w-full max-w-lg overflow-hidden rounded-2xl border border-solid bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 shadow-2xl"
          [ngStyle]="panelStyles()"
          (click)="$event.stopPropagation()"
        >
          <!-- Header con acento -->
          <div class="relative border-b border-solid border-slate-700/50 px-6 py-5">
            <div class="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>
            <h2
              id="josanz-absence-title"
              class="m-0 text-xl font-bold tracking-tight text-white"
            >
              Registrar ausencia
            </h2>
            <p class="m-0 mt-1 text-sm font-medium text-slate-400">
              Añade un nuevo periodo de ausencia para el técnico
            </p>
          </div>

          <!-- Formulario -->
          <form (ngSubmit)="save()" class="flex flex-col gap-5 px-6 py-5">
            <div>
              <label class="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">
                Tipo de ausencia
              </label>
              <div class="grid grid-cols-2 gap-2">
                @for (opt of absenceTypes; track opt.value) {
                <label
                  class="flex cursor-pointer items-center justify-center rounded-lg border border-solid px-4 py-3 text-center text-sm font-semibold transition-all"
                  [class.border-blue-500]="form().type === opt.value"
                  [class.bg-blue-500/20]="form().type === opt.value"
                  [class.text-white]="form().type === opt.value"
                  [class.border-slate-700]="form().type !== opt.value"
                  [class.text-slate-300]="form().type !== opt.value"
                  [class.hover:border-blue-400]="form().type !== opt.value"
                >
                  <input
                    type="radio"
                    [(ngModel)]="form().type"
                    name="type"
                    [value]="opt.value"
                    class="sr-only"
                  />
                  {{ opt.label }}
                </label>
                }
              </div>
            </div>

            <div>
              <label class="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">
                Periodo
              </label>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <span class="mb-1 block text-xs text-slate-400">Desde</span>
                  <input
                    type="date"
                    [(ngModel)]="form().dateFrom"
                    name="dateFrom"
                    required
                    class="w-full rounded-lg border border-solid bg-slate-800/50 px-3 py-2.5 text-sm font-medium text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                <div>
                  <span class="mb-1 block text-xs text-slate-400">Hasta</span>
                  <input
                    type="date"
                    [(ngModel)]="form().dateTo"
                    name="dateTo"
                    required
                    class="w-full rounded-lg border border-solid bg-slate-800/50 px-3 py-2.5 text-sm font-medium text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>
            </div>

            <div>
              <label class="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">
                Motivo (opcional)
              </label>
              <textarea
                [(ngModel)]="form().reason"
                name="reason"
                rows="3"
                placeholder="Describe el motivo de la ausencia..."
                class="w-full rounded-lg border border-solid bg-slate-800/50 px-3 py-2.5 text-sm font-medium text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
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
              class="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50"
              [disabled]="saving()"
              (click)="save()"
            >
              @if (saving()) {
                <span class="opacity-70">Guardando...</span>
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

  readonly absenceTypes = [
    { value: 'Vacaciones', label: 'Vacaciones' },
    { value: 'Permiso', label: 'Permiso' },
    { value: 'Baja', label: 'Baja médica' },
    { value: 'Otros', label: 'Otros' },
  ];

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
    const { surface, border } = this.themeService.currentTheme().atmosphere;
    return {
      backgroundColor: surface,
      borderColor: border,
    };
  }
}