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
    :host {
      display: block;
    }
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
      border-color: color-mix(in srgb, var(--brand) 65%, var(--border-soft));
      background: var(--surface);
      box-shadow:
        0 0 0 3px color-mix(in srgb, var(--brand-glow) 40%, transparent),
        0 8px 24px -8px var(--brand-glow);
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
      background: var(--danger);
      color: white;
      border-color: var(--danger);
      transform: scale(1.1);
    }

    .clear-btn lucide-icon { width: 0.8rem; height: 0.8rem; }

    /* Variants — deben distinguirse a simple vista */
    .search-default {
      background: color-mix(in srgb, var(--surface, #0f1016) 100%, transparent);
      border: 1px solid color-mix(in srgb, var(--border-soft) 80%, transparent);
      box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.35));
    }

    .search-filled {
      background: color-mix(in srgb, var(--surface, #0f1016) 88%, var(--brand, #e60012) 12%);
      border: 1px solid color-mix(in srgb, var(--brand) 35%, var(--border-soft));
      box-shadow:
        0 4px 18px -6px color-mix(in srgb, var(--brand) 45%, transparent),
        inset 0 1px 0 rgba(255, 255, 255, 0.06);
    }

    .search-glass {
      background: color-mix(in srgb, var(--surface, #0f1016) 55%, transparent);
      border: 1px solid rgba(255, 255, 255, 0.14);
      backdrop-filter: blur(18px) saturate(1.2);
      -webkit-backdrop-filter: blur(18px) saturate(1.2);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
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
