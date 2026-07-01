import { Component, inject } from '@angular/core';
import { ConfirmDialogComponent } from '../components/confirm-dialog';
import { JosanzDeleteConfirmService } from './josanz-delete-confirm.service';

/** Host global del diálogo de eliminación. Incluir una vez por vista que use `JosanzDeleteConfirmService`. */
@Component({
  selector: 'josanz-delete-confirm-host',
  standalone: true,
  imports: [ConfirmDialogComponent],
  template: `
    @if (deleteConfirm.dialogCopy(); as copy) {
    <josanz-confirm-dialog
      [open]="deleteConfirm.open()"
      [title]="copy.title"
      [message]="copy.message"
      [confirmLabel]="copy.confirmLabel"
      cancelLabel="Cancelar"
      (confirmed)="deleteConfirm.confirm()"
      (cancelled)="deleteConfirm.cancel()"
    />
    }
  `,
})
export class JosanzDeleteConfirmHostComponent {
  readonly deleteConfirm = inject(JosanzDeleteConfirmService);
}
