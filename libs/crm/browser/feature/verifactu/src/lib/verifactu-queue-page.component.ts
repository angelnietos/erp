import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  VerifactuApiService,
  type VerifactuQueueItemDto,
} from '@generic-crm/verifactu-data-access';
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
  map,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { verifactuHttpErrorMessage } from './http-error-message';
import { VerifactuEmptyStateComponent } from './verifactu-empty-state.component';
import { VerifactuInvoiceActionsService } from './verifactu-invoice-actions.service';
import { queueStatusLabel } from './verifactu-status-labels';

@Component({
  selector: 'lib-verifactu-queue-page',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    DatePipe,
    FormsModule,
    RouterLink,
    GcrmPageComponent,
    GcrmPanelComponent,
    GcrmButtonComponent,
    GcrmBadgeComponent,
    GcrmInlineMessageComponent,
    GcrmSpinnerComponent,
    GcrmStatCardComponent,
    VerifactuEmptyStateComponent,
  ],
  templateUrl: './verifactu-queue-page.component.html',
  styleUrls: [
    './verifactu-queue-page.component.css',
    './verifactu-shared-tables.css',
    './verifactu-shared-layout.css',
    './verifactu-shared-forms.css',
    './verifactu-toolbar.css',
  ],
})
export class VerifactuQueuePageComponent {
  private readonly verifactu = inject(VerifactuApiService);
  private readonly actions = inject(VerifactuInvoiceActionsService);
  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  readonly queueStatusLabel = queueStatusLabel;

  readonly snapshot$ = this.refresh$.pipe(
    switchMap(() =>
      this.verifactu.queue().pipe(
        map((rows) => {
          const list = (rows ?? []) as VerifactuQueueItemDto[];
          const pending = list.filter((q) =>
            ['PENDING', 'PROCESSING', 'FORWARDED'].includes(q.status),
          ).length;
          const completed = list.filter((q) => q.status === 'COMPLETED').length;
          const failed = list.filter((q) => q.status === 'FAILED').length;
          return {
            loading: false as const,
            rows: list,
            pending,
            completed,
            failed,
          };
        }),
        tap(() => {
          this.loadError = null;
        }),
        catchError((e: HttpErrorResponse) => {
          this.loadError = verifactuHttpErrorMessage(
            e,
            'No se pudo cargar la cola',
          );
          return of({
            loading: false as const,
            rows: [] as VerifactuQueueItemDto[],
            pending: 0,
            completed: 0,
            failed: 0,
          });
        }),
        startWith({
          loading: true as const,
          rows: [] as VerifactuQueueItemDto[],
          pending: 0,
          completed: 0,
          failed: 0,
        }),
      ),
    ),
  );

  invoiceIdToEnqueue = '';
  enqueueInProgress = false;
  loadError: string | null = null;

  refresh(): void {
    this.loadError = null;
    this.refresh$.next();
  }

  enqueue(): void {
    const id = this.invoiceIdToEnqueue.trim();
    if (!id) {
      this.actions.enqueueById('');
      return;
    }
    this.enqueueInProgress = true;
    this.actions.enqueueById(id, {
      onSuccess: () => {
        this.invoiceIdToEnqueue = '';
        this.refresh();
      },
      onSettled: () => {
        this.enqueueInProgress = false;
      },
    });
  }

  queueBadgeVariant(status: string): GcrmBadgeVariant {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'FORWARDED':
      case 'PROCESSING':
        return 'info';
      case 'COMPLETED':
        return 'success';
      case 'FAILED':
        return 'danger';
      default:
        return 'neutral';
    }
  }
}
