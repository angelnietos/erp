import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  UiSearchToolbarComponent,
  type SearchToolbarAppearance,
} from '../search-toolbar/search-toolbar.component';
import type { SearchVariant } from '../search/search.component';

/**
 * Fila estándar de listas: [estados / tabs opcionales] + barra de búsqueda con acciones.
 * Usa el atributo `uiFeatureFilterStates` en el bloque de pestañas o chips; el resto del
 * contenido son los botones de la derecha (igual que `ui-search-toolbar`).
 *
 * @example
 * ```html
 * <ui-feature-filter-bar placeholder="Buscar…" (searchChange)="onSearch($event)">
 *   <div uiFeatureFilterStates>
 *     <ui-tabs [tabs]="tabs" … />
 *   </div>
 *   <ui-button variant="ghost" size="sm" (clicked)="refresh()">Actualizar</ui-button>
 * </ui-feature-filter-bar>
 * ```
 */
@Component({
  selector: 'ui-feature-filter-bar',
  standalone: true,
  imports: [CommonModule, UiSearchToolbarComponent],
  template: `
    <div
      class="feature-filter-bar"
      [class.feature-filter-bar--framed]="framed"
      [class.feature-filter-bar--plain]="!framed"
    >
      <div class="feature-filter-bar__states">
        <ng-content select="[uiFeatureFilterStates]"></ng-content>
      </div>
      <ui-search-toolbar
        class="feature-filter-bar__search"
        [placeholder]="placeholder"
        [value]="value"
        [appearance]="appearance"
        [searchVariant]="searchVariant"
        (searchChange)="searchChange.emit($event)"
      >
        <ng-content />
      </ui-search-toolbar>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .feature-filter-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 1.5rem 2rem;
      width: 100%;
      margin-bottom: 2.5rem;
    }

    .feature-filter-bar--framed {
      justify-content: space-between;
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(20px) saturate(1.5);
      padding: 0.75rem 1.75rem;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-soft);
      gap: 1.5rem 2.5rem;
      transition: all 0.4s var(--transition-spring);
      box-shadow: var(--shadow-md);
    }

    .feature-filter-bar--framed:focus-within {
      background: rgba(255, 255, 255, 0.05);
      border-color: var(--brand);
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5), 0 0 25px var(--brand-ambient);
      transform: translateY(-2px);
    }

    .feature-filter-bar--plain {
      gap: 1.25rem 1.75rem;
    }

    .feature-filter-bar__states {
      flex: 0 1 auto;
      min-width: 0;
      max-width: 100%;
    }

    .feature-filter-bar__states:not(:has(*)) {
      display: none;
    }

    .feature-filter-bar__search {
      flex: 1 1 600px;
      min-width: 380px;
    }

    @media (max-width: 1024px) {
      .feature-filter-bar--framed {
        flex-direction: column;
        align-items: stretch;
        padding: 1.5rem;
      }

      .feature-filter-bar__states {
        width: 100%;
      }

      .feature-filter-bar__search {
        flex-basis: auto;
        width: 100%;
      }
    }
  `],
})
export class UiFeatureFilterBarComponent {
  /** Mismo tono que la búsqueda global del shell (`Buscar…`); cada lista puede acotar el alcance. */
  @Input() placeholder = 'Buscar…';
  @Input() value = '';
  @Input() searchVariant: SearchVariant = 'glass';
  @Input() appearance: SearchToolbarAppearance = 'feature';
  /** Tarjeta con fondo/borde como las listas (inventario, clientes). */
  @Input() framed = true;
  @Output() searchChange = new EventEmitter<string>();
}
