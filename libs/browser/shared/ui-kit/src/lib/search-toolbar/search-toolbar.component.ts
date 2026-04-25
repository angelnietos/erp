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
      /* Acento tipo “lime” de listas; sobreescribible desde el tema */
      --toolbar-accent: color-mix(in srgb, var(--brand, #c4ff00) 78%, #e8ffc4);
      --toolbar-bar-bg: linear-gradient(
        165deg,
        color-mix(in srgb, #1a2e14 55%, #0a0c08) 0%,
        #060705 48%,
        #080a07 100%
      );
      --toolbar-bar-border: color-mix(in srgb, var(--toolbar-accent) 42%, rgba(255, 255, 255, 0.08));
    }

    .search-toolbar {
      display: flex;
      align-items: stretch;
      width: 100%;
      min-height: 2.75rem;
      gap: 0;
    }

    .search-toolbar--feature {
      border-radius: 999px;
      border: 1px solid var(--toolbar-bar-border);
      background: var(--toolbar-bar-bg);
      box-shadow:
        var(--fld-shine-subtle),
        0 4px 22px rgba(0, 0, 0, 0.45),
        inset 0 1px 0 color-mix(in srgb, var(--toolbar-accent) 12%, transparent);
      overflow: hidden;
      transition:
        border-color 0.25s ease,
        box-shadow 0.25s ease;
    }

    .search-toolbar--feature:focus-within {
      border-color: color-mix(in srgb, var(--toolbar-accent) 48%, var(--toolbar-bar-border));
      box-shadow:
        var(--fld-shine-subtle),
        0 8px 32px rgba(0, 0, 0, 0.52),
        0 0 0 1px color-mix(in srgb, var(--toolbar-accent) 18%, transparent),
        inset 0 1px 0 color-mix(in srgb, var(--toolbar-accent) 16%, transparent);
    }

    .search-toolbar--minimal {
      flex-wrap: wrap;
      gap: 0.75rem 1rem;
      align-items: center;
      min-height: unset;
    }

    .search-toolbar--minimal .search-toolbar__field {
      flex: 1 1 220px;
      min-width: 180px;
    }

    .search-toolbar__field {
      flex: 1 1 auto;
      min-width: 0;
      display: flex;
      align-items: center;
    }

    .search-toolbar--feature .search-toolbar__field {
      align-self: stretch;
      flex: 1 1 200px;
      min-width: 150px;
      margin: 0;
      padding: 0;
      border-radius: 999px 0 0 999px;
      background: transparent;
      border: none;
      box-shadow: none;
    }



    .search-toolbar__divider {
      width: 1px;
      align-self: stretch;
      background: linear-gradient(
        180deg,
        transparent,
        color-mix(in srgb, var(--toolbar-accent) 35%, transparent) 30%,
        color-mix(in srgb, var(--toolbar-accent) 35%, transparent) 70%,
        transparent
      );
      flex-shrink: 0;
    }

    .search-toolbar__actions {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.25rem 0.35rem;
      flex-shrink: 0;
      padding: 0.2rem 0.65rem 0.2rem 0.35rem;
    }

    .search-toolbar--minimal .search-toolbar__actions {
      padding: 0;
    }

    /* Botones ghost proyectados: acento lima / marca */
    .search-toolbar--feature .search-toolbar__actions ::ng-deep .btn-shape-ghost,
    .search-toolbar--feature .search-toolbar__actions ::ng-deep .btn-shape-auto,
    .search-toolbar--feature .search-toolbar__actions ::ng-deep .btn-shape-solid {
      --btn-accent: var(--toolbar-accent);
      color: color-mix(in srgb, var(--toolbar-accent) 92%, #fff);
    }

    .search-toolbar--feature .search-toolbar__actions ::ng-deep .btn:hover {
      filter: brightness(1.12);
    }

    @media (max-width: 768px) {
      .search-toolbar--feature {
        flex-direction: column;
        border-radius: 18px;
        align-items: stretch;
      }

      .search-toolbar--feature .search-toolbar__divider {
        width: 100%;
        height: 1px;
        background: linear-gradient(
          90deg,
          transparent,
          color-mix(in srgb, var(--toolbar-accent) 35%, transparent) 20%,
          color-mix(in srgb, var(--toolbar-accent) 35%, transparent) 80%,
          transparent
        );
      }

      .search-toolbar__actions {
        justify-content: flex-start;
        padding: 0.5rem 0.65rem 0.65rem;
      }

      .search-toolbar--feature .search-toolbar__field {
        width: calc(100% - 1rem);
        margin-left: 0.5rem;
        margin-right: 0.5rem;
      }
    }

    /**
     * Babooni / Biosstel: barra clara (referencia SearchInput en front-biosstel),
     * sin cápsula oscura; texto y acciones legibles.
     */
    :host-context(html[data-erp-tenant='babooni']) .search-toolbar--feature {
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(14px);
      border: 1px solid color-mix(in srgb, var(--border-soft) 60%, transparent);
      box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.04);
    }

    :host-context(html[data-erp-tenant='babooni']) .search-toolbar--feature:focus-within {
      background: #ffffff;
      border-color: var(--brand);
      box-shadow: 0 8px 32px -8px rgba(0, 0, 0, 0.08);
    }

    :host-context(html[data-erp-tenant='babooni']) .search-toolbar--feature .search-toolbar__field {
      border-radius: 10px 0 0 10px;
      background: transparent;
      border-color: transparent;
    }

    :host-context(html[data-erp-tenant='babooni']) .search-toolbar--feature .search-toolbar__divider {
      background: linear-gradient(
        180deg,
        transparent,
        rgba(8, 8, 8, 0.08) 35%,
        rgba(8, 8, 8, 0.08) 65%,
        transparent
      );
    }

    :host-context(html[data-erp-tenant='babooni'])
      .search-toolbar--feature
      .search-toolbar__actions
      ::ng-deep
      .btn-shape-ghost,
    :host-context(html[data-erp-tenant='babooni'])
      .search-toolbar--feature
      .search-toolbar__actions
      ::ng-deep
      .btn-shape-auto,
    :host-context(html[data-erp-tenant='babooni'])
      .search-toolbar--feature
      .search-toolbar__actions
      ::ng-deep
      .btn-shape-solid {
      --btn-accent: var(--toolbar-accent);
      color: color-mix(in srgb, var(--text-primary, #1b1b1b) 92%, var(--toolbar-accent) 8%);
    }

    :host-context(html[data-erp-tenant='babooni'])
      .search-toolbar--feature
      .search-toolbar__actions
      ::ng-deep
      .btn:hover {
      background: color-mix(in srgb, var(--brand) 8%, transparent);
      color: var(--brand);
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
