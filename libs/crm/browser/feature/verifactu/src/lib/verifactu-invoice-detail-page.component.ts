import { HttpErrorResponse } from '@angular/common/http';
import { AsyncPipe, CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
    FormsModule,
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
    './verifactu-shared-forms.css',
  ],
})
export class VerifactuInvoiceDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly verifactu = inject(VerifactuApiService);
  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  readonly invoiceStatusLabel = invoiceStatusLabel;
  readonly queueStatusLabel = queueStatusLabel;

  rectifyType: 'S' | 'I' = 'I';
  rectifyReason = '';
  rectifyTotal: number | null = null;
  rectifyNumber = '';
  rectifyBusy = false;
  cancelMotivo: '01' | '02' | '03' = '01';
  cancelInfo = '';
  cancelBusy = false;
  actionMessage: string | null = null;
  actionError: string | null = null;

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
    this.actionMessage = null;
    this.actionError = null;
    this.refresh$.next();
  }

  submitRectificativa(invoiceId: string): void {
    if (!this.rectifyReason.trim()) {
      this.actionError = 'Indica el motivo de la rectificativa.';
      return;
    }
    this.rectifyBusy = true;
    this.actionMessage = null;
    this.actionError = null;
    this.verifactu
      .createRectificativa(invoiceId, {
        rectificationType: this.rectifyType,
        reason: this.rectifyReason.trim(),
        total: this.rectifyTotal ?? undefined,
        number: this.rectifyNumber.trim() || undefined,
      })
      .subscribe({
        next: (res) => {
          this.rectifyBusy = false;
          this.actionMessage = `Rectificativa ${res.number ?? ''} creada y encolada.`;
          this.refresh();
        },
        error: (e: HttpErrorResponse) => {
          this.rectifyBusy = false;
          this.actionError = verifactuHttpErrorMessage(
            e,
            'No se pudo crear la rectificativa',
          );
        },
      });
  }

  submitCancel(invoiceId: string): void {
    this.cancelBusy = true;
    this.actionMessage = null;
    this.actionError = null;
    this.verifactu
      .cancelInvoice(invoiceId, {
        motivoAnulacion: this.cancelMotivo,
        additionalInfo: this.cancelInfo.trim() || undefined,
      })
      .subscribe({
        next: (res) => {
          this.cancelBusy = false;
          this.actionMessage = `Factura anulada (${res.motivoLabel}).`;
          this.refresh();
        },
        error: (e: HttpErrorResponse) => {
          this.cancelBusy = false;
          this.actionError = verifactuHttpErrorMessage(
            e,
            'No se pudo anular la factura',
          );
        },
      });
  }

  invoiceKindLabel(kind: string): string {
    return kind === 'RECTIFICATIVE' ? 'Rectificativa' : 'Normal';
  }

  recordKindLabel(kind: string): string {
    switch (kind) {
      case 'RECTIFICATIVE':
        return 'Rectificativa';
      case 'CANCELLATION':
        return 'Anulación';
      default:
        return 'Factura';
    }
  }

  pageTitle(vm: DetailVm): string {
    if (vm.loading) {
      return 'Ficha de factura';
    }
    if ('error' in vm) {
      return 'Ficha de factura';
    }
    const label = vm.data.number || vm.data.invoiceId.slice(0, 8);
    return `Factura ${label}`;
  }

  isDetailLoading(vm: DetailVm): vm is { loading: true } {
    return vm.loading;
  }

  isDetailError(vm: DetailVm): vm is { loading: false; error: string } {
    return !vm.loading && 'error' in vm;
  }

  isDetailData(
    vm: DetailVm,
  ): vm is { loading: false; data: VerifactuInvoiceDetailDto } {
    return !vm.loading && 'data' in vm;
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
