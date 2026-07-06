import { Component } from '@angular/core';
import {
  JosanzCatalogListComponent,
  JOSANZ_CATALOG_WAREHOUSE_TABS,
  type JosanzCatalogListConfig,
} from '@josanz-erp/josanz-ui';
import type { JosanzCatalogListRow } from '@josanz-erp/josanz-ui';

const EQUIPMENT_ROWS: JosanzCatalogListRow[] = [
  {
    id: 'EQ-0001',
    values: ['Line array L-Acoustics', 'Sonido', 'Almacén 01', 'Rack A-12'],
    warehouse: 'Almacén 01',
    pillLabel: 'Disponible',
    pillVariant: 'confirmado',
  },
  {
    id: 'EQ-0002',
    values: ['Mesa Yamaha QL5', 'Sonido', 'Almacén 01', 'Control FOH'],
    warehouse: 'Almacén 01',
    pillLabel: 'Reservado',
    pillVariant: 'presupuesto',
  },
  {
    id: 'EQ-0003',
    values: ['Cabeza móvil Spiider', 'Iluminación', 'Almacén 02', 'Truss B'],
    warehouse: 'Almacén 02',
    pillLabel: 'En evento',
    pillVariant: 'en-produccion',
  },
  {
    id: 'EQ-0004',
    values: ['Pantalla LED 3.9', 'Vídeo', 'Almacén 03', 'Flightcase 08'],
    warehouse: 'Almacén 03',
    pillLabel: 'Mantenimiento',
    pillVariant: 'incidencia',
  },
];

@Component({
  selector: 'josanz-equipment-list',
  standalone: true,
  imports: [JosanzCatalogListComponent],
  template: `<josanz-catalog-list [config]="config" />`,
})
export class JosanzEquipmentListComponent {
  readonly config: JosanzCatalogListConfig = {
    title: 'Equipo audiovisual',
    primaryBtnLabel: 'Añadir Equipo',
    secondaryBtnLabel: 'Añadir Almacén',
    statusColumnLabel: 'Estado',
    rowLabels: ['Equipo', 'Categoría', 'Almacén', 'Ubicación'],
    rows: EQUIPMENT_ROWS,
    addRoute: '/equipment/new',
    secondaryRoute: '/stock/warehouses/new',
    detailRoute: '/equipment',
    filterOptions: JOSANZ_CATALOG_WAREHOUSE_TABS,
    summaryLine: {
      before: '180 equipos · ',
      emphasis: '8 activos',
      after: ' esta semana',
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
