import { ChangeDetectionStrategy, Component, computed, HostListener, inject, OnInit, signal } from '@angular/core';
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
import { consumePkceRedirectAborted, clearPkceRedirectPending } from '@josanz-erp/shared-auth-keycloak';

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

  readonly pkceRedirectLoading = signal(false);
  readonly pkceError = signal<string | null>(null);
  readonly keycloakReachable = signal<boolean | null>(null);
  readonly keycloakRedirectAborted = signal(false);
  readonly forceLocalLogin = signal(false);

  readonly showLocalLoginForm = computed(() => {
    if (this.forceLocalLogin()) {
      return true;
    }
    if (!this.authService.canUseKeycloakPkce(JOSANZ_TENANT_SLUG)) {
      return true;
    }
    if (this.keycloakRedirectAborted()) {
      return true;
    }
    return this.keycloakReachable() === false;
  });

  readonly keycloakHandoffPending = computed(() => {
    if (!this.authService.canUseKeycloakPkce(JOSANZ_TENANT_SLUG)) {
      return false;
    }
    if (this.keycloakRedirectAborted()) {
      return false;
    }
    const reachable = this.keycloakReachable();
    if (reachable === false) {
      return false;
    }
    return reachable === null || this.pkceRedirectLoading();
  });

  readonly showKeycloakRetryButton = computed(
    () =>
      this.keycloakRedirectAborted() &&
      this.keycloakReachable() === true &&
      !this.pkceRedirectLoading(),
  );

  readonly loginForm = this.fb.nonNullable.group({
    email: [
      getPrimaryDevLoginHintForTenant(JOSANZ_TENANT_SLUG)?.email ?? 'admin@josanz.com',
      Validators.required,
    ],
    password: [DEV_TENANT_LOGIN_PASSWORD, Validators.required],
  });

  ngOnInit(): void {
    this.theme.setTheme('luxe-rounded');
    this.pkceRedirectLoading.set(false);
    if (this.isBackForwardNavigation() && consumePkceRedirectAborted()) {
      this.keycloakRedirectAborted.set(true);
    } else {
      clearPkceRedirectPending();
    }

    if (this.authService.canUseKeycloakPkce(JOSANZ_TENANT_SLUG)) {
      this.authService.isKeycloakAvailable().subscribe({
        next: (available) => {
          this.keycloakReachable.set(available);
          if (available && !this.keycloakRedirectAborted() && !this.forceLocalLogin()) {
            void this.startKeycloakSso();
          }
        },
        error: () => this.keycloakReachable.set(false),
      });
    } else {
      this.keycloakReachable.set(false);
    }
  }

  private isBackForwardNavigation(): boolean {
    if (typeof performance === 'undefined') {
      return false;
    }
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    return nav?.type === 'back_forward';
  }

  @HostListener('window:pageshow', ['$event'])
  onPageShow(event: PageTransitionEvent): void {
    this.pkceRedirectLoading.set(false);
    if (event.persisted && consumePkceRedirectAborted()) {
      this.keycloakRedirectAborted.set(true);
    }
  }

  async startKeycloakSso(): Promise<void> {
    if (this.pkceRedirectLoading()) {
      return;
    }
    if (this.keycloakReachable() === false) {
      return;
    }
    this.pkceRedirectLoading.set(true);
    this.pkceError.set(null);
    this.keycloakRedirectAborted.set(false);
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
