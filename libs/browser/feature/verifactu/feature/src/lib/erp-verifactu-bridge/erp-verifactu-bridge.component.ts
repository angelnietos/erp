import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import {
  UiButtonComponent,
  UiCardComponent,
  UiFeatureAccessDeniedComponent,
  UiFeatureHeaderComponent,
  UiFeaturePageShellComponent,
  UiStatCardComponent,
} from '@josanz-erp/shared-ui-kit';
import {
  getErpTenantDisplayName,
  getErpTenantSlug,
  resolveTenantSlugFromId,
  getStoredTenantId,
} from '@josanz-erp/identity-data-access';
import { resolveVerifactuPlatformDeepLink } from '@josanz-erp/identity-api';
import { GlobalAuthStore, PluginStore, rbacAllows } from '@josanz-erp/shared-data-access';

@Component({
  selector: 'erp-verifactu-bridge',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    UiButtonComponent,
    UiCardComponent,
    UiFeatureAccessDeniedComponent,
    UiFeatureHeaderComponent,
    UiFeaturePageShellComponent,
    UiStatCardComponent,
  ],
  template: `
    @if (!canAccess()) {
      <ui-feature-access-denied
        message="No tienes permiso para ver VeriFactu."
        permissionHint="verifactu.view"
      />
    } @else {
      <ui-feature-page-shell [variant]="'padMd'" [fadeIn]="true" extraClass="vf-bridge">
        <ui-feature-header
          title="VeriFactu AEAT"
          breadcrumbLead="CUMPLIMIENTO FISCAL"
          breadcrumbTail="PLATAFORMA INTEGRADA"
          subtitle="Envíos, cola y certificados se gestionan en la app Verifactu (tenant {{ tenantLabel() }})."
          icon="file-check"
        >
          <div actions>
            <ui-button variant="glass" icon="history" routerLink="/billing">
              IR A FACTURACIÓN
            </ui-button>
            <ui-button variant="app" icon="external-link" (clicked)="openPlatform()">
              ABRIR PLATAFORMA
            </ui-button>
          </div>
        </ui-feature-header>

        <section class="vf-bridge__stats">
          <ui-stat-card
            label="Organización ERP"
            [value]="tenantLabel()"
            icon="building-2"
            [accent]="true"
          ></ui-stat-card>
          <ui-stat-card
            label="Estado integración"
            value="ACTIVA"
            icon="shield-check"
            [trend]="1"
          ></ui-stat-card>
          <ui-stat-card
            label="API legacy"
            value="DEPRECADA"
            icon="unlink"
          ></ui-stat-card>
        </section>

        <div class="vf-bridge__grid">
          <ui-card variant="glass" title="Plataforma Verifactu">
            <p class="vf-bridge__lead">
              Desde Facturación puedes encolar facturas hacia AEAT. El seguimiento de cola,
              series, historial y certificado digital vive en la plataforma dedicada
              <strong>:4230</strong>, sincronizada con el worker y el CRM fiscal.
            </p>
            <div class="vf-bridge__actions">
              <ui-button variant="app" icon="layout-dashboard" (clicked)="openPath('/verifactu/overview')">
                RESUMEN
              </ui-button>
              <ui-button variant="glass" icon="list-ordered" (clicked)="openPath('/verifactu/queue')">
                COLA AEAT
              </ui-button>
              <ui-button variant="glass" icon="history" (clicked)="openPath('/verifactu/logs')">
                HISTORIAL
              </ui-button>
              <ui-button variant="glass" icon="badge-check" (clicked)="openPath('/verifactu/credentials')">
                CERTIFICADO
              </ui-button>
            </div>
          </ui-card>

          <ui-card variant="glass" title="Flujo desde el ERP">
            <ol class="vf-bridge__steps">
              <li>Emite o selecciona una factura en <a routerLink="/billing">Facturación</a>.</li>
              <li>Pulsa <em>Enviar AEAT</em> para encolarla en el backend ERP.</li>
              <li>Abre la plataforma Verifactu para ver estado, QR y trazabilidad AEAT.</li>
            </ol>
            <div class="vf-bridge__note ui-glass-panel">
              <lucide-icon name="info" size="16" aria-hidden="true"></lucide-icon>
              <span>
                Si ves errores de conexión a <code>localhost:3110</code>, ignóralos: ese servicio
                legacy ya no se usa en desarrollo.
              </span>
            </div>
          </ui-card>
        </div>
      </ui-feature-page-shell>
    }
  `,
  styles: [
    `
      .vf-bridge__stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .vf-bridge__grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.25rem;
      }

      .vf-bridge__lead {
        margin: 0 0 1.25rem;
        color: var(--text-muted);
        line-height: 1.6;
        font-size: 0.9rem;
      }

      .vf-bridge__actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .vf-bridge__steps {
        margin: 0 0 1rem;
        padding-left: 1.25rem;
        color: var(--text-muted);
        line-height: 1.7;
        font-size: 0.85rem;
      }

      .vf-bridge__steps a {
        color: var(--primary);
        text-decoration: none;
      }

      .vf-bridge__note {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        font-size: 0.75rem;
        color: var(--text-muted);
      }

      .vf-bridge__note code {
        font-size: 0.7rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErpVerifactuBridgeComponent {
  private readonly auth = inject(GlobalAuthStore);
  readonly pluginStore = inject(PluginStore);

  readonly canAccess = rbacAllows(this.auth, 'verifactu.view');

  readonly tenantSlug = computed(() => {
    const fromSession = getErpTenantSlug();
    if (fromSession) {
      return fromSession;
    }
    return resolveTenantSlugFromId(getStoredTenantId()) ?? 'demo';
  });

  readonly tenantLabel = computed(() => getErpTenantDisplayName(this.tenantSlug()));

  openPlatform(): void {
    this.openPath('/verifactu/overview');
  }

  openPath(path: string): void {
    const url = resolveVerifactuPlatformDeepLink(this.tenantSlug(), path);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }
}
