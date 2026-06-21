import { Component } from '@angular/core';
import {
  JosanzCatalogListComponent,
  JOSANZ_CATALOG_BILLING_TABS,
  type JosanzCatalogListConfig,
} from '@josanz-erp/josanz-ui';
import type { JosanzCatalogListRow } from '@josanz-erp/josanz-ui';

const BILLING_ROWS: JosanzCatalogListRow[] = [
  {
    id: 'FAC-0001',
    values: ['Factura 2026-001', '12/05/2026', 'Cliente ejemplo', '4.850 EUR'],
    pillLabel: 'Facturado',
    pillVariant: 'facturado',
  },
  {
    id: 'FAC-0002',
    values: ['Factura 2026-002', '16/05/2026', 'Hotel Central', '2.300 EUR'],
    pillLabel: 'Pendiente',
    pillVariant: 'presupuesto',
  },
  {
    id: 'ABO-0003',
    values: ['Abono 2026-003', '18/05/2026', 'Espacio Norte', '-450 EUR'],
    pillLabel: 'Revisión',
    pillVariant: 'incidencia',
  },
  {
    id: 'FAC-0004',
    values: ['Factura 2026-004', '21/05/2026', 'NovaByte', '7.120 EUR'],
    pillLabel: 'Cerrado',
    pillVariant: 'cerrado',
  },
];

@Component({
  selector: 'josanz-billing-list',
  standalone: true,
  imports: [JosanzCatalogListComponent],
  template: `<josanz-catalog-list [config]="config" />`,
})
export class JosanzBillingListComponent {
  readonly config: JosanzCatalogListConfig = {
    title: 'Facturación',
    primaryBtnLabel: 'Añadir factura',
    statusColumnLabel: 'Estado',
    rowLabels: ['Documento', 'Fecha emisión', 'Cliente', 'Importe'],
    rows: BILLING_ROWS,
    addRoute: '/billing/new',
    detailRoute: '/billing',
    filterOptions: JOSANZ_CATALOG_BILLING_TABS,
    summaryLine: {
      before: '180 documentos · ',
      emphasis: '24 pendientes',
      after: ' de cobro',
    },
    showAdvancedFilters: false,
    showStatusFilters: false,
    paginationTotal: 20,
    paginationVariant: 'numbered',
    statusBadgeStyle: 'outline',
  };
}
