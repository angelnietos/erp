import { Component, OnInit, signal, inject, computed, ChangeDetectionStrategy } from '@angular/core';
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
  UiTextareaComponent,
  UiStatCardComponent,
} from '@josanz-erp/shared-ui-kit';
import { ThemeService, PluginStore, MasterFilterService, FilterableService } from '@josanz-erp/shared-data-access';
import { Observable, of } from 'rxjs';
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
    UiTextareaComponent,
    UiStatCardComponent,
    LucideAngularModule,
  ],
  template: `
    <div class="page-container animate-fade-in" [class.perf-optimized]="pluginStore.highPerformanceMode()">
      <header class="page-header" [style.border-bottom-color]="currentTheme().primary + '33'">
        <div class="header-breadcrumb">
          <h1 class="page-title text-uppercase glow-text" [style.text-shadow]="'0 0 20px ' + currentTheme().primary + '44'">
            Logística / Albaranes
          </h1>
          <div class="breadcrumb">
            <span class="active" [style.color]="currentTheme().primary">GESTIÓN OPERATIVA</span>
            <span class="separator">/</span>
            <span>MANIFIESTOS DE CARGA</span>
          </div>
        </div>
        <div class="header-actions">
           @if (config.enableCreate) {
             <ui-josanz-button variant="glass" size="md" (clicked)="openCreateModal()" icon="plus">
               NUEVO ALBARÁN
             </ui-josanz-button>
           }
        </div>
      </header>

      <div class="stats-row">
        <ui-josanz-stat-card 
          label="Salidas Hoy" 
          [value]="todayCount().toString()" 
          icon="truck" 
          [accent]="true">
        </ui-josanz-stat-card>
        <ui-josanz-stat-card 
          label="Pendientes Firma" 
          [value]="pendingCount().toString()" 
          icon="pen-tool" 
          [trend]="2">
        </ui-josanz-stat-card>
        <ui-josanz-stat-card 
          label="Retornos Operativos" 
          [value]="returnCount().toString()" 
          icon="rotate-ccw">
        </ui-josanz-stat-card>
      </div>

      <div class="navigation-bar ui-glass-panel">
        <ui-josanz-search 
          variant="filled"
          placeholder="BUSCAR Nº ALBARÁN, CLIENTE O REFERENCIA..." 
          (searchChange)="onSearch($event)"
          class="search-bar"
        ></ui-josanz-search>
      </div>

      @if (isLoading()) {
        <div class="loader-container">
          <ui-josanz-loader message="SINCRONIZANDO MANIFIESTOS LOGÍSTICOS..."></ui-josanz-loader>
        </div>
      } @else {
        <ui-josanz-card variant="glass" class="table-card" [class.neon-glow]="!pluginStore.highPerformanceMode()">
          <ui-josanz-table [columns]="columns" [data]="filteredDeliveryNotes()" variant="default">
            <ng-template #cellTemplate let-delivery let-key="key">
              @switch (key) {
                @case ('id') {
                  <a [routerLink]="['/delivery', delivery.id]" class="delivery-link" [style.color]="currentTheme().primary">
                    #{{ delivery.id.slice(0, 8) | uppercase }}
                  </a>
                }
                @case ('status') {
                  <ui-josanz-badge [variant]="getStatusVariant(delivery.status)">
                    {{ getStatusLabel(delivery.status) | uppercase }}
                  </ui-josanz-badge>
                }
                @case ('actions') {
                  <div class="row-actions">
                    <ui-josanz-button variant="ghost" size="sm" icon="eye" [routerLink]="['/delivery', delivery.id]"></ui-josanz-button>
                    @if (delivery.status === 'pending' && config.enableSign) {
                       <ui-josanz-button variant="ghost" size="sm" icon="pen-tool" (clicked)="signDelivery(delivery)" [style.color]="currentTheme().success"></ui-josanz-button>
                    }
                    @if (delivery.status === 'signed') {
                       <ui-josanz-button variant="ghost" size="sm" icon="check-circle" (clicked)="completeDelivery(delivery)" [style.color]="currentTheme().info"></ui-josanz-button>
                    }
                    <ui-josanz-button variant="ghost" size="sm" icon="pencil" (clicked)="editDelivery(delivery)"></ui-josanz-button>
                  </div>
                }
                @default {
                   {{ delivery[key] }}
                }
              }
            </ng-template>
          </ui-josanz-table>

          <footer class="table-footer" [style.background]="currentTheme().primary + '05'">
            <div class="table-info uppercase">
              {{ filteredDeliveryNotes().length }} ALBARANES ENCONTRADOS
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
         <ui-josanz-input label="Referencia Presupuesto" [(ngModel)]="formData.budgetId" placeholder="#PR-0000" icon="file-text"></ui-josanz-input>
         <ui-josanz-input label="Cliente Receptor" [(ngModel)]="formData.clientName" placeholder="RAZÓN SOCIAL..." icon="user"></ui-josanz-input>
         <ui-josanz-input label="Fecha de Salida" type="date" [(ngModel)]="formData.deliveryDate" icon="calendar"></ui-josanz-input>
         <ui-josanz-input label="Retorno Previsto" type="date" [(ngModel)]="formData.returnDate" icon="rotate-ccw"></ui-josanz-input>
         <ui-josanz-input label="Unidades Consignadas" type="number" [(ngModel)]="formData.itemsCount" icon="box" class="full-width"></ui-josanz-input>
         <ui-josanz-textarea label="Notas de Operación" [(ngModel)]="formData.notes" [rows]="3" placeholder="OBSERVACIONES..." variant="filled" class="full-width"></ui-josanz-textarea>
      </div>
      
      <div modal-footer class="modal-footer">
        <ui-josanz-button variant="ghost" (clicked)="closeModal()">CANCELAR</ui-josanz-button>
        <ui-josanz-button variant="glass" (clicked)="saveDelivery()" [disabled]="!formData.budgetId || !formData.clientName">
           {{ editingDelivery() ? 'ACTUALIZAR REGISTRO' : 'CONFIRMAR MANIFIESTO' }}
        </ui-josanz-button>
      </div>
    </ui-josanz-modal>

  `,
  styles: [`
    .page-container { padding: 0; max-width: 100%; margin: 0 auto; }
    
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-end;
      margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    
    .glow-text { 
      font-size: 1.6rem; font-weight: 800; color: #fff; margin: 0; 
      letter-spacing: 0.05em; font-family: var(--font-main);
    }
    
    .breadcrumb {
      display: flex; gap: 8px; font-size: 0.6rem; font-weight: 700;
      letter-spacing: 0.1em; color: var(--text-muted); margin-top: 0.5rem;
    }
    
    .stats-row { 
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; 
    }

    .navigation-bar { 
      display: flex; gap: 1rem; margin-bottom: 1.5rem; padding: 0.75rem 1rem; border-radius: 12px;
      background: rgba(15, 15, 15, 0.4); border: 1px solid rgba(255,255,255,0.05);
    }

    .search-bar { flex: 1; width: 100%; }
    
    .delivery-link { 
      text-decoration: none; font-weight: 800; font-family: var(--font-mono); font-size: 0.75rem;
      letter-spacing: 0.05em; transition: 0.2s;
    }
    .delivery-link:hover { color: #fff !important; text-shadow: 0 0 10px var(--brand-glow); }
    
    .row-actions { display: flex; gap: 4px; }
    
    .table-card { border-radius: 16px; overflow: hidden; }
    .neon-glow { box-shadow: 0 0 40px rgba(0, 0, 0, 0.4), inset 0 0 1px rgba(255, 255, 255, 0.1); }

    .table-footer {
      display: flex; justify-content: space-between; align-items: center;
      padding: 0.75rem 1.25rem; border-top: 1px solid rgba(255,255,255,0.05);
    }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; padding: 1rem 0; }
    .full-width { grid-column: 1 / -1; }
    .modal-footer { display: flex; gap: 1rem; justify-content: flex-end; }

    @media (max-width: 1024px) {
      .stats-row { grid-template-columns: 1fr; }
      .form-grid { grid-template-columns: 1fr; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeliveryListComponent implements OnInit, FilterableService<DeliveryNote> {
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);
  private readonly facade = inject(DeliveryFacade);
  public readonly config = inject(DELIVERY_FEATURE_CONFIG);
  private readonly masterFilter = inject(MasterFilterService);

  currentTheme = this.themeService.currentThemeData;
  columns = this.config.defaultColumns;

  deliveryNotes = this.facade.deliveryNotes;
  isLoading = this.facade.isLoading;
  currentPage = signal(1);
  totalPages = signal(1);
  
  isModalOpen = signal(false);
  editingDelivery = signal<DeliveryNote | null>(null);
  
  formData: Partial<DeliveryNote> = {
    budgetId: '', clientName: '', status: 'draft', deliveryDate: '', returnDate: '', itemsCount: 0, notes: ''
  };

  filteredDeliveryNotes = computed(() => {
    const list = this.deliveryNotes();
    const t = this.masterFilter.query().trim().toLowerCase();
    if (!t) return list;
    return list.filter(d => 
      d.budgetId.toLowerCase().includes(t) || 
      (d.clientName ?? '').toLowerCase().includes(t) ||
      (d.notes ?? '').toLowerCase().includes(t)
    );
  });

  ngOnInit() {
    this.masterFilter.registerProvider(this);
    this.loadDeliveryNotes();
  }

  ngOnDestroy() {
    this.masterFilter.unregisterProvider();
  }

  loadDeliveryNotes() { this.facade.loadDeliveryNotes(); }

  onSearch(term: string) {
    this.masterFilter.search(term);
    // Filtrado local vía computed
  }

  filter(query: string): Observable<DeliveryNote[]> {
    const term = query.toLowerCase();
    const matches = this.deliveryNotes().filter(d => 
      d.budgetId.toLowerCase().includes(term) || 
      (d.clientName ?? '').toLowerCase().includes(term)
    );
    return of(matches);
  }

  onPageChange(page: number) { this.currentPage.set(page); this.loadDeliveryNotes(); }

  openCreateModal() {
    this.editingDelivery.set(null);
    this.formData = { budgetId: '', clientName: '', status: 'draft', deliveryDate: new Date().toISOString().split('T')[0], returnDate: '', itemsCount: 0, notes: '' };
    this.isModalOpen.set(true);
  }

  editDelivery(delivery: DeliveryNote) {
    this.editingDelivery.set(delivery);
    this.formData = { ...delivery };
    this.isModalOpen.set(true);
  }

  closeModal() { this.isModalOpen.set(false); this.editingDelivery.set(null); }

  saveDelivery() {
    if (!this.formData.budgetId || !this.formData.clientName) return;
    const toEdit = this.editingDelivery();
    if (toEdit) this.facade.updateDeliveryNote(toEdit.id, this.formData);
    else this.facade.createDeliveryNote(this.formData as Omit<DeliveryNote, 'id'>);
    this.closeModal();
  }

  signDelivery(delivery: DeliveryNote) {
    const signature = prompt('Introduzca firma de conformidad (Digital ID):');
    if (signature) this.facade.signDeliveryNote(delivery.id, signature);
  }

  completeDelivery(delivery: DeliveryNote) { this.facade.completeDeliveryNote(delivery.id); }

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

  todayCount = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.deliveryNotes().filter(d => d.deliveryDate === today).length;
  });
  
  pendingCount = computed(() => this.deliveryNotes().filter(d => d.status === 'pending').length);
  returnCount = computed(() => this.deliveryNotes().filter(d => d.status === 'signed' || d.status === 'completed').length);
}
