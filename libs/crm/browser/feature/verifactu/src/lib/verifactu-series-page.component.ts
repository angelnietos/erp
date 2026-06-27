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
    GcrmBadgeComponent,
    GcrmInlineMessageComponent,
    GcrmSpinnerComponent,
    GcrmStatCardComponent,
  ],
  templateUrl: './verifactu-series-page.component.html',
  styleUrls: [
    './verifactu-series-page.component.css',
    './verifactu-shared-tables.css',
    './verifactu-shared-layout.css',
    './verifactu-shared-forms.css',
    './verifactu-toolbar.css',
  ],
})
export class VerifactuSeriesPageComponent {
  private readonly verifactu = inject(VerifactuApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  readonly snapshot$ = this.refresh$.pipe(
    switchMap(() =>
      this.verifactu.series().pipe(
        map((rows) => {
          const list = (rows ?? []) as VerifactuSeriesRowDto[];
          const active = list.filter((r) => r.isActive).length;
          return {
            loading: false as const,
            rows: list,
            active,
            inactive: list.length - active,
          };
        }),
        tap(() => {
          this.loadError = null;
        }),
        catchError((e: HttpErrorResponse) => {
          this.loadError = verifactuHttpErrorMessage(
            e,
            'No se pudieron cargar las series',
          );
          return of({
            loading: false as const,
            rows: [] as VerifactuSeriesRowDto[],
            active: 0,
            inactive: 0,
          });
        }),
        startWith({
          loading: true as const,
          rows: [] as VerifactuSeriesRowDto[],
          active: 0,
          inactive: 0,
        }),
      ),
    ),
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
