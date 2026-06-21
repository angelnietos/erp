import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
  OnInit,
  isDevMode,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  AuthStore,
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

  /** Login claro en dos columnas según Figma node `61:1312` (hero `61:1313`). */
  readonly useFigmaShellLogin = computed(() => usesJosanzFigmaLogin(this.tenantSlug()));

  /** Login oscuro document-generator (tenant docs). */
  readonly useDocsShellLogin = computed(() =>
    usesDocumentGeneratorLogin(this.tenantSlug()),
  );

  readonly useSolidLoginFields = computed(
    () => this.useFigmaShellLogin() || this.useDocsShellLogin(),
  );

  readonly loginHeading = computed(() => {
    if (this.useFigmaShellLogin()) {
      return 'Iniciar sesión';
    }
    return this.useDocsShellLogin() ? 'Acceso documentos' : 'Acceso ERP';
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
      josanz: 'Josanz Audiovisuales',
      babooni: 'Babooni Technologies',
      alexis: 'Alexis',
      docs: 'Generador de Documentos',
    };
    return known[slug] ?? slug;
  });

  /** Subtítulo de la tarjeta: según tenant, no fijo a Josanz. */
  readonly brandTagline = computed(() => {
    const slug = this.tenantSlug();
    if (slug === 'babooni') return 'Babooni Technologies';
    if (slug === 'alexis') return 'Alexis';
    if (slug === 'docs') return 'Generador de Documentos';
    return 'Josanz Audiovisuales';
  });

  readonly authModeLabel = computed(() => {
    if (this.store.loading()) {
      return 'Verificando Keycloak SSO';
    }
    if (this.store.authMode() === 'keycloak') {
      return 'Keycloak SSO activo';
    }
    if (this.store.authMode() === 'local') {
      return this.store.keycloakAvailable() === false
        ? 'Acceso local: Keycloak no disponible'
        : 'Acceso local de respaldo';
    }
    return 'Keycloak SSO + acceso local';
  });

  readonly authModeTone = computed(() => {
    if (this.store.authMode() === 'keycloak') {
      return 'keycloak';
    }
    if (this.store.authMode() === 'local') {
      return 'local';
    }
    return this.store.keycloakAvailable() === false ? 'local' : 'neutral';
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
    { id: 'josanz-classic', name: 'Josanz Classic', icon: Palette, color: '#dc2626' },
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

  ngOnInit(): void {
    const reason = this.route.snapshot.queryParamMap.get('reason');
    if (reason === 'expired') {
      this.sessionExpiredNotice.set(
        'Tu sesión ha caducado o el servidor se reinició. Vuelve a iniciar sesión.',
      );
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
    if (slug === 'babooni') {
      this.backgroundTheme.set('babooni-platform');
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(ERP_TENANT_SLUG_SESSION_KEY, slug);
    }
    setErpTenantSlug(slug);
    syncErpRoutePhaseFromPath(this.router.url || '/auth/login');
    /* No aplicar ThemeService en login Figma: pisa --surface-vibrant y rompe campos blancos. */
    if (!usesJosanzFigmaLogin(slug)) {
      this.theme.reapplyTheme();
    }
  }

  goChangeTenant(): void {
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

  fillDevCredentials(): void {
    const hint = this.devLoginHint();
    if (!hint) {
      return;
    }
    this.loginForm.patchValue({
      email: hint.email,
      password: hint.password,
    });
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
