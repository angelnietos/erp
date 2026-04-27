import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiSearchComponent } from '../search/search.component';
import type { SearchVariant } from '../search/search.component';

export type SearchToolbarAppearance = 'feature' | 'minimal';

/**
 * Barra estándar: búsqueda a la izquierda + acciones (botones) proyectadas a la derecha.
 * Usar dentro de listas/features para alinear UX con el resto del ERP.
 */
@Component({
  selector: 'ui-search-toolbar',
  standalone: true,
  imports: [CommonModule, UiSearchComponent],
  template: `
    <div
      class="search-toolbar"
      [class.search-toolbar--feature]="appearance === 'feature'"
      [class.search-toolbar--minimal]="appearance === 'minimal'"
      [attr.data-appearance]="appearance"
    >
      <div class="search-toolbar__field" role="search">
        <ui-search
          [dockToolbar]="appearance === 'feature'"
          [placeholder]="placeholder"
          [value]="value"
          [variant]="searchVariant"
          (searchChange)="searchChange.emit($event)"
        />
      </div>
      @if (appearance === 'feature') {
        <div class="search-toolbar__divider" aria-hidden="true"></div>
      }
      <div class="search-toolbar__actions" role="toolbar">
        <ng-content />
      </div>
    </div>
  `,
  styleUrls: ['../styles/form-field-visual.scss'],
  styles: [`
    :host {
      display: block;
      width: 100%;
      --toolbar-accent: var(--brand);
      --toolbar-bar-bg: rgba(255, 255, 255, 0.03);
      --toolbar-bar-border: var(--border-soft);
    }

    .search-toolbar {
      display: flex;
      align-items: stretch;
      width: 100%;
      min-height: calc(var(--page-gap, 1.5rem) * 1.5 + 1rem);
      gap: 0;
    }

    .search-toolbar--feature {
      border-radius: 24px;
      border: 1px solid var(--toolbar-bar-border);
      background: rgba(255, 255, 255, 0.02);
      backdrop-filter: blur(35px);
      box-shadow: 0 8px 32px -8px rgba(0, 0, 0, 0.3);
      overflow: hidden;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .search-toolbar--feature:focus-within {
      background: rgba(255, 255, 255, 0.04);
      border-color: var(--brand);
      box-shadow: 0 15px 45px -12px rgba(0, 0, 0, 0.5), 0 0 25px var(--brand-glow);
      transform: translateY(-2px);
    }

    .search-toolbar--minimal {
      flex-wrap: wrap;
      gap: 1rem 1.5rem;
      align-items: center;
      min-height: unset;
    }

    .search-toolbar__field {
      flex: 1 1 auto;
      min-width: 0;
      display: flex;
      align-items: center;
    }

    .search-toolbar--feature .search-toolbar__field {
      padding: 0 0.75rem 0 1.25rem;
    }

    .search-toolbar__divider {
      width: 1px;
      align-self: stretch;
      margin: 0.75rem 0;
      background: linear-gradient(to bottom, transparent, var(--border-soft), transparent);
      flex-shrink: 0;
      transition: background 0.3s ease;
    }
    
    .search-toolbar--feature:focus-within .search-toolbar__divider {
      background: linear-gradient(to bottom, transparent, var(--brand), transparent);
    }

    .search-toolbar__actions {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
      flex-shrink: 0;
      padding: 0.4rem 1rem 0.4rem 0.5rem;
    }

    .search-toolbar--feature .search-toolbar__actions ::ng-deep .btn {
      --btn-accent: var(--brand);
    }

    @media (prefers-reduced-motion: reduce) {
      .search-toolbar--feature,
      .search-toolbar--feature:focus-within {
        transition: none;
      }
    }
  `],
})
export class UiSearchToolbarComponent {
  @Input() placeholder = 'Buscar…';
  @Input() value = '';
  @Input() searchVariant: SearchVariant = 'glass';
  /** feature = cápsula unificada (listas); minimal = fila flexible sin marco */
  @Input() appearance: SearchToolbarAppearance = 'feature';
  @Output() searchChange = new EventEmitter<string>();
}
