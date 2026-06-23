import { HttpErrorResponse } from '@angular/common/http';
import { AsyncPipe, CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  VerifactuApiService,
  type VerifactuInvoiceDetailDto,
  type VerifactuTimelineEventDto,
} from '@generic-crm/verifactu-data-access';
import {
  type GcrmBadgeVariant,
  GcrmBadgeComponent,
  GcrmButtonComponent,
  GcrmInlineMessageComponent,
  GcrmPageComponent,
  GcrmPanelComponent,
  GcrmSpinnerComponent,
} from '@generic-crm/shared-ui';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  map,
  of,
  startWith,
  switchMap,
} from 'rxjs';
import { verifactuHttpErrorMessage } from './http-error-message';
import {
  invoiceStatusLabel,
  queueStatusLabel,
} from './verifactu-status-labels';

type DetailVm =
  | { loading: true }
  | { loading: false; data: VerifactuInvoiceDetailDto }
  | { loading: false; error: string };

@Component({
  selector: 'lib-verifactu-invoice-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    CurrencyPipe,
    DatePipe,
    RouterLink,
    GcrmPageComponent,
    GcrmPanelComponent,
    GcrmButtonComponent,
    GcrmBadgeComponent,
    GcrmInlineMessageComponent,
    GcrmSpinnerComponent,
  ],
  templateUrl: './verifactu-invoice-detail-page.component.html',
  styleUrls: [
    './verifactu-invoice-detail-page.component.css',
    './verifactu-shared-layout.css',
  ],
})
export class VerifactuInvoiceDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly verifactu = inject(VerifactuApiService);
  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  readonly invoiceStatusLabel = invoiceStatusLabel;
  readonly queueStatusLabel = queueStatusLabel;

  readonly vm$ = combineLatest([
    this.route.paramMap.pipe(map((p) => p.get('invoiceId') ?? '')),
    this.refresh$,
  ]).pipe(
    switchMap(([invoiceId]) => {
      if (!invoiceId) {
        return of<DetailVm>({
          loading: false,
          error: 'Identificador de factura no válido.',
        });
      }
      return this.verifactu.invoiceDetail(invoiceId).pipe(
        map((data) => ({ loading: false as const, data })),
        catchError((e: HttpErrorResponse) =>
          of<DetailVm>({
            loading: false,
            error: verifactuHttpErrorMessage(
              e,
              'No se pudo cargar la ficha de la factura',
            ),
          }),
        ),
        startWith<DetailVm>({ loading: true }),
      );
    }),
  );

  refresh(): void {
    this.refresh$.next();
  }

  verifactuBadgeVariant(
    status: VerifactuInvoiceDetailDto['verifactuStatus'],
  ): GcrmBadgeVariant {
    switch (status) {
      case 'sent':
        return 'success';
      case 'error':
        return 'danger';
      case 'pending':
        return 'warning';
      default:
        return 'neutral';
    }
  }

  verifactuStatusLabel(
    status: VerifactuInvoiceDetailDto['verifactuStatus'],
  ): string {
    switch (status) {
      case 'sent':
        return 'Enviada AEAT';
      case 'error':
        return 'Error AEAT';
      case 'pending':
        return 'En cola / pendiente';
      default:
        return 'Sin envío';
    }
  }

  timelineTone(event: VerifactuTimelineEventDto): string {
    switch (event.kind) {
      case 'aeat_success':
      case 'completed':
        return 'ok';
      case 'aeat_error':
      case 'failed':
        return 'err';
      case 'processing':
      case 'forwarded':
        return 'info';
      case 'retry':
        return 'warn';
      default:
        return 'neutral';
    }
  }
}
