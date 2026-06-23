import { HttpErrorResponse } from '@angular/common/http';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import {
  appendVerifactuBranchError,
  joinVerifactuLoadErrors,
  verifactuHttpErrorMessage,
} from './http-error-message';
import {
  VerifactuApiService,
  type VerifactuCredentialsStatusDto,
  type VerifactuIntegrationSummaryDto,
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
  forkJoin,
  map,
  of,
  switchMap,
} from 'rxjs';

@Component({
  selector: 'lib-verifactu-credentials-page',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    FormsModule,
    GcrmPageComponent,
    GcrmPanelComponent,
    GcrmButtonComponent,
    GcrmInlineMessageComponent,
    GcrmSpinnerComponent,
    GcrmStatCardComponent,
    GcrmBadgeComponent,
  ],
  templateUrl: './verifactu-credentials-page.component.html',
  styleUrls: [
    './verifactu-credentials-page.component.css',
    './verifactu-shared-layout.css',
    './verifactu-shared-forms.css',
    './verifactu-shared-tables.css',
    './verifactu-toolbar.css',
  ],
})
export class VerifactuCredentialsPageComponent {
  private readonly verifactu = inject(VerifactuApiService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  vmLoading = false;

  readonly vm$ = this.refresh$.pipe(
    switchMap(() => {
      this.vmLoading = true;
      const loadErrors: string[] = [];
      return forkJoin({
        slots: this.verifactu.credentialsStatus().pipe(
          catchError((e: HttpErrorResponse) => {
            appendVerifactuBranchError(loadErrors, 'Certificados', e);
            return of<VerifactuCredentialsStatusDto | null>(null);
          }),
        ),
        tenantSettings: this.verifactu.tenantSettings().pipe(
          catchError((e: HttpErrorResponse) => {
            appendVerifactuBranchError(loadErrors, 'Ajustes', e);
            return of({ emitterTaxId: null as string | null });
          }),
        ),
        integration: this.verifactu.integration().pipe(
          catchError((e: HttpErrorResponse) => {
            appendVerifactuBranchError(loadErrors, 'Integración', e);
            return of(null);
          }),
        ),
      }).pipe(
        map(({ slots, tenantSettings, integration }) => {
          const integ = integration as VerifactuIntegrationSummaryDto | null;
          const cred = integ?.credentials;
          const aeat = integ?.aeat;
          return {
            slots,
            emitterTaxId: tenantSettings.emitterTaxId,
            encryptionConfigured: Boolean(cred?.encryptionKeyConfigured),
            submissionEnv: aeat?.submissionEnv ?? 'test',
            httpBaseUrl: aeat?.httpBaseUrl ?? null,
            loadError: joinVerifactuLoadErrors(loadErrors),
          };
        }),
        finalize(() => {
          this.vmLoading = false;
        }),
      );
    }),
  );

  refresh(): void {
    this.refresh$.next();
  }

  environment: 'test' | 'production' = 'test';
  certificatePem = '';
  privateKeyPem = '';
  emitterNifEdit = '';
  saveMessage: string | null = null;
  saveError: string | null = null;

  pemSaving = false;
  nifSaving = false;
  nifClearing = false;
  removeEnv: 'test' | 'production' | null = null;

  /** Evita peticiones concurrentes que comparten mensajes de error globales. */
  get mutationLocked(): boolean {
    return (
      this.pemSaving ||
      this.nifSaving ||
      this.nifClearing ||
      this.removeEnv !== null
    );
  }

  save(): void {
    this.saveMessage = null;
    this.saveError = null;
    const cert = this.certificatePem.trim();
    const key = this.privateKeyPem.trim();
    if (cert.length < 80 || key.length < 80) {
      this.saveError =
        'Pega el certificado y la clave privada completos (PEM).';
      return;
    }
    this.pemSaving = true;
    this.verifactu
      .upsertCredentials({
        environment: this.environment,
        certificatePem: cert,
        privateKeyPem: key,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.pemSaving = false;
        }),
      )
      .subscribe({
        next: () => {
          this.saveMessage = 'Certificado guardado cifrado en el servidor.';
          this.certificatePem = '';
          this.privateKeyPem = '';
          this.refresh$.next();
        },
        error: (e: HttpErrorResponse) => {
          this.saveError = verifactuHttpErrorMessage(e, 'Error al guardar');
        },
      });
  }

  saveEmitterNif(): void {
    this.saveMessage = null;
    this.saveError = null;
    const v = this.emitterNifEdit.trim();
    this.nifSaving = true;
    this.verifactu
      .patchTenantSettings({ emitterTaxId: v || null })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.nifSaving = false;
        }),
      )
      .subscribe({
        next: () => {
          this.saveMessage = v
            ? `NIF emisor guardado: ${v.toUpperCase()}`
            : 'NIF emisor eliminado (se usará AEAT_EMISOR_NIF si existe).';
          this.emitterNifEdit = '';
          this.refresh$.next();
        },
        error: (e: HttpErrorResponse) => {
          this.saveError = verifactuHttpErrorMessage(e, 'Error al guardar NIF');
        },
      });
  }

  clearEmitterNif(): void {
    this.saveMessage = null;
    this.saveError = null;
    this.emitterNifEdit = '';
    this.nifClearing = true;
    this.verifactu
      .patchTenantSettings({ emitterTaxId: null })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.nifClearing = false;
        }),
      )
      .subscribe({
        next: () => {
          this.saveMessage =
            'NIF emisor eliminado (se usará AEAT_EMISOR_NIF en el worker si está definido).';
          this.refresh$.next();
        },
        error: (e: HttpErrorResponse) => {
          this.saveError = verifactuHttpErrorMessage(e, 'Error');
        },
      });
  }

  remove(env: 'test' | 'production'): void {
    this.saveMessage = null;
    this.saveError = null;
    this.removeEnv = env;
    this.verifactu
      .deleteCredentials(env)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.removeEnv = null;
        }),
      )
      .subscribe({
        next: () => {
          this.saveMessage =
            env === 'test'
              ? 'Credenciales de prueba eliminadas.'
              : 'Credenciales de producción eliminadas.';
          this.refresh$.next();
        },
        error: (e: HttpErrorResponse) => {
          this.saveError = verifactuHttpErrorMessage(e, 'No se pudo eliminar');
        },
      });
  }
}
