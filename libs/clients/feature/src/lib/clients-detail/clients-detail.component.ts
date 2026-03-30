import { Component, OnInit, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { UiCardComponent, UiButtonComponent, UiBadgeComponent, UiLoaderComponent, UiTabsComponent, TabItem } from '@josanz-erp/shared-ui-kit';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

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
  imports: [CommonModule, RouterModule, UiCardComponent, UiButtonComponent, UiBadgeComponent, UiLoaderComponent, UiTabsComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="page-container">
      @if (isLoading()) {
        <ui-josanz-loader message="Cargando cliente..."></ui-josanz-loader>
      } @else {
        <div class="page-header">
          <button class="back-btn" routerLink="/clients">
            <lucide-icon name="arrow-left"></lucide-icon>
            Volver
          </button>
        </div>

        <div class="client-header">
          <div class="client-info">
            <h1>{{ client()?.name }}</h1>
            <div class="badges">
              <ui-josanz-badge variant="info">{{ client()?.sector }}</ui-josanz-badge>
            </div>
          </div>
          <div class="header-actions">
            <ui-josanz-button icon="pencil" (clicked)="editClient()">Editar</ui-josanz-button>
          </div>
        </div>

        <ui-josanz-tabs [tabs]="tabs" [activeTab]="activeTab()" (tabChange)="onTabChange($event)"></ui-josanz-tabs>

        <div class="tab-content">
          @switch (activeTab()) {
            @case ('general') {
              <div class="detail-grid">
                <ui-josanz-card title="Información General">
                  <div class="detail-row">
                    <span class="label">Nombre</span>
                    <span class="value">{{ client()?.name }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Descripción</span>
                    <span class="value">{{ client()?.description || 'Sin descripción' }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Sector</span>
                    <span class="value">{{ client()?.sector }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Fecha de Alta</span>
                    <span class="value">{{ formatDate(client()?.createdAt) }}</span>
                  </div>
                </ui-josanz-card>

                <ui-josanz-card title="Contacto">
                  <div class="detail-row">
                    <span class="label">Persona de Contacto</span>
                    <span class="value">{{ client()?.contact }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Email</span>
                    <span class="value">{{ client()?.email }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Teléfono</span>
                    <span class="value">{{ client()?.phone }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Dirección</span>
                    <span class="value">{{ client()?.address || 'Sin dirección' }}</span>
                  </div>
                </ui-josanz-card>
              </div>
            }
            @case ('budgets') {
              <div class="section-placeholder">
                <p>Presupuestos asociados a este cliente</p>
                <ui-josanz-button icon="plus">Crear Presupuesto</ui-josanz-button>
              </div>
            }
            @case ('invoices') {
              <div class="section-placeholder">
                <p>Facturas asociadas a este cliente</p>
              </div>
            }
            @case ('history') {
              <div class="section-placeholder">
                <p>Histórico de comunicaciones</p>
              </div>
            }
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; }
    .page-header { margin-bottom: 16px; }
    .back-btn {
      display: flex; align-items: center; gap: 8px; background: none; border: none;
      color: #94A3B8; cursor: pointer; font-size: 14px; padding: 8px 0;
    }
    .back-btn:hover { color: white; }
    .client-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 24px;
    }
    .client-info h1 { margin: 0 0 12px 0; color: white; font-size: 28px; font-weight: 700; }
    .badges { display: flex; gap: 8px; }
    .header-actions { display: flex; gap: 12px; }
    .detail-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin-top: 24px; }
    .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .detail-row:last-child { border-bottom: none; }
    .label { color: #94A3B8; font-size: 14px; }
    .value { color: white; font-size: 14px; font-weight: 500; }
    .section-placeholder { 
      display: flex; flex-direction: column; align-items: center; 
      justify-content: center; padding: 60px 20px; 
      color: #64748B;
    }
    .section-placeholder p { margin-bottom: 16px; }
  `],
})
export class ClientsDetailComponent implements OnInit {
  @Input() id?: string;

  client = signal<Client | null>(null);
  isLoading = signal(true);
  activeTab = signal('general');

  tabs: TabItem[] = [
    { id: 'general', label: 'General' },
    { id: 'budgets', label: 'Presupuestos', badge: 0 },
    { id: 'invoices', label: 'Facturas', badge: 0 },
    { id: 'history', label: 'Historial' },
  ];

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const id = this.id || this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadClient(id);
    }
  }

  loadClient(id: string) {
    this.isLoading.set(true);
    // Mock data
    setTimeout(() => {
      this.client.set({
        id,
        name: 'Producciones Audiovisuales Madrid',
        description: 'Empresa de producción audiovisual especializada en documentales y publicidad',
        sector: 'Producción',
        contact: 'Juan García',
        email: 'juan@produccionesmadrid.es',
        phone: '+34 612 345 678',
        address: 'Calle Mayor 123, Madrid',
        createdAt: '2026-01-15',
        updatedAt: '2026-03-20',
      });
      this.isLoading.set(false);
    }, 300);
  }

  onTabChange(tabId: string) {
    this.activeTab.set(tabId);
  }

  editClient() {
    // TODO: Open edit modal
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES');
  }
}
