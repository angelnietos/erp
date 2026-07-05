import {
  Component,
  OnInit,
  signal,
  inject,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import {
  UiLoaderComponent,
  UiButtonComponent,
  UiBadgeComponent,
  UiFeaturePageShellComponent,
  PiiMaskPipe,
} from '@josanz-erp/shared-ui-kit';
import { ThemeService, PluginStore, GlobalAuthStore, PrivacyApiService, ToastService, downloadPrivacyJsonExport } from '@josanz-erp/shared-data-access';

import {
  Budget,
  ClientService,
  Client,
  DeliveryNote,
  Invoice,
} from '@josanz-erp/clients-data-access';

@Component({
  selector: 'lib-clients-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    UiLoaderComponent,
    UiButtonComponent,
    UiBadgeComponent,
    UiFeaturePageShellComponent,
    PiiMaskPipe,
  ],
  template: `
    <ui-feature-page-shell [variant]="'widthOnly'" [fadeIn]="true">
    <div class="ns-detail">
      @if (isLoading()) {
        <div class="ns-loading">
          <ui-loader message="Cargando..."></ui-loader>
        </div>
      } @else if (loadError()) {
        <div class="ns-error">
          <lucide-icon name="alert-circle" size="48" class="ns-error-icon" aria-hidden="true"></lucide-icon>
          <p>{{ loadError() }}</p>
          <div class="ns-error-actions">
            <ui-button variant="solid" size="sm" (clicked)="reload()">Reintentar</ui-button>
            <ui-button variant="ghost" size="sm" routerLink="/clients">Volver</ui-button>
          </div>
        </div>
      } @else if (client()) {
        <div class="ns-header-bar">
          <button class="ns-back" routerLink="/clients">
            <lucide-icon name="arrow-left" size="18" aria-hidden="true"></lucide-icon>
          </button>
          <div class="ns-header-info">
            <h1 class="ns-header-title">{{ client()?.name }}</h1>
            <p class="ns-header-meta">
              {{ client()?.sector || 'General' }} ·
              {{ client()?.id?.slice(0, 8) }}
            </p>
          </div>
          <div class="ns-header-actions">
            @if (!canViewUnmaskedPii()) {
              <ui-badge variant="info" class="ns-pii-badge">
                <lucide-icon name="shield-check" size="12" aria-hidden="true"></lucide-icon>
                Datos protegidos
              </ui-badge>
            }
            @if (canExportPrivacy()) {
              <ui-button
                variant="outline"
                size="sm"
                icon="download"
                [loading]="exportingPrivacy()"
                (clicked)="exportClientRgpd()"
              >
                Export RGPD
              </ui-button>
              <ui-button
                variant="ghost"
                size="sm"
                color="danger"
                icon="user-x"
                [loading]="requestingErasure()"
                (clicked)="requestClientErasure()"
              >
                Solicitar borrado DPO
              </ui-button>
            }
            <ui-button variant="solid" size="sm" icon="pencil" (click)="onEdit()">Editar</ui-button>
          </div>
        </div>

        <div class="ns-stats-row">
          <div class="ns-stat-box">
            <span class="ns-stat-num">12.450</span>
            <span class="ns-stat-lbl">Inversión €</span>
          </div>
          <div class="ns-stat-box ns-stat-blue">
            <span class="ns-stat-num">3</span>
            <span class="ns-stat-lbl">Proyectos</span>
          </div>
          <div class="ns-stat-box ns-stat-green">
            <span class="ns-stat-num">9.8</span>
            <span class="ns-stat-lbl">Rating</span>
          </div>
        </div>

        <div class="ns-tabs">
          @for (tab of tabs(); track tab.id) {
            <button
              class="ns-tab"
              [class.ns-tab-active]="activeTab() === tab.id"
              (click)="onTabChange(tab.id)"
            >
              {{ tab.label }}
              @if (tab.badge) {
                <span class="ns-tab-badge">{{ tab.badge }}</span>
              }
            </button>
          }
        </div>

        <div class="ns-content">
          @switch (activeTab()) {
            @case ('general') {
              <div class="ns-section">
                <div class="ns-info-card">
                  <div class="ns-info-row">
                    <span class="ns-info-label">Nombre</span>
                    <span class="ns-info-value">{{ client()?.name }}</span>
                  </div>
                  <div class="ns-info-row">
                    <span class="ns-info-label">Sector</span>
                    <ui-badge variant="info">{{ client()?.sector }}</ui-badge>
                  </div>
                  <div class="ns-info-row">
                    <span class="ns-info-label">Email</span>
                    <span class="ns-info-value">
                      @if (canViewUnmaskedPii()) {
                        {{ client()?.email || '—' }}
                      } @else {
                        {{ (client()?.email | piiMask: 'email') || '—' }}
                      }
                    </span>
                  </div>
                  <div class="ns-info-row">
                    <span class="ns-info-label">Teléfono</span>
                    <span class="ns-info-value">
                      @if (canViewUnmaskedPii()) {
                        {{ client()?.phone || '—' }}
                      } @else {
                        {{ (client()?.phone | piiMask: 'phone') || '—' }}
                      }
                    </span>
                  </div>
                </div>
              </div>
            }
            @case ('budgets') {
              <div class="ns-list">
                @for (budget of client()?.budgets; track budget.id) {
                  <a [routerLink]="['/budgets', budget.id]" class="ns-doc-card">
                    <div class="ns-doc-icon ns-blue">
                      <lucide-icon name="calculator" size="20" aria-hidden="true"></lucide-icon>
                    </div>
                    <div class="ns-doc-info">
                      <span class="ns-doc-title"
                        >Oferta {{ formatCurrency(budget.total) }}</span
                      >
                      <span class="ns-doc-meta"
                        >{{ formatDate(budget.startDate) }} —
                        {{ formatDate(budget.endDate) }}</span
                      >
                    </div>
                    <ui-badge variant="info">{{ budget.status }}</ui-badge>
                  </a>
                } @empty {
                  <div class="ns-empty-state">
                    <div class="ns-empty-state__icon-wrap" aria-hidden="true">
                      <lucide-icon name="calculator" size="28" aria-hidden="true"></lucide-icon>
                    </div>
                    <h3 class="ns-empty-state__title">Aún no hay presupuestos</h3>
                    <p class="ns-empty-state__hint">
                      Los presupuestos que crees para este cliente aparecerán aquí con su
                      estado y fechas.
                    </p>
                  </div>
                }
              </div>
            }
            @case ('invoices') {
              <div class="ns-list ns-list--documental">
                @if (
                  getAllInvoices().length === 0 && getAllDeliveryNotes().length === 0
                ) {
                  <div class="ns-empty-state">
                    <div class="ns-empty-state__icon-wrap" aria-hidden="true">
                      <lucide-icon name="archive" size="28" aria-hidden="true"></lucide-icon>
                    </div>
                    <h3 class="ns-empty-state__title">Sin documentación fiscal</h3>
                    <p class="ns-empty-state__hint">
                      Cuando generes facturas o albaranes desde los presupuestos de este
                      cliente, los verás listados aquí.
                    </p>
                  </div>
                } @else {
                  @if (getAllInvoices().length === 0) {
                    <div
                      class="ns-empty-state ns-empty-state--inline"
                      role="status"
                    >
                      <div
                        class="ns-empty-state__icon-wrap ns-empty-state__icon-wrap--sm"
                        aria-hidden="true"
                      >
                        <lucide-icon name="receipt" size="20" aria-hidden="true"></lucide-icon>
                      </div>
                      <div class="ns-empty-state__text">
                        <span class="ns-empty-state__title-inline"
                          >No hay facturas todavía</span
                        >
                        <span class="ns-empty-state__hint-inline"
                          >Se mostrarán al emitirse desde un presupuesto.</span
                        >
                      </div>
                    </div>
                  }
                  @for (inv of getAllInvoices(); track inv.id) {
                  <a [routerLink]="['/billing', inv.id]" class="ns-doc-card">
                    <div class="ns-doc-icon ns-green">
                      <lucide-icon name="receipt" size="20" aria-hidden="true"></lucide-icon>
                    </div>
                    <div class="ns-doc-info">
                      <span class="ns-doc-title"
                        >Factura {{ inv.invoiceNumber }}</span
                      >
                      <span class="ns-doc-meta">{{
                        formatCurrency(inv.total)
                      }}</span>
                    </div>
                    <ui-badge
                      [variant]="inv.status === 'PAID' ? 'success' : 'warning'"
                      >{{ inv.status }}</ui-badge
                    >
                  </a>
                  }
                @for (dn of getAllDeliveryNotes(); track dn.id) {
                  <a [routerLink]="['/delivery', dn.id]" class="ns-doc-card">
                    <div class="ns-doc-icon ns-orange">
                      <lucide-icon name="file-text" size="20" aria-hidden="true"></lucide-icon>
                    </div>
                    <div class="ns-doc-info">
                      <span class="ns-doc-title">Albarán</span>
                      <span class="ns-doc-meta"
                        >{{ dn.status }} · {{ formatDate(dn.createdAt) }}</span
                      >
                    </div>
                    <ui-badge
                      [variant]="dn.status === 'signed' ? 'success' : 'info'"
                      >{{ dn.status }}</ui-badge
                    >
                  </a>
                }
                }
              </div>
            }
            @case ('reports') {
              <div class="ns-list">
                @for (report of client()?.eventReports; track report.id) {
                  <a
                    [routerLink]="['/events', report.eventId]"
                    class="ns-doc-card ns-doc-card--vertical"
                  >
                    <div class="ns-doc-icon ns-blue">
                      <lucide-icon
                        name="clipboard-check"
                        size="20"
                        aria-hidden="true"
                      ></lucide-icon>
                    </div>
                    <div class="ns-doc-info">
                      <span class="ns-doc-title">{{ report.title }}</span>
                      <span class="ns-doc-meta"
                        >{{ formatDate(report.createdAt) }} ·
                        {{ report.author?.firstName || 'Sistema' }}</span
                      >
                    </div>
                    <span class="ns-report-snippet">{{ report.content }}</span>
                  </a>
                } @empty {
                  <div class="ns-empty-state">
                    <div class="ns-empty-state__icon-wrap" aria-hidden="true">
                      <lucide-icon name="file-text" size="28" aria-hidden="true"></lucide-icon>
                    </div>
                    <h3 class="ns-empty-state__title">Sin informes de evento</h3>
                    <p class="ns-empty-state__hint">
                      Los informes redactados tras los eventos de este cliente se listarán
                      aquí con fecha y autor.
                    </p>
                  </div>
                }
              </div>
            }
            @case ('commercial') {
              <div class="ns-list">
                @for (rental of client()?.rentals; track rental.id) {
                  <a [routerLink]="['/rentals', rental.id]" class="ns-doc-card">
                    <div class="ns-doc-icon ns-orange">
                      <lucide-icon name="package" size="20" aria-hidden="true"></lucide-icon>
                    </div>
                    <div class="ns-doc-info">
                      <span class="ns-doc-title">{{
                        rental.reference || rental.id.slice(0, 8)
                      }}</span>
                      <span class="ns-doc-meta"
                        >{{ formatDate(rental.startDate) }} ·
                        {{ formatCurrency(rental.totalPrice || 0) }}</span
                      >
                    </div>
                    <ui-badge
                      [variant]="
                        rental.status === 'COMPLETED' ? 'success' : 'info'
                      "
                      >{{ rental.status }}</ui-badge
                    >
                  </a>
                } @empty {
                  <div class="ns-empty-state">
                    <div class="ns-empty-state__icon-wrap" aria-hidden="true">
                      <lucide-icon name="truck" size="28" aria-hidden="true"></lucide-icon>
                    </div>
                    <h3 class="ns-empty-state__title">Sin movimientos de alquiler</h3>
                    <p class="ns-empty-state__hint">
                      Los alquileres y expedientes comerciales vinculados a este cliente
                      aparecerán en esta vista.
                    </p>
                  </div>
                }
              </div>
            }
          }
        </div>
      }
    </div>
    </ui-feature-page-shell>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      
       .ns-detail {
         padding: 1.25rem 1.25rem 2rem;
         max-width: 980px;
         margin: 0 auto;
         width: 100%;
         box-sizing: border-box;
       }

       .ns-loading {
         display: flex;
         justify-content: center;
         padding: 3rem 1rem;
       }

       .ns-error {
         display: flex;
         flex-direction: column;
         align-items: center;
         justify-content: center;
         padding: 2.5rem 1.5rem;
         text-align: center;
         gap: 0.75rem;
       }
       .ns-error-icon {
         color: var(--error);
         opacity: 0.9;
       }
       .ns-error p {
         margin: 0;
         color: var(--text-muted);
         max-width: 28ch;
       }
       .ns-error-actions {
         display: flex;
         flex-wrap: wrap;
         gap: 0.5rem;
         justify-content: center;
         margin-top: 0.5rem;
       }

       .ns-header-bar {
         display: flex;
         align-items: center;
         gap: 0.875rem;
         margin-bottom: 1.25rem;
         padding: 0.25rem 0 1rem;
         border-bottom: 1px solid var(--border-soft);
       }

       .ns-back {
         width: 36px;
         height: 36px;
         border-radius: 10px;
         background: var(--surface);
         border: 1px solid var(--border-soft);
         color: var(--text-muted);
         display: flex;
         align-items: center;
         justify-content: center;
         cursor: pointer;
         transition: all 0.15s ease;
         flex-shrink: 0;
       }
       .ns-back:hover {
         background: var(--border-soft);
         color: var(--text-primary);
         transform: translateX(-1px);
       }

       .ns-header-info {
         flex: 1;
         min-width: 0;
       }

       .ns-header-title {
         font-size: 1.15rem;
         font-weight: 800;
         margin: 0;
         color: var(--text-primary);
         letter-spacing: -0.01em;
         white-space: nowrap;
         overflow: hidden;
         text-overflow: ellipsis;
       }

       .ns-header-meta {
         font-size: 0.78rem;
         color: var(--text-muted);
         margin: 2px 0 0;
         font-weight: 500;
         letter-spacing: 0.01em;
       }

       .ns-header-actions {
         display: flex;
         gap: 0.5rem;
         align-items: center;
         flex-shrink: 0;
       }

       .ns-stats-row {
         display: grid;
         grid-template-columns: repeat(3, 1fr);
         gap: 0.75rem;
         margin-bottom: 1.25rem;
       }

       .ns-stat-box {
         padding: 0.875rem 1rem;
         background: var(--surface);
         border-radius: 12px;
         border: 1px solid var(--border-soft);
         display: flex;
         flex-direction: column;
         gap: 2px;
         transition: box-shadow 0.15s ease;
       }
       .ns-stat-box:hover {
         box-shadow: 0 6px 18px -8px rgba(0, 0, 0, 0.08);
       }

       .ns-stat-num {
         font-size: 1.25rem;
         font-weight: 800;
         color: var(--text-primary);
         letter-spacing: -0.01em;
       }

       .ns-stat-lbl {
         font-size: 0.68rem;
         color: var(--text-muted);
         text-transform: uppercase;
         letter-spacing: 0.06em;
         font-weight: 700;
       }

       .ns-tabs {
         display: flex;
         gap: 0.25rem;
         margin-bottom: 1rem;
         border-bottom: 1px solid var(--border-soft);
         padding-bottom: 0.25rem;
         overflow-x: auto;
         scrollbar-width: thin;
       }

       .ns-tab {
         padding: 0.6rem 0.95rem;
         border-radius: 9px;
         background: transparent;
         border: none;
         color: var(--text-muted);
         font-size: 0.85rem;
         font-weight: 600;
         cursor: pointer;
         display: inline-flex;
         align-items: center;
         gap: 0.5rem;
         transition: all 0.15s ease;
         position: relative;
         white-space: nowrap;
       }
       .ns-tab:hover {
         background: color-mix(in srgb, var(--brand) 6%, var(--surface));
         color: var(--text-primary);
       }
       .ns-tab-active {
         background: color-mix(in srgb, var(--brand) 8%, var(--surface));
         color: var(--text-primary);
         font-weight: 700;
       }
       .ns-tab-active::after {
         content: '';
         position: absolute;
         bottom: -4px;
         left: 12px;
         right: 12px;
         height: 2px;
         background: var(--brand);
         border-radius: 999px;
       }

       .ns-tab-badge {
         font-size: 0.65rem;
         padding: 2px 7px;
         border-radius: 999px;
         background: var(--border-soft);
         color: var(--text-muted);
         font-weight: 700;
         letter-spacing: 0.02em;
         min-width: 20px;
         text-align: center;
       }
       .ns-tab-active .ns-tab-badge {
         background: color-mix(in srgb, var(--brand) 14%, var(--surface));
         color: var(--brand);
       }

       .ns-content {
         margin-top: 0.25rem;
       }

       .ns-section {
         display: flex;
         flex-direction: column;
         gap: 0.75rem;
       }

       .ns-info-card {
         padding: 0.875rem 1rem;
         background: var(--surface);
         border-radius: 12px;
         border: 1px solid var(--border-soft);
       }

       .ns-info-row {
         display: flex;
         justify-content: space-between;
         align-items: center;
         padding: 0.7rem 0;
         border-bottom: 1px solid var(--border-soft);
         gap: 1rem;
       }
       .ns-info-row:last-child {
         border-bottom: none;
       }

       .ns-info-label {
         font-size: 0.8rem;
         color: var(--text-muted);
         font-weight: 500;
       }

       .ns-info-value {
         font-size: 0.875rem;
         font-weight: 600;
         color: var(--text-primary);
         text-align: right;
         word-break: break-word;
       }

       .ns-list {
         display: flex;
         flex-direction: column;
         gap: 0.5rem;
       }

       .ns-list--documental {
         gap: 0.625rem;
       }

       .ns-empty-state {
         display: flex;
         flex-direction: column;
         align-items: center;
         text-align: center;
         padding: 2rem 1.5rem 2.25rem;
         margin: 0.25rem 0 0.5rem;
         border-radius: 16px;
         border: 1px dashed color-mix(in srgb, var(--text-muted) 22%, var(--border-soft));
         background: color-mix(in srgb, var(--bg-tertiary) 50%, var(--bg-secondary));
       }

       .ns-empty-state__icon-wrap {
         display: flex;
         align-items: center;
         justify-content: center;
         width: 56px;
         height: 56px;
         margin-bottom: 0.875rem;
         border-radius: 16px;
         background: color-mix(in srgb, var(--brand) 12%, var(--bg-secondary));
         color: color-mix(in srgb, var(--brand) 88%, var(--text-primary));
         box-shadow: 0 6px 18px -10px color-mix(in srgb, var(--brand) 32%, transparent);
       }

       .ns-empty-state__icon-wrap--sm {
         width: 40px;
         height: 40px;
         margin-bottom: 0;
         border-radius: 10px;
         flex-shrink: 0;
       }

       .ns-empty-state__title {
         margin: 0;
         font-size: 1rem;
         font-weight: 800;
         letter-spacing: -0.01em;
         color: var(--text-primary);
         max-width: 24rem;
       }

       .ns-empty-state__hint {
         margin: 0.5rem 0 0;
         font-size: 0.84rem;
         line-height: 1.5;
         font-weight: 500;
         color: var(--text-muted);
         max-width: 26ch;
       }

       .ns-empty-state--inline {
         flex-direction: row;
         align-items: center;
         text-align: left;
         padding: 0.875rem 1rem;
         margin: 0 0 0.35rem;
       }

       .ns-empty-state--inline .ns-empty-state__text {
         display: flex;
         flex-direction: column;
         gap: 0.2rem;
         min-width: 0;
       }

       .ns-empty-state__title-inline {
         font-size: 0.875rem;
         font-weight: 700;
         color: var(--text-primary);
       }

       .ns-empty-state__hint-inline {
         font-size: 0.78rem;
         line-height: 1.4;
         font-weight: 500;
         color: var(--text-muted);
       }

       .ns-doc-card {
         display: flex;
         align-items: center;
         gap: 0.75rem;
         padding: 0.75rem 0.875rem;
         background: var(--surface);
         border-radius: 11px;
         border: 1px solid var(--border-soft);
         text-decoration: none;
         cursor: pointer;
         transition: all 0.15s ease;
       }
       .ns-doc-card:hover {
         border-color: var(--text-muted);
         transform: translateX(2px);
         box-shadow: 0 4px 12px -8px rgba(0, 0, 0, 0.15);
       }
       .ns-doc-card--vertical {
         flex-direction: column;
         align-items: stretch;
       }
       .ns-doc-card--vertical .ns-doc-info {
         width: 100%;
       }

       .ns-report-snippet {
         margin: 0.5rem 0 0;
         color: var(--text-muted);
         font-size: 0.82rem;
         line-height: 1.45;
         display: -webkit-box;
         -webkit-line-clamp: 3;
         -webkit-box-orient: vertical;
         overflow: hidden;
       }

       .ns-doc-icon {
         width: 34px;
         height: 34px;
         border-radius: 9px;
         display: flex;
         align-items: center;
         justify-content: center;
         color: #fff;
         flex-shrink: 0;
       }
       .ns-doc-icon.ns-blue {
         background: #3b82f6;
       }
       .ns-doc-icon.ns-green {
         background: #10b981;
       }
       .ns-doc-icon.ns-orange {
         background: #f59e0b;
       }

       .ns-doc-card ui-button {
         opacity: 0.7;
         transition: opacity 0.15s;
       }
       .ns-doc-card ui-button:hover {
         opacity: 1;
       }

       .ns-doc-info {
         flex: 1;
         display: flex;
         flex-direction: column;
         gap: 2px;
         min-width: 0;
       }

       .ns-doc-title {
         font-size: 0.875rem;
         font-weight: 700;
         color: var(--text-primary);
         white-space: nowrap;
         overflow: hidden;
         text-overflow: ellipsis;
       }

       .ns-doc-meta {
         font-size: 0.78rem;
         color: var(--text-muted);
         white-space: nowrap;
         overflow: hidden;
         text-overflow: ellipsis;
       }

       @media (max-width: 640px) {
         .ns-detail {
           padding: 1.25rem 1rem 2.25rem;
         }
         .ns-empty-state {
           padding: 1.75rem 1.25rem 2rem;
         }
         .ns-empty-state--inline {
           flex-direction: column;
           text-align: center;
           align-items: center;
         }
         .ns-empty-state--inline .ns-empty-state__text {
           align-items: center;
         }
         .ns-stats-row {
           grid-template-columns: 1fr;
         }
         .ns-header-bar {
          flex-wrap: wrap;
        }
        .ns-header-actions {
          width: 100%;
          justify-content: flex-end;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientsDetailComponent implements OnInit {
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);
  private readonly auth = inject(GlobalAuthStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly clientService = inject(ClientService);
  private readonly privacyApi = inject(PrivacyApiService);
  private readonly toast = inject(ToastService);

  currentTheme = this.themeService.currentThemeData;
  client = signal<Client | null>(null);
  isLoading = signal(true);
  loadError = signal<string | null>(null);
  activeTab = signal('general');
  tabs = signal<{ id: string; label: string; badge?: number }[]>([]);
  exportingPrivacy = signal(false);
  requestingErasure = signal(false);

  readonly canViewUnmaskedPii = computed(() => {
    const perms = this.auth.permissions();
    return perms.includes('*') || perms.includes('pii.view_unmasked');
  });

  readonly canExportPrivacy = computed(() => {
    const perms = this.auth.permissions();
    return (
      perms.includes('*') ||
      perms.includes('privacy.manage') ||
      perms.includes('privacy.export')
    );
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadClient(id);
    } else {
      this.loadError.set('Cliente no especificado');
      this.isLoading.set(false);
    }
  }

  reload(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadClient(id);
    }
  }

  onEdit() {
    const id = this.client()?.id;
    if (id) this.router.navigate(['/clients', id, 'edit']);
  }

  loadClient(id: string) {
    this.isLoading.set(true);
    this.loadError.set(null);
    this.clientService.getClient(id).subscribe({
      next: (c) => {
        if (c) {
          this.client.set(c);

          let invoiceCount = 0;
          let deliveryNoteCount = 0;
          c.budgets?.forEach((b) => {
            if (b.invoices) invoiceCount += b.invoices.length;
            if (b.deliveryNotes) deliveryNoteCount += b.deliveryNotes.length;
          });

          this.tabs.set([
            { id: 'general', label: 'Estrategia' },
            {
              id: 'budgets',
              label: 'Presupuestos',
              badge: c.budgets?.length || 0,
            },
            {
              id: 'invoices',
              label: 'Documental',
              badge: invoiceCount + deliveryNoteCount,
            },
            {
              id: 'reports',
              label: 'Informes de Evento',
              badge: c.eventReports?.length || 0,
            },
            {
              id: 'commercial',
              label: 'Historial Comercial',
              badge: c.rentals?.length || 0,
            },
          ]);
        } else {
          this.loadError.set('No se encontró el cliente.');
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.loadError.set('No se pudo cargar el cliente.');
        this.isLoading.set(false);
      },
    });
  }

  getAllInvoices(): Invoice[] {
    const invoices: Invoice[] = [];
    const c = this.client();
    if (c?.budgets) {
      c.budgets.forEach((b: Budget) => {
        if (b.invoices?.length) {
          invoices.push(...b.invoices);
        }
      });
    }
    return invoices;
  }

  getAllDeliveryNotes(): DeliveryNote[] {
    const notes: DeliveryNote[] = [];
    const c = this.client();
    if (c?.budgets) {
      c.budgets.forEach((b: Budget) => {
        if (b.deliveryNotes?.length) {
          notes.push(...b.deliveryNotes);
        }
      });
    }
    return notes;
  }

  onTabChange(tabId: string) {
    this.activeTab.set(tabId);
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES');
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  }

  exportClientRgpd(): void {
    const id = this.client()?.id;
    if (!id) return;
    this.exportingPrivacy.set(true);
    this.privacyApi.exportClientAdmin(id).subscribe({
      next: (data) => {
        downloadPrivacyJsonExport(data, `cliente-rgpd-${id.slice(0, 8)}`);
        this.exportingPrivacy.set(false);
        this.toast.show('Export RGPD del cliente completada', 'success');
      },
      error: () => {
        this.exportingPrivacy.set(false);
        this.toast.show('No se pudo exportar datos del cliente', 'error');
      },
    });
  }

  requestClientErasure(): void {
    const id = this.client()?.id;
    if (!id) return;
    this.requestingErasure.set(true);
    this.privacyApi
      .createRequest({
        type: 'CLIENT_ERASURE',
        subjectType: 'CLIENT',
        subjectId: id,
        userMessage: `Borrado cliente ${this.client()?.name ?? id} desde detalle CRM`,
      })
      .subscribe({
        next: () => {
          this.requestingErasure.set(false);
          this.toast.show('Solicitud enviada a la cola DPO', 'success');
        },
        error: () => {
          this.requestingErasure.set(false);
          this.toast.show('No se pudo crear la solicitud DPO', 'error');
        },
      });
  }
}
