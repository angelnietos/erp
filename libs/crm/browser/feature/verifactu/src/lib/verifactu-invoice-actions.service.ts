import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { finalize, take } from 'rxjs';
import {
  InvoicesApiService,
  type InvoiceRowDto,
} from '@generic-crm/invoices-data-access';
import { GcrmToastService } from '@generic-crm/shared-ui';
import { VerifactuApiService } from '@generic-crm/verifactu-data-access';
import { verifactuHttpErrorMessage } from './http-error-message';

export interface VerifactuInvoiceActionCallbacks {
  onSuccess?: () => void;
  onSettled?: () => void;
}

@Injectable({ providedIn: 'root' })
export class VerifactuInvoiceActionsService {
  private readonly invoices = inject(InvoicesApiService);
  private readonly verifactu = inject(VerifactuApiService);
  private readonly toast = inject(GcrmToastService);

  createDemoInvoice(callbacks?: VerifactuInvoiceActionCallbacks): void {
    this.invoices
      .create({ total: 121.0, currency: 'EUR' })
      .pipe(
        take(1),
        finalize(() => callbacks?.onSettled?.()),
      )
      .subscribe({
        next: () => {
          this.toast.success(
            'Factura demo creada. Emítela y encólala para Verifactu.',
          );
          callbacks?.onSuccess?.();
        },
        error: (e: HttpErrorResponse) => {
          this.toast.error(
            verifactuHttpErrorMessage(e, 'No se pudo crear la factura'),
          );
        },
      });
  }

  issueInvoice(
    invoiceId: string,
    callbacks?: VerifactuInvoiceActionCallbacks,
  ): void {
    this.invoices
      .issue(invoiceId)
      .pipe(
        take(1),
        finalize(() => callbacks?.onSettled?.()),
      )
      .subscribe({
        next: () => {
          this.toast.success('Factura emitida. Ya puedes encolarla en AEAT.');
          callbacks?.onSuccess?.();
        },
        error: (e: HttpErrorResponse) => {
          this.toast.error(
            verifactuHttpErrorMessage(e, 'No se pudo emitir la factura'),
          );
        },
      });
  }

  enqueueInvoice(
    invoiceId: string,
    callbacks?: VerifactuInvoiceActionCallbacks,
  ): void {
    this.verifactu
      .enqueue(invoiceId)
      .pipe(
        take(1),
        finalize(() => callbacks?.onSettled?.()),
      )
      .subscribe({
        next: () => {
          this.toast.success(
            'Factura encolada. Revisa Cola AEAT, Historial y Cadena fiscal.',
          );
          callbacks?.onSuccess?.();
        },
        error: (e: HttpErrorResponse) => {
          this.toast.error(
            verifactuHttpErrorMessage(e, 'No se pudo encolar la factura'),
          );
        },
      });
  }

  /** Encola por UUID manual (cola AEAT). */
  enqueueById(
    invoiceId: string,
    callbacks?: VerifactuInvoiceActionCallbacks,
  ): void {
    const id = invoiceId.trim();
    if (!id) {
      this.toast.info('Introduce el UUID de la factura.');
      return;
    }
    this.enqueueInvoice(id, callbacks);
  }

  canEnqueue(invoice: Pick<InvoiceRowDto, 'status'>): boolean {
    return invoice.status !== 'DRAFT' && invoice.status !== 'CANCELLED';
  }
}
