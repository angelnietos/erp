import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AuthStore,
  DEFAULT_LOGIN_TENANT_SLUG,
  ERP_TENANT_SLUG_SESSION_KEY,
  syncErpTenantHtmlTheme,
} from '@josanz-erp/identity-data-access';
import { ThemeService } from '@josanz-erp/shared-data-access';
import { UiInputComponent, UiButtonComponent, UiAlertComponent, DynamicCanvasComponent, UIAIChatComponent } from '@josanz-erp/shared-ui-kit';
import { LucideAngularModule, User, Lock, ArrowRight, Sparkles, Palette, Zap, Waves, Cpu, Volume2, Grid, Aperture, Search, Moon } from 'lucide-angular';
import { AIBotStore } from '@josanz-erp/shared-data-access';
import { AnimatedBackgroundComponent, BackgroundTheme } from '../animated-background/animated-background.component';

interface BackgroundThemeOption {
  id: BackgroundTheme;
  name: string;
  icon: typeof Palette | typeof Zap | typeof Sparkles | typeof Waves | typeof Cpu | typeof Volume2 | typeof Grid | typeof Aperture | typeof Search | typeof Moon;
  color: string;
}

@Component({
  selector: 'lib-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  private readonly aiBotStore = inject(AIBotStore);
  // Get dynamically generated HTML for the 'login' feature
  readonly dynamicHtml = computed(() => this.aiBotStore.dynamicCanvas()?.['login'] || '');

  readonly icons = { User, Lock, ArrowRight, Sparkles, Palette, Zap, Waves, Cpu, Volume2, Grid, Aperture, Search, Moon };
  
  readonly backgroundTheme = signal<BackgroundTheme>('josanz-classic');
  
  /** Slug resuelto desde `?tenant=` o pantalla previa (`sessionStorage`). */
  readonly tenantSlug = signal<string>(DEFAULT_LOGIN_TENANT_SLUG);

  readonly tenantLabel = computed(() => {
    const slug = this.tenantSlug();
    const known: Record<string, string> = {
      josanz: 'Josanz Audiovisuales',
      babooni: 'Babooni Technologies',
    };
    return known[slug] ?? slug;
  });

  readonly themes: BackgroundThemeOption[] = [
    { id: 'josanz-classic', name: 'Josanz Classic', icon: Palette, color: '#dc2626' },
    { id: 'cyber-neon', name: 'Cyber Neon', icon: Zap, color: '#06b6d4' },
    { id: 'golden-vintage', name: 'Golden Vintage', icon: Sparkles, color: '#f59e0b' },
    { id: 'deep-abyss', name: 'Deep Abyss', icon: Waves, color: '#1e3a8a' },
    { id: 'digital-matrix', name: 'Digital Matrix', icon: Cpu, color: '#10b981' },
    { id: 'audio-rhythm', name: 'Audio Rhythm', icon: Volume2, color: '#8b5cf6' },
    { id: 'grid-sketch', name: 'Grid Sketch', icon: Grid, color: '#3b82f6' },
    { id: 'bokeh-blur', name: 'Bokeh Blur', icon: Aperture, color: '#f43f5e' },
    { id: 'spot-scan', name: 'Spot Scan', icon: Search, color: '#facc15' },
    { id: 'nebula-cosmos', name: 'Nebula Cosmos', icon: Moon, color: '#6366f1' }
  ];

  setBackgroundTheme(theme: BackgroundTheme) {
    this.backgroundTheme.set(theme);
  }

  ngOnInit(): void {
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
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(ERP_TENANT_SLUG_SESSION_KEY, slug);
    }
    syncErpTenantHtmlTheme();
    this.theme.reapplyTheme();
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
