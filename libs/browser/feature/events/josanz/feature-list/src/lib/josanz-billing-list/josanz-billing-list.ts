import { Component } from '@angular/core';
import { JosanzCatalogListComponent } from '../josanz-catalog/josanz-catalog-list';
import type { JosanzCatalogListConfig } from '../josanz-catalog/josanz-catalog-list';
import type { JosanzCatalogListRow } from '../josanz-catalog/catalog-status';

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
    primaryBtnLabel: 'Añadir factura +',
    secondaryBtnLabel: 'Añadir Almacén +',
    statusColumnLabel: 'Estado',
    rowLabels: ['Documento', 'Fecha emisión', 'Cliente', 'Importe'],
    rows: BILLING_ROWS,
    detailRoute: '/billing',
    summaryLine: '180 documentos · 24 pendientes de cobro',
    summaryStats: [
      { label: 'Facturado', count: 132 },
      { label: 'Pendiente', count: 24 },
      { label: 'Revisión', count: 5 },
    ],
    statusFilterOptions: [
      'Todos (180)',
      'Facturado',
      'Pendiente',
      'Revisión',
      'Cerrado',
    ],
  };
}
