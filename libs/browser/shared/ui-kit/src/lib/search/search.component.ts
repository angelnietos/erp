import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export type SearchVariant = 'default' | 'filled' | 'glass';

@Component({
  selector: 'ui-search',
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
        <button class="clear-btn" (click)="onClear($event)">
          <lucide-icon name="x"></lucide-icon>
        </button>
      }
      <div class="focus-indicator"></div>
    </div>
  `,
  styles: [`
    .search-wrapper {
      position: relative; 
      display: flex; 
      align-items: center;
      border-radius: var(--radius-md); 
      transition: var(--transition-base);
      background: var(--bg-tertiary);
      border: 1px solid var(--border-soft);
      overflow: hidden;
      width: 100%;
    }

    .search-wrapper.focused {
      border-color: var(--brand);
      background: var(--bg-secondary);
      box-shadow: 0 0 20px var(--brand-glow);
    }

    .search-icon { 
      position: absolute; 
      left: 1.1rem; 
      width: 1.1rem; 
      height: 1.1rem; 
      color: var(--text-muted);
      transition: var(--transition-base);
      pointer-events: none;
    }

    .search-wrapper.focused .search-icon {
      color: var(--brand);
      transform: scale(1.1);
    }

    input {
      width: 100%; 
      padding: 0.55rem 2.5rem 0.55rem 2.35rem; 
      background: transparent;
      border: none; 
      font-size: 0.72rem; 
      font-weight: 500;
      outline: none; 
      font-family: var(--font-main);
      color: var(--text-primary);
    }

    input::placeholder {
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-size: 0.55rem;
      font-weight: 600;
      font-family: var(--font-main);
      opacity: 0.55;
    }

    .clear-btn {
      position: absolute; 
      right: 0.75rem; 
      background: rgba(255, 255, 255, 0.05); 
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      width: 1.5rem;
      height: 1.5rem;
      cursor: pointer;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: var(--transition-fast);
      padding: 0;
    }

    .clear-btn:hover {
      background: var(--danger);
      color: white;
      border-color: var(--danger);
      transform: scale(1.1);
    }

    .clear-btn lucide-icon { width: 0.8rem; height: 0.8rem; }

    /* Variants */
    .search-filled { background: var(--bg-secondary); border-color: transparent; }
    
    .search-glass {
      background: var(--surface);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }

    .focus-indicator {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background: var(--brand);
      transform: scaleX(0);
      transition: var(--transition-spring);
      transform-origin: center;
    }

    .search-wrapper.focused .focus-indicator { transform: scaleX(1); }
  `],
})
export class UiSearchComponent {
  @Input() placeholder = 'BUSCAR...';
  @Input() value = '';
  @Input() variant: SearchVariant = 'default';
  @Output() searchChange = new EventEmitter<string>();

  isFocused = false;

  onInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.value = val;
    this.searchChange.emit(val);
  }

  onClear(event: Event) {
    event.stopPropagation();
    this.value = '';
    this.searchChange.emit('');
  }
}
