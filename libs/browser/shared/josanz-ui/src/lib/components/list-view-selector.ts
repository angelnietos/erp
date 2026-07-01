import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  JOSANZ_LIST_GRID_COLUMN_OPTIONS,
  JOSANZ_LIST_VIEW_MENU_OPTIONS,
  JOSANZ_LIST_VIEW_MENU_OPTIONS_WITHOUT_BOARD,
  isGridCardsView,
  type JosanzListGridColumns,
  type JosanzListViewSelection,
} from '../list-view/list-view-preferences';

@Component({
  selector: 'josanz-list-view-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-view-selector.html',
  styleUrl: './list-view-selector.css',
})
export class ListViewSelectorComponent {
  @Input() label = 'Vista';
  @Input() selected: JosanzListViewSelection = 'tarjetas-lista';
  @Input() gridColumns: JosanzListGridColumns = 3;
  @Input() showStatusBoard = false;

  @Output() selectionChange = new EventEmitter<JosanzListViewSelection>();
  @Output() gridColumnsChange = new EventEmitter<JosanzListGridColumns>();

  get viewOptions() {
    return this.showStatusBoard
      ? JOSANZ_LIST_VIEW_MENU_OPTIONS
      : JOSANZ_LIST_VIEW_MENU_OPTIONS_WITHOUT_BOARD;
  }
  readonly columnOptions = JOSANZ_LIST_GRID_COLUMN_OPTIONS;

  get showGridColumns(): boolean {
    return isGridCardsView(this.selected);
  }

  pick(option: JosanzListViewSelection, event: Event): void {
    event.stopPropagation();
    if (option === this.selected) {
      return;
    }
    this.selectionChange.emit(option);
  }

  pickColumns(columns: JosanzListGridColumns, event: Event): void {
    event.stopPropagation();
    if (columns === this.gridColumns) {
      return;
    }
    this.gridColumnsChange.emit(columns);
  }

  isActive(option: JosanzListViewSelection): boolean {
    return this.selected === option;
  }
}
