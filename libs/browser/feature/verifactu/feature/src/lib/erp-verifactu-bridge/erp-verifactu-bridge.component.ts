import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import {
  UiButtonComponent,
  UiCardComponent,
  UiFeatureAccessDeniedComponent,
  UiFeatureHeaderComponent,
  UiFeaturePageShellComponent,
  UiLoaderComponent,
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
import {
  ErpVerifactuOverview,
  ErpVerifactuService,
} from '@josanz-erp/billing-data-access';
import { catchError, interval, of, startWith, Subscription, switchMap } from 'rxjs';

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
    UiLoaderComponent,
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
          breadcrumbTail="MONITOR TENANT"
          subtitle="Cola y certificados en tiempo real para {{ tenantLabel() }}."
          icon="file-check"
        >
          <div actions>
            <ui-button variant="glass" icon="refresh-cw" (clicked)="refresh()">
              ACTUALIZAR
            </ui-button>
            <ui-button variant="glass" icon="history" routerLink="/billing">
              FACTURACIÓN
            </ui-button>
            <ui-button variant="app" icon="external-link" (clicked)="openPlatform()">
              PLATAFORMA :4230
            </ui-button>
          </div>
        </ui-feature-header>

        @if (loading()) {
          <ui-loader message="Sincronizando cola Verifactu del tenant..."></ui-loader>
        } @else if (loadError()) {
          <div class="vf-bridge__error ui-glass-panel">
            <lucide-icon name="alert-circle" size="20" aria-hidden="true"></lucide-icon>
            <span>{{ loadError() }}</span>
            <ui-button variant="glass" size="sm" (clicked)="refresh()">Reintentar</ui-button>
          </div>
        } @else if (overview(); as o) {
          <section class="vf-bridge__stats">
            <ui-stat-card
              label="Cola pendiente"
              [value]="o.queuePending.toString()"
              icon="clock"
              [accent]="o.queuePending > 0"
            ></ui-stat-card>
            <ui-stat-card
              label="Procesadas OK"
              [value]="o.queueCompleted.toString()"
              icon="check-check"
              [trend]="o.queueCompleted > 0 ? 1 : 0"
            ></ui-stat-card>
            <ui-stat-card
              label="Facturas AEAT"
              [value]="o.invoicesSent.toString()"
              icon="shield-check"
            ></ui-stat-card>
            <ui-stat-card
              label="Errores cola"
              [value]="o.queueFailed.toString()"
              icon="alert-triangle"
              [accent]="o.queueFailed > 0"
            ></ui-stat-card>
          </section>

          <div class="vf-bridge__grid">
            <ui-card variant="glass" title="Estado del servicio">
              <dl class="vf-bridge__dl">
                <div><dt>Operativo</dt><dd>{{ o.serviceOperational ? 'SÍ' : 'NO' }}</dd></div>
                <div><dt>Pendientes AEAT</dt><dd>{{ o.invoicesPending }}</dd></div>
                <div><dt>Con error fiscal</dt><dd>{{ o.invoicesError }}</dd></div>
                <div><dt>Última actividad</dt><dd>{{ formatActivity(o.lastActivityAt) }}</dd></div>
              </dl>
            </ui-card>

            <ui-card variant="glass" title="Accesos rápidos">
              <div class="vf-bridge__actions">
                <ui-button variant="app" icon="layout-dashboard" (clicked)="openPath('/verifactu/overview')">
                  RESUMEN CRM
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
              <p class="vf-bridge__hint">
                Emite facturas en <a routerLink="/billing">Facturación</a> y pulsa
                <em>Enviar AEAT</em>. El worker procesa la cola y genera QR conforme VeriFactu.
              </p>
            </ui-card>
          </div>
        }
      </ui-feature-page-shell>
    }
  `,
  styles: [
    `
      .vf-bridge__stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .vf-bridge__grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.25rem;
      }

      .vf-bridge__actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }

      .vf-bridge__hint {
        margin: 0;
        font-size: 0.8rem;
        color: var(--text-muted);
        line-height: 1.6;
      }

      .vf-bridge__hint a {
        color: var(--primary);
        text-decoration: none;
      }

      .vf-bridge__dl {
        margin: 0;
        display: grid;
        gap: 0.75rem;
      }

      .vf-bridge__dl div {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        font-size: 0.85rem;
      }

      .vf-bridge__dl dt {
        color: var(--text-muted);
        font-weight: 600;
      }

      .vf-bridge__dl dd {
        margin: 0;
        font-weight: 800;
        color: #fff;
      }

      .vf-bridge__error {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem 1.25rem;
        border-radius: 10px;
        color: var(--text-muted);
        font-size: 0.85rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErpVerifactuBridgeComponent implements OnInit, OnDestroy {
  private readonly auth = inject(GlobalAuthStore);
  private readonly verifactu = inject(ErpVerifactuService);
  readonly pluginStore = inject(PluginStore);

  readonly canAccess = rbacAllows(this.auth, 'verifactu.view');

  readonly overview = signal<ErpVerifactuOverview | null>(null);
  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);

  private pollSub?: Subscription;

  readonly tenantSlug = computed(() => {
    const fromSession = getErpTenantSlug();
    if (fromSession) {
      return fromSession;
    }
    return resolveTenantSlugFromId(getStoredTenantId()) ?? 'demo';
  });

  readonly tenantLabel = computed(() => getErpTenantDisplayName(this.tenantSlug()));

  ngOnInit(): void {
    this.pollSub = interval(15_000)
      .pipe(
        startWith(0),
        switchMap(() =>
          this.verifactu.getOverview().pipe(
            catchError(() => of(null)),
          ),
        ),
      )
      .subscribe((data) => {
        if (data) {
          this.overview.set(data);
          this.loadError.set(null);
        } else if (!this.overview()) {
          this.loadError.set(
            'No se pudo cargar la cola Verifactu. Comprueba que el backend ERP (:3000) y el worker estén activos.',
          );
        }
        this.loading.set(false);
      });
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  refresh(): void {
    this.loading.set(true);
    this.verifactu.getOverview().subscribe({
      next: (data) => {
        this.overview.set(data);
        this.loadError.set(null);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set('Error al actualizar estadísticas Verifactu.');
        this.loading.set(false);
      },
    });
  }

  formatActivity(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

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
