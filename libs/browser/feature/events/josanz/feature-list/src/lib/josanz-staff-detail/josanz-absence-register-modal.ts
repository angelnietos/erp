import { Component, EventEmitter, Input, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JosanzThemeService } from '@josanz-erp/josanz-ui';
import { ModalComponent, RadioGroupComponent, ButtonComponent, SecondaryButtonComponent } from '@josanz-erp/josanz-ui';

export interface JosanzAbsenceFormData {
  type: 'Vacaciones' | 'Permiso' | 'Baja' | 'Otros';
  dateFrom: string;
  dateTo: string;
  reason?: string;
}

@Component({
  selector: 'josanz-absence-register-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, RadioGroupComponent, ButtonComponent, SecondaryButtonComponent],
  template: `
    @if (open) {
      <josanz-modal
        title="Registrar ausencia"
        width="520px"
        (close)="cancel()"
        [customColor]="themeService.currentTheme().atmosphere.accent"
      >
        <p class="m-0 text-sm leading-relaxed" style="color: var(--josanz-text-muted);">
          Añade un nuevo periodo de ausencia para el técnico
        </p>

        <div class="mt-6 flex flex-col gap-6">
          <div>
            <label class="block text-[11px] font-bold uppercase tracking-[0.1em] mb-2" style="color: var(--josanz-label-muted);">
              Tipo de ausencia
            </label>
            <josanz-radio-group
              [options]="absenceTypes"
              [(value)]="form().type"
              orientation="horizontal"
              customColor="var(--josanz-primary)"
            />
          </div>

          <div>
            <label class="block text-[11px] font-bold uppercase tracking-[0.1em] mb-3" style="color: var(--josanz-label-muted);">
              Periodo
            </label>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="absence-dateFrom" class="sr-only">Desde</label>
                <input
                  id="absence-dateFrom"
                  type="date"
                  [(ngModel)]="form().dateFrom"
                  name="absenceDateFrom"
                  required
                  class="h-12 w-full rounded-xl border border-solid px-4 text-sm font-medium outline-none transition-all"
                  style="background: var(--josanz-field-fill); border-color: var(--josanz-stroke-field); color: var(--josanz-text);"
                />
              </div>
              <div>
                <label for="absence-dateTo" class="sr-only">Hasta</label>
                <input
                  id="absence-dateTo"
                  type="date"
                  [(ngModel)]="form().dateTo"
                  name="absenceDateTo"
                  required
                  class="h-12 w-full rounded-xl border border-solid px-4 text-sm font-medium outline-none transition-all"
                  style="background: var(--josanz-field-fill); border-color: var(--josanz-stroke-field); color: var(--josanz-text);"
                />
              </div>
            </div>
          </div>

          <div>
            <label for="absence-reason" class="block text-[11px] font-bold uppercase tracking-[0.1em] mb-2" style="color: var(--josanz-label-muted);">
              Motivo (opcional)
            </label>
            <textarea
              id="absence-reason"
              [(ngModel)]="form().reason"
              name="absenceReason"
              rows="3"
              placeholder="Describe el motivo de la ausencia..."
              class="min-h-[112px] w-full resize-y rounded-xl border border-solid px-4 py-3 text-sm font-medium outline-none transition-all placeholder:text-[color:var(--josanz-text-muted)]"
              style="background: var(--josanz-field-fill); border-color: var(--josanz-stroke-field); color: var(--josanz-text);"
            ></textarea>
          </div>

          @if (error()) {
            <p class="m-0 text-sm font-medium" style="color: var(--josanz-danger);">{{ error() }}</p>
          }
        </div>

        <div footer-actions class="flex w-full justify-center gap-3">
          <josanz-secondary-button label="Cancelar" (btnClick)="cancel()"></josanz-secondary-button>
          <josanz-button label="Registrar ausencia" variant="primary" [disabled]="saving()" (btnClick)="save()"></josanz-button>
        </div>
      </josanz-modal>
    }
  `,
})
export class JosanzAbsenceRegisterModalComponent {
  public readonly themeService = inject(JosanzThemeService);

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
}