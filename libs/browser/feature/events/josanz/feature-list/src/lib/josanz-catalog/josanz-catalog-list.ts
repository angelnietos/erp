import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  AdaptiveListRowsComponent,
  FilterTabsComponent,
  ListTemplateHeaderRowComponent,
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
  idColumnLabel?: string;
  rowLabels?: string[];
  statusColumnLabel: 'Estado' | 'Tipo';
  rows?: JosanzCatalogListRow[];
  secondaryRoute?: string;
  addRoute?: string;
  detailRoute?: string;
  summaryLine?: string;
  summaryStats?: { label: string; count: number }[];
  filterOptions?: string[];
  statusFilterOptions?: string[];
}

@Component({
  selector: 'josanz-catalog-list',
  standalone: true,
  imports: [
    CommonModule,
    MainListLayoutComponent,
    AdaptiveListRowsComponent,
    FilterTabsComponent,
    ListTemplateHeaderRowComponent,
    SecondaryButtonComponent,
  ],
  templateUrl: './josanz-catalog-list.html',
})
export class JosanzCatalogListComponent {
  private readonly router = inject(Router);

  @Input({ required: true }) config!: JosanzCatalogListConfig;

  searchQuery = '';
  activeStatusFilter = '';

  readonly defaultRowLabels = ['Nombre evento', 'Fecha', 'Cliente', 'Operador'];

  readonly defaultSummaryStats = [
    { label: 'Borrador', count: 1 },
    { label: 'En presupuesto', count: 3 },
    { label: 'Confirmado', count: 12 },
  ];

  get filterOptions(): string[] {
    return this.config.filterOptions ?? JOSANZ_CATALOG_WAREHOUSE_TABS;
  }

  get statusFilterOptions(): string[] {
    return this.config.statusFilterOptions ?? JOSANZ_CATALOG_STATUS_FILTERS;
  }

  get selectedStatusFilter(): string {
    return this.statusFilterOptions.includes(this.activeStatusFilter)
      ? this.activeStatusFilter
      : (this.statusFilterOptions[0] ?? '');
  }

  get rowLabels(): string[] {
    return this.config.rowLabels ?? this.defaultRowLabels;
  }

  get summaryStats(): { label: string; count: number }[] {
    return this.config.summaryStats ?? this.defaultSummaryStats;
  }

  get rows(): JosanzCatalogListRow[] {
    return this.config.rows ?? JOSANZ_CATALOG_EVENT_STATUS_ROWS;
  }

  get adaptiveItems(): JosanzAdaptiveListItem[] {
    return this.filteredRows.map((row) => ({
      id: row.id,
      title: row.id,
      data: this.rowValues(row),
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
        this.rowValues(r).some((value) => value.toLowerCase().includes(q)) ||
        r.pillLabel.toLowerCase().includes(q),
    );
  }

  rowValues(row: JosanzCatalogListRow): string[] {
    return (
      row.values ?? [
        row.eventName ?? '',
        row.date ?? '',
        row.client ?? '',
        row.operator ?? '',
      ]
    );
  }

  onAdd(): void {
    if (this.config.addRoute) {
      void this.router.navigate([this.config.addRoute]);
    }
  }

  onSecondary(): void {
    const target = this.config.secondaryRoute ?? '/stock';
    void this.router.navigate([target]);
  }

  onRowClick(item: JosanzAdaptiveListItem): void {
    const base = this.config.detailRoute ?? '/events';
    void this.router.navigate([base, item.id.replace(/^0+/, '') || '1']);
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

  onTypologyFilter(): void {
    // TODO: filtrar por almacén / tipología
  }
}
