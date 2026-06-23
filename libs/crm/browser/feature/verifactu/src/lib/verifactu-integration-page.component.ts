import { HttpErrorResponse } from '@angular/common/http';
import { AsyncPipe, CommonModule, DecimalPipe, JsonPipe } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { VerifactuApiService } from '@generic-crm/verifactu-data-access';
import {
  InvoicesApiService,
  type InvoiceRowDto,
} from '@generic-crm/invoices-data-access';
import {
  type GcrmBadgeVariant,
  GcrmBadgeComponent,
  GcrmButtonComponent,
  GcrmInlineMessageComponent,
  type GcrmInlineMessageVariant,
  GcrmPageComponent,
  GcrmPanelComponent,
  GcrmSpinnerComponent,
  GcrmStatCardComponent,
} from '@generic-crm/shared-ui';
import {
  BehaviorSubject,
  catchError,
  finalize,
  forkJoin,
  map,
  of,
  switchMap,
} from 'rxjs';
import {
  appendVerifactuBranchError,
  joinVerifactuLoadErrors,
  verifactuHttpErrorMessage,
} from './http-error-message';
import { invoiceStatusLabel } from './verifactu-status-labels';

@Component({
  selector: 'lib-verifactu-integration-page',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    DecimalPipe,
    JsonPipe,
    RouterLink,
    GcrmBadgeComponent,
    GcrmButtonComponent,
    GcrmPageComponent,
    GcrmPanelComponent,
    GcrmInlineMessageComponent,
    GcrmSpinnerComponent,
    GcrmStatCardComponent,
  ],
  templateUrl: './verifactu-integration-page.component.html',
  styleUrls: [
    './verifactu-integration-page.component.css',
    './verifactu-shared-layout.css',
    './verifactu-shared-tables.css',
    './verifactu-toolbar.css',
  ],
})
export class VerifactuIntegrationPageComponent {
  private readonly verifactu = inject(VerifactuApiService);
  private readonly invoices = inject(InvoicesApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  readonly invoiceStatusLabel = invoiceStatusLabel;

  snapshotLoading = false;
  creatingDemo = false;
  issuingId: string | null = null;
  enqueuingId: string | null = null;
  actionFeedback = '';
  actionFeedbackVariant: GcrmInlineMessageVariant = 'info';

  get actionBusy(): boolean {
    return this.creatingDemo || this.issuingId !== null || this.enqueuingId !== null;
  }

  readonly snapshot$ = this.refresh$.pipe(
    switchMap(() => {
      this.snapshotLoading = true;
      const loadErrors: string[] = [];
      return forkJoin({
        integration: this.verifactu.integration().pipe(
          catchError((e: HttpErrorResponse) => {
            appendVerifactuBranchError(loadErrors, 'Integración', e);
            return of(null);
          }),
        ),
        invoices: this.invoices.list().pipe(
          catchError((e: HttpErrorResponse) => {
            appendVerifactuBranchError(loadErrors, 'Facturas', e);
            return of([] as InvoiceRowDto[]);
          }),
        ),
        settings: this.verifactu.tenantSettings().pipe(
          catchError((e: HttpErrorResponse) => {
            appendVerifactuBranchError(loadErrors, 'Ajustes', e);
            return of({ emitterTaxId: null as string | null });
          }),
        ),
        credSlots: this.verifactu.credentialsStatus().pipe(
          catchError((e: HttpErrorResponse) => {
            appendVerifactuBranchError(loadErrors, 'Certificados', e);
            return of(null);
          }),
        ),
      }).pipe(
        map((v) => ({
          ...v,
          loadError: joinVerifactuLoadErrors(loadErrors),
          crm: 'Emisión: PATCH /api/invoices/:id/issue. Con VERIFACTU_AUTO_ENQUEUE=true se encola sola.',
          standaloneApi:
            'API paralela: nx serve verifactu-crm-api (3120) — misma BD y JWT.',
          worker:
            'Worker: pnpm run dev:verifactu-worker — cola en BD; CRM espeja FORWARDED → COMPLETED.',
        })),
        finalize(() => {
          this.snapshotLoading = false;
        }),
      );
    }),
  );

  refresh(): void {
    this.refresh$.next();
  }

  createDemoInvoice(): void {
    this.actionFeedback = '';
    this.creatingDemo = true;
    this.invoices
      .create({ total: 121.0, currency: 'EUR' })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.creatingDemo = false;
        }),
      )
      .subscribe({
        next: () => {
          this.actionFeedback = 'Factura demo creada. Emítela y encólala para Verifactu.';
          this.actionFeedbackVariant = 'success';
          this.refresh();
        },
        error: (e: HttpErrorResponse) => {
          this.actionFeedback = verifactuHttpErrorMessage(e, 'No se pudo crear la factura');
          this.actionFeedbackVariant = 'error';
        },
      });
  }

  issueInvoice(id: string): void {
    this.actionFeedback = '';
    this.issuingId = id;
    this.invoices
      .issue(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.issuingId = null;
        }),
      )
      .subscribe({
        next: () => {
          this.actionFeedback = 'Factura emitida. Ya puedes encolarla en AEAT.';
          this.actionFeedbackVariant = 'success';
          this.refresh();
        },
        error: (e: HttpErrorResponse) => {
          this.actionFeedback = verifactuHttpErrorMessage(e, 'No se pudo emitir');
          this.actionFeedbackVariant = 'error';
        },
      });
  }

  enqueueInvoice(id: string): void {
    this.actionFeedback = '';
    this.enqueuingId = id;
    this.verifactu
      .enqueue(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.enqueuingId = null;
        }),
      )
      .subscribe({
        next: () => {
          this.actionFeedback =
            'Factura encolada. Revisa Cola AEAT e Historial para seguir el envío.';
          this.actionFeedbackVariant = 'success';
          this.refresh();
        },
        error: (e: HttpErrorResponse) => {
          this.actionFeedback = verifactuHttpErrorMessage(e, 'No se pudo encolar');
          this.actionFeedbackVariant = 'error';
        },
      });
  }

  invoiceBadgeVariant(status: string | undefined): GcrmBadgeVariant {
    switch (status) {
      case 'ISSUED':
        return 'success';
      case 'DRAFT':
        return 'warning';
      case 'CANCELLED':
        return 'danger';
      default:
        return 'neutral';
    }
  }
}
