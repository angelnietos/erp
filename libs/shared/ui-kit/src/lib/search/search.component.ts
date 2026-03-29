import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'ui-josanz-search',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="search-wrapper" [class.focused]="isFocused">
      <lucide-icon name="search" class="search-icon"></lucide-icon>
      <input 
        type="text" 
        [placeholder]="placeholder"
        [value]="value"
        (input)="onInput($event)"
        (focus)="isFocused = true"
        (blur)="isFocused = false"
      />
      @if (value) {
        <button class="clear-btn" (click)="onClear()">
          <lucide-icon name="x"></lucide-icon>
        </button>
      }
    </div>
  `,
  styles: [`
    .search-wrapper {
      position: relative; display: flex; align-items: center;
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px; transition: all 0.2s;
    }
    .search-wrapper.focused { border-color: #4F46E5; box-shadow: 0 0 0 4px rgba(79,70,229,0.15); }
    .search-icon { position: absolute; left: 14px; width: 18px; height: 18px; color: #64748B; }
    input {
      width: 100%; padding: 12px 14px 12px 42px; background: transparent;
      border: none; color: white; font-size: 14px; outline: none;
    }
    input::placeholder { color: #64748B; }
    .clear-btn {
      position: absolute; right: 10px; background: none; border: none;
      padding: 4px; cursor: pointer; color: #64748B;
    }
    .clear-btn:hover { color: white; }
  `],
})
export class UiSearchComponent {
  @Input() placeholder = 'Buscar...';
  @Input() value = '';
  @Output() searchChange = new EventEmitter<string>();

  isFocused = false;

  onInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.value = val;
    this.searchChange.emit(val);
  }

  onClear() {
    this.value = '';
    this.searchChange.emit('');
  }
}
