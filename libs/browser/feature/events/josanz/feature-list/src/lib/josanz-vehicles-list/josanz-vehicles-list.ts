import { Component } from '@angular/core';
import { JosanzCatalogListComponent } from '../josanz-catalog/josanz-catalog-list';
import type { JosanzCatalogListConfig } from '../josanz-catalog/josanz-catalog-list';
import type { JosanzCatalogListRow } from '../josanz-catalog/catalog-status';

const VEHICLE_ROWS: JosanzCatalogListRow[] = [
  {
    id: 'VH-0001',
    values: ['Mercedes Sprinter', '1234 KLM', 'Almacén 01', 'Carlos Ruiz'],
    pillLabel: 'Disponible',
    pillVariant: 'confirmado',
  },
  {
    id: 'VH-0002',
    values: ['Iveco Daily', '9876 JFS', 'Almacén 02', 'Laura Martín'],
    pillLabel: 'En ruta',
    pillVariant: 'en-ejecucion',
  },
  {
    id: 'VH-0003',
    values: ['Renault Master', '4321 LPR', 'Almacén 03', 'Operaciones'],
    pillLabel: 'Reservado',
    pillVariant: 'presupuesto',
  },
  {
    id: 'VH-0004',
    values: ['Nissan Cabstar', '7654 HGT', 'Taller externo', 'Flota'],
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
    primaryBtnLabel: 'Añadir vehículo +',
    secondaryBtnLabel: 'Añadir Almacén +',
    statusColumnLabel: 'Estado',
    rowLabels: ['Vehículo', 'Matrícula', 'Base', 'Responsable'],
    rows: VEHICLE_ROWS,
    addRoute: '/vehicles',
    detailRoute: '/vehicles',
    summaryLine: '42 vehículos · 3 en ruta hoy',
    summaryStats: [
      { label: 'Disponible', count: 29 },
      { label: 'En ruta', count: 3 },
      { label: 'Incidencia', count: 2 },
    ],
    statusFilterOptions: ['Todos (42)', 'Disponible', 'Reservado', 'En ruta', 'Incidencia'],
  };
}
