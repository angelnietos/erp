import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import {
  UiTableComponent,
  UiButtonComponent,
  UiSearchComponent,
  UiPaginationComponent,
  UiBadgeComponent,
  UiLoaderComponent,
  UiModalComponent,
  UiCardComponent,
} from '@josanz-erp/shared-ui-kit';
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
    UiCardComponent,
    LucideAngularModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <h1 class="glow-text">Gestión de Albaranes</h1>
          <p class="subtitle">Logística de entregas, confirmaciones de mercancia y control de retornos</p>
        </div>
        @if (config.enableCreate) {
          <ui-josanz-button variant="primary" (clicked)="openCreateModal()">
            <lucide-icon name="plus" class="mr-2"></lucide-icon>
            Nuevo Albarán
          </ui-josanz-button>
        }
      </div>

      <div class="filters-bar">
        <ui-josanz-search 
          variant="filled"
          placeholder="BUSCAR Nº ALBARÁN, CLIENTE O PRESUPUESTO..." 
          (searchChange)="onSearch($event)"
          class="flex-1"
        ></ui-josanz-search>
      </div>

      @if (isLoading()) {
        <ui-josanz-loader message="Sincronizando manifiestos de entrega..."></ui-josanz-loader>
      } @else {
        <ui-josanz-card variant="glass" class="table-card">
          <ui-josanz-table [columns]="columns" [data]="deliveryNotes()" variant="hover">
            <ng-template #cellTemplate let-delivery let-key="key">
              @switch (key) {
                @case ('id') {
                  <a [routerLink]="['/delivery', delivery.id]" class="delivery-link">
                    #{{ delivery.id.slice(0, 8) }}
                  </a>
                }
                @case ('status') {
                  <ui-josanz-badge [variant]="getStatusVariant(delivery.status)">
                    {{ getStatusLabel(delivery.status) | uppercase }}
                  </ui-josanz-badge>
                }
                @case ('deliveryDate') {
                  <span class="date-text">{{ formatDate(delivery.deliveryDate) }}</span>
                }
                @case ('returnDate') {
                  <span class="date-text">{{ formatDate(delivery.returnDate) }}</span>
                }
                @case ('actions') {
                  <div class="actions">
                    <button class="action-trigger" [routerLink]="['/delivery', delivery.id]" title="Ver">
                      <lucide-icon name="eye" size="18"></lucide-icon>
                    </button>
                    @if (delivery.status === 'pending' && config.enableSign) {
                      <button class="action-trigger success" title="Firmar" (click)="signDelivery(delivery)">
                        <lucide-icon name="pen-tool" size="18"></lucide-icon>
                      </button>
                    }
                    @if (delivery.status === 'signed') {
                      <button class="action-trigger info" title="Completar" (click)="completeDelivery(delivery)">
                        <lucide-icon name="check-circle" size="18"></lucide-icon>
                      </button>
                    }
                    <button class="action-trigger" (click)="editDelivery(delivery)" title="Editar">
                      <lucide-icon name="pencil" size="18"></lucide-icon>
                    </button>
                    @if (config.enableDelete) {
                      <button class="action-trigger danger" (click)="confirmDelete(delivery)" title="Eliminar">
                        <lucide-icon name="trash-2" size="18"></lucide-icon>
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

          <div class="pagination-wrapper">
            <ui-josanz-pagination 
              [currentPage]="currentPage()" 
              [totalPages]="totalPages()"
              variant="minimal"
              (pageChange)="onPageChange($event)"
            ></ui-josanz-pagination>
          </div>
        </ui-josanz-card>
      }
    </div>

    <!-- Create/Edit Modal -->
    <ui-josanz-modal 
      [isOpen]="isModalOpen()" 
      [title]="editingDelivery() ? 'MANIFIESTO DE ENTREGA: EDITAR' : 'MANIFIESTO DE ENTREGA: NUEVO'"
      (closed)="closeModal()"
      variant="dark"
    >
      <div class="form-container">
        <div class="form-grid">
          <div class="form-col">
            <label class="field-label" for="delivery-budget">Ref. Presupuesto *</label>
            <input 
              type="text" 
              id="delivery-budget"
              class="technical-input"
              [(ngModel)]="formData.budgetId" 
              name="budgetId" 
              required
              placeholder="#PR-0000"
            >
          </div>
          
          <div class="form-col">
            <label class="field-label" for="delivery-client">Cliente Receptor *</label>
            <input 
              type="text" 
              id="delivery-client"
              class="technical-input"
              [(ngModel)]="formData.clientName" 
              name="clientName" 
              required
              placeholder="RAZÓN SOCIAL"
            >
          </div>
          
          <div class="form-col">
            <label class="field-label" for="delivery-status">Estado Logístico</label>
            <select id="delivery-status" class="technical-select" [(ngModel)]="formData.status" name="status">
              <option value="draft">BORRADOR</option>
              <option value="pending">PENDIENTE</option>
              <option value="signed">FIRMADO</option>
              <option value="completed">COMPLETADO</option>
            </select>
          </div>
          
          <div class="form-col">
            <label class="field-label" for="delivery-items">Items Consignados</label>
            <input 
              type="number" 
              id="delivery-items"
              class="technical-input"
              [(ngModel)]="formData.itemsCount" 
              name="itemsCount" 
              placeholder="0"
            >
          </div>
          
          <div class="form-col">
            <label class="field-label" for="delivery-date-out">Fecha Salida</label>
            <input 
              type="date" 
              id="delivery-date-out"
              class="technical-input"
              [(ngModel)]="formData.deliveryDate" 
              name="deliveryDate" 
            >
          </div>
          
          <div class="form-col">
            <label class="field-label" for="delivery-date-in">Fecha Retorno Prevista</label>
            <input 
              type="date" 
              id="delivery-date-in"
              class="technical-input"
              [(ngModel)]="formData.returnDate" 
              name="returnDate" 
            >
          </div>
          
          <div class="form-col full-width">
            <label class="field-label" for="delivery-notes">Observaciones de Entrega</label>
            <textarea 
              id="delivery-notes"
              class="technical-textarea"
              [(ngModel)]="formData.notes" 
              name="notes" 
              rows="3"
              placeholder="ESPECIFICACIONES ADICIONALES..."
            ></textarea>
          </div>
        </div>
      </div>
      
      <div modal-footer class="modal-footer">
        <ui-josanz-button variant="ghost" (clicked)="closeModal()">
          ABORTAR
        </ui-josanz-button>
        <ui-josanz-button 
          variant="primary"
          (clicked)="saveDelivery()"
          [disabled]="!formData.budgetId || !formData.clientName"
        >
          {{ editingDelivery() ? 'ACTUALIZAR REGISTRO' : 'CONFIRMAR MANIFIESTO' }}
        </ui-josanz-button>
      </div>
    </ui-josanz-modal>

    <!-- Signature Modal -->
    <ui-josanz-modal
      [isOpen]="isSignModalOpen()"
      title="SISTEMA CENTRAL: CERTIFICACIÓN DE ENTREGA"
      (closed)="closeSignModal()"
      variant="dark"
    >
      <div class="signature-terminal">
        <p class="intel-text">REGISTRE LA FIRMA DIGITAL PARA VALIDAR LA CONFORMIDAD DEL RECEPTOR:</p>
        <textarea 
          class="technical-textarea"
          [(ngModel)]="signatureText" 
          placeholder="INTRODUZCA FIRMA O CÓDIGO DE VERIFICACIÓN..."
          rows="4"
        ></textarea>
        <div class="legal-disclaimer">
          <lucide-icon name="shield-check" size="14"></lucide-icon>
          <span>Esta operación quedará registrada con marca de tiempo y coordenadas GPS en el histórico del expediente.</span>
        </div>
      </div>
      
      <div modal-footer>
        <ui-josanz-button variant="ghost" (clicked)="closeSignModal()">
          CANCELAR
        </ui-josanz-button>
        <ui-josanz-button variant="primary" (clicked)="confirmSign()">
          AUTORIZAR Y FIRMAR
        </ui-josanz-button>
      </div>
    </ui-josanz-modal>

    <!-- Delete Confirmation Modal -->
    <ui-josanz-modal
      [isOpen]="isDeleteModalOpen()"
      title="ADVERTENCIA: ELIMINACIÓN DE MANIFIESTO"
      (closed)="closeDeleteModal()"
      variant="dark"
    >
      <div class="delete-warning">
        <lucide-icon name="alert-triangle" class="warning-icon"></lucide-icon>
        <div class="warning-content">
          <p>¿Estás seguro de que deseas eliminar el albarán <strong>#{{ deliveryToDelete()?.id?.slice(0, 8) }}</strong>?</p>
          <p class="critical-text">ESTA ACCIÓN ES IRREVERSIBLE Y ELIMINARÁ EL REGISTRO LOGÍSTICO COMPLETO.</p>
        </div>
      </div>
      
      <div modal-footer>
        <ui-josanz-button variant="ghost" (clicked)="closeDeleteModal()">
          CANCELAR
        </ui-josanz-button>
        <ui-josanz-button variant="danger" (clicked)="deleteDelivery()">
          ELIMINAR DEFINITIVAMENTE
        </ui-josanz-button>
      </div>
    </ui-josanz-modal>
  `,
  styles: [`
    .page-container { padding: 2rem; }
    
    .page-header {
      display: flex; 
      justify-content: space-between; 
      align-items: center;
      margin-bottom: 2rem;
      border-bottom: 1px solid var(--border-soft);
      padding-bottom: 1.5rem;
    }
    
    .glow-text { 
      font-size: 2.5rem; 
      font-weight: 900; 
      color: #fff; 
      margin: 0; 
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-family: var(--font-display);
      text-shadow: 0 0 20px var(--brand-glow);
    }
    
    .subtitle { margin: 0.5rem 0 0 0; color: var(--text-secondary); font-size: 0.9rem; font-weight: 500; }
    
    .filters-bar { margin-bottom: 2rem; display: flex; }
    .flex-1 { flex: 1; }
    
    .delivery-link { 
      color: var(--brand); 
      text-decoration: none; 
      font-weight: 900; 
      text-transform: uppercase; 
      letter-spacing: 0.1em;
      font-family: var(--font-display);
      transition: all 0.2s;
    }
    .delivery-link:hover { color: #fff; text-shadow: 0 0 10px var(--brand-glow); }
    
    .date-text { color: var(--text-muted); font-size: 0.85rem; font-weight: 600; }
    .actions { display: flex; gap: 8px; }
    
    .action-trigger { 
      background: var(--bg-tertiary); 
      border: 1px solid var(--border-soft); 
      color: var(--text-muted); 
      cursor: pointer; 
      width: 32px;
      height: 32px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }
    
    .action-trigger:hover { 
      color: #fff; 
      border-color: var(--brand);
      background: var(--bg-secondary);
      box-shadow: 0 0 10px var(--brand-glow);
    }
    
    .action-trigger.success:hover { border-color: var(--success); color: var(--success); box-shadow: 0 0 10px rgba(52, 211, 153, 0.4); }
    .action-trigger.info:hover { border-color: var(--info); color: var(--info); box-shadow: 0 0 10px rgba(96, 165, 250, 0.4); }
    .action-trigger.danger:hover {
      border-color: var(--danger);
      box-shadow: 0 0 10px rgba(239, 68, 68, 0.4);
    }

    .pagination-wrapper {
      padding-top: 1rem;
      border-top: 1px solid var(--border-soft);
      margin-top: 1rem;
    }

    /* Form Styles */
    .form-container { padding: 1rem 0; }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
    .form-col { display: flex; flex-direction: column; gap: 8px; }
    .form-col.full-width { grid-column: 1 / -1; }
    
    .field-label {
      font-size: 0.7rem;
      font-weight: 800;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    
    .technical-input, .technical-select, .technical-textarea {
      background: var(--bg-tertiary);
      border: 1px solid var(--border-soft);
      border-radius: 4px;
      padding: 12px 14px;
      color: #fff;
      font-size: 0.9rem;
      font-family: var(--font-main);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      outline: none;
      resize: vertical;
    }
    
    .technical-input:focus, .technical-select:focus, .technical-textarea:focus {
      border-color: var(--brand);
      background: var(--bg-secondary);
      box-shadow: 0 0 15px var(--brand-glow);
    }

    .technical-select option { background: var(--bg-secondary); color: #fff; }

    .signature-terminal { padding: 1rem 0; }
    .intel-text { font-size: 0.75rem; color: var(--text-muted); font-weight: 700; margin-bottom: 1rem; }
    
    .legal-disclaimer {
      margin-top: 1rem;
      display: flex;
      gap: 8px;
      align-items: flex-start;
      color: var(--text-muted);
      font-size: 0.7rem;
      line-height: 1.4;
    }
    .legal-disclaimer lucide-icon { color: var(--success); flex-shrink: 0; }

    .delete-warning {
      display: flex;
      gap: 20px;
      align-items: center;
      padding: 1rem;
      background: rgba(239, 68, 68, 0.05);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 6px;
    }
    
    .warning-icon { color: var(--danger); width: 40px; height: 40px; }
    
    .critical-text {
      color: var(--danger);
      font-weight: 800;
      font-size: 0.75rem;
      margin-top: 8px;
      text-transform: uppercase;
    }

    .mr-2 { margin-right: 8px; }

    @media (max-width: 768px) {
      .form-grid { grid-template-columns: 1fr; }
      .glow-text { font-size: 1.8rem; }
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
    const deliveryToDelete = this.deliveryToDelete();
    if (!deliveryToDelete) return;

    this.facade.deleteDeliveryNote(deliveryToDelete.id);
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
    const deliveryToSign = this.deliveryToSign();
    if (!deliveryToSign) return;

    this.facade.signDeliveryNote(deliveryToSign.id, this.signatureText);
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

