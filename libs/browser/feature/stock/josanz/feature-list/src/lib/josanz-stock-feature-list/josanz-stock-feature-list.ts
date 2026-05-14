import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  MainListLayoutComponent,
  MainTemplateCardComponent,
  BaseListComponent,
  ButtonComponent,
  MainTabsComponent,
  FilterTabsComponent,
  JosanzThemeService,
} from '@josanz-erp/josanz-ui';

@Component({
  selector: 'josanz-stock-list',
  standalone: true,
  imports: [CommonModule, MainListLayoutComponent, MainTemplateCardComponent, ButtonComponent, MainTabsComponent, FilterTabsComponent],
  templateUrl: './josanz-stock-feature-list.html',
  styleUrl: './josanz-stock-feature-list.css',
})
export class JosanzStockListComponent extends BaseListComponent {
  readonly themeService = inject(JosanzThemeService);
  private readonly router = inject(Router);

  activeType = 'Productos / lotes';
  secondaryFilterOptions = ['Todos', 'Almacén 01', 'Almacén 02', 'Almacén 03'];

  readonly stockItems = [
    {
      id: 'SKU-00124',
      ref: 'SKU-00124',
      name: 'Cableado Estructurado Cat6',
      cat: 'Electrónica',
      stock: '250 m',
      wh: 'Almacén Central',
      status: 'En Stock',
    },
    {
      id: 'SKU-00125',
      ref: 'SKU-00125',
      name: 'Pack Herramientas Pro',
      cat: 'Herramientas',
      stock: '12 uds',
      wh: 'Taller Norte',
      status: 'Bajo Mín.',
    },
    {
      id: 'SKU-00126',
      ref: 'SKU-00126',
      name: 'Focos LED 50W',
      cat: 'Iluminación',
      stock: '0 uds',
      wh: 'Almacén Central',
      status: 'Agotado',
    },
  ] as const;

  constructor() {
    super();
    this.title = 'Stock';
    this.primaryBtnLabel = 'Añadir Producto +';
    this.filterOptions = ['Todos', 'Equipo X', 'Equipo Y', 'Equipo Z'];
  }

  override onAdd(): void {
    void this.router.navigate(['/stock', 'products', 'new']);
  }

  openProductDetail(productId: string): void {
    void this.router.navigate(['/stock', 'products', productId]);
  }

  onSecondaryFilterChange(filter: string) {
    console.log('Filtro secundario:', filter);
  }

  onTypeChange(type: string) {
    this.activeType = type;
  }

  onAddWarehouse(): void {
    void this.router.navigate(['/stock', 'warehouses', 'new']);
  }
}
