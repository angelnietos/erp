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
      class="page-container animate-fade-in"
      [class.high-perf]="pluginStore.highPerformanceMode()"
    >
      @if (isLoading()) {
        <ui-josanz-loader
          message="Sincronizando expediente de cliente..."
        ></ui-josanz-loader>
      } @else if (client()) {
        <header
          class="page-header"
          [style.border-bottom-color]="currentTheme().primary + '33'"
        >
          <div class="header-breadcrumb">
            <button class="back-btn" routerLink="/clients">
              <lucide-icon name="arrow-left" size="14"></lucide-icon>
              VOLVER AL CRM
            </button>
            <h1
              class="page-title text-uppercase glow-text"
              [style.text-shadow]="'0 0 20px ' + currentTheme().primary + '44'"
            >
              {{ client()?.name }}
            </h1>
            <div class="breadcrumb">
              <span class="active" [style.color]="currentTheme().primary"
                >SECTOR: {{ client()?.sector | uppercase }}</span
              >
              <span class="separator">/</span>
              <span>ID: {{ client()?.id?.slice(0, 8) }}</span>
            </div>
          </div>
          <div class="header-actions">
            <ui-josanz-button variant="glass" size="md" icon="mail"
              >CONTACTAR</ui-josanz-button
            >
            <ui-josanz-button variant="primary" size="md" icon="edit"
              >EDITAR PERFIL</ui-josanz-button
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
                      <span class="label">RAZÓN SOCIAL</span>
                      <span class="value">{{ client()?.name }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">DESCRIPCIÓN</span>
                      <span class="value text-muted">{{
                        client()?.description || 'Sin descripción corporativa.'
                      }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">SECTOR ACTUACIÓN</span>
                      <ui-josanz-badge variant="info">{{
                        client()?.sector
                      }}</ui-josanz-badge>
                    </div>
                    <div class="info-item">
                      <span class="label">ALTA SISTEMA</span>
                      <span class="value font-mono">{{
                        formatDate(client()?.createdAt)
                      }}</span>
                    </div>
                  </div>
                </ui-josanz-card>

                <ui-josanz-card variant="glass" title="Puntos de Contacto">
                  <div class="info-list">
                    @for (contact of client()?.contacts; track contact.id) {
                      <div class="info-item">
                        <span class="label">{{ contact.isPrimary ? 'PRINCIPAL / ' : '' }}{{ contact.position | uppercase }}</span>
                        <span class="value">{{ contact.name }}</span>
                      </div>
                      @if (contact.email) {
                        <div class="info-item">
                          <span class="label">EMAIL</span>
                          <span class="value text-brand-link">{{ contact.email }}</span>
                        </div>
                      }
                      @if (contact.phone) {
                        <div class="info-item">
                          <span class="label">TELÉFONO</span>
                          <span class="value">{{ contact.phone }}</span>
                        </div>
                      }
                    }
                    @empty {
                      <div class="info-item text-muted">Módulo de contactos en sincronización o sin datos.</div>
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
                        <span class="doc-title">Oferta {{ formatCurrency(budget.total) }}</span>
                        <span class="doc-meta">Periodo: {{ formatDate(budget.startDate) }} — {{ formatDate(budget.endDate) }}</span>
                      </div>
                      <ui-josanz-badge variant="info">{{ budget.status }}</ui-josanz-badge>
                    </div>
                  } @empty {
                    <div class="placeholder-state">
                      <lucide-icon name="file-search" size="48" class="text-muted"></lucide-icon>
                      <p>Sin presupuestos registrados.</p>
                    </div>
                  }
                </div>
              </ui-josanz-card>
            }
            @case ('invoices') {
              <ui-josanz-card variant="glass" title="Facturación Receptiva">
                <div class="document-list">
                  @for (inv of getAllInvoices(); track inv.id) {
                    <div class="document-item">
                      <div class="doc-icon">
                        <lucide-icon name="receipt" size="20"></lucide-icon>
                      </div>
                      <div class="doc-info">
                        <span class="doc-title">Factura {{ inv.invoiceNumber }}</span>
                        <span class="doc-meta">Emitida: {{ formatDate(inv.issueDate) }} · {{ formatCurrency(inv.total) }}</span>
                      </div>
                      <ui-josanz-badge [variant]="inv.status === 'PAID' ? 'success' : 'warning'">{{ inv.status }}</ui-josanz-badge>
                    </div>
                  } @empty {
                    <div class="placeholder-state">
                      <p>No existen facturas vinculadas al circuito de este cliente.</p>
                    </div>
                  }
                </div>
              </ui-josanz-card>
            }
            @case ('reports') {
              <ui-josanz-card variant="glass" title="Informes de Evento">
                <div class="document-list">
                  @for (report of client()?.eventReports; track report.id) {
                    <div class="document-item" style="align-items: flex-start; flex-direction: column;">
                      <div style="display: flex; gap: 10px; width: 100%;">
                        <div class="doc-icon"><lucide-icon name="clipboard-check" size="20"></lucide-icon></div>
                        <div class="doc-info">
                          <span class="doc-title">{{ report.title }}</span>
                          <span class="doc-meta">Fecha: {{ formatDate(report.createdAt) }} · Autor: {{ report.author?.firstName || 'Sistema' }}</span>
                        </div>
                      </div>
                      <div style="padding-left: 50px; font-size: 0.8rem; color: var(--text-muted); line-height: 1.5; margin-top: 10px;">
                        {{ report.content }}
                      </div>
                    </div>
                  } @empty {
                    <div class="placeholder-state">
                      <lucide-icon name="clipboard-x" size="48" class="text-muted"></lucide-icon>
                      <p>Aún no hay informes técnicos de eventos asociados.</p>
                    </div>
                  }
                </div>
              </ui-josanz-card>
            }
            @case ('commercial') {
              <ui-josanz-card variant="glass" title="Historial Comercial">
                <div class="commercial-history">
                  <div class="history-item">
                    <div class="history-header">
                      <span class="project-title">Congreso Anual 2026</span>
                      <ui-josanz-badge variant="success"
                        >Completado</ui-josanz-badge
                      >
                    </div>
                    <div class="history-details">
                      <span class="detail">Período: 01-30 Abril 2026</span>
                      <span class="detail">Valor: 3.200 €</span>
                      <span class="detail"
                        >Equipos: Proyector 4K + Pantalla LED</span
                      >
                    </div>
                  </div>
                  <div class="history-item">
                    <div class="history-header">
                      <span class="project-title">Feria Tecnológica</span>
                      <ui-josanz-badge variant="info">En curso</ui-josanz-badge>
                    </div>
                    <div class="history-details">
                      <span class="detail">Período: 15-20 Julio 2026</span>
                      <span class="detail">Valor: 2.850 €</span>
                      <span class="detail"
                        >Equipos: Set completo audiovisual</span
                      >
                    </div>
                  </div>
                  <div class="history-item">
                    <div class="history-header">
                      <span class="project-title"
                        >Presentación Corporativa</span
                      >
                      <ui-josanz-badge variant="success"
                        >Completado</ui-josanz-badge
                      >
                    </div>
                    <div class="history-details">
                      <span class="detail">Período: 10-12 Febrero 2026</span>
                      <span class="detail">Valor: 1.200 €</span>
                      <span class="detail">Equipos: Proyector + Pantalla</span>
                    </div>
                  </div>
                </div>
              </ui-josanz-card>
            }
            @default {
              <ui-josanz-card variant="glass" title="Módulo en Sincronización">
                <div class="placeholder-state">
                  <lucide-icon
                    name="activity"
                    size="48"
                    class="text-muted"
                  ></lucide-icon>
                  <p>
                    Este módulo modular está siendo actualizado con datos en
                    tiempo real.
                  </p>
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
      .page-container {
        padding: 0;
        max-width: 100%;
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
        gap: 8px;
        font-size: 0.6rem;
        font-weight: 800;
        cursor: pointer;
        padding: 0;
        margin-bottom: 0.5rem;
        transition: color 0.3s;
      }
      .back-btn:hover {
        color: #fff;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        padding-bottom: 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }

      .glow-text {
        font-size: 1.6rem;
        font-weight: 900;
        color: #fff;
        margin: 0;
        letter-spacing: 0.05em;
        font-family: var(--font-main);
      }

      .breadcrumb {
        display: flex;
        gap: 8px;
        font-size: 0.6rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        color: var(--text-muted);
        margin-top: 0.5rem;
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
        margin-top: 1rem;
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
        border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        padding-bottom: 0.5rem;
      }
      .info-item:last-child {
        border-bottom: none;
      }
      .info-item .label {
        font-size: 0.55rem;
        font-weight: 700;
        color: var(--text-muted);
        letter-spacing: 0.1em;
      }
      .info-item .value {
        font-size: 0.72rem;
        font-weight: 800;
        color: #fff;
      }
      .text-brand-link {
        color: var(--brand) !important;
        text-decoration: underline;
        cursor: pointer;
      }

      .placeholder-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 200px;
        gap: 1.5rem;
        text-align: center;
        color: var(--text-muted);
        font-size: 0.8rem;
        font-weight: 600;
      }

      .document-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .document-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.02);
      }
      .doc-icon {
        width: 40px;
        height: 40px;
        background: var(--brand-surface);
        border: 1px solid var(--brand-border);
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--brand);
      }
      .doc-info {
        flex: 1;
      }
      .doc-title {
        display: block;
        font-weight: 700;
        color: #fff;
        font-size: 0.85rem;
      }
      .doc-meta {
        display: block;
        font-size: 0.7rem;
        color: var(--text-muted);
        margin-top: 2px;
      }

      .timeline {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }
      .timeline-item {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        position: relative;
      }
      .timeline-item:not(:last-child)::before {
        content: '';
        position: absolute;
        left: 12px;
        top: 32px;
        bottom: -24px;
        width: 2px;
        background: rgba(255, 255, 255, 0.1);
      }
      .timeline-marker {
        width: 24px;
        height: 24px;
        background: var(--brand-surface);
        border: 2px solid var(--brand);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--brand);
        flex-shrink: 0;
      }
      .timeline-content {
        flex: 1;
        margin-top: 2px;
      }
      .timeline-title {
        display: block;
        font-weight: 600;
        color: #fff;
        font-size: 0.85rem;
      }
      .timeline-meta {
        display: block;
        font-size: 0.7rem;
        color: var(--text-muted);
        margin-top: 2px;
      }

      .commercial-history {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }
      .history-item {
        padding: 1rem;
        border: 1px solid rgba(255, 255, 255, 0.05);
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
        font-weight: 700;
        color: #fff;
        font-size: 0.9rem;
      }
      .history-details {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .detail {
        font-size: 0.75rem;
        color: var(--text-secondary);
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
          c.budgets?.forEach(b => {
            if (b.invoices) invoiceCount += b.invoices.length;
          });

          this.tabs.set([
            { id: 'general', label: 'Estrategia' },
            { id: 'budgets', label: 'Presupuestos', badge: c.budgets?.length || 0 },
            { id: 'invoices', label: 'Facturas', badge: invoiceCount },
            { id: 'reports', label: 'Informes de Evento', badge: c.eventReports?.length || 0 },
            { id: 'commercial', label: 'Historial Comercial' },
          ]);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
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

  onTabChange(tabId: string) {
    this.activeTab.set(tabId);
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES');
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
  }
}
