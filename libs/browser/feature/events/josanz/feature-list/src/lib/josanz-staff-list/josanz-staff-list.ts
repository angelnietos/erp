import { Component } from '@angular/core';
import { JosanzCatalogListComponent } from '../josanz-catalog/josanz-catalog-list';
import type { JosanzCatalogListConfig } from '../josanz-catalog/josanz-catalog-list';

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
    statusColumnLabel: 'Estado',
    addRoute: '/users',
    detailRoute: '/staff',
    summaryLine: '100 personas · 12 en evento activo',
  };
}
