import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterTabsComponent } from './filter-tabs';
import { ButtonComponent } from './button';
import { SecondaryButtonComponent } from './secondary-button';
import { UserAvatarComponent } from './user-avatar';
import { PaginationComponent } from './pagination';

@Component({
  selector: 'josanz-main-list-layout',
  standalone: true,
  imports: [
    CommonModule, 
    FilterTabsComponent, 
    ButtonComponent, 
    SecondaryButtonComponent, 
    UserAvatarComponent, 
    PaginationComponent
  ],
  templateUrl: './main-list-layout.html',
  styleUrl: './main-list-layout.css',
})
export class MainListLayoutComponent {
  @Input() title = 'Título';
  @Input() primaryBtnLabel = 'Acción';
  @Input() filterOptions: string[] = ['Todas', 'Tipo X', 'Tipo Y', 'Tipo Z'];
  
  @Output() primaryAction = new EventEmitter<void>();
  @Output() excelAction = new EventEmitter<void>();
  @Output() filterChange = new EventEmitter<string>();

  onPrimaryAction() {
    this.primaryAction.emit();
  }

  onExcelAction() {
    this.excelAction.emit();
  }

  onFilterChange(option: string) {
    this.filterChange.emit(option);
  }
}
