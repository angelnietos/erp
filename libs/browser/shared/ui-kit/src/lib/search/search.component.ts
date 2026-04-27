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
      border-radius: var(--radius-md);
      transition: all 0.4s var(--transition-base);
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-soft);
      overflow: hidden;
      width: 100%;
      box-shadow: var(--shadow-sm);
    }

    .search-wrapper.focused {
      border-color: var(--brand);
      background: var(--brand-ambient);
      box-shadow: 0 0 20px var(--brand-ambient);
    }

    .search-icon { 
      position: absolute; 
      left: 1.1rem; 
      width: 1rem; 
      height: 1rem; 
      color: var(--text-muted);
      transition: all 0.3s var(--transition-spring);
      pointer-events: none;
    }

    .search-wrapper.focused .search-icon {
      color: var(--brand);
      transform: scale(1.2);
      filter: drop-shadow(0 0 5px var(--brand-glow));
    }

    input {
      width: 100%; 
      padding: 0.75rem 2.5rem 0.75rem 2.5rem; 
      background: transparent;
      border: none; 
      font-size: 0.85rem; 
      font-weight: 600;
      outline: none; 
      font-family: var(--font-main);
      color: var(--text-primary);
    }

    input::placeholder {
      color: var(--text-muted);
      opacity: 0.5;
      font-size: 0.75rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .search-default {
      background: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%);
      border: 1px solid var(--border-soft);
    }

    .search-glass {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .focus-indicator {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background: var(--brand);
      box-shadow: 0 0 15px var(--brand-glow);
      transform: scaleX(0);
      transition: var(--transition-spring);
    }

    .search-wrapper.focused .focus-indicator { transform: scaleX(1); }

    /* Dentro de ui-search-toolbar (barra cápsula unificada) */
    .search-wrapper.search-dock {
      border: none !important;
      box-shadow: none !important;
      background: transparent !important;
      border-radius: 0;
    }

    .search-wrapper.search-dock .focus-indicator {
      border-radius: 0 0 4px 4px;
    }

    /**
     * Búsqueda empotrada en ui-search-toolbar: misma jerarquía visual que la barra global
     * (tipografía legible, placeholder sin micro–MAYÚSCULAS forzadas en todo el ERP).
     */
    .search-wrapper.search-dock input {
      color: var(--text-primary);
      font-size: 0.875rem;
      font-weight: 500;
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
      padding-left: 2.5rem;
    }

    .search-wrapper.search-dock input::placeholder {
      color: var(--text-muted);
      font-size: 0.8125rem;
      font-weight: 500;
      text-transform: none;
      letter-spacing: 0.01em;
      opacity: 0.88;
    }

    .search-wrapper.search-dock .search-icon {
      left: 0.85rem;
      width: 1rem;
      height: 1rem;
      color: var(--text-muted);
    }

    .search-wrapper.search-dock.focused .search-icon {
      color: var(--brand);
    }

    :host-context(html[data-erp-tenant='babooni']) .search-wrapper.search-dock .search-icon {
      color: var(--text-muted, #747474);
    }

    :host-context(html[data-erp-tenant='babooni']) .search-wrapper.search-dock.focused .search-icon {
      color: var(--brand, #004b93);
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
  @Input() placeholder = 'BUSCAR...';
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
