@Component({
  selector: 'lib-billing-list',
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
    UiInputComponent,
    UiSelectComponent,
    UiTabsComponent,
    LucideAngularModule
  ],
  template: `...`, // (sin cambios)
  styles: [`
    .page-container { padding: 24px; }
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 24px;
    }
    .header-content h1 { margin: 0 0 4px 0; color: white; font-size: 28px; font-weight: 700; }
    .subtitle { margin: 0; color: #94A3B8; font-size: 14px; }
    .filters-bar { display: flex; gap: 16px; margin: 20px 0; }
    .invoice-link { color: #4F46E5; text-decoration: none; font-weight: 600; font-family: monospace; }
    .invoice-link:hover { text-decoration: underline; }
    .overdue { color: #EF4444; }
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
    .form-group label {
      color: #94A3B8;
      font-size: 13px;
      font-weight: 500;
    }
    .form-group input,
    .form-group select {
      background: #0F172A;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 10px 12px;
      color: white;
      font-size: 14px;
      transition: border-color 0.2s;
    }
    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: #4F46E5;
    }
    .form-group input::placeholder {
      color: #64748B;
    }
    .verifactu {
      color: #0ea5e9;
    }
    .verifactu:hover {
      background: rgba(14, 165, 233, 0.15);
    }
    .verifactu-qr {
      color: #22c55e;
    }
    .verifactu-qr:hover {
      background: rgba(34, 197, 94, 0.15);
    }
  `], // 👈 AQUÍ estaba el fallo (faltaba cerrar correctamente el backtick)
})
export class BillingListComponent implements OnInit {
  public readonly config = inject(BILLING_FEATURE_CONFIG);
  private readonly facade = inject(BillingFacade);
  private readonly verifactuStore = inject(VerifactuStore);

  tabs = this.facade.tabs;
  columns = this.config.defaultColumns;

  invoices = this.facade.invoices;
  isLoading = this.facade.isLoading;
  activeTab = this.facade.activeTab;
  currentPage = signal(1);
  totalPages = signal(1);
  searchTerm = '';
  
  // Modal state
  isModalOpen = signal(false);
  isDeleteModalOpen = signal(false);
  editingInvoice = signal<Invoice | null>(null);
  invoiceToDelete = signal<Invoice | null>(null);
  
  // Form data
  formData: Partial<Invoice> = {
    invoiceNumber: '',
    clientName: '',
    budgetId: '',
    type: 'normal',
    status: 'draft',
    total: 0,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    verifactuStatus: 'pending'
  };

  ngOnInit() {
    this.loadInvoices();
  }

  loadInvoices() {
    this.facade.loadInvoices();
  }

  onTabChange(tabId: string) {
    this.facade.setTab(tabId);
  }

  onSearch(term: string) {
    this.searchTerm = term;
    if (term.trim()) {
      this.facade.searchInvoices(term);
    } else {
      this.facade.loadInvoices();
    }
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadInvoices();
  }

  openCreateModal() {
    this.editingInvoice.set(null);
    const year = new Date().getFullYear();
    const count = this.invoices().length + 1;
    const nextNumber = 'F/' + year + '/' + count.toString().padStart(4, '0');
    this.formData = {
      invoiceNumber: nextNumber,
      clientName: '',
      budgetId: '',
      type: 'normal',
      status: 'draft',
      total: 0,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      verifactuStatus: 'pending'
    };
    this.isModalOpen.set(true);
  }

  editInvoice(invoice: Invoice) {
    this.editingInvoice.set(invoice);
    this.formData = { ...invoice };
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingInvoice.set(null);
  }

  saveInvoice() {
    if (!this.formData.clientName) return;

    const invoiceToEdit = this.editingInvoice();
    if (invoiceToEdit) {
      this.facade.updateInvoice(invoiceToEdit.id, this.formData);
      this.closeModal();
    } else {
      this.facade.createInvoice(this.formData as Omit<Invoice, 'id'>);
      this.closeModal();
    }
  }

  confirmDelete(invoice: Invoice) {
    this.invoiceToDelete.set(invoice);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    this.invoiceToDelete.set(null);
  }

  deleteInvoice() {
    const invoice = this.invoiceToDelete();
    if (!invoice) return;

    this.facade.deleteInvoice(invoice.id);
    this.closeDeleteModal();
  }

  downloadPDF(invoice: Invoice) {
    // TODO: Implement PDF generation
    console.log('Download PDF for invoice:', invoice.invoiceNumber);
  }

  sendInvoice(invoice: Invoice) {
    this.facade.sendInvoice(invoice.id);
  }

  // VeriFactu methods
  sendToVerifactu(invoice: Invoice): void {
    // Get tenant ID from somewhere (could be from auth store or config)
    const tenantId = 'default-tenant'; // TODO: Get from auth store
    this.verifactuStore.submitInvoiceDirect(invoice.id, tenantId);
    // Update invoice status in billing facade
    this.facade.updateInvoice(invoice.id, { verifactuStatus: 'sent' });
  }

  viewVerifactuQr(invoice: Invoice): void {
    // Load invoice detail to get QR code
    this.verifactuStore.loadInvoiceDetail(invoice.id);
    this.verifactuStore.loadQrCode(invoice.id);
  }

  markAsPaid(invoice: Invoice) {
    this.facade.markAsPaid(invoice.id);
  }

  getStatusVariant(status: string): 'success' | 'warning' | 'info' | 'error' | 'default' {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'sent': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'draft': return 'Borrador';
      case 'pending': return 'Pendiente';
      case 'sent': return 'Enviada';
      case 'paid': return 'Pagada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  }

  getVerifactuVariant(status: string): 'success' | 'warning' | 'error' | 'default' {
    switch (status) {
      case 'sent': return 'success';
      case 'pending': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  }

  getVerifactuLabel(status: string): string {
    switch (status) {
      case 'sent': return 'Enviada';
      case 'pending': return 'Pendiente';
      case 'error': return 'Error';
      default: return status;
    }
  }

  isOverdue(invoice: Invoice): boolean {
    return invoice.status !== 'paid' && invoice.status !== 'cancelled' && new Date(invoice.dueDate) < new Date();
  }

  formatDate(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES');
  }
}

