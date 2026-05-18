import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  AdaptiveListRowsComponent,
  FilterTabsComponent,
  JosanzThemeService,
  MainListLayoutComponent,
  SecondaryButtonComponent,
  type JosanzAdaptiveListItem,
} from '@josanz-erp/josanz-ui';
import type { JosanzCatalogListRow } from './catalog-status';
import {
  JOSANZ_CATALOG_EVENT_STATUS_ROWS,
  JOSANZ_CATALOG_STATUS_FILTERS,
  JOSANZ_CATALOG_WAREHOUSE_TABS,
} from './catalog-status';

export interface JosanzCatalogListConfig {
  title: string;
  primaryBtnLabel: string;
  secondaryBtnLabel?: string;
  statusColumnLabel: 'Estado' | 'Tipo';
  rows?: JosanzCatalogListRow[];
  addRoute?: string;
  summaryLine?: string;
  filterOptions?: string[];
}

@Component({
  selector: 'josanz-catalog-list',
  standalone: true,
  imports: [
    CommonModule,
    MainListLayoutComponent,
    AdaptiveListRowsComponent,
    FilterTabsComponent,
    SecondaryButtonComponent,
  ],
  templateUrl: './josanz-catalog-list.html',
})
export class JosanzCatalogListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly theme = inject(JosanzThemeService);

  @Input({ required: true }) config!: JosanzCatalogListConfig;

  searchQuery = '';
  activeStatusFilter = 'Todos (80)';

  readonly rowLabels = ['Nombre evento', 'Fecha', 'Cliente', 'Operador'];

  readonly summaryStats = [
    { label: 'Borrador', count: 1 },
    { label: 'En presupuesto', count: 3 },
    { label: 'Confirmado', count: 12 },
  ];

  ngOnInit(): void {
    this.theme.setListViewSelection('tarjetas-lista');
  }

  get filterOptions(): string[] {
    return this.config.filterOptions ?? JOSANZ_CATALOG_WAREHOUSE_TABS;
  }

  readonly statusFilterOptions = JOSANZ_CATALOG_STATUS_FILTERS;

  get rows(): JosanzCatalogListRow[] {
    return this.config.rows ?? JOSANZ_CATALOG_EVENT_STATUS_ROWS;
  }

  get adaptiveItems(): JosanzAdaptiveListItem[] {
    return this.filteredRows.map((row) => ({
      id: row.id,
      title: row.id,
      data: [row.eventName, row.date, row.client, row.operator],
      labels: this.rowLabels,
      status: row.pillLabel,
      statusVariant: row.pillVariant,
    }));
  }

  get filteredRows(): JosanzCatalogListRow[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) {
      return this.rows;
    }
    return this.rows.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.eventName.toLowerCase().includes(q) ||
        r.client.toLowerCase().includes(q) ||
        r.operator.toLowerCase().includes(q),
    );
  }

  onAdd(): void {
    if (this.config.addRoute) {
      void this.router.navigate([this.config.addRoute]);
    }
  }

  onSecondary(): void {
    void this.router.navigate(['/stock']);
  }

  onRowClick(item: JosanzAdaptiveListItem): void {
    void this.router.navigate(['/events', item.id.replace(/^0+/, '') || '1']);
  }

  onStatusFilter(option: string): void {
    this.activeStatusFilter = option;
  }

  onSearch(value: string): void {
    this.searchQuery = value;
  }

  onExcel(): void {
    // TODO: exportar cuando exista API
  }

  onTypologyFilter(_value: string): void {
    // TODO: filtrar por almacén / tipología
  }
}
