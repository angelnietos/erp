import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  UiTableComponent,
  UiButtonComponent,
  UiSearchComponent,
  UiPaginationComponent,
  UiBadgeComponent,
  UiLoaderComponent,
  UiModalComponent,
} from '@josanz-erp/shared-ui-kit';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DeliveryNote, DeliveryFacade } from '@josanz-erp/delivery-data-access';
import { DELIVERY_FEATURE_CONFIG } from '../delivery-feature.config';

@Component({
  selector: 'lib-delivery-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule,
    UiTableComponent, 
    UiButtonComponent, 
    UiSearchComponent, 
    UiPaginationComponent, 
    UiBadgeComponent,
    UiLoaderComponent,
    UiModalComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <h1>Albaranes</h1>
          <p class="subtitle">Gestiona las entregas de material</p>
        </div>
        @if (config.enableCreate) {
          <ui-josanz-button icon="plus" (clicked)="openCreateModal()">
            Nuevo Albarán
          </ui-josanz-button>
        }
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
                    <lucide-icon name="eye"></lucide-icon>
                  </button>
                  @if (delivery.status === 'pending' && config.enableSign) {
                    <button class="action-btn success" title="Firmar" (click)="signDelivery(delivery)">
                      <lucide-icon name="pen-tool"></lucide-icon>
                    </button>
                  }
                  @if (delivery.status === 'signed') {
                    <button class="action-btn" title="Completar" (click)="completeDelivery(delivery)">
                      <lucide-icon name="check-circle"></lucide-icon>
                    </button>
                  }
                  <button class="action-btn" (click)="editDelivery(delivery)" title="Editar">
                    <lucide-icon name="pencil"></lucide-icon>
                  </button>
                  @if (config.enableDelete) {
                    <button class="action-btn danger" (click)="confirmDelete(delivery)" title="Eliminar">
                      <lucide-icon name="trash-2"></lucide-icon>
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

    <!-- Create/Edit Modal -->
    <ui-josanz-modal 
      [isOpen]="isModalOpen()" 
      [title]="editingDelivery() ? 'Editar Albarán' : 'Nuevo Albarán'"
      (closed)="closeModal()"
    >
      <form>
        <div class="form-grid">
          <div class="form-group">
            <label for="budgetId">Presupuesto *</label>
            <input 
              type="text" 
              id="budgetId"
              [(ngModel)]="formData.budgetId" 
              name="budgetId" 
              required
              placeholder="ID del presupuesto"
            >
          </div>
          
          <div class="form-group">
            <label for="clientName">Cliente *</label>
            <input 
              type="text" 
              id="clientName"
              [(ngModel)]="formData.clientName" 
              name="clientName" 
              required
              placeholder="Nombre del cliente"
            >
          </div>
          
          <div class="form-group">
            <label for="status">Estado</label>
            <select id="status" [(ngModel)]="formData.status" name="status">
              <option value="draft">Borrador</option>
              <option value="pending">Pendiente</option>
              <option value="signed">Firmado</option>
              <option value="completed">Completado</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="itemsCount">Número de Items</label>
            <input 
              type="number" 
              id="itemsCount"
              [(ngModel)]="formData.itemsCount" 
              name="itemsCount" 
              placeholder="0"
            >
          </div>
          
          <div class="form-group">
            <label for="deliveryDate">Fecha de Entrega</label>
            <input 
              type="date" 
              id="deliveryDate"
              [(ngModel)]="formData.deliveryDate" 
              name="deliveryDate" 
            >
          </div>
          
          <div class="form-group">
            <label for="returnDate">Fecha de Devolución</label>
            <input 
              type="date" 
              id="returnDate"
              [(ngModel)]="formData.returnDate" 
              name="returnDate" 
            >
          </div>
          
          <div class="form-group full-width">
            <label for="notes">Notas</label>
            <textarea 
              id="notes"
              [(ngModel)]="formData.notes" 
              name="notes" 
              rows="3"
              placeholder="Notas adicionales..."
            ></textarea>
          </div>
        </div>
      </form>
      
      <div modal-footer>
        <ui-josanz-button variant="secondary" (clicked)="closeModal()">
          Cancelar
        </ui-josanz-button>
        <ui-josanz-button 
          (clicked)="saveDelivery()"
          [disabled]="!formData.budgetId || !formData.clientName"
        >
          {{ editingDelivery() ? 'Actualizar' : 'Crear' }}
        </ui-josanz-button>
      </div>
    </ui-josanz-modal>

    <!-- Signature Modal -->
    <ui-josanz-modal
      [isOpen]="isSignModalOpen()"
      title="Firmar Albarán"
      (closed)="closeSignModal()"
    >
      <div class="signature-area">
        <p>Firma el albarán para confirmar la entrega:</p>
        <textarea 
          [(ngModel)]="signatureText" 
          placeholder="Firma del cliente..."
          rows="4"
        ></textarea>
      </div>
      
      <div modal-footer>
        <ui-josanz-button variant="secondary" (clicked)="closeSignModal()">
          Cancelar
        </ui-josanz-button>
        <ui-josanz-button (clicked)="confirmSign()">
          Firmar
        </ui-josanz-button>
      </div>
    </ui-josanz-modal>

    <!-- Delete Confirmation Modal -->
    <ui-josanz-modal
      [isOpen]="isDeleteModalOpen()"
      title="Confirmar Eliminación"
      (closed)="closeDeleteModal()"
    >
      <p>¿Estás seguro de que deseas eliminar el albarán <strong>#{{ deliveryToDelete()?.id?.slice(0, 8) }}</strong>?</p>
      <p class="warning-text">Esta acción no se puede deshacer.</p>
      
      <div modal-footer>
        <ui-josanz-button variant="secondary" (clicked)="closeDeleteModal()">
          Cancelar
        </ui-josanz-button>
        <ui-josanz-button variant="danger" (clicked)="deleteDelivery()">
          Eliminar
        </ui-josanz-button>
      </div>
    </ui-josanz-modal>
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
    .action-btn.success:hover { background: rgba(34,197,94,0.15); color: #22C55E; }
    .action-btn.danger:hover { background: rgba(239,68,68,0.15); color: #EF4444; }
    
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-group.full-width {
      grid-column: 1 / -1;
    }
    .form-group label {
      color: #94A3B8;
      font-size: 13px;
      font-weight: 500;
    }
    .form-group input,
    .form-group select,
    .form-group textarea {
      background: #0F172A;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 10px 12px;
      color: white;
      font-size: 14px;
      transition: border-color 0.2s;
    }
    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #4F46E5;
    }
    .form-group input::placeholder,
    .form-group textarea::placeholder {
      color: #64748B;
    }
    .warning-text {
      color: #EF4444;
      font-size: 14px;
    }
    .signature-area textarea {
      width: 100%;
      background: #0F172A;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 12px;
      color: white;
      font-size: 14px;
      margin-top: 12px;
    }
  `],
})
export class DeliveryListComponent implements OnInit {
  private readonly facade = inject(DeliveryFacade);
  public readonly config = inject(DELIVERY_FEATURE_CONFIG);

  columns = this.config.defaultColumns;

  deliveryNotes = this.facade.deliveryNotes;
  isLoading = this.facade.isLoading;
  currentPage = signal(1);
  totalPages = signal(1);
  searchTerm = '';
  
  // Modal state
  isModalOpen = signal(false);
  isDeleteModalOpen = signal(false);
  isSignModalOpen = signal(false);
  editingDelivery = signal<DeliveryNote | null>(null);
  deliveryToDelete = signal<DeliveryNote | null>(null);
  deliveryToSign = signal<DeliveryNote | null>(null);
  signatureText = '';
  
  // Form data
  formData: Partial<DeliveryNote> = {
    budgetId: '',
    clientName: '',
    status: 'draft',
    deliveryDate: '',
    returnDate: '',
    itemsCount: 0,
    notes: ''
  };

  ngOnInit() {
    this.loadDeliveryNotes();
  }

  loadDeliveryNotes() {
    this.facade.loadDeliveryNotes();
  }

  onSearch(term: string) {
    this.searchTerm = term;
    if (term.trim()) {
      this.facade.searchDeliveryNotes(term);
    } else {
      this.facade.loadDeliveryNotes();
    }
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadDeliveryNotes();
  }

  openCreateModal() {
    this.editingDelivery.set(null);
    this.formData = {
      budgetId: '',
      clientName: '',
      status: 'draft',
      deliveryDate: new Date().toISOString().split('T')[0],
      returnDate: '',
      itemsCount: 0,
      notes: ''
    };
    this.isModalOpen.set(true);
  }

  editDelivery(delivery: DeliveryNote) {
    this.editingDelivery.set(delivery);
    this.formData = { ...delivery };
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingDelivery.set(null);
  }

  saveDelivery() {
    if (!this.formData.budgetId || !this.formData.clientName) return;

    const deliveryToEdit = this.editingDelivery();
    if (deliveryToEdit) {
      this.facade.updateDeliveryNote(deliveryToEdit.id, this.formData);
      this.closeModal();
    } else {
      this.facade.createDeliveryNote(this.formData as Omit<DeliveryNote, 'id'>);
      this.closeModal();
    }
  }

  confirmDelete(delivery: DeliveryNote) {
    this.deliveryToDelete.set(delivery);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    this.deliveryToDelete.set(null);
  }

  deleteDelivery() {
    const delivery = this.deliveryToDelete();
    if (!delivery) return;

    this.facade.deleteDeliveryNote(delivery.id);
    this.closeDeleteModal();
  }

  signDelivery(delivery: DeliveryNote) {
    this.deliveryToSign.set(delivery);
    this.signatureText = '';
    this.isSignModalOpen.set(true);
  }

  closeSignModal() {
    this.isSignModalOpen.set(false);
    this.deliveryToSign.set(null);
    this.signatureText = '';
  }

  confirmSign() {
    const delivery = this.deliveryToSign();
    if (!delivery) return;

    this.facade.signDeliveryNote(delivery.id, this.signatureText);
    this.closeSignModal();
  }

  completeDelivery(delivery: DeliveryNote) {
    this.facade.completeDeliveryNote(delivery.id);
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

  formatDate(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES');
  }
}

