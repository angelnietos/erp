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
  styleUrls: ['../styles/form-field-visual.scss'],
  styles: [`
    .search-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      border-radius: var(--radius-md);
      transition:
        border-color 0.3s cubic-bezier(0.16, 1, 0.3, 1),
        background 0.3s ease,
        box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      background: var(--surface);
      border: 1px solid var(--border-soft);
      overflow: hidden;
      width: 100%;
      box-shadow: var(--shadow-sm);
    }

    .search-wrapper.focused {
      border-color: var(--fld-border-brand);
      background: color-mix(in srgb, var(--surface) 92%, var(--fld-brand) 8%);
      box-shadow: var(--fld-ring-brand), var(--fld-shadow-brand);
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
      color: var(--fld-brand);
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
      letter-spacing: 0.06em;
      font-size: 0.56rem;
      font-weight: 600;
      font-family: var(--font-main);
      opacity: 0.58;
    }

    .clear-btn {
      position: absolute; 
      right: 0.75rem; 
      background: color-mix(in srgb, var(--border-soft) 60%, transparent);
      border: 1px solid var(--border-soft);
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
      background: var(--fld-danger);
      color: white;
      border-color: var(--fld-danger);
      transform: scale(1.1);
    }

    .clear-btn lucide-icon { width: 0.8rem; height: 0.8rem; }

    .search-default {
      background: linear-gradient(180deg, color-mix(in srgb, var(--surface, #0f1016) 100%, #1e293b) 0%, #0c0d12 100%);
      border: 1px solid color-mix(in srgb, var(--fld-brand) 12%, var(--border-soft));
      box-shadow: var(--fld-shine-subtle), var(--shadow-sm, 0 4px 14px rgba(0, 0, 0, 0.4));
    }

    .search-filled {
      background: var(--fld-surface-deep);
      border: 1px solid var(--fld-border-brand);
      box-shadow: var(--fld-shine-top), var(--fld-shadow-brand);
    }

    .search-glass {
      background: var(--fld-glass);
      border: 1px solid color-mix(in srgb, #fff 16%, transparent);
      backdrop-filter: blur(20px) saturate(1.25);
      -webkit-backdrop-filter: blur(20px) saturate(1.25);
      box-shadow: var(--fld-shine-top), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }

    .focus-indicator {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--fld-brand), transparent);
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
