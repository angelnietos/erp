import { Component } from '@angular/core';
import { JosanzCatalogListComponent, type JosanzCatalogListConfig } from '@josanz-erp/josanz-ui';

@Component({
  selector: 'josanz-events-feature-list',
  standalone: true,
  imports: [JosanzCatalogListComponent],
  template: `<josanz-catalog-list [config]="config" />`,
})
export class JosanzEventsFeatureListComponent {
  readonly config: JosanzCatalogListConfig = {
    title: 'Eventos',
    primaryBtnLabel: 'Añadir Evento',
    statusColumnLabel: 'Estado',
    addRoute: '/events/new',
    filterOptions: ['Todos', 'Externos', 'Hoteles', 'Espacios'],
    summaryLine: {
      before: '180 eventos · ',
      emphasis: '8 activos',
      after: ' esta semana',
    },
    showAdvancedFilters: false,
    showStatusFilters: false,
    paginationTotal: 20,
    paginationVariant: 'numbered',
    statusBadgeStyle: 'outline',
  };
}
