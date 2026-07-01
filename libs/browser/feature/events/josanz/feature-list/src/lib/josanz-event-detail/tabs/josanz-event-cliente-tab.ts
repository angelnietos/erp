import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { JosanzDeleteConfirmService, SelectComponent } from '@josanz-erp/josanz-ui';

@Component({
  selector: 'josanz-event-cliente-tab',
  standalone: true,
  imports: [ReactiveFormsModule, SelectComponent],
  template: `
    <section class="josanz-event-section" [formGroup]="form">
      <h3 class="josanz-event-section__title">Datos del cliente</h3>
      <div class="josanz-event-detail__fields">
        <josanz-select
          label="Cliente"
          placeholder="Selecciona un cliente"
          formControlName="clientId"
          [options]="clientOptions"
          [required]="true"
        ></josanz-select>
        <josanz-select
          label="Operador"
          placeholder="Selecciona un operador"
          formControlName="operatorContactId"
          [options]="operatorOptions"
          [hint]="operatorHint"
          [required]="operatorOptions.length > 0"
        ></josanz-select>
        <josanz-select
          label="Estado"
          placeholder="Estado"
          formControlName="status"
          [options]="statusOptions"
        ></josanz-select>
      </div>
      <div class="josanz-event-detail__danger">
        @if (deleteErrorMessage) {
        <p class="josanz-event-create__hint" role="alert">{{ deleteErrorMessage }}</p>
        }
        <button
          type="button"
          class="josanz-event-create__link-btn josanz-event-create__link-btn--danger"
          [disabled]="loading || deleteConfirm.busy()"
          (click)="deleteClicked.emit()"
        >
          Eliminar evento
        </button>
      </div>
    </section>
  `,
})
export class JosanzEventClienteTabComponent {
  readonly deleteConfirm = inject(JosanzDeleteConfirmService);

  @Input({ required: true }) form!: FormGroup;
  @Input({ required: true }) clientOptions!: { label: string; value: string }[];
  @Input({ required: true }) operatorOptions!: { label: string; value: string }[];
  @Input() operatorHint = '';
  @Input({ required: true }) statusOptions!: { label: string; value: string }[];
  @Input() loading = false;
  @Input() deleteErrorMessage = '';

  @Output() deleteClicked = new EventEmitter<void>();
}
