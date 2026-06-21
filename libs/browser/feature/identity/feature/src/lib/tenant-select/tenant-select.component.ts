import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
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
  syncErpTenantHtmlTheme,
  DEV_TENANT_LOGIN_HINTS,
  DEV_TENANT_LOGIN_PASSWORD,
} from '@josanz-erp/identity-data-access';
import { ThemeService } from '@josanz-erp/shared-data-access';
import { AnimatedBackgroundComponent } from '../animated-background/animated-background.component';
import type { BackgroundTheme } from '../animated-background/animated-background.component';

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
export class TenantSelectComponent {
  private readonly router = inject(Router);
  private readonly theme = inject(ThemeService);

  /** Alineado con seed: `josanz`, `babooni`, `alexis` en `prisma/seed.ts`. */
  readonly tenants: TenantChoice[] = [
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
      description: 'App de documentos IA (apps/document-generator en :4200).',
    },
  ];

  readonly customSlug = signal('');
  readonly selectedSlug = signal<string | null>(null);

  /** Cuentas seed para acceso rápido en desarrollo. */
  readonly isDev = isDevMode();
  readonly devLoginHints = DEV_TENANT_LOGIN_HINTS;
  readonly devLoginPassword = DEV_TENANT_LOGIN_PASSWORD;

  /** Previsualizar selva al elegir babooni en el grid. */
  readonly backgroundTheme = computed<BackgroundTheme>(() =>
    this.selectedSlug() === 'babooni' ? 'babooni' : 'josanz-classic'
  );

  selectTenant(slug: string): void {
    const s = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!s) return;
    this.selectedSlug.set(s);
  }

  continueWithSelected(): void {
    const slug =
      this.selectedSlug()?.trim().toLowerCase() ||
      this.customSlug().trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!slug) return;
    sessionStorage.setItem(ERP_TENANT_SLUG_SESSION_KEY, slug);
    setErpTenantSlug(slug);
    this.theme.reapplyTheme();
    void this.router.navigate(['/auth/login'], {
      queryParams: { tenant: slug },
    });
  }
}
