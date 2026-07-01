import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  JOSANZ_LIST_GRID_COLUMN_OPTIONS,
  JOSANZ_LIST_GRID_COLUMNS_MAX,
  JOSANZ_LIST_GRID_COLUMNS_MIN,
  JOSANZ_LIST_VIEW_MENU_OPTIONS,
  JOSANZ_LIST_VIEW_MENU_OPTIONS_WITHOUT_BOARD,
  isGridCardsView,
  isPresetListGridColumns,
  listViewSelectionLabel,
  normalizeListGridColumns,
  type JosanzListGridColumns,
  type JosanzListViewMenuOption,
  type JosanzListViewSelection,
} from '../list-view/list-view-preferences';
import { JosanzThemeService } from '../services/theme.service';

@Component({
  selector: 'josanz-list-view-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-view-selector.html',
  styleUrl: './list-view-selector.css',
})
export class ListViewSelectorComponent {
  readonly themeService = inject(JosanzThemeService);

  @Input() label = 'Vista';
  @Input() selected: JosanzListViewSelection = 'tarjetas-lista';
  @Input() gridColumns: JosanzListGridColumns = 3;
  @Input() showStatusBoard = false;

  @Output() selectionChange = new EventEmitter<JosanzListViewSelection>();
  @Output() gridColumnsChange = new EventEmitter<JosanzListGridColumns>();

  readonly columnOptions = JOSANZ_LIST_GRID_COLUMN_OPTIONS;
  readonly gridColumnsMin = JOSANZ_LIST_GRID_COLUMNS_MIN;
  readonly gridColumnsMax = JOSANZ_LIST_GRID_COLUMNS_MAX;

  isCustomGridColumns(): boolean {
    return !isPresetListGridColumns(this.gridColumns);
  }

  get viewOptions(): readonly JosanzListViewMenuOption[] {
    return this.showStatusBoard
      ? JOSANZ_LIST_VIEW_MENU_OPTIONS
      : JOSANZ_LIST_VIEW_MENU_OPTIONS_WITHOUT_BOARD;
  }

  get cardOptions(): readonly JosanzListViewMenuOption[] {
    return this.viewOptions.filter((opt) => opt.group === 'tarjetas');
  }

  get boardOption(): JosanzListViewMenuOption | undefined {
    return this.viewOptions.find((opt) => opt.id === 'tablero');
  }

  get tableOption(): JosanzListViewMenuOption | undefined {
    return this.viewOptions.find((opt) => opt.id === 'tabla');
  }

  get panelOpen(): boolean {
    return this.themeService.listViewPanelOpen();
  }

  get currentViewLabel(): string {
    return listViewSelectionLabel(this.selected);
  }

  get showGridColumns(): boolean {
    return isGridCardsView(this.selected);
  }

  togglePanel(): void {
    this.themeService.toggleListViewPanel();
  }

  closePanel(): void {
    this.themeService.setListViewPanelOpen(false);
  }

  pick(option: JosanzListViewSelection, event: Event): void {
    event.stopPropagation();
    if (option === this.selected) {
      this.closePanel();
      return;
    }
    this.selectionChange.emit(option);
    this.closePanel();
  }

  pickColumns(columns: JosanzListGridColumns, event: Event): void {
    event.stopPropagation();
    if (columns === this.gridColumns) {
      return;
    }
    this.gridColumnsChange.emit(columns);
  }

  onCustomColumnsInput(event: Event): void {
    event.stopPropagation();
    const input = event.target as HTMLInputElement;
    const parsed = Number.parseInt(input.value, 10);
    if (!Number.isFinite(parsed)) {
      input.value = String(this.gridColumns);
      return;
    }
    const normalized = normalizeListGridColumns(parsed);
    input.value = String(normalized);
    if (normalized === this.gridColumns) {
      return;
    }
    this.gridColumnsChange.emit(normalized);
  }

  isActive(option: JosanzListViewSelection): boolean {
    return this.selected === option;
  }
}
