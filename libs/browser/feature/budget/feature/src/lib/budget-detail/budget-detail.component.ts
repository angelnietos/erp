import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import {
  UiCardComponent, UiButtonComponent,
  UiLoaderComponent, UiTableComponent, UiStatCardComponent
} from '@josanz-erp/shared-ui-kit';
import { ThemeService, PluginStore } from '@josanz-erp/shared-data-access';
import { openPrintableDocument, escapeHtml } from '@josanz-erp/shared-utils';

export interface BudgetItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Budget {
  id: string;
  clientId: string;
  clientName: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  total: number;
  createdAt: string;
  startDate: string;
  endDate: string;
  validUntil: string;
  notes: string;
  items: BudgetItem[];
}

@Component({
  selector: 'lib-budget-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, LucideAngularModule,
    UiCardComponent, UiButtonComponent, 
    UiLoaderComponent, UiTableComponent, UiStatCardComponent
  ],
  template: `
    <div class="page-container animate-fade-in" [class.high-perf]="pluginStore.highPerformanceMode()">
      @if (isLoading()) {
        <ui-loader message="Sincronizando expediente fiscal..."></ui-loader>
      } @else if (budget()) {
        <header class="page-header" [style.border-bottom-color]="currentTheme().primary + '33'">
          <div class="header-breadcrumb">
            <button class="back-btn" routerLink="/budgets">
              <lucide-icon name="arrow-left" size="14"></lucide-icon>
              VOLVER AL LISTADO
            </button>
            <h1 class="page-title text-uppercase glow-text" [style.text-shadow]="'0 0 20px ' + currentTheme().primary + '44'">
              Presupuesto #{{ budget()?.id?.slice(0, 8) }}
            </h1>
            <div class="breadcrumb">
              <span class="active" [style.color]="currentTheme().primary">{{ budget()?.clientName }}</span>
              <span class="separator">/</span>
              <span>EXPEDIENTE COMERCIAL</span>
            </div>
          </div>
          <div class="header-actions">
            <ui-button variant="glass" size="md" icon="file-text" (clicked)="downloadPDF()">GENERAR PDF</ui-button>
            <ui-button variant="primary" size="md" icon="send" (clicked)="sendToClient()">ENVIAR FIRMA</ui-button>
          </div>
        </header>

        <div class="stats-row">
          <ui-stat-card 
            label="Total Presupuestado" 
            [value]="formatCurrencyEu(budget()?.total || 0)" 
            icon="wallet" 
            [accent]="true">
          </ui-stat-card>
          <ui-stat-card 
            label="Estado Actual" 
            [value]="getStatusLabel(budget()?.status)" 
            [icon]="getStatusIcon(budget()?.status)">
          </ui-stat-card>
          <ui-stat-card 
            label="Vencimiento Oferta" 
            [value]="formatDate(budget()?.validUntil)" 
            icon="calendar-clock">
          </ui-stat-card>
        </div>

        <div class="main-content">
          <ui-card variant="glass" title="Detalle de Líneas Comerciales">
            <ui-table [columns]="itemColumns" [data]="budget()?.items || []">
              <ng-template #cellTemplate let-item let-key="key">
                @switch (key) {
                  @case ('unitPrice') { <span class="font-mono">{{ formatCurrencyEu(item.unitPrice) }}</span> }
                  @case ('total') { <strong class="font-mono" [style.color]="currentTheme().primary">{{ formatCurrencyEu(item.total) }}</strong> }
                  @default { {{ item[key] }} }
                }
              </ng-template>
            </ui-table>
          </ui-card>

          <div class="sidebar-info">
             <ui-card variant="glass" title="Información Logística">
                <div class="info-list">
                   <div class="info-item">
                      <span class="label">INICIO PREVISTO</span>
                      <span class="value">{{ formatDate(budget()?.startDate) }}</span>
                   </div>
                   <div class="info-item">
                      <span class="label">FIN PRODUCCIÓN</span>
                      <span class="value">{{ formatDate(budget()?.endDate) }}</span>
                   </div>
                   <div class="info-item">
                      <span class="label">VALIDEZ FISCAL</span>
                      <span class="value">{{ formatDate(budget()?.validUntil) }}</span>
                   </div>
                </div>
             </ui-card>

             <ui-card variant="glass" title="Acciones de Seguimiento">
                <div class="actions-grid">
                  @if (budget()?.status === 'accepted') {
                    <ui-button variant="primary" class="full-width" icon="truck" (clicked)="createDelivery()">
                      GENERAR ALBARÁN
                    </ui-button>
                    <ui-button variant="glass" class="full-width" icon="history" (clicked)="createInvoice()">
                      EMITIR FACTURA
                    </ui-button>
                  } @else {
                    <ui-button variant="glass" class="full-width" (clicked)="approveBudget()">FORZAR ACEPTACIÓN</ui-button>
                  }
                </div>
             </ui-card>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 0; max-width: 100%; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem; }
    
    .back-btn {
      background: none; border: none; color: var(--text-muted); 
      display: flex; align-items: center; gap: 8px; font-size: 0.6rem;
      font-weight: 800; cursor: pointer; padding: 0; margin-bottom: 0.5rem;
      transition: color 0.3s;
    }
    .back-btn:hover { color: #fff; }

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
    
    .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }

    .main-content { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; }
    .sidebar-info { display: flex; flex-direction: column; gap: 1.5rem; }

    .info-list { display: flex; flex-direction: column; gap: 1rem; }
    .info-item { display: flex; justify-content: space-between; align-items: center; }
    .info-item .label { font-size: 0.55rem; font-weight: 700; color: var(--text-muted); letter-spacing: 0.1em; }
    .info-item .value { font-size: 0.65rem; font-weight: 800; color: #fff; }

    .actions-grid { display: flex; flex-direction: column; gap: 0.75rem; }
    .full-width { width: 100%; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BudgetDetailComponent implements OnInit {
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  currentTheme = this.themeService.currentThemeData;
  budget = signal<Budget | null>(null);
  isLoading = signal(true);

  itemColumns = [
    { key: 'description', header: 'Concepto' },
    { key: 'quantity', header: 'Cant.', width: '80px' },
    { key: 'unitPrice', header: 'Precio Unit.', width: '120px' },
    { key: 'total', header: 'Subtotal', width: '120px' },
  ];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBudget(id);
    }
  }

  loadBudget(id: string) {
    this.isLoading.set(true);
    setTimeout(() => {
      this.budget.set({
        id,
        clientId: '1',
        clientName: 'Producciones Audiovisuales Madrid',
        status: 'accepted',
        total: 4500,
        createdAt: '2026-03-15',
        startDate: '2026-04-01',
        endDate: '2026-04-05',
        validUntil: '2026-03-30',
        notes: 'Precio incluye IVA. Equipment de última generación.',
        items: [
          { id: '1', description: 'Cámara Sony FX6 Cinema Line', quantity: 2, unitPrice: 500, total: 1000 },
          { id: '2', description: 'Kit Iluminación Aputure 600d', quantity: 1, unitPrice: 800, total: 800 },
          { id: '3', description: 'Sistema de Estabilización Ronin RS3', quantity: 2, unitPrice: 150, total: 300 },
          { id: '4', description: 'Servicios Logísticos Josanz (4 días)', quantity: 4, unitPrice: 850, total: 3400 },
        ],
      });
      this.isLoading.set(false);
    }, 400);
  }

  getStatusLabel(status: string | undefined): string {
    switch (status) {
      case 'accepted': return 'ACEPTADO';
      case 'sent': return 'ENVIADO';
      case 'draft': return 'BORRADOR';
      case 'rejected': return 'RECHAZADO';
      default: return 'DESCONOCIDO';
    }
  }

  getStatusIcon(status: string | undefined): string {
    switch (status) {
      case 'accepted': return 'check-circle';
      case 'sent': return 'navigation';
      case 'rejected': return 'x-circle';
      default: return 'help-circle';
    }
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES');
  }

  formatCurrencyEu(value: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
  }

  downloadPDF() {
    const b = this.budget();
    if (!b) return;
    const rows = b.items
      .map(
        (it) =>
          `<tr><td>${escapeHtml(it.description)}</td><td>${it.quantity}</td><td>${escapeHtml(
            this.formatCurrencyEu(it.unitPrice),
          )}</td><td>${escapeHtml(this.formatCurrencyEu(it.total))}</td></tr>`,
      )
      .join('');
    const body = `
      <h1>Presupuesto comercial</h1>
      <div class="meta">
        <div><strong>Nº expediente:</strong> ${escapeHtml(b.id)}</div>
        <div><strong>Cliente:</strong> ${escapeHtml(b.clientName)}</div>
        <div><strong>Estado:</strong> ${escapeHtml(this.getStatusLabel(b.status))}</div>
        <div><strong>Inicio:</strong> ${escapeHtml(this.formatDate(b.startDate))}</div>
        <div><strong>Fin:</strong> ${escapeHtml(this.formatDate(b.endDate))}</div>
        <div><strong>Válido hasta:</strong> ${escapeHtml(this.formatDate(b.validUntil))}</div>
        ${b.notes ? `<div><strong>Notas:</strong> ${escapeHtml(b.notes)}</div>` : ''}
      </div>
      <table>
        <thead><tr><th>Concepto</th><th>Cant.</th><th>P. unit.</th><th>Total</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p class="totals">Total: ${escapeHtml(this.formatCurrencyEu(b.total))}</p>
    `;
    openPrintableDocument(`Presupuesto ${b.id.slice(0, 8)}`, body);
  }
  sendToClient() { /* TODO */ }
  approveBudget() { /* TODO */ }
  createDelivery() { this.router.navigate(['/delivery'], { queryParams: { budgetId: this.budget()?.id } }); }
  createInvoice() { this.router.navigate(['/billing'], { queryParams: { budgetId: this.budget()?.id } }); }
}
