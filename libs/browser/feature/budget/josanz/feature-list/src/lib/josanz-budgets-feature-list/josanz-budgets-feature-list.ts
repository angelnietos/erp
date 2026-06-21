import { Component } from '@angular/core';
import {
  JosanzCatalogListComponent,
  JOSANZ_CATALOG_BUDGET_TABS,
  type JosanzCatalogListConfig,
} from '@josanz-erp/josanz-ui';
import type { JosanzCatalogListRow } from '@josanz-erp/josanz-ui';

const BUDGET_ROWS: JosanzCatalogListRow[] = [
  {
    id: 'PR-2024-010',
    title: 'PR-2024-010',
    values: ['Construcciones S.A.', '14/05/2024', '30 días', '4.500,00 €'],
    typology: 'Enviados',
    pillLabel: 'Enviado',
    pillVariant: 'presupuesto',
  },
  {
    id: 'PR-2024-011',
    title: 'PR-2024-011',
    values: ['Reformas García', '13/05/2024', '15 días', '1.250,00 €'],
    typology: 'Aceptados',
    pillLabel: 'Aceptado',
    pillVariant: 'confirmado',
  },
  {
    id: 'PR-2024-012',
    title: 'PR-2024-012',
    values: ['Hotel Playa Sol', '12/05/2024', '30 días', '12.800,00 €'],
    typology: 'Borradores',
    pillLabel: 'Borrador',
    pillVariant: 'borrador',
  },
  {
    id: 'PR-2024-013',
    title: 'PR-2024-013',
    values: ['Paco Montajes', '10/05/2024', '7 días', '850,00 €'],
    typology: 'Rechazados',
    pillLabel: 'Rechazado',
    pillVariant: 'cancelado',
  },
];

@Component({
  selector: 'josanz-budgets-feature-list',
  standalone: true,
  imports: [JosanzCatalogListComponent],
  template: `<josanz-catalog-list [config]="config" />`,
})
export class JosanzBudgetsFeatureListComponent {
  readonly config: JosanzCatalogListConfig = {
    title: 'Presupuestos',
    primaryBtnLabel: 'Añadir presupuesto',
    titleColumnLabel: 'Nº Presupuesto',
    rowLabels: ['Cliente', 'Fecha', 'Validez', 'Total'],
    statusColumnLabel: 'Estado',
    rows: BUDGET_ROWS,
    addRoute: '/budgets/new',
    detailRoute: '/budgets',
    filterOptions: JOSANZ_CATALOG_BUDGET_TABS,
    summaryLine: {
      before: '42 presupuestos · ',
      emphasis: '8 aceptados',
      after: '',
    },
    paginationTotal: 20,
    paginationVariant: 'numbered',
    statusBadgeStyle: 'outline',
  };
}
