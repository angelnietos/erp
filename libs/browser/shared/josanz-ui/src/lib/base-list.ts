import { Directive, EventEmitter, Input, Output } from '@angular/core';

@Directive()
export abstract class BaseListComponent {
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
}
