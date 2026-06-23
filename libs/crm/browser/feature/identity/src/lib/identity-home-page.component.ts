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
  inferTenantSlugFromEmail,
  isSafeAppInternalPath,
  SessionTokenStorageService,
} from '@generic-crm/shared-browser-data-access';
import {
  GcrmButtonComponent,
  type GcrmInlineMessageVariant,
  GcrmInlineMessageComponent,
  GcrmPageComponent,
  GcrmPanelComponent,
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
    GcrmPageComponent,
    GcrmPanelComponent,
  ],
  templateUrl: './identity-home-page.component.html',
  styleUrl: './identity-home-page.component.css',
})
export class IdentityHomePageComponent implements OnInit {
  private readonly auth = inject(IdentityAuthService);
  private readonly router = inject(Router);
  private readonly tokens = inject(SessionTokenStorageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly devMode = isDevMode();

  email = '';
  password = '';
  tenantSlug = '';
  feedback = '';
  feedbackVariant: GcrmInlineMessageVariant = 'info';
  submitting = false;

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

  private navigateAfterAuth(): void {
    const tree = this.router.parseUrl(this.router.url);
    const v = tree.queryParams['returnUrl'];
    const raw = typeof v === 'string' ? v : Array.isArray(v) ? v[0] : undefined;
    if (raw && isSafeAppInternalPath(raw)) {
      void this.router.navigateByUrl(raw);
      return;
    }
    void this.router.navigateByUrl('/verifactu/overview');
  }

  login(): void {
    this.feedback = '';
    this.submitting = true;
    const tenantSlug =
      this.tenantSlug.trim() ||
      inferTenantSlugFromEmail(this.email) ||
      undefined;
    this.auth
      .login({
        email: this.email,
        password: this.password,
        tenantSlug,
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
