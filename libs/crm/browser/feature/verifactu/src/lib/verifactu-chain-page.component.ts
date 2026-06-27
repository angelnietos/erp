import { HttpErrorResponse } from '@angular/common/http';
import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  VerifactuApiService,
  type VerifactuChainBlockDto,
  type VerifactuChainVerificationDto,
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
  merge,
  of,
  startWith,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { verifactuHttpErrorMessage } from './http-error-message';
import { VerifactuEmptyStateComponent } from './verifactu-empty-state.component';

type ChainVerifyViewState =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'done'; result: VerifactuChainVerificationDto }
  | { phase: 'error'; message: string };

@Component({
  selector: 'lib-verifactu-chain-page',
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
  templateUrl: './verifactu-chain-page.component.html',
  styleUrls: [
    './verifactu-chain-page.component.css',
    './verifactu-shared-tables.css',
    './verifactu-shared-layout.css',
    './verifactu-shared-forms.css',
    './verifactu-toolbar.css',
  ],
})
export class VerifactuChainPageComponent {
  private readonly verifactu = inject(VerifactuApiService);
  private readonly refresh$ = new BehaviorSubject<void>(undefined);
  private readonly verifyClick$ = new Subject<void>();

  invoiceFilter = '';
  loadError: string | null = null;

  readonly verifyView = toSignal(
    merge(
      of({ phase: 'idle' } as ChainVerifyViewState),
      this.verifyClick$.pipe(
        switchMap(() =>
          this.verifactu.chainVerify().pipe(
            map(
              (result): ChainVerifyViewState => ({
                phase: 'done',
                result,
              }),
            ),
            catchError((e: HttpErrorResponse) =>
              of({
                phase: 'error' as const,
                message: verifactuHttpErrorMessage(
                  e,
                  'No se pudo verificar la cadena',
                ),
              }),
            ),
            startWith({ phase: 'loading' } as ChainVerifyViewState),
          ),
        ),
      ),
    ),
    { initialValue: { phase: 'idle' } as ChainVerifyViewState },
  );

  readonly verifyBusy = computed(() => this.verifyView().phase === 'loading');

  readonly vm$ = this.refresh$.pipe(
    switchMap(() => {
      const invoiceId = this.invoiceFilter.trim() || undefined;
      return this.verifactu.chainBlocks(invoiceId, 120).pipe(
        map((rows) => ({
          blocks: (rows ?? []) as VerifactuChainBlockDto[],
          loading: false as const,
        })),
        tap(() => {
          this.loadError = null;
        }),
        catchError((e: HttpErrorResponse) => {
          this.loadError = verifactuHttpErrorMessage(
            e,
            'No se pudo cargar la cadena fiscal',
          );
          return of({
            blocks: [] as VerifactuChainBlockDto[],
            loading: false as const,
          });
        }),
        startWith({
          blocks: [] as VerifactuChainBlockDto[],
          loading: true as const,
        }),
      );
    }),
  );

  applyFilter(): void {
    this.loadError = null;
    this.refresh$.next();
  }

  refresh(): void {
    this.loadError = null;
    this.refresh$.next();
  }

  verifyChain(): void {
    this.verifyClick$.next();
  }

  truncateHash(value: string | null | undefined, head = 10, tail = 8): string {
    if (!value) {
      return '—';
    }
    if (value.length <= head + tail + 1) {
      return value;
    }
    return `${value.slice(0, head)}…${value.slice(-tail)}`;
  }

  envLabel(env: string): string {
    return env === 'PRODUCTION' ? 'Producción' : 'Pruebas';
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

  recordKindBadgeVariant(kind: string): GcrmBadgeVariant {
    switch (kind) {
      case 'RECTIFICATIVE':
        return 'warning';
      case 'CANCELLATION':
        return 'danger';
      default:
        return 'success';
    }
  }

  verifyBadgeVariant(result: VerifactuChainVerificationDto): GcrmBadgeVariant {
    return result.isValid ? 'success' : 'danger';
  }

  verifyHeadline(result: VerifactuChainVerificationDto): string {
    if (!result.isValid) {
      return 'Cadena comprometida';
    }
    if (result.totalRecords === 0) {
      return 'Cadena vacía e íntegra';
    }
    return 'Cadena íntegra';
  }

  verifySummary(result: VerifactuChainVerificationDto): string {
    const env = this.envLabel(result.environment);
    const verifiedAt = new Date(result.verifiedAt).toLocaleString();
    if (result.totalRecords === 0) {
      return `No hay bloques registrados todavía en entorno ${env}. La estructura del ledger es válida. Verificado ${verifiedAt}.`;
    }
    const head =
      result.headBlockIndex != null
        ? ` Cabeza en bloque #${result.headBlockIndex}.`
        : '';
    return `${result.totalRecords} bloque(s) verificados en entorno ${env}.${head} Verificado ${verifiedAt}.`;
  }
}
