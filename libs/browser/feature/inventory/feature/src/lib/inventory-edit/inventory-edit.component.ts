import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import {
  UiButtonComponent,
  UiInputComponent,
  UiTextareaComponent,
  UiSelectComponent,
  UiCardComponent,
  UiLoaderComponent,
} from '@josanz-erp/shared-ui-kit';
import {
  InventoryFacade,
  Product,
  InventoryService,
} from '@josanz-erp/inventory-data-access';
import { ThemeService, PluginStore, ToastService } from '@josanz-erp/shared-data-access';

@Component({
  selector: 'lib-inventory-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    UiButtonComponent,
    UiInputComponent,
    UiTextareaComponent,
    UiSelectComponent,
    UiCardComponent,
    UiLoaderComponent,
  ],
  template: `
    <div
      class="page-container animate-fade-in"
      [class.high-perf]="pluginStore.highPerformanceMode()"
    >
      @if (isLoading()) {
        <ui-loader message="Cargando activo para edición..."></ui-loader>
      } @else if (loadError() && !isCreateMode) {
        <div class="error-state">
          <lucide-icon name="alert-triangle" size="48" [style.color]="currentTheme().primary" aria-hidden="true"></lucide-icon>
          <h2>ACTIVO NO ENCONTRADO</h2>
          <ui-button variant="primary" (clicked)="goToList()">VOLVER AL INVENTARIO</ui-button>
        </div>
      } @else {
        <header class="page-header" [style.border-bottom-color]="currentTheme().primary + '33'">
          <div class="header-actions">
            <ui-button variant="ghost" icon="arrow-left" (clicked)="goBack()">Volver</ui-button>
          </div>
          <div class="header-breadcrumb">
            <h1 class="page-title text-uppercase glow-text">
              {{ isCreateMode ? 'Nuevo activo' : 'Editar activo' }}
            </h1>
            <div class="breadcrumb">
              <span class="active" [style.color]="currentTheme().primary">INVENTARIO</span>
              <span class="separator">/</span>
              <span>{{ form.name || '—' }}</span>
            </div>
          </div>
          <div class="header-actions">
            <ui-button variant="secondary" icon="x" (clicked)="goBack()">Cancelar</ui-button>
            <ui-button variant="primary" icon="save" (clicked)="save()">Guardar</ui-button>
          </div>
        </header>

        <ui-card variant="glass" title="Datos del activo">
          <div class="form-grid">
            <ui-input
              label="Nombre"
              [(ngModel)]="form.name"
              placeholder="Denominación del producto"
              icon="box"
            />
            <div class="row-2">
              <ui-input label="SKU" [(ngModel)]="form.sku" icon="hash" />
              <ui-input label="Categoría" [(ngModel)]="form.category" icon="tag" />
            </div>
            <div class="row-2">
              <ui-select
                label="Tipo"
                [(ngModel)]="form.type"
                [options]="typeOptions"
                icon="layers"
              />
              <ui-select
                label="Estado"
                [(ngModel)]="form.status"
                [options]="statusOptions"
                icon="activity"
              />
            </div>
            <div class="row-2">
              <ui-input
                label="Unidades (stock total)"
                type="number"
                [(ngModel)]="form.totalStock"
                icon="layers"
              />
              <ui-input
                label="Tarifa diaria (€)"
                type="number"
                [(ngModel)]="form.dailyRate"
                icon="euro"
              />
            </div>
            <ui-textarea
              label="Descripción"
              [(ngModel)]="form.description"
              placeholder="Descripción técnica o notas operativas"
              [rows]="4"
            />
          </div>
        </ui-card>
      }
    </div>
  `,
  styles: [
    `
      .page-container {
        padding: 0;
        max-width: 960px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        padding-bottom: 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        flex-wrap: wrap;
        gap: 1rem;
      }
      .header-breadcrumb {
        flex: 1;
        min-width: 200px;
      }
      .glow-text {
        font-size: 1.4rem;
        font-weight: 900;
        color: #fff;
        margin: 0 0 0.35rem 0;
        letter-spacing: 0.05em;
        font-family: var(--font-main);
      }
      .breadcrumb {
        display: flex;
        gap: 8px;
        font-size: 0.6rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        color: var(--text-muted);
      }
      .separator {
        opacity: 0.5;
      }
      .header-actions {
        display: flex;
        gap: 0.75rem;
        align-items: center;
      }
      .form-grid {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        padding: 0.5rem 0;
      }
      .row-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }
      .error-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 360px;
        gap: 1.25rem;
        text-align: center;
      }
      @media (max-width: 640px) {
        .row-2 {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryEditComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly facade = inject(InventoryFacade);
  private readonly inventoryApi = inject(InventoryService);
  private readonly toast = inject(ToastService);

  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);

  currentTheme = this.themeService.currentThemeData;

  isLoading = signal(true);
  loadError = signal(false);
  private productId = '';
  /** Alta desde ruta `/inventory/new` (expuesto para la plantilla). */
  isCreateMode = false;

  form: Partial<Product> = {
    name: '',
    sku: '',
    category: '',
    type: 'generic',
    status: 'available',
    totalStock: 0,
    dailyRate: 0,
    description: '',
  };

  typeOptions = [
    { value: 'generic', label: 'Genérico' },
    { value: 'serialized', label: 'Serializado' },
  ];

  statusOptions = [
    { value: 'available', label: 'Disponible' },
    { value: 'reserved', label: 'Reservado' },
    { value: 'maintenance', label: 'Mantenimiento' },
    { value: 'retired', label: 'Retirado' },
  ];

  ngOnInit() {
    if (this.route.snapshot.routeConfig?.path === 'new') {
      this.isCreateMode = true;
      this.productId = '';
      this.isLoading.set(false);
      this.loadError.set(false);
      return;
    }
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loadError.set(true);
      this.isLoading.set(false);
      return;
    }
    this.productId = id;
    this.inventoryApi.getProduct(id).subscribe({
      next: (p) => {
        if (p) {
          this.applyProduct(p);
          this.isLoading.set(false);
          return;
        }
        this.loadFromProductList(id);
      },
      error: () => this.loadFromProductList(id),
    });
  }

  /** Si GET por id falla o no hay cuerpo, intenta localizar en el listado (misma fuente que el listado). */
  private loadFromProductList(id: string) {
    this.inventoryApi.getProducts().subscribe({
      next: (list) => {
        const p = list.find((x) => x.id === id);
        if (p) {
          this.applyProduct(p);
        } else {
          this.loadError.set(true);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  private applyProduct(p: Product) {
    this.form = {
      name: p.name,
      sku: p.sku,
      category: p.category,
      type: p.type,
      status: p.status,
      totalStock: p.totalStock,
      dailyRate: p.dailyRate,
      description: p.description ?? '',
    };
    this.loadError.set(false);
  }

  goBack() {
    if (this.isCreateMode) {
      this.goToList();
      return;
    }
    if (this.productId) {
      this.router.navigate(['/inventory', this.productId]);
      return;
    }
    this.goToList();
  }

  goToList() {
    this.router.navigate(['/inventory']);
  }

  save() {
    const name = this.form.name?.trim();
    if (!name) {
      this.toast.show('El nombre es obligatorio', 'error');
      return;
    }
    const totalStock = Math.max(
      0,
      Math.floor(Number(this.form.totalStock ?? 0)),
    );
    const dailyRate = Math.max(0, Number(this.form.dailyRate ?? 0));

    const payload = {
      ...this.form,
      name,
      sku: (this.form.sku ?? '').trim(),
      category: (this.form.category ?? '').trim() || 'Varios',
      type: this.form.type ?? 'generic',
      status: this.form.status ?? 'available',
      totalStock,
      dailyRate,
      description: (this.form.description ?? '').trim() || undefined,
    };

    if (this.isCreateMode) {
      this.facade
        .createProduct({
          ...payload,
          availableStock: totalStock,
          reservedStock: 0,
        })
        .subscribe({
        next: (p) => {
          this.toast.show('Activo creado correctamente', 'success');
          this.router.navigate(['/inventory', p.id]);
        },
        error: () =>
          this.toast.show('No se pudo crear el activo.', 'error'),
      });
      return;
    }

    this.facade.updateProduct(this.productId, payload).subscribe({
      next: () => {
        this.toast.show('Activo actualizado correctamente', 'success');
        this.router.navigate(['/inventory', this.productId]);
      },
      error: () =>
        this.toast.show('No se pudo guardar el activo.', 'error'),
    });
  }
}
