import { Component } from '@angular/core';
import {
  JosanzCatalogListComponent,
  JOSANZ_CATALOG_USER_TABS,
  type JosanzCatalogListConfig,
} from '@josanz-erp/josanz-ui';
import type { JosanzCatalogListRow } from '@josanz-erp/josanz-ui';

const USER_ROWS: JosanzCatalogListRow[] = [
  {
    id: 'admin@josanz.com',
    title: 'Admin Josanz',
    leadingMark: 'AJ',
    values: ['admin@josanz.com', '+34 600 000 001', 'Administrador', 'Hace 5 min'],
    typology: 'Administradores',
    pillLabel: 'Activo',
    pillVariant: 'confirmado',
  },
  {
    id: 'juan.perez@josanz.com',
    title: 'Juan Pérez',
    leadingMark: 'JP',
    values: ['juan.perez@josanz.com', '+34 600 000 002', 'Operario', 'Ayer'],
    typology: 'Operarios',
    pillLabel: 'Activo',
    pillVariant: 'confirmado',
  },
  {
    id: 'ana.belen@josanz.com',
    title: 'Ana Belén',
    leadingMark: 'AB',
    values: ['ana.belen@josanz.com', '+34 600 000 003', 'Logística', '12/05/2024'],
    typology: 'Logística',
    pillLabel: 'Ausente',
    pillVariant: 'inasistencia',
  },
];

@Component({
  selector: 'lib-josanz-users-list',
  standalone: true,
  imports: [JosanzCatalogListComponent],
  template: `<josanz-catalog-list [config]="config" />`,
  styleUrl: './josanz-users-feature-list.css',
})
export class JosanzUsersListComponent {
  readonly config: JosanzCatalogListConfig = {
    title: 'Usuario/as',
    primaryBtnLabel: 'Añadir Usuario',
    titleColumnLabel: 'Nombre y Apellidos',
    rowLabels: ['Email', 'Teléfono', 'Rol', 'Último acceso'],
    statusColumnLabel: 'Estado',
    rows: USER_ROWS,
    addRoute: '/users/new',
    detailRoute: '/users',
    filterOptions: JOSANZ_CATALOG_USER_TABS,
    withLeadingMark: true,
    summaryLine: {
      before: '3 usuarios · ',
      emphasis: '2 activos',
      after: '',
    },
    paginationTotal: 20,
    paginationVariant: 'numbered',
    statusBadgeStyle: 'outline',
  };
}
