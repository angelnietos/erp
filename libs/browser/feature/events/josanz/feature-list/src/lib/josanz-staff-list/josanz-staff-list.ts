import { Component } from '@angular/core';
import {
  JosanzCatalogListComponent,
  JOSANZ_CATALOG_STAFF_TABS,
  type JosanzCatalogListConfig,
} from '@josanz-erp/josanz-ui';
import type { JosanzCatalogListRow } from '@josanz-erp/josanz-ui';

const STAFF_ROWS: JosanzCatalogListRow[] = [
  {
    id: 'ST-0001',
    values: ['Laura Martín', 'Técnica sonido', '619 000 101', 'Disponible'],
    typology: 'Técnicos',
    pillLabel: 'Técnico',
    pillVariant: 'staff-tecnico',
  },
  {
    id: 'ST-0002',
    values: ['Nerea Vidal', 'Iluminación', '619 000 102', 'En evento'],
    typology: 'Freelance',
    pillLabel: 'Freelance',
    pillVariant: 'staff-freelance',
  },
  {
    id: 'ST-0003',
    values: ['Diego Santos', 'Auxiliar montaje', '619 000 103', 'Prácticas'],
    typology: 'Prácticas',
    pillLabel: 'En prácticas',
    pillVariant: 'staff-practicas',
  },
  {
    id: 'ST-0004',
    values: ['Marta López', 'Producción', '619 000 104', 'Vacaciones'],
    typology: 'Inasistencias',
    pillLabel: 'Inasistencia',
    pillVariant: 'inasistencia',
  },
];

@Component({
  selector: 'josanz-staff-list',
  standalone: true,
  imports: [JosanzCatalogListComponent],
  template: `<josanz-catalog-list [config]="config" />`,
})
export class JosanzStaffListComponent {
  readonly config: JosanzCatalogListConfig = {
    title: 'Staff',
    primaryBtnLabel: 'Añadir personal',
    statusColumnLabel: 'Tipo',
    rowLabels: ['Nombre', 'Perfil', 'Teléfono', 'Disponibilidad'],
    rows: STAFF_ROWS,
    addRoute: '/staff/new',
    detailRoute: '/staff',
    filterOptions: JOSANZ_CATALOG_STAFF_TABS,
    summaryLine: {
      before: '100 personas · ',
      emphasis: '12 en evento',
      after: ' activo',
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
