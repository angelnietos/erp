import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  ButtonComponent,
  InputComponent,
  JosanzThemeService,
} from '@josanz-erp/josanz-ui';
import {
  AuthService,
  AUTH_KEYCLOAK_CONFIG,
  ERP_TENANT_SLUG_SESSION_KEY,
  JOSANZ_FIGMA_TENANT_SLUG,
  redirectToKeycloakResetCredentials,
  resolveForgotPasswordTenantSlug,
} from '@josanz-erp/identity-data-access';
import { getTenantKeycloakConfig, tenantUsesKeycloakLogin } from '@josanz-erp/identity-api';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-josanz-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, ButtonComponent, RouterLink],
  templateUrl: './josanz-forgot-password.component.html',
  styleUrl: './josanz-login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JosanzForgotPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly keycloakConfig = inject(AUTH_KEYCLOAK_CONFIG, { optional: true });
  private readonly theme = inject(JosanzThemeService);

  readonly loading = signal(false);
  readonly keycloakHandoffPending = signal(true);
  readonly useLocalFallback = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly devResetUrl = signal<string | null>(null);
  readonly tenantSlug = signal<string>(JOSANZ_FIGMA_TENANT_SLUG);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    this.theme.setTheme('luxe-rounded');

    const fromQuery = this.route.snapshot.queryParamMap.get('tenant');
    const fromStore =
      typeof sessionStorage !== 'undefined'
        ? sessionStorage.getItem(ERP_TENANT_SLUG_SESSION_KEY)
        : null;
    const slug = resolveForgotPasswordTenantSlug(
      fromQuery,
      fromStore,
      JOSANZ_FIGMA_TENANT_SLUG,
    );
    this.tenantSlug.set(slug);

    if (this.route.snapshot.queryParamMap.get('local') === '1') {
      this.keycloakHandoffPending.set(false);
      this.useLocalFallback.set(true);
      return;
    }

    void this.tryKeycloakForgotPasswordFirst(slug);
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);
    this.devResetUrl.set(null);

    const slug = this.tenantSlug();

    try {
      const { email } = this.form.getRawValue();
      const res = await firstValueFrom(this.auth.forgotPassword(email, slug));
      this.success.set('Contraseña enviada correctamente. Revisa tu bandeja de entrada.');
      if (res.devResetUrl) {
        this.devResetUrl.set(res.devResetUrl);
      }
    } catch (err: unknown) {
      const msg =
        (err as { error?: { message?: string } })?.error?.message ??
        'No se pudo procesar la solicitud. Inténtalo de nuevo.';
      this.error.set(typeof msg === 'string' ? msg : 'Error inesperado');
    } finally {
      this.loading.set(false);
    }
  }

  goLogin(): void {
    void this.router.navigate(['/auth/login']);
  }

  private async tryKeycloakForgotPasswordFirst(slug: string): Promise<void> {
    if (!tenantUsesKeycloakLogin(slug)) {
      this.keycloakHandoffPending.set(false);
      this.useLocalFallback.set(true);
      return;
    }

    const tenantCfg = getTenantKeycloakConfig(slug);
    const kcBase = this.keycloakConfig?.url?.replace(/\/$/, '') ?? '';
    if (!tenantCfg || !kcBase) {
      this.keycloakHandoffPending.set(false);
      this.useLocalFallback.set(true);
      return;
    }

    try {
      const keycloakAvailable = await firstValueFrom(
        this.auth.isKeycloakAvailable(tenantCfg.realm),
      );
      if (keycloakAvailable && redirectToKeycloakResetCredentials(kcBase, slug)) {
        return;
      }
    } catch {
      /* fallback local */
    }

    this.keycloakHandoffPending.set(false);
    this.useLocalFallback.set(true);
  }
}
