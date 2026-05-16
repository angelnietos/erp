import { Directive, EventEmitter, Input, Output } from '@angular/core';
import type { JosanzAdaptiveListItem } from './components/adaptive-list-rows';
import { filterAdaptiveListItems } from './list-view/filter-list-items';

@Directive()
export abstract class BaseListComponent {
  searchQuery = '';
  @Input() title = '';
  @Input() primaryBtnLabel = '';
  @Input() filterOptions: string[] = ['Todas', 'Tipo X', 'Tipo Y', 'Tipo Z'];

  @Output() primaryAction = new EventEmitter<void>();
  @Output() excelAction = new EventEmitter<void>();
  @Output() filterChange = new EventEmitter<string>();

  onAdd() {
    this.primaryAction.emit();
  }

  onExcel() {
    this.excelAction.emit();
  }

  onFilter(option: string) {
    this.filterChange.emit(option);
  }

  onSearch(value: string): void {
    this.searchQuery = value;
  }

  protected filterItems(items: readonly JosanzAdaptiveListItem[]): JosanzAdaptiveListItem[] {
    return filterAdaptiveListItems(items, this.searchQuery);
  }
}
