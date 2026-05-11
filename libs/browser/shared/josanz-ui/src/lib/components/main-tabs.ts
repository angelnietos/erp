import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'josanz-main-tabs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex gap-2">
      @for (option of options; track option) {
        <button 
          (click)="select(option)"
          class="px-[12px] py-[6px] rounded-[6px] text-[13px] font-medium transition-all duration-200 border"
          [class.bg-white]="true"
          [class.border-black]="selection === option"
          [class.text-black]="selection === option"
          [class.border-[#E2E2E2]]="selection !== option"
          [class.text-[#A0A0A0]]="selection !== option"
        >
          {{ option }}
        </button>
      }
    </div>
  `,
  styles: []
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
