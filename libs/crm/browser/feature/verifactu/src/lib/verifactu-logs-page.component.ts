import { HttpErrorResponse } from '@angular/common/http';
import { AsyncPipe, CommonModule, DatePipe, JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  VerifactuApiService,
  type VerifactuLogRowDto,
} from '@generic-crm/verifactu-data-access';
import {
  type GcrmBadgeVariant,
  GcrmBadgeComponent,
  GcrmButtonComponent,
  GcrmInlineMessageComponent,
  GcrmPageComponent,
  GcrmPanelComponent,
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
  selector: 'lib-verifactu-logs-page',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    DatePipe,
    JsonPipe,
    FormsModule,
    GcrmPageComponent,
    GcrmPanelComponent,
    GcrmButtonComponent,
    GcrmBadgeComponent,
    GcrmInlineMessageComponent,
  ],
  templateUrl: './verifactu-logs-page.component.html',
  styleUrls: [
    './verifactu-logs-page.component.css',
    './verifactu-shared-tables.css',
    './verifactu-toolbar.css',
  ],
})
export class VerifactuLogsPageComponent {
  private readonly verifactu = inject(VerifactuApiService);
  private readonly filter$ = new BehaviorSubject<string | undefined>(undefined);

  invoiceFilter = '';
  loadError: string | null = null;
  logsLoading = false;

  readonly logs$ = this.filter$.pipe(
    switchMap((invoiceId) => {
      this.logsLoading = true;
      return this.verifactu.logs(invoiceId, 80).pipe(
        map((rows) => (rows ?? []) as VerifactuLogRowDto[]),
        tap(() => {
          this.loadError = null;
        }),
        catchError((e: HttpErrorResponse) => {
          this.loadError = verifactuHttpErrorMessage(
            e,
            'No se pudo cargar el historial',
          );
          return of([] as VerifactuLogRowDto[]);
        }),
        finalize(() => {
          this.logsLoading = false;
        }),
      );
    }),
  );

  applyFilter(): void {
    this.loadError = null;
    const v = this.invoiceFilter.trim();
    this.filter$.next(v || undefined);
  }

  refreshLogs(): void {
    this.loadError = null;
    this.filter$.next(this.filter$.getValue());
  }

  logStatusBadgeVariant(status: string): GcrmBadgeVariant {
    switch (status) {
      case 'SUCCESS':
        return 'success';
      case 'ERROR':
        return 'danger';
      default:
        return 'neutral';
    }
  }
}
