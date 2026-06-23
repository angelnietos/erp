import { HttpErrorResponse } from '@angular/common/http';
import { AsyncPipe, CommonModule, JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { VerifactuApiService } from '@generic-crm/verifactu-data-access';
import {
  InvoicesApiService,
  type InvoiceRowDto,
} from '@generic-crm/invoices-data-access';
import {
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
  forkJoin,
  map,
  of,
  switchMap,
} from 'rxjs';
import {
  appendVerifactuBranchError,
  joinVerifactuLoadErrors,
} from './http-error-message';

@Component({
  selector: 'lib-verifactu-integration-page',
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
  ],
  templateUrl: './verifactu-integration-page.component.html',
  styleUrls: [
    './verifactu-integration-page.component.css',
    './verifactu-toolbar.css',
  ],
})
export class VerifactuIntegrationPageComponent {
  private readonly verifactu = inject(VerifactuApiService);
  private readonly invoices = inject(InvoicesApiService);
  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  snapshotLoading = false;

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
            'Despliegue paralelo: nx serve verifactu-api (puerto 3110) misma BD y JWT.',
          worker:
            'Proceso: nx serve verifactu-worker — cola en BD (SKIP LOCKED); el envío AEAT lo implementa el adaptador (stub o http según AEAT_SUBMISSION_MODE).',
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
}
