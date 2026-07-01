import { Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, ViewChild, effect, inject, signal } from '@angular/core';
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
import { isStatusBoardView, isTableListView } from '../../list-view/list-view-preferences';
import { isDateInBoardPeriod, type JosanzBoardPeriodKind } from '../../list-view/board-period';
import { CatalogThemeFacade } from '../../services/catalog-theme.facade';
import {
  eventStatusOptionsFromTheme,
  resolveEventStatusPillColor,
} from '../../catalog/catalog-theme';
import {
  StatusKanbanBoardComponent,
  type JosanzStatusKanbanChange,
  type JosanzStatusKanbanItem,
} from '../status-kanban-board/status-kanban-board';
import { BoardPeriodToolbarComponent } from '../board-period-toolbar/board-period-toolbar';
import {
  resolveCatalogModalFilterFields,
  uniqueCatalogModalFilterOptions,
  type JosanzCatalogModalFilterField,
  type JosanzCatalogModalFilterMode,
} from '../../catalog/catalog-modal-filters';
import type { JosanzCatalogFiltersPresentation } from '../../list-view/list-view-preferences';

export type { JosanzCatalogListFeatures, ResolvedCatalogListFeatures };
export { resolveCatalogListFeatures };
export type { JosanzCatalogModalFilterMode };

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
  /** Muestra skeleton de filas mientras la primera carga (sin datos en cach?). */
  loading?: boolean;
  loadingPlaceholderCount?: number;
  /** Campos del modal Filtros: `events` (por defecto) o `clients`. */
  modalFilterMode?: JosanzCatalogModalFilterMode;
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
    StatusKanbanBoardComponent,
    BoardPeriodToolbarComponent,
  ],
  templateUrl: './josanz-catalog-list.html',
})
export class JosanzCatalogListComponent implements OnChanges {
  private readonly router = inject(Router);
  private readonly listExport = inject(JosanzListExportService);
  readonly themeService = inject(JosanzThemeService);
  private readonly catalogTheme = inject(CatalogThemeFacade);

  @ViewChild(MainListLayoutComponent)
  private listLayout?: MainListLayoutComponent;

  private trackedPageSize = 0;

  private kanbanItemsFingerprint = '';
  private kanbanItemsSnapshot: JosanzStatusKanbanItem[] = [];
  private kanbanColumnsFingerprint = '';
  private kanbanColumnsSnapshot: {
    value: string;
    label: string;
    color?: string;
  }[] = [];
  private paginatedItemsFingerprint = '';
  private paginatedItemsSnapshot: JosanzAdaptiveListItem[] = [];

  constructor() {
    effect(() => {
      this.themeService.listPageSize();
      this.syncPageSizeAndReset();
      this.invalidateListSnapshots();
    });
  }

  @Input({ required: true }) config!: JosanzCatalogListConfig;

  @Output() rowStatusChange = new EventEmitter<{ id: string; status: string; previousStatus: string }>();

  readonly statusUpdateBusyIds = signal<string[]>([]);

  /** Evita parpadeo de skeleton en cargas r?pidas (<200ms). */
  readonly showLoadingSkeleton = signal(false);
  private loadingDelayTimer?: ReturnType<typeof setTimeout>;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config']) {
      this.invalidateListSnapshots();
      this.syncLoadingSkeleton(Boolean(this.config.loading));
      this.ensureValidViewSelection();
      this.syncPageSizeAndReset();
    }
  }

  private invalidateListSnapshots(): void {
    this.kanbanItemsFingerprint = '';
    this.kanbanColumnsFingerprint = '';
    this.paginatedItemsFingerprint = '';
  }

  private syncPageSizeAndReset(): void {
    const size = this.pageSize;
    if (this.trackedPageSize !== 0 && size !== this.trackedPageSize) {
      this.currentPage = 1;
    }
    this.trackedPageSize = size;
  }

  private ensureValidViewSelection(): void {
    if (
      !this.features.statusBoard &&
      isStatusBoardView(this.themeService.listViewSelection())
    ) {
      this.themeService.setListViewSelection('tarjetas-lista');
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

  // Panel de filtros (inline o popover Figma)
  showFiltrosPanel = false;
  selectedModalFilters: Record<string, string> = {};
  popoverStyle: Record<string, string> = {};

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
    if (this.showStatusBoardView()) {
      return false;
    }
    const selection = this.themeService.listViewSelection();
    return (
      this.features.columnHeader &&
      (isTableListView(selection) || selection === 'tarjetas-lista')
    );
  }

  showStatusBoardView(): boolean {
    return (
      this.features.statusBoard &&
      isStatusBoardView(this.themeService.listViewSelection())
    );
  }

  get kanbanColumns() {
    const columns = this.buildKanbanColumns();
    const fingerprint = columns
      .map((column) => `${column.value}:${column.label}:${column.color ?? ''}`)
      .join('|');
    if (fingerprint === this.kanbanColumnsFingerprint) {
      return this.kanbanColumnsSnapshot;
    }
    this.kanbanColumnsFingerprint = fingerprint;
    this.kanbanColumnsSnapshot = columns;
    return this.kanbanColumnsSnapshot;
  }

  get kanbanItems(): JosanzStatusKanbanItem[] {
    const fingerprint = this.kanbanItemsFingerprintKey();
    if (fingerprint === this.kanbanItemsFingerprint) {
      return this.kanbanItemsSnapshot;
    }
    this.kanbanItemsFingerprint = fingerprint;
    this.kanbanItemsSnapshot = this.boardPeriodRows.map((row) => ({
      id: row.id,
      statusValue: row.statusValue ?? 'DRAFT',
      title: row.eventName ?? row.title ?? row.id,
      subtitle: row.date,
      meta: row.client,
      pillLabel: row.pillLabel,
      pillColor: row.pillColor,
      railColor: row.railColor,
    }));
    return this.kanbanItemsSnapshot;
  }

  get filteredRowCount(): number {
    return this.filteredRows.length;
  }

  get boardPeriodRows(): JosanzCatalogListRow[] {
    const rows = this.filteredRows;
    if (!this.showStatusBoardView()) {
      return rows;
    }
    return this.applyBoardPeriodFilter(rows);
  }

  get boardPeriodVisibleCount(): number {
    return this.boardPeriodRows.length;
  }

  get boardPeriodHiddenCount(): number {
    return Math.max(0, this.filteredRows.length - this.boardPeriodRows.length);
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
    if (this.showStatusBoardView()) {
      return 0;
    }
    if (!this.features.pagination) {
      return 0;
    }
    const total = this.paginationTotal;
    return total > 1 ? total : 0;
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
    return this.config.pageSize ?? this.themeService.listPageSize();
  }

  get paginationTotal(): number {
    if (this.config.paginationTotal !== undefined) {
      return this.config.paginationTotal;
    }
    const count = this.filteredRows.length;
    if (count === 0) {
      return 0;
    }
    return Math.max(1, Math.ceil(count / this.pageSize));
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
    const fingerprint = this.paginatedItemsFingerprintKey();
    if (fingerprint === this.paginatedItemsFingerprint) {
      return this.paginatedItemsSnapshot;
    }
    this.paginatedItemsFingerprint = fingerprint;
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedItemsSnapshot = this.adaptiveItems.slice(start, start + this.pageSize);
    return this.paginatedItemsSnapshot;
  }

  get modalFilterFields(): JosanzCatalogModalFilterField[] {
    return resolveCatalogModalFilterFields(this.config.modalFilterMode);
  }

  get filteredRows(): JosanzCatalogListRow[] {
    let rows = this.rows;
    rows = this.applyTypologyFilter(rows);
    rows = this.applyStatusFilter(rows);
    rows = this.filterRowsByModalSelection(rows);
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

  onKanbanItemClick(item: JosanzStatusKanbanItem): void {
    const base = this.config.detailRoute ?? '/events';
    void this.router.navigate([base, item.id]);
  }

  onKanbanStatusChange(change: JosanzStatusKanbanChange): void {
    this.rowStatusChange.emit(change);
  }

  setStatusUpdateBusy(id: string, busy: boolean): void {
    this.statusUpdateBusyIds.update((ids) => {
      if (busy) {
        return ids.includes(id) ? ids : [...ids, id];
      }
      return ids.filter((value) => value !== id);
    });
  }

  onStatusFilter(option: string): void {
    this.activeStatusFilter = option;
    this.currentPage = 1;
    this.invalidateListSnapshots();
  }

  onSearch(value: string): void {
    this.searchQuery = value;
    this.currentPage = 1;
    this.invalidateListSnapshots();
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
        modalFilters: { ...this.selectedModalFilters },
        modalFilterFieldLabels: Object.fromEntries(
          this.modalFilterFields.map((field) => [field.key, field.label]),
        ),
      },
    );

    this.exportBusy = true;
    this.exportError = '';
    try {
      await this.listExport.export(payload, this.exportFormat);
      this.showExportModal = false;
    } catch {
      this.exportError =
        'No se pudo generar la exportaci?n. Comprueba la sesi?n y vuelve a intentarlo.';
    } finally {
      this.exportBusy = false;
    }
  }

  onTypologyFilter(option: string): void {
    this.activeTypology = option;
    this.currentPage = 1;
    this.invalidateListSnapshots();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.invalidateListSnapshots();
  }

  onBoardPeriodKindChange(kind: JosanzBoardPeriodKind): void {
    this.themeService.setBoardPeriodKind(kind);
    this.invalidateListSnapshots();
  }

  onBoardPeriodPrevious(): void {
    this.themeService.shiftBoardPeriod(-1);
    this.invalidateListSnapshots();
  }

  onBoardPeriodNext(): void {
    this.themeService.shiftBoardPeriod(1);
    this.invalidateListSnapshots();
  }

  onBoardPeriodGoToCurrent(): void {
    this.themeService.goToCurrentBoardPeriod();
    this.invalidateListSnapshots();
  }

  private buildKanbanColumns() {
    const theme = this.catalogTheme.mergedTheme();
    return eventStatusOptionsFromTheme(theme).map((option) => ({
      value: option.value,
      label: option.label,
      color: resolveEventStatusPillColor(option.value, theme) ?? undefined,
    }));
  }

  private kanbanItemsFingerprintKey(): string {
    const rows = this.boardPeriodRows;
    return [
      this.themeService.boardPeriodKind(),
      this.themeService.boardPeriodAnchor(),
      this.themeService.listViewSelection(),
      rows.map((row) => `${row.id}:${row.statusValue ?? ''}:${row.pillLabel}`).join('|'),
    ].join('::');
  }

  private paginatedItemsFingerprintKey(): string {
    const rows = this.filteredRows;
    return [
      this.currentPage,
      this.pageSize,
      this.themeService.listViewSelection(),
      this.themeService.listGridColumns(),
      rows.map((row) => `${row.id}:${row.pillLabel}`).join('|'),
    ].join('::');
  }

  private applyBoardPeriodFilter(rows: JosanzCatalogListRow[]): JosanzCatalogListRow[] {
    const kind = this.themeService.boardPeriodKind();
    const anchor = this.themeService.boardPeriodAnchorDate();
    return rows.filter((row) => isDateInBoardPeriod(row.eventDateIso ?? row.date, kind, anchor));
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
    if (row.warehouse && tab.includes('Almac?n')) {
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
    if (tab === 'Log?stica') {
      return this.rowValues(row).some((v) => v.toLowerCase().includes('log?stica') || v.toLowerCase().includes('logistica'));
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

  get filtersPresentation(): JosanzCatalogFiltersPresentation {
    return this.themeService.catalogFiltersPresentation();
  }

  get filtersUseInlinePanel(): boolean {
    return this.filtersPresentation === 'inline';
  }

  // Modal actions and filters helper methods
  openFiltrosPanel(): void {
    this.showFiltrosPanel = !this.showFiltrosPanel;
    if (this.showFiltrosPanel && !this.filtersUseInlinePanel) {
      queueMicrotask(() => this.syncPopoverPosition());
    }
  }

  closeFiltrosPanel(): void {
    this.showFiltrosPanel = false;
  }

  setFiltersPresentation(presentation: JosanzCatalogFiltersPresentation): void {
    if (this.themeService.catalogFiltersPresentation() === presentation) {
      return;
    }
    this.themeService.setCatalogFiltersPresentation(presentation);
    if (this.showFiltrosPanel && !this.filtersUseInlinePanel) {
      queueMicrotask(() => this.syncPopoverPosition());
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.showFiltrosPanel && !this.filtersUseInlinePanel) {
      this.syncPopoverPosition();
    }
  }

  private syncPopoverPosition(): void {
    const btn = this.listLayout?.getFiltrosButtonElement();
    if (!btn) {
      return;
    }
    const rect = btn.getBoundingClientRect();
    const panelWidth = Math.min(600, window.innerWidth - 24);
    const maxLeft = Math.max(12, window.innerWidth - panelWidth - 12);
    const left = Math.min(Math.max(12, rect.left), maxLeft);
    this.popoverStyle = {
      top: `${rect.bottom + 8}px`,
      left: `${left}px`,
      width: `${panelWidth}px`,
    };
  }

  clearAllModalFilters(): void {
    this.selectedModalFilters = {};
    this.currentPage = 1;
    this.invalidateListSnapshots();
  }

  applyModalFilters(): void {
    this.currentPage = 1;
    this.invalidateListSnapshots();
    if (!this.filtersUseInlinePanel) {
      this.closeFiltrosPanel();
    }
  }

  get activeFilterChips(): { key: string; label: string; value: string }[] {
    return this.modalFilterFields
      .filter((field) => Boolean(this.selectedModalFilters[field.key]?.trim()))
      .map((field) => ({
        key: field.key,
        label: field.label,
        value: this.selectedModalFilters[field.key],
      }));
  }

  removeFilterChip(chip: { key: string }): void {
    const next = { ...this.selectedModalFilters };
    delete next[chip.key];
    this.selectedModalFilters = next;
    this.currentPage = 1;
    this.invalidateListSnapshots();
  }

  getModalFilterOptions(field: JosanzCatalogModalFilterField): string[] {
    return uniqueCatalogModalFilterOptions(this.rows, field);
  }

  private filterRowsByModalSelection(rows: JosanzCatalogListRow[]): JosanzCatalogListRow[] {
    return this.modalFilterFields.reduce((filtered, field) => {
      const selected = this.selectedModalFilters[field.key]?.trim();
      if (!selected) {
        return filtered;
      }
      return filtered.filter((row) => field.extract(row) === selected);
    }, rows);
  }
}
