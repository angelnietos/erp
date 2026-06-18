import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  AdaptiveListRowsComponent,
  ListTemplateHeaderRowComponent,
  MainListLayoutComponent,
  BaseListComponent,
  MainTabsComponent,
  FilterTabsComponent,
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
    MainTabsComponent,
    FilterTabsComponent,
  ],
  templateUrl: './josanz-stock-feature-list.html',
  styleUrl: './josanz-stock-feature-list.css',
})
export class JosanzStockListComponent extends BaseListComponent {
  private readonly router = inject(Router);

  activeType = 'Productos / lotes';
  activeStatusFilter = 'Todos (248)';
  readonly typeTabs = ['Productos / lotes', 'Productos en alquiler'];

  readonly summaryStats = [
    { label: 'En stock', count: 198 },
    { label: 'Bajo mín.', count: 24 },
    { label: 'Agotado', count: 6 },
  ];

  readonly statusFilterOptions = [
    'Todos (248)',
    'En stock',
    'Bajo mín.',
    'Agotado',
    'En alquiler',
  ];

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
    let items = this.filterItems(this.stockAdaptiveItems);
    if (this.activeStatusFilter !== 'Todos (248)') {
      const key = this.activeStatusFilter.toLowerCase();
      items = items.filter((i) => i.status?.toLowerCase().includes(key.split(' ')[0] ?? key));
    }
    return items;
  }

  constructor() {
    super();
    this.title = 'Stock';
    this.primaryBtnLabel = 'Añadir producto +';
    this.filterOptions = ['Todos', 'Almacén 01', 'Almacén 02', 'Almacén 03'];
  }

  override onAdd(): void {
    void this.router.navigate(['/stock', 'products', 'new']);
  }

  openProductDetail(productId: string): void {
    void this.router.navigate(['/stock', 'products', productId]);
  }

  onStatusFilter(filter: string): void {
    this.activeStatusFilter = filter;
  }

  onTypeChange(type: string): void {
    this.activeType = type;
  }

  onAddWarehouse(): void {
    void this.router.navigate(['/stock', 'warehouses', 'new']);
  }
}
