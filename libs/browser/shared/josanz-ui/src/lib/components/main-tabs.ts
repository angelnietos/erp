import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'josanz-main-tabs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex gap-1.5 p-1 bg-slate-100/50 rounded-xl w-fit border border-slate-200/50">
      @for (option of options; track option) {
        <button 
          (click)="select(option)"
          class="px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 whitespace-nowrap"
          [class.bg-white]="selection === option"
          [class.text-blue-600]="selection === option"
          [class.shadow-sm]="selection === option"
          [class.text-slate-500]="selection !== option"
          [class.hover:bg-slate-200/50]="selection !== option"
        >
          {{ option }}
        </button>
      }
    </div>
  `,
})
export class MainTabsComponent {
  @Input() options: string[] = [];
  @Input() selection = '';
  @Output() selectionChange = new EventEmitter<string>();

  select(option: string) {
    this.selection = option;
    this.selectionChange.emit(option);
  }
}
