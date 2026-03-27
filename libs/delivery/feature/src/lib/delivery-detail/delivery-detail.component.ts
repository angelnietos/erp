import type { BadgeVariant } from '@josanz-erp/shared-ui-kit';
import { Component, OnInit, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { UiCardComponent, UiButtonComponent, UiBadgeComponent, UiLoaderComponent, UiTableComponent } from '@josanz-erp/shared-ui-kit';

export interface DeliveryItem {
  id: string;
  productName: string;
  quantity: number;
  condition: 'new' | 'good' | 'damaged' | 'missing';
  observations: string;
}

export interface DeliveryNote {
  id: string;
  budgetId: string;
  budgetReference: string;
  clientName: string;
  status: 'draft' | 'pending' | 'signed' | 'completed';
  deliveryDate: string;
  returnDate: string;
  deliveryAddress: string;
  recipientName: string;
  recipientSignature?: string;
  items: DeliveryItem[];
}

@Component({
  selector: 'lib-delivery-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, UiCardComponent, UiButtonComponent, UiBadgeComponent, UiLoaderComponent, UiTableComponent],
  template: `
    <div class="page-container">
      @if (isLoading()) {
        <ui-josanz-loader message="Cargando albarán..."></ui-josanz-loader>
      } @else {
        <div class="page-header">
          <button class="back-btn" routerLink="/delivery">
            <i-lucide name="arrow-left"></i-lucide>
            Volver
          </button>
        </div>

        <div class="delivery-header">
          <div class="delivery-info">
            <h1>Albarán #{{ delivery()?.id?.slice(0, 8) }}</h1>
            <div class="badges">
              <ui-josanz-badge [variant]="getStatusVariant(delivery()?.status)">
                {{ getStatusLabel(delivery()?.status) }}
              </ui-josanz-badge>
              <span class="client-name">{{ delivery()?.clientName }}</span>
            </div>
          </div>
          <div class="header-actions">
            <ui-josanz-button icon="download" (clicked)="downloadPDF()">Descargar PDF</ui-josanz-button>
            @if (delivery()?.status === 'pending') {
              <ui-josanz-button icon="pen-tool" (clicked)="openSignature()">Firmar</ui-josanz-button>
            }
          </div>
        </div>

        <div class="delivery-meta">
          <div class="meta-item">
            <span class="label">Presupuesto</span>
            <a [routerLink]="['/budgets', delivery()?.budgetId]" class="link">{{ delivery()?.budgetReference }}</a>
          </div>
          <div class="meta-item">
            <span class="label">Fecha de Entrega</span>
            <span class="value">{{ formatDate(delivery()?.deliveryDate) }}</span>
          </div>
          <div class="meta-item">
            <span class="label">Fecha de Devolución</span>
            <span class="value">{{ formatDate(delivery()?.returnDate) }}</span>
          </div>
          <div class="meta-item">
            <span class="label">Dirección</span>
            <span class="value">{{ delivery()?.deliveryAddress }}</span>
          </div>
        </div>

        <ui-josanz-card title="Material Entregado">
          <ui-josanz-table [columns]="itemColumns" [data]="delivery()?.items || []">
            <ng-template #cellTemplate let-item let-key="key">
              @switch (key) {
                @case ('condition') {
                  <ui-josanz-badge [variant]="getConditionVariant(item.condition)">
                    {{ getConditionLabel(item.condition) }}
                  </ui-josanz-badge>
                }
                @default { {{ item[key] }} }
              }
            </ng-template>
          </ui-josanz-table>
        </ui-josanz-card>

        @if (delivery()?.recipientSignature) {
          <ui-josanz-card title="Firma del Receptor">
            <div class="signature-box">
              <img [src]="delivery()?.recipientSignature" alt="Firma" class="signature-image" />
              <span class="signature-name">{{ delivery()?.recipientName }}</span>
            </div>
          </ui-josanz-card>
        }
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
    .delivery-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 24px;
    }
    .delivery-info h1 { margin: 0 0 12px 0; color: white; font-size: 28px; font-weight: 700; }
    .badges { display: flex; align-items: center; gap: 12px; }
    .client-name { color: #94A3B8; font-size: 14px; }
    .header-actions { display: flex; gap: 12px; }
    .delivery-meta {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;
      background: rgba(255,255,255,0.03); border-radius: 12px; padding: 20px; margin-bottom: 24px;
    }
    .meta-item { display: flex; flex-direction: column; gap: 4px; }
    .meta-item .label { color: #64748B; font-size: 12px; }
    .meta-item .value { color: white; font-size: 14px; }
    .link { color: #4F46E5; text-decoration: none; }
    .link:hover { text-decoration: underline; }
    .signature-box {
      display: flex; flex-direction: column; align-items: center; gap: 12px;
      padding: 20px; background: rgba(255,255,255,0.02); border-radius: 8px;
    }
    .signature-image { max-width: 200px; max-height: 80px; }
    .signature-name { color: #E2E8F0; font-size: 14px; }
  `],
})
export class DeliveryDetailComponent implements OnInit {
  @Input() id?: string;

  delivery = signal<DeliveryNote | null>(null);
  isLoading = signal(true);

  itemColumns = [
    { key: 'productName', header: 'Producto' },
    { key: 'quantity', header: 'Cantidad', width: '100px' },
    { key: 'condition', header: 'Estado', width: '120px' },
    { key: 'observations', header: 'Observaciones' },
  ];

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const id = this.id || this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDelivery(id);
    }
  }

  loadDelivery(id: string) {
    this.isLoading.set(true);
    setTimeout(() => {
      this.delivery.set({
        id,
        budgetId: 'bgt-001',
        budgetReference: '#bgt-001',
        clientName: 'Producciones Audiovisuales Madrid',
        status: 'signed',
        deliveryDate: '2026-03-20',
        returnDate: '2026-03-25',
        deliveryAddress: 'Calle Mayor 123, Madrid',
        recipientName: 'Juan García',
        recipientSignature: 'data:image/png;base64,mock',
        items: [
          { id: '1', productName: 'Cámara Sony FX6', quantity: 2, condition: 'good', observations: 'Sin observaciones' },
          { id: '2', productName: 'Iluminación LED Kit', quantity: 1, condition: 'new', observations: 'Equipo nuevo' },
          { id: '3', productName: 'Trípode profesional', quantity: 2, condition: 'good', observations: 'Funcionando correctamente' },
        ],
      });
      this.isLoading.set(false);
    }, 300);
  }

  getStatusVariant(status: string | undefined): 'success' | 'warning' | 'info' | 'default' {
    switch (status) {
      case 'signed': return 'success';
      case 'completed': return 'info';
      case 'pending': return 'warning';
      default: return 'default';
    }
  }

  getStatusLabel(status: string | undefined): string {
    switch (status) {
      case 'draft': return 'Borrador';
      case 'pending': return 'Pendiente';
      case 'signed': return 'Firmado';
      case 'completed': return 'Completado';
      default: return '-';
    }
  }

  getConditionVariant(condition: string): BadgeVariant {
    switch (condition) {
      case 'new': return 'success';
      case 'good': return 'info';
      case 'damaged': return 'warning';
      case 'missing': return 'error';
      default: return 'default';
    }
  }

  getConditionLabel(condition: string): string {
    switch (condition) {
      case 'new': return 'Nuevo';
      case 'good': return 'Bueno';
      case 'damaged': return 'Dañado';
      case 'missing': return 'Faltante';
      default: return condition;
    }
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES');
  }

  downloadPDF() { /* TODO */ }
  openSignature() { /* TODO */ }
}