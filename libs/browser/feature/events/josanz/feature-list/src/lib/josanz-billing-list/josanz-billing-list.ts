import { Component } from '@angular/core';
import { JosanzCatalogListComponent } from '../josanz-catalog/josanz-catalog-list';
import type { JosanzCatalogListConfig } from '../josanz-catalog/josanz-catalog-list';

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
    detailRoute: '/billing',
    summaryLine: '180 documentos · 24 pendientes de cobro',
  };
}
