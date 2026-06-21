import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  ButtonComponent,
  InputComponent,
  JOSANZ_FIGMA_LOGIN,
  JosanzThemeService,
} from '@josanz-erp/josanz-ui';
import {
  AuthService,
  AuthStore,
  DEV_TENANT_LOGIN_PASSWORD,
  getPrimaryDevLoginHintForTenant,
} from '@josanz-erp/identity-data-access';

const JOSANZ_TENANT_SLUG = 'josanz';

@Component({
  selector: 'app-josanz-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, ButtonComponent, RouterLink],
  templateUrl: './josanz-login.component.html',
  styleUrl: './josanz-login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JosanzLoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  readonly store = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly theme = inject(JosanzThemeService);

  readonly loginCta = JOSANZ_FIGMA_LOGIN.primaryCta;
  readonly loginCtaDisabled = JOSANZ_FIGMA_LOGIN.disabledCta;

  readonly showKeycloakSso = signal(false);
  readonly pkceRedirectLoading = signal(false);
  readonly pkceError = signal<string | null>(null);
  readonly keycloakReachable = signal<boolean | null>(null);

  readonly showLocalLoginForm = computed(() => {
    if (!this.authService.canUseKeycloakPkce(JOSANZ_TENANT_SLUG)) {
      return true;
    }
    return this.keycloakReachable() === false;
  });

  readonly loginForm = this.fb.nonNullable.group({
    email: [
      getPrimaryDevLoginHintForTenant(JOSANZ_TENANT_SLUG)?.email ?? 'admin@josanz.com',
      Validators.required,
    ],
    password: [DEV_TENANT_LOGIN_PASSWORD, Validators.required],
  });

  ngOnInit(): void {
    this.theme.setTheme('luxe-rounded');
    this.showKeycloakSso.set(this.authService.canUseKeycloakPkce(JOSANZ_TENANT_SLUG));
    if (this.authService.canUseKeycloakPkce(JOSANZ_TENANT_SLUG)) {
      this.authService.isKeycloakAvailable().subscribe({
        next: (available) => {
          this.keycloakReachable.set(available);
          this.showKeycloakSso.set(available);
        },
        error: () => {
          this.keycloakReachable.set(false);
          this.showKeycloakSso.set(false);
        },
      });
    } else {
      this.keycloakReachable.set(false);
    }
  }

  async startKeycloakSso(): Promise<void> {
    if (!this.showKeycloakSso() || this.pkceRedirectLoading()) {
      return;
    }
    this.pkceRedirectLoading.set(true);
    this.pkceError.set(null);
    try {
      await this.authService.startKeycloakPkceRedirect(JOSANZ_TENANT_SLUG);
    } catch (err) {
      this.pkceRedirectLoading.set(false);
      this.pkceError.set(
        err instanceof Error ? err.message : 'No se pudo redirigir a Keycloak.',
      );
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const { email, password } = this.loginForm.getRawValue();
    this.store.login({
      email,
      password,
      tenantSlug: JOSANZ_TENANT_SLUG,
    });
  }
}
