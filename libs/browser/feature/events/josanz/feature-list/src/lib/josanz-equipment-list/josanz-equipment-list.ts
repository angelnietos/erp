import { Component } from '@angular/core';
import { JosanzCatalogListComponent } from '../josanz-catalog/josanz-catalog-list';
import type { JosanzCatalogListConfig } from '../josanz-catalog/josanz-catalog-list';
import type { JosanzCatalogListRow } from '../josanz-catalog/catalog-status';

const EQUIPMENT_ROWS: JosanzCatalogListRow[] = [
  {
    id: 'EQ-0001',
    values: ['Line array L-Acoustics', 'Sonido', 'Almacén 01', 'Rack A-12'],
    pillLabel: 'Disponible',
    pillVariant: 'confirmado',
  },
  {
    id: 'EQ-0002',
    values: ['Mesa Yamaha QL5', 'Sonido', 'Almacén 01', 'Control FOH'],
    pillLabel: 'Reservado',
    pillVariant: 'presupuesto',
  },
  {
    id: 'EQ-0003',
    values: ['Cabeza móvil Spiider', 'Iluminación', 'Almacén 02', 'Truss B'],
    pillLabel: 'En evento',
    pillVariant: 'en-produccion',
  },
  {
    id: 'EQ-0004',
    values: ['Pantalla LED 3.9', 'Vídeo', 'Almacén 03', 'Flightcase 08'],
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
    primaryBtnLabel: 'Añadir Equipo +',
    secondaryBtnLabel: 'Añadir Almacén +',
    statusColumnLabel: 'Estado',
    rowLabels: ['Equipo', 'Categoría', 'Almacén', 'Ubicación'],
    rows: EQUIPMENT_ROWS,
    addRoute: '/equipment/new',
    secondaryRoute: '/stock/warehouses/new',
    detailRoute: '/equipment',
    summaryLine: '180 equipos · 8 activos esta semana',
    summaryStats: [
      { label: 'Disponible', count: 124 },
      { label: 'Reservado', count: 18 },
      { label: 'Mantenimiento', count: 6 },
    ],
    statusFilterOptions: [
      'Todos (180)',
      'Disponible',
      'Reservado',
      'En evento',
      'Mantenimiento',
    ],
  };
}
