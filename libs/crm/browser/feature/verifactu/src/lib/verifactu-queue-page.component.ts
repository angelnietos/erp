import { HttpErrorResponse } from '@angular/common/http';
import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
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
} from '@generic-crm/shared-ui';
import {
  BehaviorSubject,
  catchError,
  finalize,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { verifactuHttpErrorMessage } from './http-error-message';

@Component({
  selector: 'lib-verifactu-queue-page',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    DatePipe,
    FormsModule,
    GcrmPageComponent,
    GcrmPanelComponent,
    GcrmButtonComponent,
    GcrmBadgeComponent,
    GcrmInlineMessageComponent,
    GcrmSpinnerComponent,
  ],
  templateUrl: './verifactu-queue-page.component.html',
  styleUrls: [
    './verifactu-queue-page.component.css',
    './verifactu-shared-tables.css',
    './verifactu-toolbar.css',
  ],
})
export class VerifactuQueuePageComponent {
  private readonly verifactu = inject(VerifactuApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  tableLoading = false;

  readonly queue$ = this.refresh$.pipe(
    switchMap(() => {
      this.tableLoading = true;
      return this.verifactu.queue().pipe(
        map((rows) => (rows ?? []) as VerifactuQueueItemDto[]),
        tap(() => {
          this.loadError = null;
        }),
        catchError((e: HttpErrorResponse) => {
          this.loadError = verifactuHttpErrorMessage(
            e,
            'No se pudo cargar la cola',
          );
          return of([] as VerifactuQueueItemDto[]);
        }),
        finalize(() => {
          this.tableLoading = false;
        }),
      );
    }),
  );

  invoiceIdToEnqueue = '';
  enqueueInProgress = false;
  feedback: string | null = null;
  errorMessage: string | null = null;
  loadError: string | null = null;

  refresh(): void {
    this.loadError = null;
    this.refresh$.next();
  }

  enqueue(): void {
    this.feedback = null;
    this.errorMessage = null;
    const id = this.invoiceIdToEnqueue.trim();
    if (!id) {
      return;
    }
    this.enqueueInProgress = true;
    this.verifactu
      .enqueue(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.enqueueInProgress = false;
        }),
      )
      .subscribe({
        next: () => {
          this.invoiceIdToEnqueue = '';
          this.feedback = 'Factura encolada.';
          this.refresh();
        },
        error: (e: HttpErrorResponse) => {
          this.errorMessage = verifactuHttpErrorMessage(
            e,
            'No se pudo encolar',
          );
        },
      });
  }

  queueBadgeVariant(status: string): GcrmBadgeVariant {
    switch (status) {
      case 'PENDING':
        return 'warning';
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
