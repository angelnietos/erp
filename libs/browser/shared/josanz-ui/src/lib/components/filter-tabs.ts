import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'josanz-filter-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-tabs.html',
  styleUrl: './filter-tabs.css',
})
export class FilterTabsComponent {
  @Input() options: string[] = ['Todas', 'Tipo X', 'Tipo Y', 'Tipo Z'];
  @Input() selected = 'Todas';
  @Output() selectionChange = new EventEmitter<string>();

  selectOption(option: string) {
    this.selected = option;
    this.selectionChange.emit(option);
  }
}
