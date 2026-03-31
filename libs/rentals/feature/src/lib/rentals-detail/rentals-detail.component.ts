import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { 
  UiCardComponent, UiButtonComponent, UiBadgeComponent, 
  UiLoaderComponent, UiStatCardComponent 
} from '@josanz-erp/shared-ui-kit';
import { ThemeService, PluginStore } from '@josanz-erp/shared-data-access';
import { RentalService, Rental } from '@josanz-erp/rentals-data-access';

@Component({
  selector: 'lib-rentals-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, LucideAngularModule,
    UiCardComponent, UiButtonComponent, UiBadgeComponent, 
    UiLoaderComponent, UiStatCardComponent
  ],
  template: `
    <div class="page-container animate-fade-in" [class.high-perf]="pluginStore.highPerformanceMode()">
      @if (isLoading()) {
        <ui-josanz-loader message="Sincronizando contrato de alquiler..."></ui-josanz-loader>
      } @else if (rental()) {
        <header class="page-header" [style.border-bottom-color]="currentTheme().primary + '33'">
          <div class="header-breadcrumb">
            <button class="back-btn" routerLink="/rentals">
              <lucide-icon name="arrow-left" size="14"></lucide-icon>
              VOLVER A ALQUILERES
            </button>
            <h1 class="page-title text-uppercase glow-text" [style.text-shadow]="'0 0 20px ' + currentTheme().primary + '44'">
              Alquiler #{{ rental()?.id?.slice(0, 8) }}
            </h1>
            <div class="breadcrumb">
              <span class="active" [style.color]="currentTheme().primary">{{ rental()?.clientName }}</span>
              <span class="separator">/</span>
              <span>CONTRATO DE ARRENDAMIENTO</span>
            </div>
          </div>
          <div class="header-actions">
            @if (rental()?.status === 'DRAFT') {
              <ui-josanz-button variant="glass" size="md" icon="check" (clicked)="activate()">ACTIVAR ALQUILER</ui-josanz-button>
            }
            @if (rental()?.status === 'ACTIVE') {
              <ui-josanz-button variant="primary" size="md" icon="archive" (clicked)="complete()">FINALIZAR Y RECIBIR</ui-josanz-button>
            }
            <ui-josanz-button variant="glass" size="md" icon="printer">IMPRIMIR CONTRATO</ui-josanz-button>
          </div>
        </header>

        <div class="stats-row">
          <ui-josanz-stat-card 
            label="Monto Total" 
            [value]="formatCurrencyEu(rental()?.totalAmount || 0)" 
            icon="credit-card" 
            [accent]="true">
          </ui-josanz-stat-card>
          <ui-josanz-stat-card 
            label="Días Transcurridos" 
            [value]="getDaysElapsed(rental()?.startDate) + ' DÍAS'" 
            icon="clock">
          </ui-josanz-stat-card>
          <ui-josanz-stat-card 
            label="Ítems en Alquiler" 
            [value]="rental()?.itemsCount?.toString() || '0'" 
            icon="layers">
          </ui-josanz-stat-card>
        </div>

        <div class="content-grid">
           <div class="main-column">
              <ui-josanz-card variant="glass" title="Detalles del Alquiler">
                <div class="info-grid">
                   <div class="info-item">
                      <span class="label">FECHA INICIO</span>
                      <span class="value">{{ formatDate(rental()?.startDate) }}</span>
                   </div>
                   <div class="info-item">
                      <span class="label">FECHA DEVOLUCIÓN</span>
                      <span class="value">{{ formatDate(rental()?.endDate) }}</span>
                   </div>
                   <div class="info-item">
                      <span class="label">ESTADO DEL CONTRATO</span>
                      <ui-josanz-badge [variant]="getStatusVariant(rental()?.status)">
                        {{ rental()?.status }}
                      </ui-josanz-badge>
                   </div>
                   <div class="info-item">
                      <span class="label">IDENTIFICADOR CLIENTE</span>
                      <span class="value">ID: {{ rental()?.clientId }}</span>
                   </div>
                </div>
              </ui-josanz-card>

              <ui-josanz-card variant="glass" title="Registro de Actividad">
                 <div class="activity-timeline">
                    <div class="timeline-item">
                       <span class="dot" [style.background]="currentTheme().primary"></span>
                       <div class="activity-content">
                          <span class="time">HACE 4 HORAS</span>
                          <span class="text">Contrato actualizado a estado <strong>{{ rental()?.status }}</strong></span>
                       </div>
                    </div>
                    <div class="timeline-item">
                       <span class="dot"></span>
                       <div class="activity-content">
                          <span class="time">{{ formatDate(rental()?.createdAt) }}</span>
                          <span class="text">Expediente de alquiler creado por sistema</span>
                       </div>
                    </div>
                 </div>
              </ui-josanz-card>
           </div>

           <div class="side-column">
              <ui-josanz-card variant="glass" title="Garantías y Depósitos">
                 <div class="deposit-box">
                    <lucide-icon name="shield-check" size="24" [style.color]="currentTheme().primary"></lucide-icon>
                    <div class="deposit-info">
                       <span class="deposit-label">FIANZA BLOQUEADA</span>
                       <span class="deposit-value">{{ formatCurrencyEu((rental()?.totalAmount || 0) * 0.2) }}</span>
                    </div>
                 </div>
              </ui-josanz-card>

              <ui-josanz-card variant="glass" title="Acciones Rápidas">
                 <div class="quick-actions">
                    <ui-josanz-button variant="glass" class="full-width" icon="file-plus">AÑADIR ANEXO</ui-josanz-button>
                    @if (rental()?.status !== 'CANCELLED' && rental()?.status !== 'COMPLETED') {
                      <ui-josanz-button variant="glass" class="full-width danger-btn" icon="trash-2" (clicked)="cancel()">ANULAR CONTRATO</ui-josanz-button>
                    }
                 </div>
              </ui-josanz-card>
           </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 0; max-width: 1600px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem; }
    
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

    .content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; }
    .main-column, .side-column { display: flex; flex-direction: column; gap: 1.5rem; }

    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; padding: 0.5rem 0; }
    .info-item { display: flex; flex-direction: column; gap: 4px; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 0.5rem; }
    .info-item .label { font-size: 0.55rem; font-weight: 700; color: var(--text-muted); letter-spacing: 0.1em; }
    .info-item .value { font-size: 0.7rem; font-weight: 800; color: #fff; }

    .activity-timeline { display: flex; flex-direction: column; gap: 1.5rem; padding: 0.5rem 0; }
    .timeline-item { display: flex; gap: 1rem; position: relative; }
    .dot { width: 8px; height: 8px; background: rgba(255,255,255,0.1); border-radius: 50%; margin-top: 4px; z-index: 1; }
    .activity-content { display: flex; flex-direction: column; gap: 2px; }
    .time { font-size: 0.5rem; font-weight: 900; color: var(--text-muted); }
    .text { font-size: 0.65rem; color: var(--text-secondary); }

    .deposit-box { display: flex; align-items: center; gap: 1rem; padding: 0.5rem 0; }
    .deposit-info { display: flex; flex-direction: column; }
    .deposit-label { font-size: 0.55rem; font-weight: 700; color: var(--text-muted); }
    .deposit-value { font-size: 0.9rem; font-weight: 900; color: #fff; }

    .quick-actions { display: flex; flex-direction: column; gap: 0.75rem; }
    .full-width { width: 100%; text-align: left; }
    .danger-btn:hover { background: rgba(239, 68, 68, 0.1) !important; color: #ff4b4b !important; border-color: rgba(239, 68, 68, 0.2) !important; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RentalsDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(RentalService);
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);

  currentTheme = this.themeService.currentThemeData;
  rental = signal<Rental | null>(null);
  isLoading = signal(true);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
       this.loadRental(id);
    }
  }

  loadRental(id: string) {
    this.isLoading.set(true);
    setTimeout(() => {
       this.service.getRentals().subscribe(list => {
          const r = list.find(item => item.id === id);
          this.rental.set(r || null);
          this.isLoading.set(false);
       });
    }, 400);
  }

  getStatusVariant(status: string | undefined): 'success' | 'warning' | 'error' | 'info' | 'default' {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'DRAFT': return 'info';
      case 'CANCELLED': return 'error';
      case 'COMPLETED': return 'default';
      default: return 'default';
    }
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES');
  }

  formatCurrencyEu(value: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
  }

  getDaysElapsed(startDate: string | undefined): number {
     if (!startDate) return 0;
     const diff = new Date().getTime() - new Date(startDate).getTime();
     return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }

  activate() { const r = this.rental(); if (r) this.service.activateRental(r.id).subscribe(() => this.loadRental(r.id)); }
  complete() { const r = this.rental(); if (r) this.service.completeRental(r.id).subscribe(() => this.loadRental(r.id)); }
  cancel() { const r = this.rental(); if (r) this.service.cancelRental(r.id).subscribe(() => this.loadRental(r.id)); }
}
