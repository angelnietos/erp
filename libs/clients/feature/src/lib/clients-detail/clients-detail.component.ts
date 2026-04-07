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

export interface Client {
  id: string;
  name: string;
  description: string;
  sector: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  createdAt?: string;
  updatedAt?: string;
}

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
          [tabs]="tabs"
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
                    <div class="info-item">
                      <span class="label">KEY ACCOUNT MANAGER</span>
                      <span class="value">{{ client()?.contact }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">EMAIL CORPORATIVO</span>
                      <span class="value text-brand-link">{{
                        client()?.email
                      }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">TELÉFONO DIRECTO</span>
                      <span class="value">{{ client()?.phone }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">SEDE CENTRAL</span>
                      <span class="value">{{
                        client()?.address || 'Dirección no consignada.'
                      }}</span>
                    </div>
                  </div>
                </ui-josanz-card>
              </div>
            }
            @case ('budgets') {
              <ui-josanz-card variant="glass" title="Historial Financiero">
                <div class="placeholder-state">
                  <lucide-icon
                    name="file-search"
                    size="48"
                    class="text-muted"
                  ></lucide-icon>
                  <p>Accediendo a la bóveda de presupuestos del cliente...</p>
                  <ui-josanz-button
                    variant="glass"
                    size="sm"
                    icon="plus"
                    routerLink="/budgets"
                    >NUEVA OFERTA</ui-josanz-button
                  >
                </div>
              </ui-josanz-card>
            }
            @case ('invoices') {
              <ui-josanz-card variant="glass" title="Documentación Fiscal">
                <div class="document-list">
                  <div class="document-item">
                    <div class="doc-icon">
                      <lucide-icon name="file-text" size="20"></lucide-icon>
                    </div>
                    <div class="doc-info">
                      <span class="doc-title">Factura F/2026/0001</span>
                      <span class="doc-meta"
                        >Emitida: 15/03/2026 · 2.300,00 €</span
                      >
                    </div>
                    <ui-josanz-button variant="ghost" size="sm" icon="download"
                      >PDF</ui-josanz-button
                    >
                  </div>
                  <div class="document-item">
                    <div class="doc-icon">
                      <lucide-icon name="receipt" size="20"></lucide-icon>
                    </div>
                    <div class="doc-info">
                      <span class="doc-title">Albarán ALB-2026-001</span>
                      <span class="doc-meta"
                        >Entregado: 10/03/2026 · Equipos audiovisuales</span
                      >
                    </div>
                    <ui-josanz-button variant="ghost" size="sm" icon="download"
                      >PDF</ui-josanz-button
                    >
                  </div>
                  <div class="document-item">
                    <div class="doc-icon">
                      <lucide-icon name="shield-check" size="20"></lucide-icon>
                    </div>
                    <div class="doc-info">
                      <span class="doc-title">Certificado VeriFactu</span>
                      <span class="doc-meta"
                        >Validado: 15/03/2026 · Estado: ACEPTADO</span
                      >
                    </div>
                    <ui-josanz-button variant="ghost" size="sm" icon="download"
                      >XML</ui-josanz-button
                    >
                  </div>
                </div>
              </ui-josanz-card>
            }
            @case ('history') {
              <ui-josanz-card
                variant="glass"
                title="Telemetría de Interacciones"
              >
                <div class="timeline">
                  <div class="timeline-item">
                    <div class="timeline-marker">
                      <lucide-icon name="mail" size="16"></lucide-icon>
                    </div>
                    <div class="timeline-content">
                      <span class="timeline-title"
                        >Email de seguimiento enviado</span
                      >
                      <span class="timeline-meta"
                        >Hace 2 días · Por: Ana López</span
                      >
                    </div>
                  </div>
                  <div class="timeline-item">
                    <div class="timeline-marker">
                      <lucide-icon name="phone" size="16"></lucide-icon>
                    </div>
                    <div class="timeline-content">
                      <span class="timeline-title"
                        >Llamada telefónica realizada</span
                      >
                      <span class="timeline-meta"
                        >Hace 5 días · Duración: 15 min</span
                      >
                    </div>
                  </div>
                  <div class="timeline-item">
                    <div class="timeline-marker">
                      <lucide-icon name="calendar" size="16"></lucide-icon>
                    </div>
                    <div class="timeline-content">
                      <span class="timeline-title"
                        >Reunión presencial agendada</span
                      >
                      <span class="timeline-meta"
                        >Hace 1 semana · IFEMA Madrid</span
                      >
                    </div>
                  </div>
                  <div class="timeline-item">
                    <div class="timeline-marker">
                      <lucide-icon name="briefcase" size="16"></lucide-icon>
                    </div>
                    <div class="timeline-content">
                      <span class="timeline-title">Proyecto completado</span>
                      <span class="timeline-meta"
                        >Hace 2 semanas · Presupuesto: 12.450 €</span
                      >
                    </div>
                  </div>
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

  currentTheme = this.themeService.currentThemeData;
  client = signal<Client | null>(null);
  isLoading = signal(true);
  activeTab = signal('general');

  tabs: TabItem[] = [
    { id: 'general', label: 'Estrategia' },
    { id: 'budgets', label: 'Financiero' },
    { id: 'invoices', label: 'Documental', badge: 3 },
    { id: 'history', label: 'Telemetría', badge: 4 },
    { id: 'commercial', label: 'Historial Comercial', badge: 3 },
  ];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadClient(id);
    }
  }

  loadClient(id: string) {
    this.isLoading.set(true);
    setTimeout(() => {
      this.client.set({
        id,
        name: 'Producciones Audiovisuales Madrid',
        description:
          'Líder en producción de contenido digital para el sector broadcast y streaming.',
        sector: 'Broadcast Media',
        contact: 'Juan García-Cortés',
        email: 'j.cortes@broadmadrid.com',
        phone: '+34 612 345 678',
        address: 'Paseo de la Castellana 200, 28046 Madrid',
        createdAt: '2026-01-15',
        updatedAt: '2026-03-20',
      });
      this.isLoading.set(false);
    }, 450);
  }

  onTabChange(tabId: string) {
    this.activeTab.set(tabId);
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES');
  }
}
