import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export type SearchVariant = 'default' | 'filled' | 'glass';

@Component({
  selector: 'ui-search',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div
      class="search-wrapper"
      [class]="'search-' + variant"
      [class.search-dock]="dockToolbar"
      [class.focused]="isFocused"
    >
      <lucide-icon name="search" class="search-icon" aria-hidden="true"></lucide-icon>
      <input 
        type="text" 
        [placeholder]="placeholder"
        [value]="value"
        (input)="onInput($event)"
        (focus)="isFocused = true"
        (blur)="isFocused = false"
      />
      @if (value) {
        <button type="button" class="clear-btn" (click)="onClear($event)" aria-label="Limpiar búsqueda">
          <lucide-icon name="x" aria-hidden="true"></lucide-icon>
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
      border-radius: 14px;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      background: none !important;
      border: 1px solid var(--border-soft);
      overflow: hidden;
      width: 100%;
      box-shadow: none !important;
      --search-padding-v: calc(var(--page-gap, 1.5rem) * 0.4 + 0.15rem);
    }

    .search-wrapper.focused {
      border-color: color-mix(in srgb, var(--brand) 42%, var(--border-soft) 58%);
      background: color-mix(in srgb, var(--theme-surface, #111623) 84%, var(--brand) 16%);
      box-shadow: 0 8px 20px -14px rgba(0, 0, 0, 0.35);
    }

    .search-icon { 
      position: absolute; 
      left: 1.25rem; 
      width: 1rem !important; 
      height: 1rem !important; 
      color: var(--text-muted);
      transition: all 0.4s var(--transition-spring);
      pointer-events: none;
    }

    .search-wrapper.focused .search-icon {
      color: var(--brand);
      transform: none;
      filter: none;
    }

    input {
      flex: 1;
      min-width: 0;
      padding: var(--search-padding-v) 1rem var(--search-padding-v) 2.75rem; 
      background: transparent !important;
      background-color: transparent !important;
      border: none !important; 
      font-size: 0.85rem; 
      font-weight: 500;
      outline: none !important; 
      font-family: var(--font-main);
      color: var(--text-primary);
      text-transform: none !important;
      box-shadow: none !important;
      -webkit-appearance: none;
      line-height: 1.35;
    }

    input::placeholder {
      color: var(--text-muted);
      opacity: 0.6;
      font-size: 0.85rem;
      font-weight: 400;
      text-transform: none !important;
      letter-spacing: normal !important;
      white-space: nowrap;
    }

    .search-glass {
      background: rgba(255, 255, 255, 0.02);
      backdrop-filter: blur(30px) saturate(1.8);
      border-color: rgba(255, 255, 255, 0.08);
    }

    .focus-indicator {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background: var(--brand);
      box-shadow: 0 0 25px var(--brand);
      transform: scaleX(0);
      transition: transform 0.5s var(--transition-spring);
    }

    .search-wrapper.focused .focus-indicator { transform: scaleX(1); }

    .search-wrapper.search-dock {
      border: none !important;
      box-shadow: none !important;
      background: transparent !important;
      border-radius: 0;
    }
    
    .search-wrapper.search-dock input {
      padding: 0.75rem 2.5rem 0.75rem 3rem;
    }
    
    .search-wrapper.search-dock .search-icon {
      left: 1rem;
    }

    .clear-btn {
      position: absolute;
      right: 0.55rem;
      top: 50%;
      transform: translateY(-50%);
      width: 1.65rem;
      height: 1.65rem;
      border: 1px solid color-mix(in srgb, var(--border-soft) 82%, transparent);
      background: color-mix(in srgb, var(--theme-surface, #131722) 92%, transparent);
      border-radius: 999px;
      color: var(--text-muted);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
    }

    .clear-btn:hover {
      color: var(--brand);
      border-color: color-mix(in srgb, var(--brand) 35%, transparent);
      background: color-mix(in srgb, var(--brand) 12%, var(--theme-surface, #131722) 88%);
    }

    .clear-btn lucide-icon {
      width: 0.85rem;
      height: 0.85rem;
    }

    :host-context(html[data-erp-tenant='babooni']) .search-wrapper.focused {
      background: rgba(255, 255, 255, 0.9);
      box-shadow: 0 8px 18px -14px rgba(0, 0, 0, 0.2);
    }

    @media (prefers-reduced-motion: reduce) {
      .focus-indicator {
        transition: none;
      }
      .clear-btn:hover {
        transform: none;
      }
    }
  `],
})
export class UiSearchComponent {
  @Input() placeholder = 'Buscar...';
  @Input() value = '';
  @Input() variant: SearchVariant = 'default';
  /** Integrado en barra unificada: sin marco propio (usa el del toolbar). */
  @Input() dockToolbar = false;
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
