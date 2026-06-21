import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  AdaptiveListRowsComponent,
  ListTemplateHeaderRowComponent,
  MainListLayoutComponent,
  BaseListComponent,
  type JosanzAdaptiveListItem,
  type JosanzStatusPillKey,
} from '@josanz-erp/josanz-ui';

@Component({
  selector: 'josanz-stock-list',
  standalone: true,
  imports: [
    CommonModule,
    MainListLayoutComponent,
    AdaptiveListRowsComponent,
    ListTemplateHeaderRowComponent,
  ],
  templateUrl: './josanz-stock-feature-list.html',
  styleUrl: './josanz-stock-feature-list.css',
})
export class JosanzStockListComponent extends BaseListComponent {
  private readonly router = inject(Router);

  readonly summaryLine = {
    before: '248 productos · ',
    emphasis: '198 en stock',
    after: '',
  };

  readonly stockItems = [
    {
      id: 'SKU-00124',
      ref: 'SKU-00124',
      name: 'Cableado Estructurado Cat6',
      cat: 'Electrónica',
      stock: '250 m',
      wh: 'Almacén Central',
      status: 'En stock',
      pillKey: 'confirmado' as JosanzStatusPillKey,
    },
    {
      id: 'SKU-00125',
      ref: 'SKU-00125',
      name: 'Pack Herramientas Pro',
      cat: 'Herramientas',
      stock: '12 uds',
      wh: 'Taller Norte',
      status: 'Bajo mín.',
      pillKey: 'incidencia' as JosanzStatusPillKey,
    },
    {
      id: 'SKU-00126',
      ref: 'SKU-00126',
      name: 'Focos LED 50W',
      cat: 'Iluminación',
      stock: '0 uds',
      wh: 'Almacén Central',
      status: 'Agotado',
      pillKey: 'cancelado' as JosanzStatusPillKey,
    },
    {
      id: 'SKU-00127',
      ref: 'SKU-00127',
      name: 'Micrófono inalámbrico Shure',
      cat: 'Sonido',
      stock: '18 uds',
      wh: 'Almacén 01',
      status: 'En stock',
      pillKey: 'confirmado' as JosanzStatusPillKey,
    },
    {
      id: 'SKU-00128',
      ref: 'SKU-00128',
      name: 'Truss aluminio 3m',
      cat: 'Rigging',
      stock: '6 uds',
      wh: 'Almacén 02',
      status: 'En alquiler',
      pillKey: 'en-produccion' as JosanzStatusPillKey,
    },
  ] as const;

  readonly stockLabels = ['Producto', 'Categoría', 'Stock', 'Almacén'];

  get stockAdaptiveItems(): JosanzAdaptiveListItem[] {
    return this.stockItems.map((item) => ({
      id: item.id,
      title: item.ref,
      data: [item.name, item.cat, item.stock, item.wh],
      labels: this.stockLabels,
      status: item.status,
      statusVariant: item.pillKey,
    }));
  }

  get filteredStockItems(): JosanzAdaptiveListItem[] {
    return this.filterItems(this.stockAdaptiveItems);
  }

  constructor() {
    super();
    this.title = 'Stock';
    this.filterOptions = ['Todos', 'Almacén 01', 'Almacén 02', 'Almacén 03'];
  }

  override onAdd(): void {
    void this.router.navigate(['/stock', 'products', 'new']);
  }

  openProductDetail(productId: string): void {
    void this.router.navigate(['/stock', 'products', productId]);
  }

  onAddWarehouse(): void {
    void this.router.navigate(['/stock', 'warehouses', 'new']);
  }
}
