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
      border-radius: 18px;
      border: 1px solid color-mix(in srgb, var(--toolbar-bar-border) 88%, transparent);
      background: color-mix(in srgb, var(--theme-surface, #141722) 78%, transparent);
      backdrop-filter: blur(16px);
      box-shadow: 0 8px 24px -14px rgba(0, 0, 0, 0.35);
      overflow: hidden;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .search-toolbar--feature:focus-within {
      background: color-mix(in srgb, var(--theme-surface, #141722) 84%, var(--brand) 16%);
      border-color: color-mix(in srgb, var(--brand) 40%, var(--border-soft) 60%);
      box-shadow: 0 10px 26px -14px rgba(0, 0, 0, 0.4);
    }

    .search-toolbar--minimal {
      flex-wrap: wrap;
      gap: 1rem 1.5rem;
      align-items: center;
      min-height: unset;
    }

    .search-toolbar__field {
      flex: 1 1 0;
      min-width: 0;
      display: flex;
      align-items: center;
    }

    .search-toolbar__field > ui-search {
      flex: 1 1 0;
      min-width: 0;
      width: 100%;
    }

    .search-toolbar--feature .search-toolbar__field {
      padding: 0 0.2rem 0 0.85rem;
    }

    .search-toolbar__divider {
      width: 1px;
      align-self: stretch;
      margin: 0.55rem 0;
      background: linear-gradient(to bottom, transparent, color-mix(in srgb, var(--border-soft) 80%, transparent), transparent);
      flex-shrink: 0;
      transition: background 0.3s ease;
    }
    
    .search-toolbar--feature:focus-within .search-toolbar__divider {
      background: linear-gradient(to bottom, transparent, color-mix(in srgb, var(--brand) 55%, transparent), transparent);
    }

    .search-toolbar__actions {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.35rem;
      flex-shrink: 0;
      padding: 0.32rem 0.65rem 0.32rem 0.35rem;
    }

    .search-toolbar--feature .search-toolbar__actions ::ng-deep .btn {
      --btn-accent: var(--brand);
      border-radius: 999px;
    }

    :host-context(html[data-erp-tenant='babooni']) .search-toolbar--feature {
      background: rgba(255, 255, 255, 0.64);
      border-color: color-mix(in srgb, var(--border-soft, rgba(8, 8, 8, 0.12)) 85%, transparent);
      box-shadow: 0 6px 18px -14px rgba(0, 0, 0, 0.28);
      backdrop-filter: blur(10px);
    }

    :host-context(html[data-erp-tenant='babooni']) .search-toolbar--feature:focus-within {
      background: rgba(255, 255, 255, 0.86);
      border-color: color-mix(in srgb, var(--brand) 34%, rgba(8, 8, 8, 0.12));
      box-shadow: 0 8px 22px -14px rgba(0, 0, 0, 0.22);
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
