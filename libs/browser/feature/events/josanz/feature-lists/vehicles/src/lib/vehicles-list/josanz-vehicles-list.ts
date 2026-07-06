import { Component } from '@angular/core';
import {
  JosanzCatalogListComponent,
  JOSANZ_CATALOG_VEHICLE_TABS,
  type JosanzCatalogListConfig,
} from '@josanz-erp/josanz-ui';
import type { JosanzCatalogListRow } from '@josanz-erp/josanz-ui';

const VEHICLE_ROWS: JosanzCatalogListRow[] = [
  {
    id: 'VH-0001',
    values: ['Mercedes Sprinter', '1234 KLM', 'Almacén 01', 'Carlos Ruiz'],
    typology: 'Disponibles',
    pillLabel: 'Disponible',
    pillVariant: 'confirmado',
  },
  {
    id: 'VH-0002',
    values: ['Iveco Daily', '9876 JFS', 'Almacén 02', 'Laura Martín'],
    typology: 'En ruta',
    pillLabel: 'En ruta',
    pillVariant: 'en-ejecucion',
  },
  {
    id: 'VH-0003',
    values: ['Renault Master', '4321 LPR', 'Almacén 03', 'Operaciones'],
    typology: 'Reservados',
    pillLabel: 'Reservado',
    pillVariant: 'presupuesto',
  },
  {
    id: 'VH-0004',
    values: ['Nissan Cabstar', '7654 HGT', 'Taller externo', 'Flota'],
    typology: 'Incidencias',
    pillLabel: 'Incidencia',
    pillVariant: 'incidencia',
  },
];

@Component({
  selector: 'josanz-vehicles-list',
  standalone: true,
  imports: [JosanzCatalogListComponent],
  template: `<josanz-catalog-list [config]="config" />`,
})
export class JosanzVehiclesListComponent {
  readonly config: JosanzCatalogListConfig = {
    title: 'Vehículos',
    primaryBtnLabel: 'Añadir vehículo',
    statusColumnLabel: 'Estado',
    rowLabels: ['Vehículo', 'Matrícula', 'Base', 'Responsable'],
    rows: VEHICLE_ROWS,
    addRoute: '/vehicles/new',
    detailRoute: '/vehicles',
    filterOptions: JOSANZ_CATALOG_VEHICLE_TABS,
    summaryLine: {
      before: '42 vehículos · ',
      emphasis: '3 en ruta',
      after: ' hoy',
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
