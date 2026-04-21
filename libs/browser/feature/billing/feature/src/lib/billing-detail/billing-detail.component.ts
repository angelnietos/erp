import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import {
  UiLoaderComponent,
  UiStatCardComponent,
  UiCardComponent,
  UiButtonComponent,
  UiFeaturePageShellComponent,
} from '@josanz-erp/shared-ui-kit';
import { ThemeService, PluginStore } from '@josanz-erp/shared-data-access';
import { Invoice, InvoiceService, BillingFacade } from '@josanz-erp/billing-data-access';
import { getStoredTenantId } from '@josanz-erp/identity-data-access';
import { VerifactuService } from '@josanz-erp/verifactu-data-access';

@Component({
  selector: 'lib-billing-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    UiLoaderComponent,
    UiStatCardComponent,
    UiCardComponent,
    UiButtonComponent,
    UiFeaturePageShellComponent,
  ],
  template: `
    <ui-feature-page-shell
      [variant]="'widthOnly'"
      [fadeIn]="true"
      [extraClass]="(pluginStore.highPerformanceMode() ? 'high-perf ' : '') + 'billing-detail-root'"
    >
      <div class="billing-detail__inner">
      @if (isLoading()) {
        <ui-loader message="Sincronizando registros fiscales con AEAT..."></ui-loader>
      } @else if (invoice(); as inv) {
        <header class="page-header" [style.border-bottom-color]="currentTheme().primary + '33'">
          <div class="header-breadcrumb">
            <button class="back-btn" routerLink="/billing">
              <lucide-icon name="arrow-left" size="14" aria-hidden="true"></lucide-icon>
              VOLVER A FACTURACIÓN
            </button>
            <h1 class="page-title text-uppercase glow-text" [style.text-shadow]="'0 0 24px ' + currentTheme().primary + '44'">
              Factura {{ inv.invoiceNumber }}
            </h1>
            <div class="breadcrumb">
              <span class="active" [style.color]="currentTheme().primary">{{ inv.clientName }}</span>
              <span class="separator">/</span>
              <span>ESTADO: {{ getStatusLabel(inv.status) }}</span>
            </div>
          </div>
          <div class="header-actions">
            <ui-button variant="glass" icon="printer" (clicked)="printInvoice()">IMPRIMIR</ui-button>
            @if (inv.status === 'draft') {
              <ui-button variant="primary" icon="play" (clicked)="issueInvoice()">EMITIR FACTURA</ui-button>
            }
            @if (inv.status === 'pending') {
              <ui-button variant="primary" icon="check-circle" (clicked)="markAsPaid()">NOTIFICAR PAGO</ui-button>
            }
            @if (inv.status !== 'draft') {
               @if (!inv.verifactuStatus || inv.verifactuStatus === 'pending') {
                 <ui-button variant="app" icon="shield-check" (clicked)="sendToAEAT()">ENVIAR AEAT</ui-button>
               }
               @if (inv.verifactuStatus === 'sent') {
                 <ui-button variant="outline" icon="file-warning" (clicked)="rectifyInvoice()">RECTIFICAR FACTURA</ui-button>
               }
               @if (inv.verifactuStatus === 'error') {
                 <ui-button variant="app" icon="refresh-cw" (clicked)="sendToAEAT()">REINTENTAR AEAT</ui-button>
               }
            }
          </div>
        </header>

        <div class="stats-row">
          <ui-stat-card 
            label="Total Facturado" 
            [value]="formatCurrencyEu(inv.total)" 
            icon="wallet" 
            [accent]="true">
          </ui-stat-card>
          <ui-stat-card 
            label="Integridad VeriFactu" 
            [value]="getVerifactuLabel(inv.verifactuStatus)" 
            [icon]="getVerifactuIcon(inv.verifactuStatus)">
          </ui-stat-card>
          <ui-stat-card 
            label="Fecha Emisión" 
            [value]="formatDate(inv.issueDate)" 
            icon="calendar">
          </ui-stat-card>
        </div>

        <div class="main-content">
          <div class="detail-cards">
            <ui-card variant="glass" title="Líneas de Facturación">
              <div class="line-items-cards" role="list">
                @for (line of inv.items || []; track line.id) {
                  <article class="line-item-card" role="listitem">
                    <h3 class="line-item-card__title">{{ line.description }}</h3>
                    <dl class="line-item-card__grid">
                      <div>
                        <dt>Ud.</dt>
                        <dd>{{ line.quantity }}</dd>
                      </div>
                      <div>
                        <dt>Precio unit.</dt>
                        <dd class="font-mono">{{ formatCurrencyEu(line.unitPrice) }}</dd>
                      </div>
                      <div class="line-item-card__subtotal">
                        <dt>Subtotal</dt>
                        <dd class="font-mono" [style.color]="currentTheme().primary">{{ formatCurrencyEu(line.total) }}</dd>
                      </div>
                    </dl>
                  </article>
                } @empty {
                  <p class="line-items-empty">Sin líneas de facturación.</p>
                }
              </div>

              <footer slot="footer" class="invoice-summary" [style.border-top-color]="currentTheme().primary + '22'">
                <div class="summary-line">
                  <span>Base Imponible</span>
                  <span>{{ formatCurrencyEu(inv.total / 1.21) }}</span>
                </div>
                <div class="summary-line">
                  <span>IVA (21%)</span>
                  <span>{{ formatCurrencyEu(inv.total - (inv.total / 1.21)) }}</span>
                </div>
                <div class="summary-line total" [style.color]="currentTheme().primary">
                  <span>TOTAL FACTURA</span>
                  <span>{{ formatCurrencyEu(inv.total) }}</span>
                </div>
              </footer>
            </ui-card>
          </div>

          <aside class="sidebar">
            <ui-card variant="glass" title="Vigilancia Fiscal (AEAT)">
               <div class="vf-status-box" [style.background]="getVerifactuBg()">
                 <lucide-icon [name]="getVerifactuIcon(inv.verifactuStatus)" [size]="28" aria-hidden="true"></lucide-icon>
                 <div class="vf-text">
                   <h4 class="text-uppercase">{{ getVerifactuLabel(inv.verifactuStatus) }}</h4>
                   <p class="text-friendly">Certificación VeriFactu cumplimentada bajo normativa 2026/02/AEAT.</p>
                 </div>
               </div>
               @if (inv.verifactuStatus === 'sent') {
                 <div class="qr-placeholder ui-filled">
                    <lucide-icon name="qr-code" size="64" aria-hidden="true"></lucide-icon>
                    <p class="text-uppercase" style="font-size: 0.5rem; margin-top: 8px;">Código HASH Certificado</p>
                 </div>
               }
            </ui-card>

            <ui-card variant="glass" title="Notas del Expediente">
               <p class="notes-text text-friendly">{{ inv.notes || 'No hay notas adicionales para este documento fiscal.' }}</p>
            </ui-card>
          </aside>
        </div>
      } @else {
        <div class="error-container ui-glass">
          <lucide-icon name="alert-triangle" size="48" [style.color]="currentTheme().danger" aria-hidden="true"></lucide-icon>
          <h3>Expediente No Encontrado</h3>
          <p>El documento solicitado no existe o no tiene permisos de acceso.</p>
          <ui-button variant="glass" routerLink="/billing">VOLVER AL LISTADO</ui-button>
        </div>
      }
      </div>
    </ui-feature-page-shell>
  `,
  styles: [`
    .billing-detail__inner {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: clamp(1rem, 2.5vw, 1.75rem) clamp(1rem, 2.5vw, 2rem) 2rem;
      box-sizing: border-box;
      width: 100%;
    }

    .back-btn {
      background: none; border: none; color: var(--text-muted); 
      display: flex; align-items: center; gap: 8px; font-size: 0.6rem;
      font-weight: 800; cursor: pointer; padding: 0; margin-bottom: 0.5rem;
      transition: color 0.3s;
    }
    .back-btn:hover { color: #fff; }

    .glow-text { 
      font-size: 1.8rem; font-weight: 900; color: #fff; margin: 0; 
      letter-spacing: 0.05em; font-family: var(--font-main);
    }
    
    .breadcrumb {
      display: flex; gap: 8px; font-size: 0.6rem; font-weight: 700;
      letter-spacing: 0.1em; color: var(--text-muted); margin-top: 0.5rem;
    }
    
    .header-actions { display: flex; gap: 0.75rem; }

    .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }

    .main-content { display: grid; grid-template-columns: 1fr 340px; gap: 1.5rem; }
    
    .detail-cards { display: flex; flex-direction: column; gap: 1.5rem; }
    .sidebar { display: flex; flex-direction: column; gap: 1.5rem; }

    .invoice-summary {
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      border-top: 1px solid var(--border-soft);
      margin-top: 1rem;
    }

    .summary-line {
      display: flex; justify-content: space-between; align-items: center;
      font-size: 0.7rem; color: var(--text-secondary);
    }
    .summary-line.total { font-size: 1rem; font-weight: 900; margin-top: 0.5rem; }

    .vf-status-box {
      padding: 1.25rem;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .vf-text h4 { font-size: 0.75rem; margin-bottom: 0.25rem; color: #fff; }
    .vf-text p { font-size: 0.55rem; color: rgba(255,255,255,0.7); margin: 0; line-height: 1.4; }

    .qr-placeholder {
      aspect-ratio: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-lg);
      padding: 2rem;
      color: var(--text-muted);
    }

    .notes-text { font-size: 0.75rem; color: var(--text-secondary); line-height: 1.6; }

    .line-items-cards {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .line-item-card {
      border: 1px solid var(--border-soft);
      border-radius: var(--radius-md, 8px);
      padding: 0.85rem 1rem;
      background: color-mix(in srgb, var(--surface) 92%, transparent);
    }
    .line-item-card__title {
      margin: 0 0 0.65rem 0;
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.35;
    }
    .line-item-card__grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0.65rem 1rem;
      margin: 0;
    }
    .line-item-card__grid > div {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      min-width: 0;
    }
    .line-item-card__grid dt {
      margin: 0;
      font-size: 0.58rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--text-muted);
    }
    .line-item-card__grid dd {
      margin: 0;
      font-size: 0.8rem;
      color: var(--text-secondary);
    }
    .line-item-card__subtotal dd {
      font-weight: 700;
      color: var(--text-primary);
    }
    .line-items-empty {
      margin: 0;
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    @media (max-width: 640px) {
      .line-item-card__grid {
        grid-template-columns: 1fr;
      }
    }

    .error-container {
      padding: 4rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
      text-align: center;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly invoiceService = inject(InvoiceService);
  private readonly facade = inject(BillingFacade);
  private readonly verifactuApi = inject(VerifactuService);
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);

  currentTheme = this.themeService.currentThemeData;
  invoice = signal<Invoice | null>(null);
  isLoading = signal(true);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadInvoice(id);
    }
  }

  loadInvoice(id: string) {
    const fromList = this.facade.allInvoices().find((i) => i.id === id);
    if (fromList) {
      this.invoice.set(fromList);
      this.isLoading.set(false);
    } else {
      this.isLoading.set(true);
    }
    this.invoiceService.getInvoice(id).subscribe({
      next: (inv) => {
        if (inv) {
          this.invoice.set(inv);
          // Consultar estado real en Verifactu (CRM) para sincronizar UI
          this.verifactuApi.getInvoiceDetail(id).subscribe({
             next: (vf) => {
                this.invoice.update(current => current ? { 
                  ...current, 
                  verifactuStatus: vf.verifactuStatus as 'sent' | 'error' | 'pending',
                  aeatReference: vf.aeatReference,
                  qrCode: vf.qrCode
                } : current);
             },
             error: () => { /* Ignorar si no hay registro aún */ }
          });
        } else if (!fromList) {
          this.setMockInvoice(id);
        }
        this.isLoading.set(false);
      },
      error: () => {
        if (!fromList) {
          this.setMockInvoice(id);
        }
        this.isLoading.set(false);
      },
    });
  }

  private setMockInvoice(id: string) {
    this.invoice.set({
      id,
      invoiceNumber: `F/2026-${id.slice(0,4).toUpperCase()}`,
      budgetId: 'b1',
      clientName: 'FILMAX PRODUCCIONES S.A.',
      status: 'pending',
      type: 'normal',
      total: 12500,
      issueDate: '2026-03-20',
      dueDate: '2026-04-20',
      verifactuStatus: 'sent',
      notes: 'Facturación correspondiente al alquiler de material de iluminación para el rodaje de la serie "Nexus 7".',
      items: [
        { id: '1', description: 'Pack ARRI Alexa Mini LF + Lentes Sigma High Speed', quantity: 1, unitPrice: 4500, total: 4500 },
        { id: '2', description: 'Kit de Iluminación Teranex (15 unidades)', quantity: 1, unitPrice: 3200, total: 3200 },
        { id: '3', description: 'Operador de Cámara Senior (5 jornadas)', quantity: 5, unitPrice: 600, total: 3000 },
        { id: '4', description: 'Transporte y Logística (Valencia-Madrid)', quantity: 1, unitPrice: 1800, total: 1800 },
      ]
    });
  }

  getStatusLabel(status: string | undefined): string {
    switch (status) {
      case 'paid': return 'PAGADA';
      case 'pending': return 'PENDIENTE PAGO';
      case 'sent': return 'ENVIADA';
      case 'cancelled': return 'ANULADA';
      default: return 'BORRADOR';
    }
  }

  getVerifactuLabel(status: string | undefined): string {
    switch (status) {
      case 'sent': return 'SINCRO OK';
      case 'error': return 'ERROR AEAT';
      case 'pending': return 'PENDIENTE AEAT';
      default: return 'NO SINCRO';
    }
  }

  getVerifactuIcon(status: string | undefined): string {
    switch (status) {
      case 'sent': return 'shield-check';
      case 'error': return 'alert-circle';
      case 'pending': return 'clock';
      default: return 'help-circle';
    }
  }

  getVerifactuBg() {
    const status = this.invoice()?.verifactuStatus;
    if (status === 'sent') return 'rgba(0, 242, 173, 0.1)';
    if (status === 'error') return 'rgba(255, 94, 108, 0.1)';
    return 'rgba(255, 255, 255, 0.05)';
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  }

  formatCurrencyEu(value: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
  }

  printInvoice() { window.print(); }
  
  issueInvoice() {
     const inv = this.invoice();
     if (!inv) return;
     this.facade.updateInvoice(inv.id, { status: 'pending' });
     this.invoice.update(i => i ? { ...i, status: 'pending' } : i);
  }

  markAsPaid() { 
     const inv = this.invoice();
     if (!inv) return;
     this.facade.markAsPaid(inv.id);
     this.invoice.update(i => i ? { ...i, status: 'paid' } : i);
  }

  sendToAEAT() {
    const inv = this.invoice();
    const tenantId = getStoredTenantId();
    if (!inv || !tenantId) return;
    this.verifactuApi.submitInvoiceDirect(inv.id, tenantId, inv.invoiceNumber, inv.total).subscribe({
      next: (res) => {
        if (!res.success) {
          this.facade.updateInvoice(inv.id, { verifactuStatus: 'error' });
        } else {
          // Si el envío a la cola fue OK, esperamos un poco y recargamos para ver el resultado del worker
          setTimeout(() => this.loadInvoice(inv.id), 2000);
        }
        this.loadInvoice(inv.id);
      },
      error: () => {
        this.facade.updateInvoice(inv.id, { verifactuStatus: 'error' });
        this.loadInvoice(inv.id);
      },
    });
  }

  rectifyInvoice() {
    const inv = this.invoice();
    const tenantId = getStoredTenantId();
    if (!inv || !tenantId) return;
    if (confirm(`¿Estás seguro de que deseas emitir una factura rectificativa para ${inv.invoiceNumber}?`)) {
      this.verifactuApi.cancelInvoice(inv.id, tenantId).subscribe({
        next: (ok) => {
          if (ok) {
            this.facade.updateInvoice(inv.id, { status: 'cancelled', verifactuStatus: 'error' });
            this.loadInvoice(inv.id);
          }
        },
      });
    }
  }
}
