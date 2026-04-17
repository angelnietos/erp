import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import {
  ERP_TENANT_SLUG_SESSION_KEY,
  syncErpTenantHtmlTheme,
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

  /** Alineado con seed: `josanz`, `babooni` en `prisma/seed.ts`. */
  readonly tenants: TenantChoice[] = [
    {
      slug: 'josanz',
      name: 'Josanz Audiovisuales',
      description: 'Entorno demo principal del ERP.',
    },
    {
      slug: 'babooni',
      name: 'Babooni Technologies',
      description: 'Organización alternativa (plataforma / pruebas).',
    },
  ];

  readonly backgroundTheme = signal<BackgroundTheme>('josanz-classic');
  readonly customSlug = signal('');
  readonly selectedSlug = signal<string | null>(null);

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
    syncErpTenantHtmlTheme();
    this.theme.reapplyTheme();
    void this.router.navigate(['/auth/login'], {
      queryParams: { tenant: slug },
    });
  }
}
