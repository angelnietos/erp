import {
  Component,
  OnInit,
  signal,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import {
  UiLoaderComponent,
  UiButtonComponent,
  UiBadgeComponent,
} from '@josanz-erp/shared-ui-kit';
import { ThemeService, PluginStore } from '@josanz-erp/shared-data-access';

import { ClientService, Client } from '@josanz-erp/clients-data-access';

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
  ],
  template: `
    <div class="ns-detail">
      @if (isLoading()) {
        <div class="ns-loading">
          <ui-loader message="Cargando..."></ui-loader>
        </div>
      } @else if (loadError()) {
        <div class="ns-error">
          <lucide-icon name="alert-circle" size="48" class="ns-error-icon"></lucide-icon>
          <p>{{ loadError() }}</p>
          <div class="ns-error-actions">
            <ui-button variant="solid" size="sm" (clicked)="reload()">Reintentar</ui-button>
            <ui-button variant="ghost" size="sm" routerLink="/clients">Volver</ui-button>
          </div>
        </div>
      } @else if (client()) {
        <div class="ns-header-bar">
          <button class="ns-back" routerLink="/clients">
            <lucide-icon name="arrow-left" size="18"></lucide-icon>
          </button>
          <div class="ns-header-info">
            <h1 class="ns-header-title">{{ client()?.name }}</h1>
            <p class="ns-header-meta">
              {{ client()?.sector || 'General' }} ·
              {{ client()?.id?.slice(0, 8) }}
            </p>
          </div>
          <div class="ns-header-actions">
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
                    <span class="ns-info-value">{{
                      client()?.email || '—'
                    }}</span>
                  </div>
                  <div class="ns-info-row">
                    <span class="ns-info-label">Teléfono</span>
                    <span class="ns-info-value">{{
                      client()?.phone || '—'
                    }}</span>
                  </div>
                </div>
              </div>
            }
            @case ('budgets') {
              <div class="ns-list">
                @for (budget of client()?.budgets; track budget.id) {
                  <a [routerLink]="['/budgets', budget.id]" class="ns-doc-card">
                    <div class="ns-doc-icon ns-blue">
                      <lucide-icon name="calculator" size="20"></lucide-icon>
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
                  <div class="ns-empty">
                    <lucide-icon name="file-x" size="40"></lucide-icon>
                    <p>Sin presupuestos</p>
                  </div>
                }
              </div>
            }
            @case ('invoices') {
              <div class="ns-list">
                @for (inv of getAllInvoices(); track inv.id) {
                  <a [routerLink]="['/billing', inv.id]" class="ns-doc-card">
                    <div class="ns-doc-icon ns-green">
                      <lucide-icon name="receipt" size="20"></lucide-icon>
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
                } @empty {
                  <div class="ns-empty">
                    <lucide-icon name="file-x" size="40"></lucide-icon>
                    <p>Sin facturas</p>
                  </div>
                }
                @for (dn of getAllDeliveryNotes(); track dn.id) {
                  <a [routerLink]="['/delivery', dn.id]" class="ns-doc-card">
                    <div class="ns-doc-icon ns-orange">
                      <lucide-icon name="file-text" size="20"></lucide-icon>
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
              </div>
            }
            @case ('reports') {
              <div class="ns-list">
                @for (report of client()?.eventReports; track report.id) {
                  <a
                    [routerLink]="['/events', report.eventId]"
                    class="ns-doc-card"
                    style="flex-direction: column; align-items: flex-start;"
                  >
                    <div
                      style="display: flex; align-items: center; gap: 0.875rem; width: 100%;"
                    >
                      <div class="ns-doc-icon ns-blue">
                        <lucide-icon
                          name="clipboard-check"
                          size="20"
                        ></lucide-icon>
                      </div>
                      <div class="ns-doc-info">
                        <span class="ns-doc-title">{{ report.title }}</span>
                        <span class="ns-doc-meta"
                          >{{ formatDate(report.createdAt) }} ·
                          {{ report.author?.firstName || 'Sistema' }}</span
                        >
                      </div>
                    </div>
                    <p
                      style="margin: 0.5rem 0 0 2.5rem; color: var(--text-muted); font-size: 0.85rem;"
                    >
                      {{ report.content }}
                    </p>
                  </a>
                } @empty {
                  <div class="ns-empty">
                    <lucide-icon name="file-x" size="40"></lucide-icon>
                    <p>Sin informes</p>
                  </div>
                }
              </div>
            }
            @case ('commercial') {
              <div class="ns-list">
                @for (rental of client()?.rentals; track rental.id) {
                  <a [routerLink]="['/rentals', rental.id]" class="ns-doc-card">
                    <div class="ns-doc-icon ns-orange">
                      <lucide-icon name="package" size="20"></lucide-icon>
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
                  <div class="ns-empty">
                    <lucide-icon name="file-x" size="40"></lucide-icon>
                    <p>Sin proyectos</p>
                  </div>
                }
              </div>
            }
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .ns-detail {
        padding: 1.5rem;
        max-width: 800px;
        margin: 0 auto;
      }

      .ns-loading {
        display: flex;
        justify-content: center;
        padding: 3rem;
      }

      .ns-error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem 1.5rem;
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
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .ns-back {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: var(--surface);
        border: 1px solid var(--border-soft);
        color: var(--text-muted);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .ns-back:hover {
        background: var(--border-soft);
        color: var(--text-primary);
      }

      .ns-header-info {
        flex: 1;
      }

      .ns-header-title {
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0;
        color: var(--text-primary);
      }

      .ns-header-meta {
        font-size: 0.85rem;
        color: var(--text-muted);
        margin: 4px 0 0;
      }

      .ns-header-actions {
        display: flex;
        gap: 0.5rem;
      }

      .ns-stats-row {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.75rem;
        margin-bottom: 1.5rem;
      }

      .ns-stat-box {
        padding: 1rem;
        background: var(--surface);
        border-radius: 12px;
        border: 1px solid var(--border-soft);
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .ns-stat-num {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary);
      }

      .ns-stat-lbl {
        font-size: 0.75rem;
        color: var(--text-muted);
      }

      .ns-tabs {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
        overflow-x: auto;
      }

      .ns-tab {
        padding: 0.625rem 1rem;
        border-radius: 8px;
        background: transparent;
        border: none;
        color: var(--text-muted);
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.15s ease;
      }
      .ns-tab:hover {
        background: var(--surface);
      }
      .ns-tab-active {
        background: var(--surface);
        color: var(--text-primary);
      }

      .ns-tab-badge {
        font-size: 0.7rem;
        padding: 2px 6px;
        border-radius: 10px;
        background: var(--border-soft);
      }

      .ns-content {
        margin-top: 1rem;
      }

      .ns-section {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .ns-info-card {
        padding: 1rem;
        background: var(--surface);
        border-radius: 12px;
        border: 1px solid var(--border-soft);
      }

      .ns-info-row {
        display: flex;
        justify-content: space-between;
        padding: 0.75rem 0;
        border-bottom: 1px solid var(--border-soft);
      }
      .ns-info-row:last-child {
        border-bottom: none;
      }

      .ns-info-label {
        font-size: 0.85rem;
        color: var(--text-muted);
      }

      .ns-info-value {
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--text-primary);
      }

      .ns-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .ns-doc-card {
        display: flex;
        align-items: center;
        gap: 0.875rem;
        padding: 0.875rem 1rem;
        background: var(--surface);
        border-radius: 12px;
        border: 1px solid var(--border-soft);
        text-decoration: none;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .ns-doc-card:hover {
        border-color: var(--text-muted);
        transform: translateX(4px);
      }

      .ns-doc-icon {
        width: 38px;
        height: 38px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
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
      .ns-doc-icon.ns-orange {
        background: #f59e0b;
      }

      .ns-doc-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .ns-doc-title {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .ns-doc-meta {
        font-size: 0.8rem;
        color: var(--text-muted);
      }

      .ns-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        color: var(--text-muted);
        gap: 0.75rem;
      }

      @media (max-width: 640px) {
        .ns-stats-row {
          grid-template-columns: 1fr;
        }
        .ns-header-bar {
          flex-wrap: wrap;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientsDetailComponent implements OnInit {
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly clientService = inject(ClientService);

  currentTheme = this.themeService.currentThemeData;
  client = signal<Client | null>(null);
  isLoading = signal(true);
  loadError = signal<string | null>(null);
  activeTab = signal('general');
  tabs = signal<{ id: string; label: string; badge?: number }[]>([]);

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

  getAllInvoices() {
    const invoices: any[] = [];
    const c = this.client();
    if (c?.budgets) {
      c.budgets.forEach((b: any) => {
        if (b.invoices) {
          invoices.push(...b.invoices);
        }
      });
    }
    return invoices;
  }

  getAllDeliveryNotes() {
    const notes: any[] = [];
    const c = this.client();
    if (c?.budgets) {
      c.budgets.forEach((b: any) => {
        if (b.deliveryNotes) {
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
}
