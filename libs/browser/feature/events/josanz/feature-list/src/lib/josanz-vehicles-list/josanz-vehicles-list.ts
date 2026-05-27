import { Component } from '@angular/core';
import { JosanzCatalogListComponent } from '../josanz-catalog/josanz-catalog-list';
import type { JosanzCatalogListConfig } from '../josanz-catalog/josanz-catalog-list';

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
    addRoute: '/events/new',
    detailRoute: '/vehicles',
    summaryLine: '42 vehículos · 3 en ruta hoy',
  };
}
