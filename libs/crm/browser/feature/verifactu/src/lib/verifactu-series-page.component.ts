import { HttpErrorResponse } from '@angular/common/http';
import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import {
  VerifactuApiService,
  type VerifactuSeriesRowDto,
} from '@generic-crm/verifactu-data-access';
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
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { verifactuHttpErrorMessage } from './http-error-message';

@Component({
  selector: 'lib-verifactu-series-page',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    DatePipe,
    FormsModule,
    GcrmPageComponent,
    GcrmPanelComponent,
    GcrmButtonComponent,
    GcrmInlineMessageComponent,
    GcrmSpinnerComponent,
  ],
  templateUrl: './verifactu-series-page.component.html',
  styleUrls: [
    './verifactu-series-page.component.css',
    './verifactu-shared-tables.css',
    './verifactu-toolbar.css',
  ],
})
export class VerifactuSeriesPageComponent {
  private readonly verifactu = inject(VerifactuApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  tableLoading = false;

  readonly series$ = this.refresh$.pipe(
    switchMap(() => {
      this.tableLoading = true;
      return this.verifactu.series().pipe(
        map((rows) => (rows ?? []) as VerifactuSeriesRowDto[]),
        tap(() => {
          this.loadError = null;
        }),
        catchError((e: HttpErrorResponse) => {
          this.loadError = verifactuHttpErrorMessage(
            e,
            'No se pudieron cargar las series',
          );
          return of([] as VerifactuSeriesRowDto[]);
        }),
        finalize(() => {
          this.tableLoading = false;
        }),
      );
    }),
  );

  code = '';
  description = '';
  createInProgress = false;
  feedback: string | null = null;
  errorMessage: string | null = null;
  loadError: string | null = null;

  refresh(): void {
    this.loadError = null;
    this.refresh$.next();
  }

  create(): void {
    this.feedback = null;
    this.errorMessage = null;
    const code = this.code.trim();
    if (!code) {
      return;
    }
    this.createInProgress = true;
    this.verifactu
      .createSeries({
        code,
        description: this.description.trim() || undefined,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.createInProgress = false;
        }),
      )
      .subscribe({
        next: () => {
          this.code = '';
          this.description = '';
          this.feedback = `Serie «${code}» creada.`;
          this.refresh();
        },
        error: (e: HttpErrorResponse) => {
          this.errorMessage = verifactuHttpErrorMessage(
            e,
            'No se pudo crear la serie',
          );
        },
      });
  }
}
