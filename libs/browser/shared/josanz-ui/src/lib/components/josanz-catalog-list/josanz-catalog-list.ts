import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import type { JosanzCatalogListRow } from '../../catalog/catalog-status';
import {
  JOSANZ_CATALOG_EVENT_STATUS_ROWS,
  JOSANZ_CATALOG_STATUS_FILTERS,
  JOSANZ_CATALOG_WAREHOUSE_TABS,
} from '../../catalog/catalog-status';
import { AdaptiveListRowsComponent, type JosanzAdaptiveListItem } from '../adaptive-list-rows';
import { FilterTabsComponent } from '../filter-tabs';
import { ListTemplateHeaderRowComponent } from '../list-template-header-row';
import { MainListLayoutComponent } from '../main-list-layout';
import { SecondaryButtonComponent } from '../secondary-button';
import type { JosanzStatusPillVariant } from '../main-template-card';

export interface JosanzCatalogListConfig {
  title: string;
  primaryBtnLabel: string;
  secondaryBtnLabel?: string;
  /** @deprecated Usar `titleColumnLabel`. */
  idColumnLabel?: string;
  titleColumnLabel?: string;
  rowLabels?: string[];
  statusColumnLabel: 'Estado' | 'Tipo';
  rows?: JosanzCatalogListRow[];
  secondaryRoute?: string;
  addRoute?: string;
  detailRoute?: string;
  summaryLine?: string | { before: string; emphasis: string; after: string };
  summaryStats?: { label: string; count: number }[];
  filterOptions?: string[];
  statusFilterOptions?: string[];
  withLeadingMark?: boolean;
  /** Pastillas de estado: `outline` = Figma Eventos. */
  statusBadgeStyle?: 'filled' | 'outline';
  showAdvancedFilters?: boolean;
  showStatusFilters?: boolean;
  paginationTotal?: number;
  paginationVariant?: 'figma' | 'numbered';
  pageSize?: number;
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
  activeTypology = 'Todos';
  currentPage = 1;

  readonly defaultRowLabels = ['Nombre evento', 'Fecha', 'Cliente', 'Operador'];

  readonly defaultSummaryStats = [
    { label: 'Borrador', count: 1 },
    { label: 'En presupuesto', count: 3 },
    { label: 'Confirmado', count: 12 },
  ];

  get showExtraFilters(): boolean {
    if (this.config.showAdvancedFilters === true || this.config.showStatusFilters === true) {
      return true;
    }
    return !this.config.summaryLine && this.summaryStats.length > 0;
  }

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

  get pageSize(): number {
    return this.config.pageSize ?? 10;
  }

  get paginationTotal(): number {
    if (this.config.paginationTotal !== undefined) {
      return this.config.paginationTotal;
    }
    return Math.max(1, Math.ceil(this.filteredRows.length / this.pageSize));
  }

  get adaptiveItems(): JosanzAdaptiveListItem[] {
    return this.filteredRows.map((row) => ({
      id: row.id,
      title: row.title ?? row.id,
      leadingMark: row.leadingMark,
      data: this.rowValues(row),
      labels: this.rowLabels,
      status: row.pillLabel,
      statusVariant: row.pillVariant,
    }));
  }

  get paginatedItems(): JosanzAdaptiveListItem[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.adaptiveItems.slice(start, start + this.pageSize);
  }

  get filteredRows(): JosanzCatalogListRow[] {
    let rows = this.rows;
    rows = this.applyTypologyFilter(rows);
    rows = this.applyStatusFilter(rows);
    return this.applySearchFilter(rows);
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
    this.currentPage = 1;
  }

  onSearch(value: string): void {
    this.searchQuery = value;
    this.currentPage = 1;
  }

  onExcel(): void {
    // TODO: exportar cuando exista API
  }

  onTypologyFilter(option: string): void {
    this.activeTypology = option;
    this.currentPage = 1;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  private applyTypologyFilter(rows: JosanzCatalogListRow[]): JosanzCatalogListRow[] {
    const tab = this.activeTypology;
    if (!tab || tab === 'Todos' || tab === 'Todas') {
      return rows;
    }
    return rows.filter((row) => this.rowMatchesTypology(row, tab));
  }

  private rowMatchesTypology(row: JosanzCatalogListRow, tab: string): boolean {
    if (row.typology && row.typology === tab) {
      return true;
    }
    if (row.warehouse && tab.includes('Almacén')) {
      return row.warehouse === tab;
    }
    if (tab === 'Facturas') {
      return row.id.startsWith('FAC') || row.pillLabel.toLowerCase().includes('factura');
    }
    if (tab === 'Abonos') {
      return row.id.startsWith('ABO') || row.pillLabel.toLowerCase().includes('abono');
    }
    if (tab === 'Pendientes') {
      return ['presupuesto', 'incidencia', 'borrador'].includes(String(row.pillVariant));
    }
    if (tab === 'Tipo cliente 1') {
      return row.pillVariant === 'cliente-tipo-pink';
    }
    if (tab === 'Tipo cliente 2') {
      return row.pillVariant === 'cliente-tipo-green';
    }
    if (tab === 'Tipo cliente 3') {
      return row.pillVariant === 'cliente-tipo-yellow';
    }
    if (tab === 'Tipo cliente 4') {
      return row.pillVariant === 'cliente-nuevo';
    }
    if (tab === 'Enviados') {
      return row.pillVariant === 'presupuesto';
    }
    if (tab === 'Aceptados') {
      return row.pillVariant === 'confirmado';
    }
    if (tab === 'Borradores') {
      return row.pillVariant === 'borrador';
    }
    if (tab === 'Rechazados') {
      return row.pillVariant === 'cancelado';
    }
    if (tab === 'Administradores') {
      return this.rowValues(row).some((v) => v.toLowerCase().includes('administrador'));
    }
    if (tab === 'Operarios') {
      return this.rowValues(row).some((v) => v.toLowerCase().includes('operario'));
    }
    if (tab === 'Logística') {
      return this.rowValues(row).some((v) => v.toLowerCase().includes('logística') || v.toLowerCase().includes('logistica'));
    }
    return this.matchesTabByLabel(row, tab);
  }

  private matchesTabByLabel(row: JosanzCatalogListRow, tab: string): boolean {
    const needle = tab.toLowerCase();
    if (row.pillLabel.toLowerCase().includes(needle)) {
      return true;
    }
    return this.rowValues(row).some((v) => v.toLowerCase().includes(needle));
  }

  private applyStatusFilter(rows: JosanzCatalogListRow[]): JosanzCatalogListRow[] {
    const filter = this.selectedStatusFilter;
    if (!filter || filter.startsWith('Todos')) {
      return rows;
    }
    const key = filter.replace(/\s*\(\d+\)\s*$/, '').trim().toLowerCase();
    return rows.filter(
      (r) =>
        r.pillLabel.toLowerCase().includes(key) ||
        String(r.pillVariant).toLowerCase().includes(key.replace(/\s+/g, '-')),
    );
  }

  private applySearchFilter(rows: JosanzCatalogListRow[]): JosanzCatalogListRow[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) {
      return rows;
    }
    return rows.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        (r.title?.toLowerCase().includes(q) ?? false) ||
        this.rowValues(r).some((value) => value.toLowerCase().includes(q)) ||
        r.pillLabel.toLowerCase().includes(q),
    );
  }
}
