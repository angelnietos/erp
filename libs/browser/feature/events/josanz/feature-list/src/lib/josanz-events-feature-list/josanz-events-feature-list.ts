import { Component } from '@angular/core';
import { JosanzCatalogListComponent } from '../josanz-catalog/josanz-catalog-list';
import type { JosanzCatalogListConfig } from '../josanz-catalog/josanz-catalog-list';

@Component({
  selector: 'josanz-events-feature-list',
  standalone: true,
  imports: [JosanzCatalogListComponent],
  template: `<josanz-catalog-list [config]="config" />`,
})
export class JosanzEventsFeatureListComponent {
  readonly config: JosanzCatalogListConfig = {
    title: 'Eventos',
    primaryBtnLabel: 'Añadir Evento +',
    statusColumnLabel: 'Estado',
    addRoute: '/events/new',
    filterOptions: ['Todos', 'Externo', 'Hotel', 'Espacio'],
  };
}
