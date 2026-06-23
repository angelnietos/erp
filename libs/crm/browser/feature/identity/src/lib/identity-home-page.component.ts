import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  inject,
  isDevMode,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IdentityAuthService } from '@generic-crm/identity-data-access';
import {
  httpApiErrorMessage,
  isSafeAppInternalPath,
  SessionTokenStorageService,
} from '@generic-crm/shared-browser-data-access';
import {
  GcrmButtonComponent,
  type GcrmInlineMessageVariant,
  GcrmInlineMessageComponent,
} from '@generic-crm/shared-ui';
import { finalize } from 'rxjs';

@Component({
  selector: 'lib-identity-home-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GcrmButtonComponent,
    GcrmInlineMessageComponent,
  ],
  templateUrl: './identity-home-page.component.html',
  styleUrl: './identity-home-page.component.css',
})
export class IdentityHomePageComponent implements OnInit {
  private readonly auth = inject(IdentityAuthService);
  private readonly router = inject(Router);
  private readonly tokens = inject(SessionTokenStorageService);
  private readonly destroyRef = inject(DestroyRef);

  /** Solo true en `ng serve` / build sin optimización de producción; no muestra datos de demo en prod. */
  readonly devMode = isDevMode();

  email = '';
  password = '';
  tenantSlug = '';
  feedback = '';
  feedbackVariant: GcrmInlineMessageVariant = 'info';
  submitting = false;

  /** Misma contraseña que `apps/api/prisma/seed.ts` (solo entornos de prueba). */
  private static readonly demoPassword = 'Demo12345!';

  fillDemoAdmin(): void {
    this.email = 'admin@demo.local';
    this.password = IdentityHomePageComponent.demoPassword;
    this.tenantSlug = 'demo';
  }

  fillDemoViewer(): void {
    this.email = 'visor@demo.local';
    this.password = IdentityHomePageComponent.demoPassword;
    this.tenantSlug = 'demo';
  }

  ngOnInit(): void {
    const tree = this.router.parseUrl(this.router.url);
    const tenantParam = tree.queryParams['tenant'];
    const tenantFromQuery =
      typeof tenantParam === 'string'
        ? tenantParam
        : Array.isArray(tenantParam)
          ? tenantParam[0]
          : '';
    if (tenantFromQuery?.trim()) {
      this.tenantSlug = tenantFromQuery.trim();
    }

    if (this.tokens.getAccessToken()) {
      this.navigateAfterAuth();
    }
  }

  /** Tras login o si ya hay JWT: `returnUrl` del query (guard) o `/clients`. */
  private navigateAfterAuth(): void {
    const tree = this.router.parseUrl(this.router.url);
    const v = tree.queryParams['returnUrl'];
    const raw = typeof v === 'string' ? v : Array.isArray(v) ? v[0] : undefined;
    if (raw && isSafeAppInternalPath(raw)) {
      void this.router.navigateByUrl(raw);
      return;
    }
    void this.router.navigateByUrl('/clients');
  }

  login(): void {
    this.feedback = '';
    this.submitting = true;
    this.auth
      .login({
        email: this.email,
        password: this.password,
        tenantSlug: this.tenantSlug || undefined,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.submitting = false;
        }),
      )
      .subscribe({
        next: () => {
          this.feedback = 'Sesión iniciada.';
          this.feedbackVariant = 'success';
          this.navigateAfterAuth();
        },
        error: (err: unknown) => {
          this.feedbackVariant = 'error';
          this.feedback =
            err instanceof HttpErrorResponse
              ? httpApiErrorMessage(err, 'Error de login')
              : 'Error de login';
        },
      });
  }
}
