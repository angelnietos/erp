import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UiTableComponent, UiButtonComponent, UiSearchComponent, UiPaginationComponent, UiBadgeComponent, UiLoaderComponent } from '@josanz-erp/shared-ui-kit';

export interface DeliveryNote {
  id: string;
  budgetId: string;
  clientName: string;
  status: 'draft' | 'pending' | 'signed' | 'completed';
  deliveryDate: string;
  returnDate: string;
  itemsCount: number;
  signature?: string;
}

@Component({
  selector: 'lib-delivery-list',
  standalone: true,
  imports: [CommonModule, RouterModule, UiTableComponent, UiButtonComponent, UiSearchComponent, UiPaginationComponent, UiBadgeComponent, UiLoaderComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <h1>Albaranes</h1>
          <p class="subtitle">Gestiona las entregas de material</p>
        </div>
        <ui-josanz-button icon="plus" (clicked)="openCreateModal()">
          Nuevo Albarán
        </ui-josanz-button>
      </div>

      <div class="filters-bar">
        <ui-josanz-search 
          placeholder="Buscar albaranes..." 
          (searchChange)="onSearch($event)"
        ></ui-josanz-search>
      </div>

      @if (isLoading()) {
        <ui-josanz-loader message="Cargando albaranes..."></ui-josanz-loader>
      } @else {
        <ui-josanz-table [columns]="columns" [data]="deliveryNotes()">
          <ng-template #cellTemplate let-delivery let-key="key">
            @switch (key) {
              @case ('id') {
                <a [routerLink]="['/delivery', delivery.id]" class="delivery-link">
                  #{{ delivery.id.slice(0, 8) }}
                </a>
              }
              @case ('status') {
                <ui-josanz-badge [variant]="getStatusVariant(delivery.status)">
                  {{ getStatusLabel(delivery.status) }}
                </ui-josanz-badge>
              }
              @case ('deliveryDate') {
                {{ formatDate(delivery.deliveryDate) }}
              }
              @case ('returnDate') {
                {{ formatDate(delivery.returnDate) }}
              }
              @case ('actions') {
                <div class="actions">
                  <button class="action-btn" [routerLink]="['/delivery', delivery.id]" title="Ver">
                    <i-lucide name="eye"></i-lucide>
                  </button>
                  @if (delivery.status === 'pending') {
                    <button class="action-btn" title="Firmar">
                      <i-lucide name="pen-tool"></i-lucide>
                    </button>
                  }
                </div>
              }
              @default {
                {{ delivery[key] }}
              }
            }
          </ng-template>
        </ui-josanz-table>

        <ui-josanz-pagination 
          [currentPage]="currentPage()" 
          [totalPages]="totalPages()"
          (pageChange)="onPageChange($event)"
        ></ui-josanz-pagination>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; }
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 24px;
    }
    .header-content h1 { margin: 0 0 4px 0; color: white; font-size: 28px; font-weight: 700; }
    .subtitle { margin: 0; color: #94A3B8; font-size: 14px; }
    .filters-bar { display: flex; gap: 16px; margin-bottom: 20px; }
    .delivery-link { color: #4F46E5; text-decoration: none; font-weight: 500; font-family: monospace; }
    .delivery-link:hover { text-decoration: underline; }
    .actions { display: flex; gap: 8px; }
    .action-btn {
      background: none; border: none; padding: 6px; cursor: pointer;
      color: #94A3B8; border-radius: 6px; transition: all 0.2s;
    }
    .action-btn:hover { background: rgba(255,255,255,0.1); color: white; }
  `],
})
export class DeliveryListComponent implements OnInit {
  columns = [
    { key: 'id', header: 'Referencia', width: '120px' },
    { key: 'budgetId', header: 'Presupuesto', width: '120px' },
    { key: 'clientName', header: 'Cliente' },
    { key: 'deliveryDate', header: 'Fecha Entrega', width: '120px' },
    { key: 'returnDate', header: 'Fecha Devolución', width: '120px' },
    { key: 'itemsCount', header: 'Items', width: '80px' },
    { key: 'status', header: 'Estado', width: '120px' },
    { key: 'actions', header: '', width: '100px' },
  ];

  deliveryNotes = signal<DeliveryNote[]>([]);
  isLoading = signal(true);
  currentPage = signal(1);
  totalPages = signal(1);
  searchTerm = '';

  ngOnInit() {
    this.loadDeliveryNotes();
  }

  loadDeliveryNotes() {
    this.isLoading.set(true);
    // Mock data
    setTimeout(() => {
      this.deliveryNotes.set([
        {
          id: 'dlv-001',
          budgetId: 'bgt-001',
          clientName: 'Producciones Audiovisuales Madrid',
          status: 'signed',
          deliveryDate: '2026-03-20',
          returnDate: '2026-03-25',
          itemsCount: 8,
        },
        {
          id: 'dlv-002',
          budgetId: 'bgt-002',
          clientName: 'Cadena TV España',
          status: 'pending',
          deliveryDate: '2026-03-22',
          returnDate: '2026-03-28',
          itemsCount: 12,
        },
        {
          id: 'dlv-003',
          budgetId: 'bgt-003',
          clientName: 'Film Studios Barcelona',
          status: 'completed',
          deliveryDate: '2026-03-15',
          returnDate: '2026-03-18',
          itemsCount: 5,
        },
      ]);
      this.isLoading.set(false);
      this.totalPages.set(1);
    }, 500);
  }

  getStatusVariant(status: string): 'success' | 'warning' | 'info' | 'default' {
    switch (status) {
      case 'signed': return 'success';
      case 'completed': return 'info';
      case 'pending': return 'warning';
      default: return 'default';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'draft': return 'Borrador';
      case 'pending': return 'Pendiente';
      case 'signed': return 'Firmado';
      case 'completed': return 'Completado';
      default: return status;
    }
  }

  onSearch(term: string) {
    this.searchTerm = term;
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadDeliveryNotes();
  }

  openCreateModal() {
    // TODO: Open create modal
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES');
  }
}