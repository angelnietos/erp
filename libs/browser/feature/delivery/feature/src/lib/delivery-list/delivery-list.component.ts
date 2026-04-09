import { 
  UiButtonComponent, 
  UiSearchComponent, 
  UiBadgeComponent, 
  UiLoaderComponent, 
  UiModalComponent, 
  UiInputComponent, 
  UiTextareaComponent, 
  UiStatCardComponent,
  UiFeatureHeaderComponent,
  UiFeatureStatsComponent,
  UiFeatureGridComponent,
  UiFeatureCardComponent,
} from '@josanz-erp/shared-ui-kit';

@Component({
  selector: 'lib-delivery-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule,
    UiButtonComponent, 
    UiSearchComponent, 
    UiBadgeComponent,
    UiLoaderComponent,
    UiModalComponent,
    UiInputComponent,
    UiTextareaComponent,
    UiStatCardComponent,
    UiFeatureHeaderComponent,
    UiFeatureStatsComponent,
    UiFeatureGridComponent,
    UiFeatureCardComponent,
    LucideAngularModule,
  ],
  template: `
    <div class="delivery-container">
      <ui-feature-header
        title="Albaranes"
        subtitle="Gestión de manifiestos logísticos y manifiestos de carga"
        icon="truck"
        actionLabel="NUEVO ALBARÁN"
        (actionClicked)="openCreateModal()"
      ></ui-feature-header>

      <ui-feature-stats>
        <ui-stat-card 
          label="Salidas Hoy" 
          [value]="todayCount().toString()" 
          icon="truck" 
          [accent]="true">
        </ui-stat-card>
        <ui-stat-card 
          label="Pendientes Firma" 
          [value]="pendingCount().toString()" 
          icon="pen-tool" 
          [trend]="2">
        </ui-stat-card>
        <ui-stat-card 
          label="Retornos Realizados" 
          [value]="returnCount().toString()" 
          icon="rotate-ccw">
        </ui-stat-card>
        <ui-stat-card
          label="Entregas a Tiempo"
          value="94%"
          icon="timer"
          [accent]="false"
        ></ui-stat-card>
      </ui-feature-stats>

      <div class="navigation-bar">
        <ui-search 
          variant="glass"
          placeholder="BUSCAR Nº ALBARÁN, CLIENTE O REFERENCIA..." 
          (searchChange)="onSearch($event)"
          class="flex-1"
        ></ui-search>
      </div>

      @if (isLoading()) {
        <div class="loader-container">
          <ui-loader message="SINCRONIZANDO MANIFIESTOS..."></ui-loader>
        </div>
      } @else {
        <ui-feature-grid>
          @for (delivery of filteredDeliveryNotes(); track delivery.id) {
            <ui-feature-card
              [name]="delivery.clientName || 'Sin cliente'"
              [subtitle]="'Ref: ' + delivery.budgetId"
              [avatarInitials]="getInitials(delivery.budgetId)"
              [avatarBackground]="getStatusGradient(delivery.status)"
              [status]="(delivery.status === 'signed' || delivery.status === 'completed') ? 'active' : 'offline'"
              [badgeLabel]="getStatusLabel(delivery.status) | uppercase"
              [badgeVariant]="getStatusVariant(delivery.status)"
              (cardClicked)="onRowClick(delivery)"
              [footerItems]="[
                { icon: 'calendar', label: delivery.deliveryDate },
                { icon: 'box', label: delivery.itemsCount + ' bultos' }
              ]"
            >
               <div footer-extra class="card-actions">
                  <ui-button variant="ghost" size="sm" icon="eye" [routerLink]="['/delivery', delivery.id]"></ui-button>
                  @if (delivery.status === 'pending') {
                    <ui-button variant="ghost" size="sm" icon="pen-tool" (click)="$event.stopPropagation(); signDelivery(delivery)" class="text-success"></ui-button>
                  }
                  <ui-button variant="ghost" size="sm" icon="pencil" (click)="$event.stopPropagation(); editDelivery(delivery)"></ui-button>
               </div>
            </ui-feature-card>
          } @empty {
            <div class="empty-state">
              <lucide-icon name="truck" size="64" class="empty-icon"></lucide-icon>
              <h3>Sin albaranes</h3>
              <p>No hay registros logísticos que coincidan con la búsqueda.</p>
              <ui-button variant="solid" (clicked)="openCreateModal()" icon="CirclePlus">Crear albarán</ui-button>
            </div>
          }
        </ui-feature-grid>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <ui-modal 
      [isOpen]="isModalOpen()" 
      [title]="editingDelivery() ? 'MODIFICACIÓN DE ALBARÁN' : 'NUEVO ALBARÁN'"
      (closed)="closeModal()"
      variant="dark"
    >
      <div class="form-grid">
         <ui-input label="Referencia Presupuesto" [(ngModel)]="formData.budgetId" placeholder="#PR-0000" icon="file-text"></ui-input>
         <ui-input label="Cliente Receptor" [(ngModel)]="formData.clientName" placeholder="RAZÓN SOCIAL..." icon="user"></ui-input>
         <ui-input label="Fecha de Salida" type="date" [(ngModel)]="formData.deliveryDate" icon="calendar"></ui-input>
         <ui-input label="Retorno Previsto" type="date" [(ngModel)]="formData.returnDate" icon="rotate-ccw"></ui-input>
         <ui-input label="Unidades Consignadas" type="number" [(ngModel)]="formData.itemsCount" icon="box" class="full-width"></ui-input>
         <ui-textarea label="Notas de Operación" [(ngModel)]="formData.notes" [rows]="3" placeholder="OBSERVACIONES..." variant="filled" class="full-width"></ui-textarea>
      </div>
      
      <div modal-footer class="modal-footer-box">
        <ui-button variant="ghost" (clicked)="closeModal()">CANCELAR</ui-button>
        <ui-button variant="glass" (clicked)="saveDelivery()" [disabled]="!formData.budgetId || !formData.clientName">
           {{ editingDelivery() ? 'ACTUALIZAR' : 'CONFIRMAR' }}
        </ui-button>
      </div>
    </ui-modal>
  `,
  styles: [`
    .delivery-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    .navigation-bar {
      margin-bottom: 2rem;
      background: var(--surface);
      padding: 0.75rem 1.5rem;
      border-radius: 16px;
      border: 1px solid var(--border-soft);
      display: flex;
    }

    .flex-1 { flex: 1; }
    .card-actions { display: flex; gap: 0.25rem; }
    .text-success { color: var(--success) !important; }

    .loader-container { display: flex; justify-content: center; padding: 5rem; }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; padding: 1rem 0; }
    .full-width { grid-column: 1 / -1; }
    .modal-footer-box { display: flex; gap: 1rem; justify-content: flex-end; padding-top: 1rem; }

    .empty-state {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 5rem;
      text-align: center;
      background: var(--surface);
      border-radius: 20px;
      border: 2px dashed var(--border-soft);
    }
    .empty-icon { color: var(--text-muted); opacity: 0.3; margin-bottom: 1.5rem; }

    @media (max-width: 900px) {
       .navigation-bar { padding: 1rem; }
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

  onRowClick(delivery: DeliveryNote) {
    // Navigate
  }

  getInitials(id: string): string {
    return id.slice(0, 2).toUpperCase();
  }

  getStatusGradient(status: string): string {
    switch (status) {
      case 'signed': return 'linear-gradient(135deg, #10b981, #059669)';
      case 'completed': return 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
      case 'pending': return 'linear-gradient(135deg, #f59e0b, #d97706)';
      default: return 'linear-gradient(135deg, #6b7280, #374151)';
    }
  }

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
