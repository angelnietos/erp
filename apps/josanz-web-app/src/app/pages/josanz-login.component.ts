import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
  JOSANZ_FIGMA_TENANT_SLUG,
} from '@josanz-erp/identity-data-access';
import {
  clearPkceRedirectPending,
  consumePkceRedirectAborted,
} from '@josanz-erp/shared-auth-keycloak';

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
  readonly authService = inject(AuthService);
  readonly store = inject(AuthStore);
  private readonly route = inject(ActivatedRoute);
  private readonly theme = inject(JosanzThemeService);

  readonly tenantSlug = JOSANZ_FIGMA_TENANT_SLUG;
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
    if (!this.authService.canUseKeycloakPkce(JOSANZ_FIGMA_TENANT_SLUG)) {
      return true;
    }
    if (this.keycloakRedirectAborted()) {
      return true;
    }
    return this.keycloakReachable() === false;
  });

  readonly keycloakHandoffPending = computed(() => {
    if (!this.authService.canUseKeycloakPkce(JOSANZ_FIGMA_TENANT_SLUG)) {
      return false;
    }
    if (this.keycloakRedirectAborted()) {
      return false;
    }
    if (this.forceLocalLogin()) {
      return false;
    }
    const reachable = this.keycloakReachable();
    if (reachable === false) {
      return false;
    }
    return reachable === null || this.pkceRedirectLoading();
  });

  readonly loginForm = this.fb.nonNullable.group({
    email: [
      getPrimaryDevLoginHintForTenant(JOSANZ_FIGMA_TENANT_SLUG)?.email ??
        'admin@alexis.local',
      Validators.required,
    ],
    password: [DEV_TENANT_LOGIN_PASSWORD, Validators.required],
  });

  ngOnInit(): void {
    this.theme.setTheme('luxe-rounded');
    this.pkceRedirectLoading.set(false);

    if (this.route.snapshot.queryParamMap.get('local') === '1') {
      this.forceLocalLogin.set(true);
      this.keycloakRedirectAborted.set(true);
      this.keycloakReachable.set(false);
      return;
    }

    if (consumePkceRedirectAborted()) {
      this.keycloakRedirectAborted.set(true);
    } else {
      clearPkceRedirectPending();
    }

    if (this.authService.canUseKeycloakPkce(JOSANZ_FIGMA_TENANT_SLUG)) {
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
    const getEntries = performance.getEntriesByType?.bind(performance);
    if (!getEntries) {
      return false;
    }
    const nav = getEntries('navigation')[0] as PerformanceNavigationTiming | undefined;
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
      await this.authService.startKeycloakPkceRedirect(JOSANZ_FIGMA_TENANT_SLUG);
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
      tenantSlug: JOSANZ_FIGMA_TENANT_SLUG,
    });
  }
}
