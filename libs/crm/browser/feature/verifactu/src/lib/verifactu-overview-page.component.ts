import { HttpErrorResponse } from '@angular/common/http';
import { AsyncPipe, CommonModule, JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  VerifactuApiService,
  type VerifactuIntegrationSummaryDto,
  type VerifactuQueueItemDto,
  type VerifactuSeriesRowDto,
} from '@generic-crm/verifactu-data-access';
import {
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
  forkJoin,
  map,
  of,
  startWith,
  switchMap,
} from 'rxjs';
import {
  appendVerifactuBranchError,
  joinVerifactuLoadErrors,
} from './http-error-message';

@Component({
  selector: 'lib-verifactu-overview-page',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    JsonPipe,
    RouterLink,
    GcrmButtonComponent,
    GcrmPageComponent,
    GcrmPanelComponent,
    GcrmInlineMessageComponent,
    GcrmSpinnerComponent,
    GcrmStatCardComponent,
  ],
  templateUrl: './verifactu-overview-page.component.html',
  styleUrls: [
    './verifactu-overview-page.component.css',
    './verifactu-shared-layout.css',
    './verifactu-toolbar.css',
  ],
})
export class VerifactuOverviewPageComponent {
  private readonly verifactu = inject(VerifactuApiService);
  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  readonly snapshot$ = this.refresh$.pipe(
    switchMap(() => {
      const loadErrors: string[] = [];
      return forkJoin({
        queue: this.verifactu.queue().pipe(
          catchError((e: HttpErrorResponse) => {
            appendVerifactuBranchError(loadErrors, 'Cola', e);
            return of([] as VerifactuQueueItemDto[]);
          }),
        ),
        series: this.verifactu.series().pipe(
          catchError((e: HttpErrorResponse) => {
            appendVerifactuBranchError(loadErrors, 'Series', e);
            return of([] as VerifactuSeriesRowDto[]);
          }),
        ),
        integration: this.verifactu.integration().pipe(
          catchError((e: HttpErrorResponse) => {
            appendVerifactuBranchError(loadErrors, 'Integración', e);
            return of(null);
          }),
        ),
        settings: this.verifactu.tenantSettings().pipe(
          catchError((e: HttpErrorResponse) => {
            appendVerifactuBranchError(loadErrors, 'Ajustes', e);
            return of({ emitterTaxId: null as string | null });
          }),
        ),
      }).pipe(
        map(({ queue, series, integration, settings }) => {
          const integ = integration as VerifactuIntegrationSummaryDto | null;
          const aeat = integ?.aeat;
          const cred = integ?.credentials;
          const pendingCount = queue.filter((q) =>
            ['PENDING', 'PROCESSING', 'FORWARDED'].includes(q.status),
          ).length;
          const completedCount = queue.filter((q) => q.status === 'COMPLETED').length;
          const failedCount = queue.filter((q) => q.status === 'FAILED').length;
          return {
            loading: false as const,
            queueCount: queue.length,
            pendingCount,
            completedCount,
            failedCount,
            seriesCount: series.length,
            emitterTaxId: settings.emitterTaxId,
            submissionEnv: aeat?.submissionEnv ?? '—',
            encryptionConfigured: Boolean(cred?.encryptionKeyConfigured),
            submissionMode: aeat?.submissionMode ?? '—',
            loadError: joinVerifactuLoadErrors(loadErrors),
            raw: { queue, series, integration },
          };
        }),
        startWith({ loading: true as const }),
      );
    }),
  );

  refresh(): void {
    this.refresh$.next();
  }
}
