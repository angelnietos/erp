import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
  OnInit,
  isDevMode,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  AuthStore,
  AuthService,
  DEFAULT_LOGIN_TENANT_SLUG,
  ERP_TENANT_SLUG_SESSION_KEY,
  setErpTenantSlug,
  syncErpTenantHtmlTheme,
  syncErpRoutePhaseFromPath,
  usesJosanzFigmaLogin,
  usesDocumentGeneratorLogin,
  getPrimaryDevLoginHintForTenant,
  getDevLoginHintsForTenant,
  getDevLoginEmailPlaceholder,
} from '@josanz-erp/identity-data-access';
import {
  getTenantKeycloakConfig,
  tenantUsesKeycloakLogin,
  isExternalErpAppSlug,
} from '@josanz-erp/identity-api';
import { consumePkceRedirectAborted, clearPkceRedirectPending } from '@josanz-erp/shared-auth-keycloak';
import { ThemeService } from '@josanz-erp/shared-data-access';
import { UiInputComponent, UiButtonComponent, UiAlertComponent, DynamicCanvasComponent, UIAIChatComponent } from '@josanz-erp/shared-ui-kit';
import {
  LucideAngularModule,
  User,
  Lock,
  ArrowRight,
  Sparkles,
  Palette,
  Zap,
  Waves,
  Cpu,
  Volume2,
  Grid,
  Aperture,
  Search,
  Moon,
  Banana,
  LayoutGrid,
  Landmark,
  LeafyGreen,
  MemoryStick,
  ChevronDown,
  ChevronUp,
  Code2,
  FileText,
  FilePlus,
  PenLine,
} from 'lucide-angular';
import { AIBotStore } from '@josanz-erp/shared-data-access';
import { AnimatedBackgroundComponent, BackgroundTheme } from '../animated-background/animated-background.component';
import { resolveLoginAtmosphere } from './login-tenant-atmosphere';

interface BackgroundThemeOption {
  id: BackgroundTheme;
  name: string;
  icon:
    | typeof Palette
    | typeof Zap
    | typeof Sparkles
    | typeof Waves
    | typeof Cpu
    | typeof Volume2
    | typeof Grid
    | typeof Aperture
    | typeof Search
    | typeof Moon
    | typeof Banana
    | typeof LayoutGrid
    | typeof Landmark
    | typeof LeafyGreen
    | typeof MemoryStick;
  color: string;
}

@Component({
  selector: 'lib-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    LucideAngularModule,
    UiInputComponent,
    UiButtonComponent,
    UiAlertComponent,
    AnimatedBackgroundComponent,
    DynamicCanvasComponent,
    UIAIChatComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly store = inject(AuthStore);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly theme = inject(ThemeService);

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  private readonly aiBotStore = inject(AIBotStore);
  // Get dynamically generated HTML for the 'login' feature
  readonly dynamicHtml = computed(() => this.aiBotStore.dynamicCanvas()?.['login'] || '');

  readonly icons = {
    User,
    Lock,
    ArrowRight,
    Sparkles,
    Palette,
    Zap,
    Waves,
    Cpu,
    Volume2,
    Grid,
    Aperture,
    Search,
    Moon,
    Banana,
    LayoutGrid,
    Landmark,
    LeafyGreen,
    MemoryStick,
    ChevronDown,
    ChevronUp,
    Code2,
    FileText,
    FilePlus,
    PenLine,
  };

  readonly backgroundTheme = signal<BackgroundTheme>('josanz-classic');

  /** Babooni: selector de fondo colapsado por defecto para no recortar el modal. */
  readonly showThemePicker = signal(false);
  readonly showAllThemes = signal(false);
  readonly isBabooniTenant = computed(() => this.tenantSlug() === 'babooni');
  /** Slug resuelto desde `?tenant=` o pantalla previa (`sessionStorage`). */
  readonly tenantSlug = signal<string>(DEFAULT_LOGIN_TENANT_SLUG);

  /** Estado previo al login: Keycloak alcanzable para el tenant actual. */
  readonly keycloakReachablePreview = signal<boolean | null>(null);
  readonly tenantUsesKeycloak = computed(() => tenantUsesKeycloakLogin(this.tenantSlug()));

  readonly showKeycloakSso = computed(
    () =>
      this.tenantUsesKeycloak() &&
      this.authService.canUseKeycloakPkce(this.tenantSlug()) &&
      this.keycloakReachablePreview() !== false,
  );

  /** Usuario volvió atrás desde Keycloak: mostrar botón manual, no auto-redirect. */
  readonly keycloakRedirectAborted = signal(false);

  /** Comprobando KC o redirigiendo (sin formulario intermedio). */
  readonly keycloakHandoffPending = computed(() => {
    if (!this.tenantUsesKeycloak() || !this.authService.canUseKeycloakPkce(this.tenantSlug())) {
      return false;
    }
    if (this.keycloakRedirectAborted()) {
      return false;
    }
    const reachable = this.keycloakReachablePreview();
    if (reachable === false) {
      return false;
    }
    return reachable === null || this.pkceRedirectLoading();
  });

  readonly forceLocalLogin = signal(false);

  /** Formulario email/password: tenant sin KC, KC caído o usuario volvió atrás desde KC. */
  readonly showLocalLoginForm = computed(() => {
    if (this.forceLocalLogin()) {
      return true;
    }
    if (!this.tenantUsesKeycloak() || !this.authService.canUseKeycloakPkce(this.tenantSlug())) {
      return true;
    }
    if (this.keycloakRedirectAborted()) {
      return true;
    }
    return this.keycloakReachablePreview() === false;
  });

  /** Login claro en dos columnas según Figma node `61:1312` (hero `61:1313`). */
  readonly useFigmaShellLogin = computed(() => usesJosanzFigmaLogin(this.tenantSlug()));

  /** Login oscuro document-generator (tenant docs). */
  readonly useDocsShellLogin = computed(() =>
    usesDocumentGeneratorLogin(this.tenantSlug()),
  );

  /** Generic ERP (tenant josanz, shell clásico — no Figma ni docs). */
  readonly isGenericErpTenant = computed(
    () =>
      this.tenantSlug() === 'josanz' &&
      !this.useFigmaShellLogin() &&
      !this.useDocsShellLogin(),
  );

  readonly useSolidLoginFields = computed(
    () => this.useFigmaShellLogin() || this.useDocsShellLogin(),
  );

  readonly loginHeading = computed(() => {
    if (this.useFigmaShellLogin()) {
      return 'Iniciar sesión';
    }
    if (this.useDocsShellLogin()) {
      return 'Acceso documentos';
    }
    if (this.isGenericErpTenant()) {
      return this.tenantLabel();
    }
    return 'Acceso ERP';
  });

  readonly loginSubmitLabel = computed(() =>
    this.useFigmaShellLogin() ? 'Iniciar sesión' : 'Acceder',
  );

  readonly loginEmailLabel = computed(() =>
    this.useFigmaShellLogin() ? '' : 'E-mail',
  );

  readonly loginPasswordLabel = computed(() =>
    this.useFigmaShellLogin() ? '' : 'Contraseña',
  );

  readonly loginSubtitle = computed(() => {
    if (this.useDocsShellLogin()) {
      return 'Editor IA · plantillas · PDF';
    }
    return this.brandTagline();
  });

  readonly isDev = isDevMode();
  readonly devLoginHint = computed(() =>
    getPrimaryDevLoginHintForTenant(this.tenantSlug()),
  );
  readonly devLoginAlternates = computed(() =>
    getDevLoginHintsForTenant(this.tenantSlug()).filter((h) => !h.primary),
  );
  readonly emailPlaceholder = computed(() =>
    this.useFigmaShellLogin()
      ? 'Usuarioejemplo_01'
      : getDevLoginEmailPlaceholder(this.tenantSlug()),
  );

  readonly tenantLabel = computed(() => {
    const slug = this.tenantSlug();
    const known: Record<string, string> = {
      josanz: 'Generic ERP',
      babooni: 'Babooni Technologies',
      alexis: 'Alexis',
      docs: 'Generador de Documentos',
      verifactu: 'Verifactu',
      platform: 'Panel SaaS',
    };
    return known[slug] ?? slug;
  });

  /** Apps del hub (:4230, :4210, :4300) vs tenants ERP. */
  readonly isAppLogin = computed(() => isExternalErpAppSlug(this.tenantSlug()));

  readonly hubSwitchLabel = computed(() =>
    this.isAppLogin() ? 'Ir al hub' : 'Cambiar organización',
  );

  readonly contextKindLabel = computed(() =>
    this.isAppLogin() ? 'App' : 'Organización',
  );

  readonly contextIcon = computed(() =>
    this.isAppLogin() ? 'layout-grid' : 'building-2',
  );

  readonly loginAtmosphere = computed(() => resolveLoginAtmosphere(this.tenantSlug()));

  readonly loginMoodLine = computed(() => this.loginAtmosphere().moodLine);

  /** Subtítulo de la tarjeta: badge por atmósfera del tenant. */
  readonly brandTagline = computed(() => this.loginAtmosphere().heroBadge);

  readonly authModeLabel = computed(() => {
    if (this.store.loading()) {
      return 'Verificando credenciales…';
    }
    if (this.store.authMode() === 'keycloak') {
      return 'Keycloak SSO activo';
    }
    if (this.store.authMode() === 'local') {
      return this.store.keycloakAvailable() === false
        ? 'Acceso local: Keycloak no disponible'
        : 'Acceso local de respaldo';
    }
    if (this.keycloakRedirectAborted()) {
      return 'Acceso local (volviste desde Keycloak)';
    }
    if (this.tenantUsesKeycloak()) {
      const reachable = this.keycloakReachablePreview();
      if (reachable === false) {
        return 'Keycloak no responde · fallback local';
      }
      if (reachable === true) {
        return 'Inicia sesión con Keycloak';
      }
      return 'Comprobando Keycloak…';
    }
    return 'Acceso local (tenant demo)';
  });

  readonly authModeTone = computed(() => {
    if (this.store.authMode() === 'keycloak') {
      return 'keycloak';
    }
    if (this.store.authMode() === 'local') {
      return 'local';
    }
    if (this.tenantUsesKeycloak()) {
      return this.keycloakReachablePreview() === false ? 'local' : 'neutral';
    }
    return 'local';
  });

  /** Fondos temáticos estilo videojuego (Babooni). */
  private readonly babooniOnlyThemes: BackgroundThemeOption[] = [
    { id: 'babooni-platform', name: 'Plataforma 2D', icon: LayoutGrid, color: '#2d7a3e' },
    { id: 'babooni-arcade', name: 'Modo arcade', icon: MemoryStick, color: '#16a34a' },
    { id: 'babooni-ruins', name: 'Ruinas', icon: Landmark, color: '#854d0e' },
    { id: 'babooni-mist', name: 'Niebla', icon: LeafyGreen, color: '#64748b' },
    { id: 'babooni', name: 'Selva clásica', icon: Banana, color: '#1e6b3a' },
  ];

  private readonly josanzThemeList: BackgroundThemeOption[] = [
    { id: 'josanz-classic', name: 'Generic Classic', icon: Palette, color: '#dc2626' },
    { id: 'cyber-neon', name: 'Cyber Neon', icon: Zap, color: '#06b6d4' },
    { id: 'golden-vintage', name: 'Golden Vintage', icon: Sparkles, color: '#f59e0b' },
    { id: 'deep-abyss', name: 'Deep Abyss', icon: Waves, color: '#1e3a8a' },
    { id: 'digital-matrix', name: 'Digital Matrix', icon: Cpu, color: '#10b981' },
    { id: 'audio-rhythm', name: 'Audio Rhythm', icon: Volume2, color: '#8b5cf6' },
    { id: 'grid-sketch', name: 'Grid Sketch', icon: Grid, color: '#3b82f6' },
    { id: 'bokeh-blur', name: 'Bokeh Blur', icon: Aperture, color: '#f43f5e' },
    { id: 'spot-scan', name: 'Spot Scan', icon: Search, color: '#facc15' },
    { id: 'nebula-cosmos', name: 'Nebula Cosmos', icon: Moon, color: '#6366f1' },
  ];

  /** Fondo Babooni primero si el org es babooni; en Josanz, la selva al final. */
  readonly backgroundThemes = computed<BackgroundThemeOption[]>(() => {
    if (this.tenantSlug() === 'babooni') {
      return [...this.babooniOnlyThemes, ...this.josanzThemeList];
    }
    return [...this.josanzThemeList, ...this.babooniOnlyThemes];
  });

  readonly visibleBackgroundThemes = computed<BackgroundThemeOption[]>(() => {
    if (this.isBabooniTenant() && !this.showAllThemes()) {
      return this.babooniOnlyThemes;
    }
    return this.backgroundThemes();
  });

  toggleThemePicker(): void {
    this.showThemePicker.update((v) => !v);
  }

  setBackgroundTheme(theme: BackgroundTheme) {
    this.backgroundTheme.set(theme);
  }

  readonly sessionExpiredNotice = signal<string | null>(null);
  readonly postAuthReason = signal<'logout' | 'expired' | null>(null);
  readonly pkceRedirectLoading = signal(false);
  readonly pkceError = signal<string | null>(null);

  ngOnInit(): void {
    this.pkceRedirectLoading.set(false);
    if (this.isBackForwardNavigation() && consumePkceRedirectAborted()) {
      this.keycloakRedirectAborted.set(true);
    } else {
      clearPkceRedirectPending();
    }

    const forceLocal = this.route.snapshot.queryParamMap.get('local') === '1';
    if (forceLocal) {
      this.forceLocalLogin.set(true);
      this.keycloakRedirectAborted.set(true);
    }

    const reason = this.route.snapshot.queryParamMap.get('reason');
    if (reason === 'expired') {
      this.sessionExpiredNotice.set(
        'Tu sesión ha caducado o el servidor se reinició. Vuelve a iniciar sesión.',
      );
      this.postAuthReason.set('expired');
    } else if (reason === 'logout') {
      this.sessionExpiredNotice.set('Has cerrado sesión correctamente.');
      this.postAuthReason.set('logout');
    }

    const fromQuery = this.route.snapshot.queryParamMap.get('tenant');
    const fromStore =
      typeof sessionStorage !== 'undefined'
        ? sessionStorage.getItem(ERP_TENANT_SLUG_SESSION_KEY)
        : null;
    const raw = (fromQuery || fromStore || '').trim().toLowerCase();
    const slug = raw.replace(/[^a-z0-9-]/g, '');
    if (!slug) {
      void this.router.navigate(['/auth/tenant'], { replaceUrl: true });
      return;
    }
    this.tenantSlug.set(slug);
    this.backgroundTheme.set(resolveLoginAtmosphere(slug).defaultTheme);
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(ERP_TENANT_SLUG_SESSION_KEY, slug);
    }
    setErpTenantSlug(slug);
    syncErpRoutePhaseFromPath(this.router.url || '/auth/login');
    /* No aplicar ThemeService en login Figma: pisa --surface-vibrant y rompe campos blancos. */
    if (!usesJosanzFigmaLogin(slug)) {
      this.theme.reapplyTheme();
    }
    if (forceLocal) {
      this.keycloakReachablePreview.set(false);
      this.prefillDevCredentialsIfLocal();
      return;
    }
    this.probeKeycloakAvailability(slug);
    this.prefillDevCredentialsIfLocal();
  }

  /** Autocompletar credenciales demo en formulario local (dev). */
  private prefillDevCredentialsIfLocal(): void {
    if (!this.isDev || !this.showLocalLoginForm()) {
      return;
    }
    this.fillDevCredentials();
  }

  private isBackForwardNavigation(): boolean {
    if (typeof performance === 'undefined') {
      return false;
    }
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    return nav?.type === 'back_forward';
  }

  private probeKeycloakAvailability(slug: string): void {
    if (!tenantUsesKeycloakLogin(slug)) {
      this.keycloakReachablePreview.set(null);
      return;
    }
    const cfg = getTenantKeycloakConfig(slug);
    if (!cfg) {
      this.keycloakReachablePreview.set(null);
      return;
    }

    this.authService.isKeycloakAvailable(cfg.realm).subscribe({
      next: (available) => {
        this.keycloakReachablePreview.set(available);
        if (!available) {
          this.prefillDevCredentialsIfLocal();
        }
        if (available && !this.keycloakRedirectAborted() && !this.forceLocalLogin()) {
          void this.startKeycloakSso();
        }
      },
      error: () => {
        this.keycloakReachablePreview.set(false);
        this.prefillDevCredentialsIfLocal();
      },
    });
  }

  @HostListener('window:pageshow', ['$event'])
  onPageShow(event: PageTransitionEvent): void {
    this.pkceRedirectLoading.set(false);
    if (event.persisted && consumePkceRedirectAborted()) {
      this.keycloakRedirectAborted.set(true);
    }
  }

  goChangeTenant(): void {
    this.pkceRedirectLoading.set(false);
    this.postAuthReason.set(null);
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(ERP_TENANT_SLUG_SESSION_KEY);
    }
    syncErpTenantHtmlTheme();
    this.theme.reapplyTheme();
    void this.router.navigate(['/auth/tenant']);
  }

  /**
   * Duración del mensaje dinámico (p. ej. saludo de Buddy) en el canvas del login.
   * Al expirar, `ui-dynamic-canvas` emite y se limpia el store para no dejar HTML colgado.
   */
  readonly loginBuddyCanvasTtlMs = 12_000;

  onLoginCanvasAutoCleared(): void {
    this.aiBotStore.clearLoginDynamicOverlay();
  }

  fillDevCredentials(email?: string, password?: string): void {
    const hint = this.devLoginHint();
    if (!hint && !email) {
      return;
    }
    this.loginForm.patchValue({
      email: email ?? hint!.email,
      password: password ?? hint!.password,
    });
  }

  async startKeycloakSso(): Promise<void> {
    if (!this.showKeycloakSso() && !this.keycloakRedirectAborted()) {
      return;
    }
    if (this.pkceRedirectLoading()) {
      return;
    }
    this.pkceRedirectLoading.set(true);
    this.pkceError.set(null);
    this.keycloakRedirectAborted.set(false);
    try {
      await this.authService.startKeycloakPkceRedirect(this.tenantSlug());
    } catch (err) {
      this.pkceRedirectLoading.set(false);
      this.pkceError.set(
        err instanceof Error ? err.message : 'No se pudo redirigir a Keycloak.',
      );
    }
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.getRawValue();
      this.store.login({
        email,
        password,
        tenantSlug: this.tenantSlug(),
      });
    }
  }
}
