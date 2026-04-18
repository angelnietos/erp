import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { 
  UiCardComponent, UiButtonComponent, UiBadgeComponent, 
  UiLoaderComponent, UiStatCardComponent, UiFeaturePageShellComponent,
} from '@josanz-erp/shared-ui-kit';
import { InventoryFacade, Product } from '@josanz-erp/inventory-data-access';
import { ThemeService, PluginStore } from '@josanz-erp/shared-data-access';

@Component({
  selector: 'lib-inventory-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, LucideAngularModule,
    UiCardComponent, UiButtonComponent, UiBadgeComponent, 
    UiLoaderComponent, UiStatCardComponent, UiFeaturePageShellComponent,
  ],
  template: `
    <ui-feature-page-shell
      [variant]="'widthOnly'"
      [fadeIn]="true"
      [extraClass]="pluginStore.highPerformanceMode() ? 'high-perf' : ''"
    >
      <div class="inventory-detail__stack">
      @if (isLoading()) {
        <ui-loader message="Sincronizando ficha de activo..."></ui-loader>
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
            <ui-button variant="glass" size="md" icon="pencil" (click)="onEdit()">EDITAR ACTIVO</ui-button>
            <ui-button variant="primary" size="md" icon="printer" (click)="onPrintQr()">ETIQUETA QR</ui-button>
          </div>
        </header>

        <div class="stats-row">
          <ui-stat-card 
            label="Existencias" 
            [value]="product()?.totalStock?.toString() || '0'" 
            icon="box" 
            [accent]="true">
          </ui-stat-card>
          <ui-stat-card 
            label="Precio Unitario" 
            [value]="formatCurrencyEu(product()?.dailyRate || 0)" 
            icon="tag">
          </ui-stat-card>
          <ui-stat-card 
            label="Valor Stock" 
            [value]="formatCurrencyEu((product()?.totalStock || 0) * (product()?.dailyRate || 0))" 
            icon="trending-up">
          </ui-stat-card>
        </div>

        <div class="content-grid">
          <ui-card variant="glass" title="Especificaciones Generales">
            <div class="spec-list">
              <div class="spec-item">
                <span class="label">CATEGORÍA</span>
                <ui-badge variant="info">{{ product()?.category | uppercase }}</ui-badge>
              </div>
              <div class="spec-item">
                <span class="label">ESTADO DE STOCK</span>
                <ui-badge [variant]="(product()?.totalStock || 0) < 5 ? 'warning' : 'success'">
                  {{ (product()?.totalStock || 0) < 5 ? 'CRÍTICO' : 'OPTIMO' }}
                </ui-badge>
              </div>
              <div class="spec-item">
                <span class="label">ÚLTIMA ACTUALIZACIÓN</span>
                <span class="value font-mono">01/04/2026</span>
              </div>
            </div>
          </ui-card>

          <ui-card variant="glass" title="Descripción del Producto">
             <p class="description-text text-friendly">{{ product()?.description || 'Sin descripción técnica disponible.' }}</p>
          </ui-card>
        </div>
      } @else {
        <div class="error-state">
           <lucide-icon name="alert-triangle" size="48" [style.color]="currentTheme().primary"></lucide-icon>
           <h2>ACTIVO NO ENCONTRADO</h2>
           <ui-button variant="primary" routerLink="/inventory">VOLVER AL INVENTARIO</ui-button>
        </div>
      }
      </div>
    </ui-feature-page-shell>
  `,
  styles: [`
    .inventory-detail__stack {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      width: 100%;
    }
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
  private readonly router = inject(Router);
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

  onEdit() {
    const id = this.product()?.id;
    if (id) this.router.navigate(['/inventory', id, 'edit']);
  }

  onPrintQr() {
    const p = this.product();
    if (!p) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>QR ${p.sku}</title>
      <style>body{font-family:monospace;text-align:center;padding:2rem}
      .code{font-size:2rem;font-weight:bold;border:3px solid #000;padding:1rem;display:inline-block;margin:1rem}
      </style></head><body>
      <h2>${p.name}</h2><div class="code">[QR] ${p.sku}</div>
      <p>SKU: ${p.sku} | Stock: ${p.totalStock} | Precio: ${p.dailyRate}€/día</p>
      <script>window.print()</scr` + `ipt></body></html>`);
    win.document.close();
  }

  formatCurrencyEu(value: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
  }
}
