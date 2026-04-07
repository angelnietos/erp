import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { 
  UiCardComponent, UiButtonComponent, UiBadgeComponent, 
  UiLoaderComponent, UiStatCardComponent
} from '@josanz-erp/shared-ui-kit';
import { InventoryFacade, Product } from '@josanz-erp/inventory-data-access';
import { ThemeService, PluginStore } from '@josanz-erp/shared-data-access';

@Component({
  selector: 'lib-inventory-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, LucideAngularModule,
    UiCardComponent, UiButtonComponent, UiBadgeComponent, 
    UiLoaderComponent, UiStatCardComponent
  ],
  template: `
    <div class="page-container animate-fade-in" [class.high-perf]="pluginStore.highPerformanceMode()">
      @if (isLoading()) {
        <ui-josanz-loader message="Sincronizando ficha de activo..."></ui-josanz-loader>
      } @else if (product()) {
        <header class="page-header" [style.border-bottom-color]="currentTheme().primary + '33'">
          <div class="header-breadcrumb">
            <button class="back-btn" routerLink="/inventory">
              <lucide-icon name="arrow-left" size="14"></lucide-icon>
              VOLVER AL LISTADO
            </button>
            <h1 class="page-title text-uppercase glow-text" [style.text-shadow]="'0 0 20px ' + currentTheme().primary + '44'">
              {{ product()?.name }}
            </h1>
            <div class="breadcrumb">
              <span class="active" [style.color]="currentTheme().primary">FICHA TÉCNICA</span>
              <span class="separator">/</span>
              <span>REF: {{ product()?.sku }}</span>
            </div>
          </div>
          <div class="header-actions">
            <ui-josanz-button variant="glass" size="md" icon="edit">EDITAR ACTIVO</ui-josanz-button>
            <ui-josanz-button variant="primary" size="md" icon="printer">ETIQUETA QR</ui-josanz-button>
          </div>
        </header>

        <div class="stats-row">
          <ui-josanz-stat-card 
            label="Existencias" 
            [value]="product()?.totalStock?.toString() || '0'" 
            icon="box" 
            [accent]="true">
          </ui-josanz-stat-card>
          <ui-josanz-stat-card 
            label="Precio Unitario" 
            [value]="formatCurrencyEu(product()?.dailyRate || 0)" 
            icon="tag">
          </ui-josanz-stat-card>
          <ui-josanz-stat-card 
            label="Valor Stock" 
            [value]="formatCurrencyEu((product()?.totalStock || 0) * (product()?.dailyRate || 0))" 
            icon="trending-up">
          </ui-josanz-stat-card>
        </div>

        <div class="content-grid">
          <ui-josanz-card variant="glass" title="Especificaciones Generales">
            <div class="spec-list">
              <div class="spec-item">
                <span class="label">CATEGORÍA</span>
                <ui-josanz-badge variant="info">{{ product()?.category | uppercase }}</ui-josanz-badge>
              </div>
              <div class="spec-item">
                <span class="label">ESTADO DE STOCK</span>
                <ui-josanz-badge [variant]="(product()?.totalStock || 0) < 5 ? 'warning' : 'success'">
                  {{ (product()?.totalStock || 0) < 5 ? 'CRÍTICO' : 'OPTIMO' }}
                </ui-josanz-badge>
              </div>
              <div class="spec-item">
                <span class="label">ÚLTIMA ACTUALIZACIÓN</span>
                <span class="value font-mono">01/04/2026</span>
              </div>
            </div>
          </ui-josanz-card>

          <ui-josanz-card variant="glass" title="Descripción del Producto">
             <p class="description-text text-friendly">{{ product()?.description || 'Sin descripción técnica disponible.' }}</p>
          </ui-josanz-card>
        </div>
      } @else {
        <div class="error-state">
           <lucide-icon name="alert-triangle" size="48" [style.color]="currentTheme().primary"></lucide-icon>
           <h2>ACTIVO NO ENCONTRADO</h2>
           <ui-josanz-button variant="primary" routerLink="/inventory">VOLVER AL INVENTARIO</ui-josanz-button>
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

    .content-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 1.5rem; }

    .spec-list { display: flex; flex-direction: column; gap: 1.25rem; padding: 0.5rem 0; }
    .spec-item { display: flex; justify-content: space-between; align-items: center; }
    .spec-item .label { font-size: 0.6rem; font-weight: 700; color: var(--text-muted); letter-spacing: 0.1em; }
    .spec-item .value { font-size: 0.7rem; font-weight: 800; color: #fff; }

    .description-text { color: var(--text-secondary); line-height: 1.6; font-size: 0.9rem; }

    .error-state { 
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      min-height: 400px; gap: 1.5rem; text-align: center;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly facade = inject(InventoryFacade);
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);

  currentTheme = this.themeService.currentThemeData;
  product = signal<Product | null>(null);
  isLoading = signal(true);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
       // Mock or real load
       setTimeout(() => {
         const p = this.facade.allProducts().find(item => item.id === id);
         this.product.set(p || null);
         this.isLoading.set(false);
       }, 500);
    }
  }

  formatCurrencyEu(value: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
  }
}
