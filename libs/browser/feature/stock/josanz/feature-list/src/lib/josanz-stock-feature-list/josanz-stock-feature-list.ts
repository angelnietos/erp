import { Component } from '@angular/core';
import {
  JosanzCatalogListComponent,
  JOSANZ_CATALOG_WAREHOUSE_TABS,
  type JosanzCatalogListConfig,
} from '@josanz-erp/josanz-ui';
import type { JosanzCatalogListRow } from '@josanz-erp/josanz-ui';

const STOCK_ROWS: JosanzCatalogListRow[] = [
  {
    id: 'SKU-00124',
    title: 'SKU-00124',
    values: ['Cableado Estructurado Cat6', 'Electrónica', '250 m', 'Almacén Central'],
    warehouse: 'Almacén 01',
    pillLabel: 'En stock',
    pillVariant: 'confirmado',
  },
  {
    id: 'SKU-00125',
    title: 'SKU-00125',
    values: ['Pack Herramientas Pro', 'Herramientas', '12 uds', 'Taller Norte'],
    warehouse: 'Almacén 02',
    pillLabel: 'Bajo mín.',
    pillVariant: 'incidencia',
  },
  {
    id: 'SKU-00126',
    title: 'SKU-00126',
    values: ['Focos LED 50W', 'Iluminación', '0 uds', 'Almacén Central'],
    warehouse: 'Almacén 01',
    pillLabel: 'Agotado',
    pillVariant: 'cancelado',
  },
  {
    id: 'SKU-00127',
    title: 'SKU-00127',
    values: ['Micrófono inalámbrico Shure', 'Sonido', '18 uds', 'Almacén 01'],
    warehouse: 'Almacén 01',
    pillLabel: 'En stock',
    pillVariant: 'confirmado',
  },
  {
    id: 'SKU-00128',
    title: 'SKU-00128',
    values: ['Truss aluminio 3m', 'Rigging', '6 uds', 'Almacén 02'],
    warehouse: 'Almacén 02',
    pillLabel: 'En alquiler',
    pillVariant: 'en-produccion',
  },
];

@Component({
  selector: 'josanz-stock-list',
  standalone: true,
  imports: [JosanzCatalogListComponent],
  template: `<josanz-catalog-list [config]="config" />`,
})
export class JosanzStockListComponent {
  readonly config: JosanzCatalogListConfig = {
    title: 'Stock',
    primaryBtnLabel: 'Añadir producto',
    secondaryBtnLabel: 'Añadir Almacén',
    titleColumnLabel: 'Referencia',
    rowLabels: ['Producto', 'Categoría', 'Stock', 'Almacén'],
    statusColumnLabel: 'Estado',
    rows: STOCK_ROWS,
    addRoute: '/stock/new',
    secondaryRoute: '/stock/warehouses/new',
    detailRoute: '/stock',
    filterOptions: JOSANZ_CATALOG_WAREHOUSE_TABS,
    summaryLine: {
      before: '248 productos · ',
      emphasis: '198 en stock',
      after: '',
    },
    features: {
      advancedFilters: false,
      statusFilters: false,
    },
    paginationTotal: 20,
    paginationVariant: 'numbered',
    statusBadgeStyle: 'outline',
  };
}
