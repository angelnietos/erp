import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  inject,
  OnInit,
  signal,
  isDevMode,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import {
  ERP_TENANT_SLUG_SESSION_KEY,
  setErpTenantSlug,
  DEV_TENANT_LOGIN_HINTS,
  DEV_TENANT_LOGIN_PASSWORD,
  AuthService,
} from '@josanz-erp/identity-data-access';
import {
  ERP_EXTERNAL_APP_CATALOG,
  getTenantKeycloakConfig,
  isExternalErpAppSlug,
  resolveExternalAppLaunchUrl,
  tenantUsesKeycloakLogin,
} from '@josanz-erp/identity-api';
import { clearPkceRedirectPending } from '@josanz-erp/shared-auth-keycloak';
import { ThemeService } from '@josanz-erp/shared-data-access';
import { AnimatedBackgroundComponent } from '../animated-background/animated-background.component';
import type { BackgroundTheme } from '../animated-background/animated-background.component';
import { resolveHubAtmosphere } from '../login/login-tenant-atmosphere';

export interface TenantChoice {
  slug: string;
  name: string;
  description: string;
}

@Component({
  selector: 'lib-tenant-select',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, AnimatedBackgroundComponent],
  templateUrl: './tenant-select.component.html',
  styleUrl: './tenant-select.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TenantSelectComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly theme = inject(ThemeService);
  private readonly authService = inject(AuthService);

  readonly handoffInProgress = signal(false);

  ngOnInit(): void {
    this.resetHandoffState();
  }

  @HostListener('window:pageshow')
  onPageShow(): void {
    this.resetHandoffState();
  }

  private resetHandoffState(): void {
    this.handoffInProgress.set(false);
    clearPkceRedirectPending();
  }

  /** Organizaciones ERP (mismo shell :4200, distinto tenant). */
  readonly erpTenants: TenantChoice[] = [
    {
      slug: 'josanz',
      name: 'Josanz Audiovisuales',
      description: 'ERP con diseño Figma (josanz-ui).',
    },
    {
      slug: 'babooni',
      name: 'Babooni Technologies',
      description: 'Organización SaaS / plataforma (shell Biosstel).',
    },
    {
      slug: 'alexis',
      name: 'Alexis',
      description: 'Shell Figma + Keycloak (tema josanz-figma en IdP).',
    },
    {
      slug: 'docs',
      name: 'Generador de Documentos',
      description: 'App de documentos IA integrada en el ERP.',
    },
  ];

  /** Apps independientes enlazadas desde el hub (p. ej. panel SaaS :4300). */
  readonly externalApps = ERP_EXTERNAL_APP_CATALOG;

  readonly customSlug = signal('');
  readonly selectedSlug = signal<string | null>(null);

  readonly isDev = isDevMode();
  readonly devLoginHints = DEV_TENANT_LOGIN_HINTS;
  readonly devLoginPassword = DEV_TENANT_LOGIN_PASSWORD;

  readonly activeSlug = computed(
    () =>
      this.selectedSlug()?.trim().toLowerCase() ||
      this.customSlug().trim().toLowerCase().replace(/[^a-z0-9-]/g, '') ||
      '',
  );

  readonly isExternalSelection = computed(() => isExternalErpAppSlug(this.activeSlug()));

  readonly continueLabel = computed(() => {
    if (this.handoffInProgress()) {
      return this.isExternalSelection() ? 'Abriendo aplicación…' : 'Redirigiendo a Keycloak…';
    }
    return this.isExternalSelection() ? 'Abrir aplicación' : 'Continuar al acceso';
  });

  readonly backgroundTheme = computed<BackgroundTheme>(() =>
    resolveHubAtmosphere(this.selectedSlug()).defaultTheme,
  );

  readonly hubMoodLine = computed(() => resolveHubAtmosphere(this.selectedSlug()).moodLine);

  selectTenant(slug: string): void {
    const s = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!s) return;
    this.selectedSlug.set(s);
    this.customSlug.set('');
  }

  continueWithSelected(): void {
    const slug =
      this.selectedSlug()?.trim().toLowerCase() ||
      this.customSlug().trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!slug || this.handoffInProgress()) return;

    if (isExternalErpAppSlug(slug)) {
      const launchUrl = resolveExternalAppLaunchUrl(slug);
      if (!launchUrl) {
        return;
      }
      this.handoffInProgress.set(true);
      window.location.assign(launchUrl);
      return;
    }

    sessionStorage.setItem(ERP_TENANT_SLUG_SESSION_KEY, slug);
    setErpTenantSlug(slug);
    this.theme.reapplyTheme();

    if (tenantUsesKeycloakLogin(slug) && this.authService.canUseKeycloakPkce(slug)) {
      const cfg = getTenantKeycloakConfig(slug);
      if (!cfg) {
        void this.router.navigate(['/auth/login'], { queryParams: { tenant: slug, local: '1' } });
        return;
      }
      this.handoffInProgress.set(true);
      this.authService.isKeycloakAvailable(cfg.realm).subscribe({
        next: (available) => {
          if (available) {
            void this.authService.startKeycloakPkceRedirect(slug).catch(() => {
              this.handoffInProgress.set(false);
              void this.router.navigate(['/auth/login'], {
                queryParams: { tenant: slug, local: '1' },
              });
            });
            return;
          }
          this.handoffInProgress.set(false);
          void this.router.navigate(['/auth/login'], {
            queryParams: { tenant: slug, local: '1' },
          });
        },
        error: () => {
          this.handoffInProgress.set(false);
          void this.router.navigate(['/auth/login'], {
            queryParams: { tenant: slug, local: '1' },
          });
        },
      });
      return;
    }

    void this.router.navigate(['/auth/login'], {
      queryParams: { tenant: slug },
    });
  }
}
