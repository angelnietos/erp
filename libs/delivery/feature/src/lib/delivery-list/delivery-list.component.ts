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
  UiInputComponent,
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
    UiInputComponent,
    LucideAngularModule
  ],
  template: `
    <div class="page-container animate-fade-in">
      <header class="page-header">
        <div class="header-main">
          <h1 class="page-title text-uppercase">Gestión de Albaranes</h1>
          <div class="breadcrumb">
            <span class="active">LOGÍSTICA INTEGRAL</span>
            <span class="separator">/</span>
            <span>MANIFIESTOS DE CARGA</span>
          </div>
        </div>
        @if (config.enableCreate) {
          <ui-josanz-button variant="primary" size="md" (clicked)="openCreateModal()" icon="plus">
            NUEVO ALBARÁN
          </ui-josanz-button>
        }
      </header>

      <div class="navigation-bar">
        <ui-josanz-search 
          variant="filled"
          placeholder="BUSCAR Nº ALBARÁN, CLIENTE O PRESUPUESTO..." 
          (searchChange)="onSearch($event)"
          class="search-bar"
        ></ui-josanz-search>
      </div>

      @if (isLoading()) {
        <div class="loader-container">
          <ui-josanz-loader message="SINCRONIZANDO MANIFIESTOS DE ENTREGA..."></ui-josanz-loader>
        </div>
      } @else {
        <ui-josanz-card variant="glass" class="table-card">
          <ui-josanz-table [columns]="columns" [data]="deliveryNotes()" variant="default">
            <ng-template #cellTemplate let-delivery let-key="key">
              @switch (key) {
                @case ('id') {
                  <a [routerLink]="['/delivery', delivery.id]" class="delivery-link">
                    #{{ delivery.id.slice(0, 8) | uppercase }}
                  </a>
                }
                @case ('status') {
                  <ui-josanz-badge [variant]="getStatusVariant(delivery.status)">
                    {{ getStatusLabel(delivery.status) | uppercase }}
                  </ui-josanz-badge>
                }
                @case ('deliveryDate') {
                  <span class="text-secondary font-mono">{{ formatDate(delivery.deliveryDate) }}</span>
                }
                @case ('returnDate') {
                  <span class="text-secondary font-mono">{{ formatDate(delivery.returnDate) }}</span>
                }
                @case ('actions') {
                  <div class="row-actions">
                    <button class="action-btn" [routerLink]="['/delivery', delivery.id]" title="Detalles">
                      <lucide-icon name="eye" size="16"></lucide-icon>
                    </button>
                    @if (delivery.status === 'pending' && config.enableSign) {
                      <button class="action-btn success" title="Firmar" (click)="signDelivery(delivery)">
                        <lucide-icon name="pen-tool" size="15"></lucide-icon>
                      </button>
                    }
                    @if (delivery.status === 'signed') {
                      <button class="action-btn info" title="Completar" (click)="completeDelivery(delivery)">
                        <lucide-icon name="check-circle" size="16"></lucide-icon>
                      </button>
                    }
                    <button class="action-btn" (click)="editDelivery(delivery)" title="Editar">
                      <lucide-icon name="pencil" size="16"></lucide-icon>
                    </button>
                    @if (config.enableDelete) {
                      <button class="action-btn danger" (click)="confirmDelete(delivery)" title="Eliminar">
                        <lucide-icon name="trash-2" size="16"></lucide-icon>
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

          <footer class="table-footer">
            <div class="table-info text-uppercase">
              {{ deliveryNotes().length }} ALBARANES EN OPERACIÓN
            </div>
            <ui-josanz-pagination 
              [currentPage]="currentPage()" 
              [totalPages]="totalPages()"
              variant="default"
              (pageChange)="onPageChange($event)"
            ></ui-josanz-pagination>
          </footer>
        </ui-josanz-card>
      }
    </div>

    <!-- Create/Edit Modal -->
    <ui-josanz-modal 
      [isOpen]="isModalOpen()" 
      [title]="editingDelivery() ? 'MODIFICACIÓN DE MANIFIESTO' : 'REGISTRO DE NUEVA ENTREGA'"
      (closed)="closeModal()"
      variant="dark"
    >
      <div class="form-grid">
        <div class="form-section">
          <h3 class="section-title text-uppercase">Vinculación y Destino</h3>
          <div class="input-row">
            <ui-josanz-input 
              label="Ref. Presupuesto" 
              [(ngModel)]="formData.budgetId" 
              placeholder="#PR-0000"
              icon="search"
              id="delivery-budget"
            ></ui-josanz-input>
            
            <ui-josanz-input 
              label="Cliente Receptor" 
              [(ngModel)]="formData.clientName" 
              placeholder="RAZÓN SOCIAL..."
              icon="user"
              id="delivery-client"
            ></ui-josanz-input>
          </div>
        </div>

        <div class="form-section">
          <h3 class="section-title text-uppercase">Logística y Tiempos</h3>
          <div class="input-row">
            <ui-josanz-input 
              label="Fecha Salida" 
              type="date" 
              [(ngModel)]="formData.deliveryDate" 
              icon="calendar"
              id="delivery-date-out"
            ></ui-josanz-input>
            
            <ui-josanz-input 
              label="Retorno Previsto" 
              type="date" 
              [(ngModel)]="formData.returnDate" 
              icon="calendar-check"
              id="delivery-date-in"
            ></ui-josanz-input>
          </div>
        </div>

        <div class="form-section">
          <h3 class="section-title text-uppercase">Contenido y Notas</h3>
          <ui-josanz-input 
            label="Items Consignados" 
            type="number" 
            [(ngModel)]="formData.itemsCount" 
            icon="box"
            id="delivery-items"
          ></ui-josanz-input>
          
          <div class="form-group">
            <label for="delivery-notes" class="field-label text-uppercase">Observaciones de Operación</label>
            <textarea 
              id="delivery-notes"
              class="tech-textarea"
              [(ngModel)]="formData.notes" 
              rows="3"
              placeholder="ESPECIFICACIONES ADICIONALES PARA LA ENTREGA..."
            ></textarea>
          </div>
        </div>
      </div>
      
      <div modal-footer class="modal-actions">
        <ui-josanz-button variant="ghost" (clicked)="closeModal()">CANCELAR</ui-josanz-button>
        <ui-josanz-button 
          variant="glass"
          (clicked)="saveDelivery()"
          [disabled]="!formData.budgetId || !formData.clientName"
        >
          <lucide-icon name="save" size="18" class="mr-2"></lucide-icon>
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
      <div class="modal-content-tech">
        <div class="terminal-msg text-uppercase">
          <lucide-icon name="shield-check" size="20" class="mr-2 text-success"></lucide-icon>
          Registre la firma digital para validar la conformidad:
        </div>
        
        <textarea 
          class="tech-textarea signature-pad"
          [(ngModel)]="signatureText" 
          placeholder="INTRODUZCA FIRMA O CÓDIGO DE VERIFICACIÓN..."
          rows="5"
        ></textarea>
        
        <div class="disclaimer-alert">
          <lucide-icon name="info" size="16"></lucide-icon>
          <span>Operación rastreada con telemetría GPS y timestamp legal.</span>
        </div>
      </div>
      
      <div modal-footer class="modal-actions">
        <ui-josanz-button variant="ghost" (clicked)="closeSignModal()">ABORTAR</ui-josanz-button>
        <ui-josanz-button variant="primary" (clicked)="confirmSign()">
          AUTORIZAR Y FIRMAR
        </ui-josanz-button>
      </div>
    </ui-josanz-modal>

    <!-- Delete Confirmation Modal -->
    <ui-josanz-modal
      [isOpen]="isDeleteModalOpen()"
      title="SISTEMA: ADVERTENCIA DE ELIMINACIÓN"
      (closed)="closeDeleteModal()"
      variant="dark"
    >
      <div class="delete-warning">
        <lucide-icon name="alert-triangle" size="40" class="warning-icon"></lucide-icon>
        <div class="warning-content">
          <p class="text-uppercase">¿ESTÁ SEGURO DE QUE DESEA ELIMINAR EL ALBARÁN <strong>#{{ deliveryToDelete()?.id?.slice(0, 8) | uppercase }}</strong>?</p>
          <p class="critical-text text-uppercase">ESTA ACCIÓN ES IRREVERSIBLE. SE ELIMINARÁ EL MANIFIESTO DEL HISTÓRICO LOGÍSTICO.</p>
        </div>
      </div>
      
      <div modal-footer class="modal-actions">
        <ui-josanz-button variant="ghost" (clicked)="closeDeleteModal()">ABORTAR</ui-josanz-button>
        <ui-josanz-button variant="danger" (clicked)="deleteDelivery()">CONFIRMAR BAJA</ui-josanz-button>
      </div>
    </ui-josanz-modal>
  `,
  styles: [`
    .page-container { padding: 2.5rem; max-width: 1600px; margin: 0 auto; }
    
    .page-header {
      display: flex; 
      justify-content: space-between; 
      align-items: flex-end;
      margin-bottom: 3rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-soft);
    }
    
    .page-title { 
      font-size: 2.25rem; 
      font-weight: 900; 
      color: #fff; 
      margin: 0 0 0.5rem 0; 
      letter-spacing: -0.02em;
      font-family: var(--font-display);
    }
    
    .breadcrumb {
      display: flex;
      gap: 8px;
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: 0.15em;
      color: var(--text-muted);
    }
    .breadcrumb .active { color: var(--brand); }
    .breadcrumb .separator { opacity: 0.3; }
    
    .navigation-bar { margin-bottom: 2rem; }
    .search-bar { max-width: 450px; }
    
    .delivery-link { 
      color: var(--brand); 
      text-decoration: none; 
      font-weight: 800; 
      font-family: var(--font-mono);
      font-size: 0.75rem;
      letter-spacing: 0.05em;
      transition: var(--transition-fast);
    }
    .delivery-link:hover { color: #fff; text-decoration: underline; }
    
    .row-actions { display: flex; gap: 6px; }
    
    .action-btn { 
      background: var(--bg-tertiary); 
      border: 1px solid var(--border-soft); 
      color: var(--text-secondary); 
      cursor: pointer; 
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: var(--transition-base);
    }
    
    .action-btn:hover { 
      color: #fff; 
      border-color: var(--brand);
      background: var(--brand-muted);
      transform: translateY(-2px);
    }
    
    .action-btn.success:hover { background: var(--success); border-color: var(--success); }
    .action-btn.info:hover { background: var(--info); border-color: var(--info); }
    .action-btn.danger:hover { background: var(--danger); border-color: var(--danger); }

    .table-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      background: rgba(0, 0, 0, 0.1);
      border-top: 1px solid var(--border-soft);
    }

    .table-info { font-size: 0.65rem; font-weight: 800; color: var(--text-muted); letter-spacing: 0.1em; }

    /* Form Styles */
    .form-grid { display: flex; flex-direction: column; gap: 2.5rem; padding: 1rem 0; }
    .form-section { display: flex; flex-direction: column; gap: 1.5rem; }
    .section-title { 
      font-size: 0.75rem; 
      color: var(--brand); 
      letter-spacing: 0.2em; 
      font-weight: 900; 
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border-soft);
    }
    .input-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
    
    .field-label { font-size: 0.65rem; font-weight: 800; color: var(--text-secondary); margin-bottom: 6px; }
    
    .tech-textarea {
      width: 100%;
      padding: 1rem 1.2rem;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-soft);
      border-radius: var(--radius-md);
      color: #fff;
      font-size: 0.85rem;
      font-family: var(--font-main);
      outline: none;
      transition: var(--transition-base);
      resize: vertical;
    }
    .tech-textarea:focus { border-color: var(--brand); background: var(--bg-secondary); }

    .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; }

    .modal-content-tech { display: flex; flex-direction: column; gap: 1.5rem; }
    .terminal-msg { font-size: 0.75rem; font-weight: 800; color: var(--text-secondary); display: flex; align-items: center; }
    .signature-pad { background: #000; border: 1px dashed var(--border-medium); font-family: 'Courier New', monospace; letter-spacing: 0.1em; }
    .disclaimer-alert { 
      padding: 0.75rem 1rem; 
      background: rgba(255, 255, 255, 0.03); 
      border-left: 3px solid var(--brand); 
      font-size: 0.65rem; 
      color: var(--text-muted);
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .delete-warning {
      display: flex;
      gap: 20px;
      align-items: center;
      padding: 1.5rem;
      background: rgba(239, 68, 68, 0.05);
      border-radius: var(--radius-md);
    }
    .warning-icon { color: var(--danger); }
    .critical-text { color: var(--danger); font-weight: 800; font-size: 0.7rem; margin-top: 8px; opacity: 0.8; }

    .mr-2 { margin-right: 8px; }

    @media (max-width: 1024px) {
      .input-row { grid-template-columns: 1fr; }
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
  
  isModalOpen = signal(false);
  isDeleteModalOpen = signal(false);
  isSignModalOpen = signal(false);
  editingDelivery = signal<DeliveryNote | null>(null);
  deliveryToDelete = signal<DeliveryNote | null>(null);
  deliveryToSign = signal<DeliveryNote | null>(null);
  signatureText = '';
  
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
