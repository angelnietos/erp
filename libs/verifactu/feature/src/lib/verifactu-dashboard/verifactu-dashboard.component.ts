import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { 
  UiCardComponent, UiButtonComponent, UiBadgeComponent, 
  UiStatCardComponent
} from '@josanz-erp/shared-ui-kit';
import { VerifactuStore } from '@josanz-erp/verifactu-data-access';
import type { VerifactuRecord } from '@josanz-erp/verifactu-api';
import { getStoredTenantId } from '@josanz-erp/identity-data-access';
import { ThemeService, PluginStore } from '@josanz-erp/shared-data-access';

@Component({
	selector: 'verifactu-dashboard',
	standalone: true,
	imports: [
    CommonModule, FormsModule, LucideAngularModule,
    UiCardComponent, UiButtonComponent, UiBadgeComponent, 
    UiStatCardComponent
  ],
	template: `
    <div class="page-container animate-fade-in" [class.high-perf]="pluginStore.highPerformanceMode()">
      <header class="page-header" [style.border-bottom-color]="currentTheme().primary + '33'">
        <div class="header-breadcrumb">
          <h1 class="page-title text-uppercase glow-text" [style.text-shadow]="'0 0 20px ' + currentTheme().primary + '44'">
            Panel Veri*Factu
          </h1>
          <div class="breadcrumb">
            <span class="active" [style.color]="currentTheme().primary">CUMPLIMIENTO FISCAL</span>
            <span class="separator">/</span>
            <span>MONITOR SIANE</span>
          </div>
        </div>
        <div class="header-actions">
           <div class="tenant-selector ui-glass-panel">
              <lucide-icon name="building-2" size="14"></lucide-icon>
              <input type="text" [ngModel]="tenantId()" (ngModelChange)="tenantId.set($event)" placeholder="UUID tenant (login)">
              <button type="button" class="sync-btn" (click)="loadRecords()">
                 <lucide-icon name="refresh-cw" size="14"></lucide-icon>
              </button>
           </div>
           @if (!tenantId()) {
             <span class="tenant-hint">Sin tenant en sesión: inicia sesión o pega el UUID del tenant.</span>
           }
           <ui-josanz-button variant="primary" size="md" icon="file-up" (clicked)="submitInvoice()">REPORTE DIRECTO</ui-josanz-button>
        </div>
      </header>

      <div class="stats-row">
        <ui-josanz-stat-card 
          label="Facturas Reportadas" 
          [value]="store.records().length.toString()" 
          icon="shield-check" 
          [accent]="true">
        </ui-josanz-stat-card>
        <ui-josanz-stat-card 
          label="Estado Servicio" 
          value="OPERATIVO" 
          icon="activity"
          [trend]="1">
        </ui-josanz-stat-card>
        <ui-josanz-stat-card 
          label="Latencia Media" 
          value="124ms" 
          icon="timer">
        </ui-josanz-stat-card>
      </div>

      <div class="dashboard-grid">
         <ui-josanz-card variant="glass" title="Registro de Operaciones Fiscales">
            <div class="table-container">
               <table class="luxe-table">
                  <thead>
                     <tr>
                        <th>REFERENCIA</th>
                        <th>EMISIÓN</th>
                        <th>BASE IMP.</th>
                        <th>ESTADO AEAT</th>
                        <th>ACCIONES</th>
                     </tr>
                  </thead>
                  <tbody>
                     @for (record of store.records(); track record.id) {
                       <tr class="luxe-row">
                          <td class="font-mono">{{ record.reference || record.invoiceId.slice(0, 8) }}</td>
                          <td>{{ formatDate(record.createdAt) }}</td>
                          <td class="font-mono">{{ formatCurrency(record.total) }}</td>
                          <td>
                             <ui-josanz-badge [variant]="getStatusVariant(record.status)">
                                {{ record.status }}
                             </ui-josanz-badge>
                          </td>
                          <td>
                             <button class="icon-btn" (click)="viewInvoiceDetail(record)">
                                <lucide-icon name="eye" size="14"></lucide-icon>
                             </button>
                          </td>
                       </tr>
                     } @empty {
                       <tr>
                         <td colspan="5" class="empty-state">
                            <lucide-icon name="inbox" size="32" class="text-muted"></lucide-icon>
                            <p>No se han localizado registros para el Tenant indicado.</p>
                         </td>
                       </tr>
                     }
                  </tbody>
               </table>
            </div>
         </ui-josanz-card>

         <div class="side-panel">
            <ui-josanz-card variant="glass" title="Envío Manual">
               <div class="manual-form">
                  <div class="form-group">
                     <label>ID FACTURA</label>
                     <input type="text" [ngModel]="invoiceIdToSubmit()" (ngModelChange)="invoiceIdToSubmit.set($event)" placeholder="INV-2026-XXXX">
                  </div>
                  <ui-josanz-button variant="glass" class="full-width" (clicked)="submitInvoice()">ENVIAR A VERIFACTU</ui-josanz-button>
               </div>
            </ui-josanz-card>

            <ui-josanz-card variant="glass" title="Certificados Activos">
               <div class="cert-item">
                  <div class="cert-icon" [style.background]="currentTheme().primary + '22'">
                     <lucide-icon name="shield-check" [style.color]="currentTheme().primary" size="16"></lucide-icon>
                  </div>
                  <div class="cert-info">
                     <span class="cert-name">FNMT-MODULAR-2026</span>
                     <span class="cert-expiry">VENCE: 12/2026</span>
                  </div>
               </div>
            </ui-josanz-card>
         </div>
      </div>

      <ui-josanz-modal
        [isOpen]="isDetailModalOpen()"
        title="Detalle factura VeriFactu"
        variant="dark"
        [showFooter]="true"
        (closed)="closeDetailModal()"
      >
        @if (store.loading() && !store.selectedInvoice()) {
          <p class="detail-loading">Cargando detalle…</p>
        } @else if (store.error() && !store.selectedInvoice()) {
          <p class="detail-error">{{ store.error() }}</p>
        } @else if (store.selectedInvoice(); as inv) {
          <div class="detail-grid">
            <div class="detail-block">
              <span class="detail-label">Cliente</span>
              <span class="detail-value">{{ inv.customerName }}</span>
            </div>
            <div class="detail-block">
              <span class="detail-label">NIF</span>
              <span class="detail-value">{{ inv.customerNif || '—' }}</span>
            </div>
            <div class="detail-block">
              <span class="detail-label">Emisión</span>
              <span class="detail-value">{{ inv.issueDate }}</span>
            </div>
            <div class="detail-block">
              <span class="detail-label">Estado VeriFactu</span>
              <span class="detail-value">{{ inv.verifactuStatus }}</span>
            </div>
            <div class="detail-block span-2">
              <span class="detail-label">Importes</span>
              <span class="detail-value">
                Base {{ formatCurrency(inv.subtotal) }} · IVA {{ formatCurrency(inv.taxAmount) }} ·
                <strong>Total {{ formatCurrency(inv.total) }}</strong>
              </span>
            </div>
            @if (inv.aeatReference) {
              <div class="detail-block span-2">
                <span class="detail-label">Referencia AEAT</span>
                <span class="detail-value font-mono">{{ inv.aeatReference }}</span>
              </div>
            }
            @if (inv.hashChain?.currentHash) {
              <div class="detail-block span-2">
                <span class="detail-label">Huella registro</span>
                <span class="detail-hash">{{ inv.hashChain.currentHash }}</span>
              </div>
            }
            @if (inv.qrCode) {
              <div class="detail-qr span-2">
                <span class="detail-label">QR VeriFactu</span>
                <img [src]="inv.qrCode" alt="Código QR factura" class="qr-img" />
              </div>
            }
          </div>
        }
        <div modal-footer>
          <ui-josanz-button variant="ghost" (clicked)="closeDetailModal()">Cerrar</ui-josanz-button>
        </div>
      </ui-josanz-modal>
    </div>
  `,
	styles: [`
    .page-container { padding: 0; max-width: 100%; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem; }
    
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
    
    .header-actions { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; }
    .tenant-hint { font-size: 0.6rem; color: var(--text-muted); max-width: 220px; line-height: 1.3; }

    .tenant-selector {
       display: flex; align-items: center; gap: 10px; padding: 6px 12px;
       border-radius: 8px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);
    }
    .tenant-selector input {
       background: none; border: none; color: #fff; font-size: 0.7rem; font-weight: 700;
       width: 100px; outline: none;
    }
    .sync-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; display: flex; transition: color 0.2s; }
    .sync-btn:hover { color: #fff; }

    .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }

    .dashboard-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; }
    
    .table-container { overflow-x: auto; margin-top: 1rem; }
    .luxe-table { width: 100%; border-collapse: collapse; text-align: left; }
    .luxe-table th { 
      font-size: 0.55rem; font-weight: 900; color: var(--text-muted); 
      letter-spacing: 0.15em; padding: 1rem; text-transform: uppercase;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .luxe-table td { padding: 1.25rem 1rem; font-size: 0.7rem; color: #fff; border-bottom: 1px solid rgba(255,255,255,0.02); }
    .luxe-row:hover { background: rgba(255,255,255,0.02); }

    .icon-btn { 
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); 
      color: var(--text-secondary); width: 28px; height: 28px; border-radius: 6px;
      display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;
    }
    .icon-btn:hover { background: var(--brand); color: #fff; border-color: var(--brand); }

    .empty-state { text-align: center; padding: 4rem 1rem; color: var(--text-muted); }
    .empty-state p { font-size: 0.75rem; margin-top: 1rem; }

    .side-panel { display: flex; flex-direction: column; gap: 1.5rem; }

    .manual-form { display: flex; flex-direction: column; gap: 1.5rem; }
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    .form-group label { font-size: 0.55rem; font-weight: 900; color: var(--text-muted); letter-spacing: 0.1em; }
    .form-group input {
       background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); border-radius: 6px;
       padding: 12px; color: #fff; font-family: var(--font-main); font-size: 0.8rem; outline: none;
       transition: border-color 0.2s;
    }
    .form-group input:focus { border-color: var(--brand); }
    .full-width { width: 100%; }

    .cert-item { display: flex; align-items: center; gap: 12px; padding: 0.5rem 0; }
    .cert-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
    .cert-info { display: flex; flex-direction: column; gap: 2px; }
    .cert-name { font-size: 0.65rem; font-weight: 900; color: #fff; }
    .cert-expiry { font-size: 0.5rem; color: var(--text-muted); }

    .detail-loading, .detail-error { font-size: 0.8rem; margin: 0; color: var(--text-secondary); }
    .detail-error { color: #f87171; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem 1.25rem; }
    .detail-block { display: flex; flex-direction: column; gap: 0.35rem; }
    .detail-block.span-2 { grid-column: 1 / -1; }
    .detail-label { font-size: 0.55rem; font-weight: 800; letter-spacing: 0.08em; color: var(--text-muted); text-transform: uppercase; }
    .detail-value { font-size: 0.8rem; color: #fff; }
    .font-mono { font-family: ui-monospace, monospace; font-size: 0.7rem; word-break: break-all; }
    .detail-hash { font-size: 0.65rem; color: var(--text-secondary); word-break: break-all; line-height: 1.4; }
    .detail-qr { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
    .qr-img { max-width: 220px; height: auto; border-radius: 8px; background: #fff; padding: 8px; }
  `],
})
export class VerifactuDashboardComponent implements OnInit {
	protected store = inject(VerifactuStore);
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);

  currentTheme = this.themeService.currentThemeData;
	tenantId = signal('');
	invoiceIdToSubmit = signal('');
	selectedInvoiceId = signal('');
	isDetailModalOpen = signal(false);

	ngOnInit(): void {
    this.tenantId.set(getStoredTenantId() ?? '');
    this.loadRecords();
	}

	loadRecords(): void {
		const tenant = this.tenantId();
		if (tenant) {
			this.store.loadRecords(tenant);
		}
	}

	submitInvoice(): void {
		const tenant = this.tenantId();
		const invoiceId = this.invoiceIdToSubmit();
		if (tenant && invoiceId) {
			this.store.submitInvoiceDirect(invoiceId, tenant);
			this.invoiceIdToSubmit.set('');
			setTimeout(() => this.loadRecords(), 500);
		}
	}

	viewInvoiceDetail(record: VerifactuRecord): void {
		// API detail is keyed by Invoice.id, not VerifactuLog.id (record.id).
		this.store.loadInvoiceDetailWithQr(record.invoiceId);
		this.selectedInvoiceId.set(record.invoiceId);
		this.isDetailModalOpen.set(true);
	}

	closeDetailModal(): void {
		this.isDetailModalOpen.set(false);
		this.store.clearSelectedInvoice();
	}

  getStatusVariant(status: string): 'success' | 'warning' | 'error' | 'info' | 'default' {
		switch (status) {
			case 'COMPLETED':
			case 'SENT':
			case 'SUCCESS':
				return 'success';
			case 'PROCESSING':
			case 'PENDING':
				return 'warning';
			case 'FAILED':
			case 'ERROR':
				return 'error';
			default:
				return 'default';
		}
	}

	formatDate(dateStr: string): string {
		if (!dateStr) return '-';
		return new Date(dateStr).toLocaleDateString('es-ES', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	}

	formatCurrency(amount: number | undefined): string {
		if (amount === undefined) return '-';
		return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
	}
}

