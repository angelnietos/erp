import { HttpErrorResponse } from '@angular/common/http';
import { AsyncPipe, CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  InvoicesApiService,
  type InvoiceRowDto,
} from '@generic-crm/invoices-data-access';
import {
  type GcrmBadgeVariant,
  GcrmBadgeComponent,
  GcrmButtonComponent,
  GcrmInlineMessageComponent,
  GcrmPageComponent,
  GcrmPanelComponent,
  GcrmSpinnerComponent,
  GcrmStatCardComponent,
} from '@generic-crm/shared-ui';
import {
  BehaviorSubject,
  catchError,
  finalize,
  map,
  of,
  startWith,
  switchMap,
} from 'rxjs';
import { appendVerifactuBranchError, joinVerifactuLoadErrors } from './http-error-message';
import { VerifactuEmptyStateComponent } from './verifactu-empty-state.component';
import { VerifactuInvoiceActionsService } from './verifactu-invoice-actions.service';
import {
  invoiceStatusLabel,
  verifactuStatusLabel,
} from './verifactu-status-labels';

@Component({
  selector: 'lib-verifactu-invoices-page',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    DecimalPipe,
    DatePipe,
    RouterLink,
    GcrmBadgeComponent,
    GcrmButtonComponent,
    GcrmPageComponent,
    GcrmPanelComponent,
    GcrmInlineMessageComponent,
    GcrmSpinnerComponent,
    GcrmStatCardComponent,
    VerifactuEmptyStateComponent,
  ],
  templateUrl: './verifactu-invoices-page.component.html',
  styleUrls: [
    './verifactu-shared-layout.css',
    './verifactu-shared-tables.css',
    './verifactu-toolbar.css',
  ],
})
export class VerifactuInvoicesPageComponent {
  private readonly invoices = inject(InvoicesApiService);
  private readonly actions = inject(VerifactuInvoiceActionsService);
  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  readonly invoiceStatusLabel = invoiceStatusLabel;
  readonly verifactuStatusLabel = verifactuStatusLabel;
  readonly canEnqueue = (inv: InvoiceRowDto) => this.actions.canEnqueue(inv);

  creatingDemo = false;
  issuingId: string | null = null;
  enqueuingId: string | null = null;

  get actionBusy(): boolean {
    return this.creatingDemo || this.issuingId !== null || this.enqueuingId !== null;
  }

  readonly vm$ = this.refresh$.pipe(
    switchMap(() => {
      const loadErrors: string[] = [];
      return this.invoices.list().pipe(
        map((rows) => {
          const list = (rows ?? []) as InvoiceRowDto[];
          const issuedCount = list.filter((i) => i.status === 'ISSUED').length;
          const sentCount = list.filter(
            (i) => i.verifactuStatus?.toUpperCase() === 'SENT',
          ).length;
          const pendingVerifactuCount = list.filter((i) => {
            const vf = i.verifactuStatus?.toUpperCase();
            return !vf || vf === 'PENDING';
          }).length;
          return {
            loading: false as const,
            invoices: list,
            issuedCount,
            sentCount,
            pendingVerifactuCount,
            loadError: joinVerifactuLoadErrors(loadErrors),
          };
        }),
        catchError((e: HttpErrorResponse) => {
          appendVerifactuBranchError(loadErrors, 'Facturas', e);
          return of({
            loading: false as const,
            invoices: [] as InvoiceRowDto[],
            issuedCount: 0,
            sentCount: 0,
            pendingVerifactuCount: 0,
            loadError: joinVerifactuLoadErrors(loadErrors),
          });
        }),
        startWith({
          loading: true as const,
          invoices: [] as InvoiceRowDto[],
          issuedCount: 0,
          sentCount: 0,
          pendingVerifactuCount: 0,
          loadError: null as string | null,
        }),
      );
    }),
  );

  refresh(): void {
    this.refresh$.next();
  }

  createDemoInvoice(): void {
    this.creatingDemo = true;
    this.actions.createDemoInvoice({
      onSuccess: () => this.refresh(),
      onSettled: () => {
        this.creatingDemo = false;
      },
    });
  }

  issueInvoice(id: string): void {
    this.issuingId = id;
    this.actions.issueInvoice(id, {
      onSuccess: () => this.refresh(),
      onSettled: () => {
        this.issuingId = null;
      },
    });
  }

  enqueueInvoice(id: string): void {
    this.enqueuingId = id;
    this.actions.enqueueInvoice(id, {
      onSuccess: () => this.refresh(),
      onSettled: () => {
        this.enqueuingId = null;
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

  verifactuBadgeVariant(status: string | undefined): GcrmBadgeVariant {
    switch (status?.toUpperCase()) {
      case 'SENT':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'ERROR':
      case 'REJECTED':
        return 'danger';
      default:
        return 'neutral';
    }
  }
}
