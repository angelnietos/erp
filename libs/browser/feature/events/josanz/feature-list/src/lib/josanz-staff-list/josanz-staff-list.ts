import { Component } from '@angular/core';
import { JosanzCatalogListComponent } from '../josanz-catalog/josanz-catalog-list';
import type { JosanzCatalogListConfig } from '../josanz-catalog/josanz-catalog-list';
import type { JosanzCatalogListRow } from '../josanz-catalog/catalog-status';

const STAFF_ROWS: JosanzCatalogListRow[] = [
  {
    id: 'ST-0001',
    values: ['Laura Martín', 'Técnica sonido', '619 000 101', 'Disponible'],
    pillLabel: 'Técnico',
    pillVariant: 'staff-tecnico',
  },
  {
    id: 'ST-0002',
    values: ['Nerea Vidal', 'Iluminación', '619 000 102', 'En evento'],
    pillLabel: 'Freelance',
    pillVariant: 'staff-freelance',
  },
  {
    id: 'ST-0003',
    values: ['Diego Santos', 'Auxiliar montaje', '619 000 103', 'Prácticas'],
    pillLabel: 'En prácticas',
    pillVariant: 'staff-practicas',
  },
  {
    id: 'ST-0004',
    values: ['Marta López', 'Producción', '619 000 104', 'Vacaciones'],
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
    primaryBtnLabel: 'Añadir personal +',
    secondaryBtnLabel: 'Añadir Equipo +',
    statusColumnLabel: 'Tipo',
    rowLabels: ['Nombre', 'Perfil', 'Teléfono', 'Disponibilidad'],
    rows: STAFF_ROWS,
    addRoute: '/staff/new',
    detailRoute: '/staff',
    summaryLine: '100 personas · 12 en evento activo',
    summaryStats: [
      { label: 'Técnicos', count: 52 },
      { label: 'Freelance', count: 31 },
      { label: 'Prácticas', count: 8 },
    ],
    statusFilterOptions: [
      'Todos (100)',
      'Técnico',
      'Freelance',
      'En prácticas',
      'Inasistencia',
    ],
  };
}
