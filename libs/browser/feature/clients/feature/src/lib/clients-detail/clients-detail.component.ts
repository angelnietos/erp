import {
  Component,
  OnInit,
  signal,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import {
  UiCardComponent,
  UiButtonComponent,
  UiBadgeComponent,
  UiLoaderComponent,
  UiTabsComponent,
  TabItem,
  UiStatCardComponent,
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
    UiCardComponent,
    UiButtonComponent,
    UiBadgeComponent,
    UiLoaderComponent,
    UiTabsComponent,
    UiStatCardComponent,
  ],
  template: `
    <div
      class="detail-page"
      [class.high-perf]="pluginStore.highPerformanceMode()"
    >
      @if (isLoading()) {
        <ui-josanz-loader
          message="Cargando expediente de cliente..."
        ></ui-josanz-loader>
      } @else if (client()) {
        <header
          class="page-header"
          [style.border-bottom-color]="currentTheme().primary + '33'"
        >
          <div class="header-content">
            <button class="back-btn" routerLink="/clients">
              <lucide-icon name="arrow-left" size="16"></lucide-icon>
              Volver al CRM
            </button>
            <h1 class="page-title">
              {{ client()?.name }}
            </h1>
            <nav class="breadcrumb">
              <span class="active" [style.color]="currentTheme().primary"
                >Sector: {{ client()?.sector }}</span
              >
              <span class="sep">/</span>
              <span>ID: {{ client()?.id?.slice(0, 8) }}</span>
            </nav>
          </div>
          <div class="header-actions">
            <ui-josanz-button variant="glass" size="md" icon="mail"
              >Contactar</ui-josanz-button
            >
            <ui-josanz-button variant="primary" size="md" icon="edit"
              >Editar perfil</ui-josanz-button
            >
          </div>
        </header>

        <div class="stats-row">
          <ui-josanz-stat-card
            label="Inversión Total"
            value="12.450 €"
            icon="line-chart"
            [accent]="true"
          >
          </ui-josanz-stat-card>
          <ui-josanz-stat-card
            label="Proyectos Activos"
            value="3"
            icon="briefcase"
            [trend]="1"
          >
          </ui-josanz-stat-card>
          <ui-josanz-stat-card label="Rating Fidelidad" value="9.8" icon="star">
          </ui-josanz-stat-card>
        </div>

        <ui-josanz-tabs
          [tabs]="tabs()"
          [activeTab]="activeTab()"
          variant="underline"
          (tabChange)="onTabChange($event)"
        ></ui-josanz-tabs>

        <div class="main-content">
          @switch (activeTab()) {
            @case ('general') {
              <div class="detail-grid">
                <ui-josanz-card variant="glass" title="Información Corporativa">
                  <div class="info-list">
                    <div class="info-item">
                      <span class="label">Razón social</span>
                      <span class="value">{{ client()?.name }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Descripción</span>
                      <span class="value text-muted">{{
                        client()?.description || 'Sin descripción corporativa.'
                      }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Sector</span>
                      <ui-josanz-badge variant="info">{{
                        client()?.sector
                      }}</ui-josanz-badge>
                    </div>
                    <div class="info-item">
                      <span class="label">Alta en sistema</span>
                      <span class="value">{{
                        formatDate(client()?.createdAt)
                      }}</span>
                    </div>
                  </div>
                </ui-josanz-card>

                <ui-josanz-card variant="glass" title="Puntos de Contacto">
                  <div class="info-list">
                    @for (contact of client()?.contacts; track contact.id) {
                      <div class="info-item">
                        <span class="label"
                          >{{ contact.isPrimary ? 'Principal / ' : ''
                          }}{{ contact.position }}</span
                        >
                        <span class="value">{{ contact.name }}</span>
                      </div>
                      @if (contact.email) {
                        <div class="info-item">
                          <span class="label">Email</span>
                          <span class="value text-brand-link">{{
                            contact.email
                          }}</span>
                        </div>
                      }
                      @if (contact.phone) {
                        <div class="info-item">
                          <span class="label">Teléfono</span>
                          <span class="value">{{ contact.phone }}</span>
                        </div>
                      }
                    } @empty {
                      <div class="empty-state">
                        <p>Sin contactos registrados.</p>
                      </div>
                    }
                  </div>
                </ui-josanz-card>
              </div>
            }
            @case ('budgets') {
              <ui-josanz-card variant="glass" title="Presupuestos">
                <div class="document-list">
                  @for (budget of client()?.budgets; track budget.id) {
                    <div class="document-item">
                      <div class="doc-icon">
                        <lucide-icon name="calculator" size="20"></lucide-icon>
                      </div>
                      <div class="doc-info">
                        <span class="doc-title"
                          >Oferta {{ formatCurrency(budget.total) }}</span
                        >
                        <span class="doc-meta"
                          >Periodo: {{ formatDate(budget.startDate) }} —
                          {{ formatDate(budget.endDate) }}</span
                        >
                      </div>
                      <div class="doc-actions">
                        <ui-josanz-badge variant="info">{{
                          budget.status
                        }}</ui-josanz-badge>
                        <ui-josanz-button
                          variant="ghost"
                          size="sm"
                          icon="external-link"
                          routerLink="/budgets/{{ budget.id }}"
                          >Ver</ui-josanz-button
                        >
                      </div>
                    </div>
                  } @empty {
                    <div class="empty-state">
                      <lucide-icon name="file-search" size="48"></lucide-icon>
                      <p>Sin presupuestos registrados.</p>
                    </div>
                  }
                </div>
              </ui-josanz-card>
            }
            @case ('invoices') {
              <ui-josanz-card variant="glass" title="Documentación">
                <div class="document-list">
                  @for (inv of getAllInvoices(); track inv.id) {
                    <div class="document-item">
                      <div class="doc-icon">
                        <lucide-icon name="receipt" size="20"></lucide-icon>
                      </div>
                      <div class="doc-info">
                        <span class="doc-title"
                          >Factura {{ inv.invoiceNumber }}</span
                        >
                        <span class="doc-meta"
                          >Emitida: {{ formatDate(inv.issueDate) }} ·
                          {{ formatCurrency(inv.total) }}</span
                        >
                      </div>
                      <div class="doc-actions">
                        <ui-josanz-badge
                          [variant]="
                            inv.status === 'PAID' ? 'success' : 'warning'
                          "
                          >{{ inv.status }}</ui-josanz-badge
                        >
                        <ui-josanz-button
                          variant="ghost"
                          size="sm"
                          icon="external-link"
                          routerLink="/billing/{{ inv.id }}"
                          >Ver</ui-josanz-button
                        >
                      </div>
                    </div>
                  }

                  @for (dn of getAllDeliveryNotes(); track dn.id) {
                    <div class="document-item">
                      <div class="doc-icon">
                        <lucide-icon name="file-text" size="20"></lucide-icon>
                      </div>
                      <div class="doc-info">
                        <span class="doc-title">Albarán</span>
                        <span class="doc-meta"
                          >Firma: {{ dn.status }} · Alta:
                          {{ formatDate(dn.createdAt) }}</span
                        >
                      </div>
                      <div class="doc-actions">
                        <ui-josanz-badge
                          [variant]="
                            dn.status === 'signed' ? 'success' : 'info'
                          "
                          >{{ dn.status }}</ui-josanz-badge
                        >
                        <ui-josanz-button
                          variant="ghost"
                          size="sm"
                          icon="external-link"
                          routerLink="/delivery/{{ dn.id }}"
                          >Ver</ui-josanz-button
                        >
                      </div>
                    </div>
                  }

                  @if (
                    getAllInvoices().length === 0 &&
                    getAllDeliveryNotes().length === 0
                  ) {
                    <div class="empty-state">
                      <p>No existen facturas ni albaranes vinculados.</p>
                    </div>
                  }
                </div>
              </ui-josanz-card>
            }
            @case ('reports') {
              <ui-josanz-card variant="glass" title="Informes de Evento">
                <div class="document-list">
                  @for (report of client()?.eventReports; track report.id) {
                    <div class="report-item">
                      <div class="report-header">
                        <div class="doc-icon">
                          <lucide-icon
                            name="clipboard-check"
                            size="20"
                          ></lucide-icon>
                        </div>
                        <div class="doc-info">
                          <span class="doc-title">{{ report.title }}</span>
                          <span class="doc-meta"
                            >Fecha: {{ formatDate(report.createdAt) }} · Autor:
                            {{ report.author?.firstName || 'Sistema' }}</span
                          >
                        </div>
                        <ui-josanz-button
                          variant="ghost"
                          size="sm"
                          icon="calendar"
                          routerLink="/events/{{ report.eventId }}"
                          >Ver evento</ui-josanz-button
                        >
                      </div>
                      <div class="report-content">
                        {{ report.content }}
                      </div>
                    </div>
                  } @empty {
                    <div class="empty-state">
                      <lucide-icon name="clipboard-x" size="48"></lucide-icon>
                      <p>Aún no hay informes de eventos asociados.</p>
                    </div>
                  }
                </div>
              </ui-josanz-card>
            }
            @case ('commercial') {
              <ui-josanz-card variant="glass" title="Historial Comercial">
                <div class="commercial-history">
                  @for (rental of client()?.rentals; track rental.id) {
                    <div class="history-item">
                      <div class="history-header">
                        <span class="project-title"
                          >Expediente
                          {{
                            rental.reference || rental.id.substring(0, 8)
                          }}</span
                        >
                        <div class="history-actions">
                          <ui-josanz-badge
                            [variant]="
                              rental.status === 'COMPLETED'
                                ? 'success'
                                : rental.status === 'ACTIVE'
                                  ? 'info'
                                  : 'warning'
                            "
                          >
                            {{ rental.status }}
                          </ui-josanz-badge>
                          <ui-josanz-button
                            variant="ghost"
                            size="sm"
                            icon="external-link"
                            routerLink="/rentals/{{ rental.id }}"
                            >Ver</ui-josanz-button
                          >
                        </div>
                      </div>
                      <div class="history-details">
                        <span class="detail"
                          >Período: {{ formatDate(rental.startDate) }} —
                          {{ formatDate(rental.endDate) }}</span
                        >
                        <span class="detail"
                          >Valor:
                          {{ formatCurrency(rental.totalPrice || 0) }}</span
                        >
                        <span class="detail"
                          >Equipos:
                          {{ rental.rentalItems?.length || 0 }} elementos</span
                        >
                      </div>
                    </div>
                  } @empty {
                    <div class="empty-state">
                      <p>Aún no existen proyectos ni alquileres registrados.</p>
                    </div>
                  }
                </div>
              </ui-josanz-card>
            }
            @default {
              <ui-josanz-card variant="glass" title="Cargando...">
                <div class="empty-state">
                  <lucide-icon name="activity" size="48"></lucide-icon>
                  <p>Cargando módulo...</p>
                </div>
              </ui-josanz-card>
            }
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .detail-page {
        padding: 1.5rem;
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .back-btn {
        background: none;
        border: none;
        color: var(--text-muted);
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.8rem;
        font-weight: 500;
        cursor: pointer;
        padding: 0;
        margin-bottom: 0.75rem;
        transition: color 0.2s;
      }
      .back-btn:hover {
        color: #fff;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        padding-bottom: 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .header-content {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .page-title {
        font-size: 1.75rem;
        font-weight: 700;
        color: #fff;
        margin: 0;
      }

      .breadcrumb {
        display: flex;
        gap: 8px;
        font-size: 0.8rem;
        color: var(--text-muted);
      }

      .breadcrumb .sep {
        opacity: 0.5;
      }

      .breadcrumb .active {
        font-weight: 600;
      }

      .stats-row {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .detail-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
      }

      .info-list {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        padding: 0.5rem 0;
      }
      .info-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        padding-bottom: 0.75rem;
      }
      .info-item:last-child {
        border-bottom: none;
      }
      .info-item .label {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-muted);
        letter-spacing: 0.03em;
      }
      .info-item .value {
        font-size: 0.9rem;
        font-weight: 500;
        color: #fff;
      }
      .text-brand-link {
        color: var(--brand) !important;
        text-decoration: underline;
        cursor: pointer;
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 150px;
        gap: 1rem;
        text-align: center;
        color: var(--text-muted);
        font-size: 0.85rem;
      }

      .document-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .document-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.02);
      }
      .doc-icon {
        width: 40px;
        height: 40px;
        background: var(--brand-surface);
        border: 1px solid var(--brand-border);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--brand);
        flex-shrink: 0;
      }
      .doc-info {
        flex: 1;
      }
      .doc-title {
        display: block;
        font-weight: 600;
        color: #fff;
        font-size: 0.9rem;
      }
      .doc-meta {
        display: block;
        font-size: 0.8rem;
        color: var(--text-muted);
        margin-top: 2px;
      }
      .doc-actions {
        display: flex;
        gap: 0.75rem;
        align-items: center;
      }

      .report-item {
        padding: 1rem;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.02);
      }
      .report-header {
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      .report-content {
        padding-left: 52px;
        font-size: 0.85rem;
        color: var(--text-muted);
        line-height: 1.6;
        margin-top: 0.75rem;
      }

      .commercial-history {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .history-item {
        padding: 1rem;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.02);
      }
      .history-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
      }
      .project-title {
        font-weight: 600;
        color: #fff;
        font-size: 0.95rem;
      }
      .history-actions {
        display: flex;
        gap: 0.75rem;
        align-items: center;
      }
      .history-details {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding-left: 0.5rem;
      }
      .detail {
        font-size: 0.8rem;
        color: var(--text-secondary);
      }

      @media (max-width: 768px) {
        .stats-row {
          grid-template-columns: 1fr;
        }
        .detail-grid {
          grid-template-columns: 1fr;
        }
        .page-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
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
  private readonly clientService = inject(ClientService);

  currentTheme = this.themeService.currentThemeData;
  client = signal<Client | null>(null);
  isLoading = signal(true);
  activeTab = signal('general');
  tabs = signal<TabItem[]>([]);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadClient(id);
    }
  }

  loadClient(id: string) {
    this.isLoading.set(true);
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
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
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
