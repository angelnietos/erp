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
      border-radius: var(--radius-lg);
      transition: all 0.5s var(--transition-spring);
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-soft);
      overflow: hidden;
      width: 100%;
      box-shadow: var(--shadow-sm);
    }

    .search-wrapper.focused {
      border-color: var(--brand);
      background: rgba(255, 255, 255, 0.05);
      box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 0 20px var(--brand-ambient);
      transform: translateY(-2px);
    }

    .search-icon { 
      position: absolute; 
      left: 1.25rem; 
      width: 1.15rem; 
      height: 1.15rem; 
      color: var(--text-muted);
      transition: all 0.4s var(--transition-spring);
      pointer-events: none;
    }

    .search-wrapper.focused .search-icon {
      color: var(--brand);
      transform: scale(1.3) rotate(-5deg);
      filter: drop-shadow(0 0 10px var(--brand-glow));
    }

    input {
      width: 100%; 
      padding: 1rem 3rem 1rem 3.25rem; 
      background: transparent;
      border: none; 
      font-size: 0.95rem; 
      font-weight: 600;
      outline: none; 
      font-family: var(--font-main);
      color: var(--text-primary);
    }

    input::placeholder {
      color: var(--text-muted);
      opacity: 0.7;
      font-size: 0.85rem;
      font-weight: 500;
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
