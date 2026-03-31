import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { 
  UiCardComponent, UiButtonComponent, UiBadgeComponent, 
  UiLoaderComponent, UiTabsComponent, TabItem, UiStatCardComponent 
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
    CommonModule, RouterModule, LucideAngularModule,
    UiCardComponent, UiButtonComponent, UiBadgeComponent, 
    UiLoaderComponent, UiTabsComponent, UiStatCardComponent
  ],
  template: `
    <div class="page-container animate-fade-in" [class.high-perf]="pluginStore.highPerformanceMode()">
      @if (isLoading()) {
        <ui-josanz-loader message="Sincronizando expediente de cliente..."></ui-josanz-loader>
      } @else if (client()) {
        <header class="page-header" [style.border-bottom-color]="currentTheme().primary + '33'">
          <div class="header-breadcrumb">
            <button class="back-btn" routerLink="/clients">
              <lucide-icon name="arrow-left" size="14"></lucide-icon>
              VOLVER AL CRM
            </button>
            <h1 class="page-title text-uppercase glow-text" [style.text-shadow]="'0 0 20px ' + currentTheme().primary + '44'">
              {{ client()?.name }}
            </h1>
            <div class="breadcrumb">
              <span class="active" [style.color]="currentTheme().primary">SECTOR: {{ client()?.sector | uppercase }}</span>
              <span class="separator">/</span>
              <span>ID: {{ client()?.id?.slice(0,8) }}</span>
            </div>
          </div>
          <div class="header-actions">
            <ui-josanz-button variant="glass" size="md" icon="mail">CONTACTAR</ui-josanz-button>
            <ui-josanz-button variant="primary" size="md" icon="edit">EDITAR PERFIL</ui-josanz-button>
          </div>
        </header>

        <div class="stats-row">
          <ui-josanz-stat-card 
            label="Inversión Total" 
            value="12.450 €" 
            icon="line-chart" 
            [accent]="true">
          </ui-josanz-stat-card>
          <ui-josanz-stat-card 
            label="Proyectos Activos" 
            value="3" 
            icon="briefcase"
            [trend]="1">
          </ui-josanz-stat-card>
          <ui-josanz-stat-card 
            label="Rating Fidelidad" 
            value="9.8" 
            icon="star">
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
                      <span class="value text-muted">{{ client()?.description || 'Sin descripción corporativa.' }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">SECTOR ACTUACIÓN</span>
                      <ui-josanz-badge variant="info">{{ client()?.sector }}</ui-josanz-badge>
                    </div>
                    <div class="info-item">
                      <span class="label">ALTA SISTEMA</span>
                      <span class="value font-mono">{{ formatDate(client()?.createdAt) }}</span>
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
                      <span class="value text-brand-link">{{ client()?.email }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">TELÉFONO DIRECTO</span>
                      <span class="value">{{ client()?.phone }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">SEDE CENTRAL</span>
                      <span class="value">{{ client()?.address || 'Dirección no consignada.' }}</span>
                    </div>
                  </div>
                </ui-josanz-card>
              </div>
            }
            @case ('budgets') {
              <ui-josanz-card variant="glass" title="Historial Comercial">
                <div class="placeholder-state">
                  <lucide-icon name="file-search" size="48" class="text-muted"></lucide-icon>
                  <p>Accediendo a la bóveda de presupuestos del cliente...</p>
                  <ui-josanz-button variant="glass" size="sm" icon="plus" routerLink="/budgets">NUEVA OFERTA</ui-josanz-button>
                </div>
              </ui-josanz-card>
            }
            @default {
              <ui-josanz-card variant="glass" title="Módulo en Sincronización">
                 <div class="placeholder-state">
                   <lucide-icon name="activity" size="48" class="text-muted"></lucide-icon>
                   <p>Este módulo modular está siendo actualizado con datos en tiempo real.</p>
                 </div>
              </ui-josanz-card>
            }
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 0; max-width: 1600px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem; }
    
    .back-btn {
      background: none; border: none; color: var(--text-muted); 
      display: flex; align-items: center; gap: 8px; font-size: 0.6rem;
      font-weight: 800; cursor: pointer; padding: 0; margin-bottom: 0.5rem;
      transition: color 0.3s;
    }
    .back-btn:hover { color: #fff; }

    .page-header {
      display: flex; justify-content: space-between; align-items: flex-end;
      padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    
    .glow-text { 
      font-size: 1.6rem; font-weight: 900; color: #fff; margin: 0; 
      letter-spacing: 0.05em; font-family: var(--font-main);
    }
    
    .breadcrumb {
      display: flex; gap: 8px; font-size: 0.6rem; font-weight: 700;
      letter-spacing: 0.1em; color: var(--text-muted); margin-top: 0.5rem;
    }
    
    .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }

    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1rem; }
    
    .info-list { display: flex; flex-direction: column; gap: 1.25rem; padding: 0.5rem 0; }
    .info-item { display: flex; flex-direction: column; gap: 4px; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 0.5rem; }
    .info-item:last-child { border-bottom: none; }
    .info-item .label { font-size: 0.55rem; font-weight: 700; color: var(--text-muted); letter-spacing: 0.1em; }
    .info-item .value { font-size: 0.72rem; font-weight: 800; color: #fff; }
    .text-brand-link { color: var(--brand) !important; text-decoration: underline; cursor: pointer; }

    .placeholder-state { 
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      min-height: 200px; gap: 1.5rem; text-align: center; color: var(--text-muted);
      font-size: 0.8rem; font-weight: 600;
    }
  `],
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
    { id: 'budgets', label: 'Financiero', badge: 2 },
    { id: 'invoices', label: 'Documental' },
    { id: 'history', label: 'Telemetría' },
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
        description: 'Líder en producción de contenido digital para el sector broadcast y streaming.',
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
