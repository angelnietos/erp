import { Component, Input, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import type { JosanzCatalogListRow } from '../../catalog/catalog-status';
import {
  JOSANZ_CATALOG_EVENT_STATUS_ROWS,
  JOSANZ_CATALOG_STATUS_FILTERS,
  JOSANZ_CATALOG_WAREHOUSE_TABS,
  railColorForCatalogRow,
} from '../../catalog/catalog-status';
import { AdaptiveListRowsComponent, type JosanzAdaptiveListItem } from '../adaptive-list-rows';
import { FilterTabsComponent } from '../filter-tabs';
import { ListTemplateHeaderRowComponent } from '../list-template-header-row';
import { MainListLayoutComponent } from '../main-list-layout';
import { SecondaryButtonComponent } from '../secondary-button';
import { SkeletonComponent } from '../skeleton';
import type { JosanzStatusPillVariant } from '../main-template-card';
import {
  resolveCatalogListFeatures,
  type JosanzCatalogListFeatures,
  type ResolvedCatalogListFeatures,
} from './catalog-list-features';
import { JosanzListExportService } from '../../list-export/josanz-list-export.service';
import {
  buildCatalogListExportPayload,
} from '../../list-export/list-export.utils';
import type { JosanzListExportFormat } from '../../list-export/list-export.types';
import { JosanzThemeService } from '../../services/theme.service';
import { isTableListView } from '../../list-view/list-view-preferences';

export type { JosanzCatalogListFeatures, ResolvedCatalogListFeatures };
export { resolveCatalogListFeatures };

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
  /** Visibilidad declarativa de bloques UX del listado. */
  features?: JosanzCatalogListFeatures;
  /** @deprecated Usar `features.advancedFilters`. */
  showAdvancedFilters?: boolean;
  /** @deprecated Usar `features.statusFilters`. */
  showStatusFilters?: boolean;
  paginationTotal?: number;
  paginationVariant?: 'figma' | 'numbered';
  pageSize?: number;
  /** Muestra skeleton de filas mientras la primera carga (sin datos en cachù). */
  loading?: boolean;
  loadingPlaceholderCount?: number;
}

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'josanz-catalog-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MainListLayoutComponent,
    AdaptiveListRowsComponent,
    FilterTabsComponent,
    ListTemplateHeaderRowComponent,
    SecondaryButtonComponent,
    SkeletonComponent,
  ],
  templateUrl: './josanz-catalog-list.html',
})
export class JosanzCatalogListComponent implements OnChanges {
  private readonly router = inject(Router);
  private readonly listExport = inject(JosanzListExportService);
  readonly themeService = inject(JosanzThemeService);

  @Input({ required: true }) config!: JosanzCatalogListConfig;

  /** Evita parpadeo de skeleton en cargas rùpidas (<200ms). */
  readonly showLoadingSkeleton = signal(false);
  private loadingDelayTimer?: ReturnType<typeof setTimeout>;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config']) {
      this.syncLoadingSkeleton(Boolean(this.config.loading));
    }
  }

  private syncLoadingSkeleton(loading: boolean): void {
    clearTimeout(this.loadingDelayTimer);
    if (!loading) {
      this.showLoadingSkeleton.set(false);
      return;
    }
    this.loadingDelayTimer = setTimeout(() => {
      if (this.config.loading) {
        this.showLoadingSkeleton.set(true);
      }
    }, 200);
  }

  searchQuery = '';
  activeStatusFilter = '';
  activeTypology = 'Todos';
  currentPage = 1;

  // Modal de filtros properties
  showFiltrosModal = false;
  selectedIdFilter = '';
  selectedNombreFilter = '';
  selectedFechaFilter = '';
  selectedClienteFilter = '';
  selectedOperadorFilter = '';
  selectedEstadoFilter = '';

  showExportModal = false;
  exportFormat: JosanzListExportFormat = 'xlsx';
  exportBusy = false;
  exportError = '';

  readonly defaultRowLabels = ['Nombre evento', 'Fecha', 'Cliente', 'Operador'];

  readonly defaultSummaryStats = [
    { label: 'Borrador', count: 1 },
    { label: 'En presupuesto', count: 3 },
    { label: 'Confirmado', count: 12 },
  ];

  get features(): ResolvedCatalogListFeatures {
    return resolveCatalogListFeatures(this.config);
  }

  get showColumnHeader(): boolean {
    const selection = this.themeService.listViewSelection();
    return (
      this.features.columnHeader &&
      (isTableListView(selection) || selection === 'tarjetas-lista')
    );
  }

  get showExtraFilters(): boolean {
    const f = this.features;
    return f.statusSummary || f.advancedFilters || f.statusFilters;
  }

  get typologyFilterOptions(): string[] {
    return this.features.typologyTabs ? this.filterOptions : [];
  }

  get effectiveSummaryLine(): JosanzCatalogListConfig['summaryLine'] {
    return this.features.summaryLine ? this.config.summaryLine : undefined;
  }

  get effectiveSecondaryLabel(): string {
    return this.features.secondaryAction ? (this.config.secondaryBtnLabel ?? '') : '';
  }

  get effectivePaginationTotal(): number {
    return this.features.pagination ? this.paginationTotal : 0;
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
    let hotelIndex = 0;
    return this.filteredRows.map((row) => {
      const hotelIdx = row.typology === 'Hoteles' ? hotelIndex++ : 0;
      const railColor =
        row.railColor ?? railColorForCatalogRow(row, hotelIdx);
      return {
        id: row.id,
        title: row.title ?? row.id,
        leadingMark: row.leadingMark,
        data: this.rowValues(row),
        labels: this.rowLabels,
        status: row.pillLabel,
        statusVariant: row.pillVariant,
        railColor,
        pillColor: row.pillColor,
        avatarGradient: !!row.leadingMark,
      };
    });
  }

  get paginatedItems(): JosanzAdaptiveListItem[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.adaptiveItems.slice(start, start + this.pageSize);
  }

  get filteredRows(): JosanzCatalogListRow[] {
    let rows = this.rows;
    rows = this.applyTypologyFilter(rows);
    rows = this.applyStatusFilter(rows);

    if (this.selectedIdFilter) {
      rows = rows.filter(r => r.id === this.selectedIdFilter);
    }
    if (this.selectedNombreFilter) {
      rows = rows.filter(r => r.eventName === this.selectedNombreFilter);
    }
    if (this.selectedFechaFilter) {
      rows = rows.filter(r => r.date === this.selectedFechaFilter);
    }
    if (this.selectedClienteFilter) {
      rows = rows.filter(r => r.client === this.selectedClienteFilter);
    }
    if (this.selectedOperadorFilter) {
      rows = rows.filter(r => r.operator === this.selectedOperadorFilter);
    }
    if (this.selectedEstadoFilter) {
      rows = rows.filter(r => r.pillLabel.toLowerCase() === this.selectedEstadoFilter.toLowerCase());
    }

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
    void this.router.navigate([base, item.id]);
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
    this.exportError = '';
    this.exportFormat = 'xlsx';
    this.showExportModal = true;
  }

  closeExportModal(): void {
    if (this.exportBusy) {
      return;
    }
    this.showExportModal = false;
    this.exportError = '';
  }

  async runExport(): Promise<void> {
    if (this.exportBusy) {
      return;
    }

    const rows = this.filteredRows;
    if (!rows.length) {
      this.exportError = 'No hay filas para exportar con los filtros actuales.';
      return;
    }

    const payload = buildCatalogListExportPayload(
      this.config,
      rows,
      (row) => this.rowValues(row),
      {
        search: this.searchQuery,
        typology: this.activeTypology,
        statusFilter: this.selectedStatusFilter,
        modalFilters: {
          id: this.selectedIdFilter,
          nombre: this.selectedNombreFilter,
          fecha: this.selectedFechaFilter,
          cliente: this.selectedClienteFilter,
          operador: this.selectedOperadorFilter,
          estado: this.selectedEstadoFilter,
        },
      },
    );

    this.exportBusy = true;
    this.exportError = '';
    try {
      await this.listExport.export(payload, this.exportFormat);
      this.showExportModal = false;
    } catch {
      this.exportError =
        'No se pudo generar la exportaciùn. Comprueba la sesiùn y vuelve a intentarlo.';
    } finally {
      this.exportBusy = false;
    }
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
    if (row.warehouse && tab.includes('Almacùn')) {
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
    if (tab === 'Logùstica') {
      return this.rowValues(row).some((v) => v.toLowerCase().includes('logùstica') || v.toLowerCase().includes('logistica'));
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

  // Modal actions and filters helper methods
  openFiltrosModal(): void {
    this.showFiltrosModal = true;
  }

  closeFiltrosModal(): void {
    this.showFiltrosModal = false;
  }

  clearAllModalFilters(): void {
    this.selectedIdFilter = '';
    this.selectedNombreFilter = '';
    this.selectedFechaFilter = '';
    this.selectedClienteFilter = '';
    this.selectedOperadorFilter = '';
    this.selectedEstadoFilter = '';
    this.currentPage = 1;
  }

  applyModalFilters(): void {
    this.currentPage = 1;
    this.closeFiltrosModal();
  }

  get activeFilterChips(): string[] {
    const chips: string[] = [];
    if (this.selectedIdFilter) chips.push(this.selectedIdFilter);
    if (this.selectedNombreFilter) chips.push(this.selectedNombreFilter);
    if (this.selectedFechaFilter) chips.push(this.selectedFechaFilter);
    if (this.selectedClienteFilter) chips.push(this.selectedClienteFilter);
    if (this.selectedOperadorFilter) chips.push(this.selectedOperadorFilter);
    if (this.selectedEstadoFilter) chips.push(this.selectedEstadoFilter);
    return chips;
  }

  removeFilterChip(chip: string): void {
    if (this.selectedIdFilter === chip) this.selectedIdFilter = '';
    else if (this.selectedNombreFilter === chip) this.selectedNombreFilter = '';
    else if (this.selectedFechaFilter === chip) this.selectedFechaFilter = '';
    else if (this.selectedClienteFilter === chip) this.selectedClienteFilter = '';
    else if (this.selectedOperadorFilter === chip) this.selectedOperadorFilter = '';
    else if (this.selectedEstadoFilter === chip) this.selectedEstadoFilter = '';
    this.currentPage = 1;
  }

  getUniqueIdOptions(): string[] {
    return Array.from(new Set(this.rows.map(r => r.id).filter((id): id is string => !!id)));
  }

  getUniqueNombreOptions(): string[] {
    return Array.from(new Set(this.rows.map(r => r.eventName).filter((n): n is string => !!n)));
  }

  getUniqueFechaOptions(): string[] {
    return Array.from(new Set(this.rows.map(r => r.date).filter((d): d is string => !!d)));
  }

  getUniqueClienteOptions(): string[] {
    return Array.from(new Set(this.rows.map(r => r.client).filter((c): c is string => !!c)));
  }

  getUniqueOperadorOptions(): string[] {
    return Array.from(new Set(this.rows.map(r => r.operator).filter((o): o is string => !!o)));
  }

  getUniqueEstadoOptions(): string[] {
    return Array.from(new Set(this.rows.map(r => r.pillLabel).filter((s): s is string => !!s)));
  }
}
