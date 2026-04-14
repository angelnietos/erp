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
      padding: 0.15rem 0 0.15rem 0.35rem;
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
    }
  `],
})
export class UiSearchToolbarComponent {
  @Input() placeholder = 'BUSCAR...';
  @Input() value = '';
  @Input() searchVariant: SearchVariant = 'glass';
  /** feature = cápsula unificada (listas); minimal = fila flexible sin marco */
  @Input() appearance: SearchToolbarAppearance = 'feature';
  @Output() searchChange = new EventEmitter<string>();
}
