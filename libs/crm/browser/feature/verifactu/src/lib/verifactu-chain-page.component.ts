import { HttpErrorResponse } from '@angular/common/http';
import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
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
  finalize,
  map,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { verifactuHttpErrorMessage } from './http-error-message';
import { VerifactuEmptyStateComponent } from './verifactu-empty-state.component';

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

  invoiceFilter = '';
  loadError: string | null = null;
  verifyError: string | null = null;
  verifyLoading = false;
  verification: VerifactuChainVerificationDto | null = null;

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
    this.verifyLoading = true;
    this.verifyError = null;
    this.verifactu
      .chainVerify()
      .pipe(
        finalize(() => {
          this.verifyLoading = false;
        }),
      )
      .subscribe({
        next: (result) => {
          this.verification = result;
        },
        error: (e: HttpErrorResponse) => {
          this.verifyError = verifactuHttpErrorMessage(
            e,
            'No se pudo verificar la cadena',
          );
          this.verification = null;
        },
      });
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

  verifyBadgeVariant(): GcrmBadgeVariant {
    if (!this.verification) {
      return 'neutral';
    }
    return this.verification.isValid ? 'success' : 'danger';
  }
}
