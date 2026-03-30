import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export type SearchVariant = 'default' | 'filled' | 'outlined' | 'ghost' | 'dark' | 'light' | 'primary' | 'success' | 'warning' | 'error';

@Component({
  selector: 'ui-josanz-search',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="search-wrapper" [class]="'search-' + variant" [class.focused]="isFocused">
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
      position: relative; 
      display: flex; 
      align-items: center;
      border-radius: 6px; 
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      background: var(--bg-tertiary);
      border: 1px solid var(--border-soft);
      overflow: hidden;
    }

    .search-wrapper.focused {
      border-color: var(--brand);
      background: var(--bg-secondary);
      box-shadow: 0 0 15px var(--brand-glow);
    }

    .search-icon { 
      position: absolute; 
      left: 14px; 
      width: 18px; 
      height: 18px; 
      color: var(--text-muted);
      transition: color 0.3s ease;
    }

    .search-wrapper.focused .search-icon {
      color: var(--brand);
    }

    input {
      width: 100%; 
      padding: 12px 42px 12px 44px; 
      background: transparent;
      border: none; 
      font-size: 0.9rem; 
      outline: none; 
      font-family: var(--font-main);
      color: var(--text-primary);
    }

    input::placeholder {
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .clear-btn {
      position: absolute; 
      right: 12px; 
      background: rgba(255, 255, 255, 0.03); 
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 4px;
      padding: 4px; 
      cursor: pointer;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .clear-btn:hover {
      background: var(--danger);
      color: white;
      border-color: var(--danger);
    }

    .clear-btn lucide-icon {
      width: 14px;
      height: 14px;
    }

    /* Variant Modifiers */
    .search-dark { background: #000; border-color: #222; }
    .search-filled { background: rgba(255, 255, 255, 0.03); border-color: transparent; }
    .search-outlined { background: transparent; border-width: 2px; }
    
    .search-primary.focused { border-color: var(--brand); box-shadow: 0 0 15px var(--brand-glow); }
    .search-success.focused { border-color: var(--success); box-shadow: 0 0 15px rgba(16, 185, 129, 0.2); }
    .search-error.focused { border-color: var(--danger); box-shadow: 0 0 15px rgba(239, 68, 68, 0.2); }
  `],
})
export class UiSearchComponent {
  @Input() placeholder = 'Buscar...';
  @Input() value = '';
  @Input() variant: SearchVariant = 'default';
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
