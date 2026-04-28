import { Component, Input, ContentChild, TemplateRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ThemeService } from '@josanz-erp/shared-data-access';

export type TableVariant = 'default' | 'striped' | 'glass';

@Component({
  selector: 'ui-table',
  standalone: true,
  imports: [CommonModule, ScrollingModule],
  template: `
    <div
      [ngClass]="['table-container', 'table-' + variant]"
      [class.table-virtual-active]="useVirtual"
      [style.--row-height]="actualRowHeight + 'px'"
      [style.--cell-padding]="cellPadding"
    >
      @if (useVirtual && data.length === 0) {
        <div class="empty-state standalone">
          <span class="empty-title">Sin registros</span>
          <span class="empty-hint">Prueba a ajustar filtros o crear un elemento nuevo.</span>
        </div>
      } @else if (useVirtual) {
        <div class="virt-head" [style.gridTemplateColumns]="gridTemplate">
          @for (col of columns; track col.key) {
            <div class="virt-th">{{ col.header }}</div>
          }
        </div>
        <cdk-virtual-scroll-viewport
          [itemSize]="rowHeight"
          class="virt-viewport"
          [style.height.px]="viewportHeight"
        >
          <div
            *cdkVirtualFor="let item of data; trackBy: trackByCdk"
            class="virt-row table-row"
            [style.gridTemplateColumns]="gridTemplate"
          >
            @for (col of columns; track col.key) {
              <div class="virt-td">
                <div class="cell-content">
                  <ng-container
                    [ngTemplateOutlet]="cellTemplate"
                    [ngTemplateOutletContext]="{
                      $implicit: item,
                      key: col.key,
                    }"
                  >
                  </ng-container>
                </div>
              </div>
            }
          </div>
        </cdk-virtual-scroll-viewport>
      } @else {
        <table>
          <thead>
            <tr>
              @for (col of columns; track col.key) {
                <th [style.width]="col.width">{{ col.header }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (item of data; track trackBy(item)) {
              <tr class="table-row">
                @for (col of columns; track col.key) {
                  <td>
                    <div class="cell-content">
                      <ng-container
                        [ngTemplateOutlet]="cellTemplate"
                        [ngTemplateOutletContext]="{
                          $implicit: item,
                          key: col.key,
                        }"
                      >
                      </ng-container>
                    </div>
                  </td>
                }
              </tr>
            } @empty {
              <tr>
                <td [attr.colspan]="columns.length" class="empty-cell">
                  <div class="empty-state">
                    <span class="empty-title">Sin registros</span>
                    <span class="empty-hint">Prueba a cambiar filtros o crear uno nuevo.</span>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .table-container {
        width: 100%;
        overflow-x: auto;
        border-radius: var(--radius-xl);
        background: rgba(255, 255, 255, 0.02);
        backdrop-filter: blur(35px);
        border: 1px solid var(--border-soft);
        box-shadow: var(--shadow-xl);
        position: relative;
      }

      table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        text-align: left;
        min-width: 1000px;
      }

      thead {
        position: sticky;
        top: 0;
        z-index: 10;
      }

      th {
        padding: 1.25rem var(--cell-padding);
        font-size: 0.75rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.15em;
        color: #fff;
        border-bottom: 1px solid var(--brand);
        font-family: var(--font-main);
        background: rgba(10, 15, 25, 0.95);
        backdrop-filter: blur(20px);
        user-select: none;
        transition: background 0.3s ease;
      }

      td {
        padding: var(--cell-padding);
        font-size: 0.9rem;
        color: var(--text-primary);
        border-bottom: 1px solid var(--border-soft);
        transition: all 0.4s var(--transition-spring);
        vertical-align: middle;
        font-weight: 600;
        height: var(--row-height);
      }

      .table-row {
        transition: all 0.5s var(--transition-spring);
        position: relative;
        background: transparent;
      }

      .table-row:hover td {
        background: rgba(var(--brand-rgb), 0.08);
        color: #fff;
      }

      .table-row:hover td:first-child {
        box-shadow: inset 4px 0 0 var(--brand);
      }

      .table-row:last-child td {
        border-bottom: none;
      }

      .table-glass {
        background: rgba(255, 255, 255, 0.03);
        backdrop-filter: blur(40px) saturate(2);
        border-color: rgba(255, 255, 255, 0.1);
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        padding: 6rem 2rem;
        color: var(--text-muted);
      }

      .empty-title {
        font-size: 0.85rem;
        letter-spacing: 0.25em;
        font-weight: 900;
        font-family: var(--font-gaming);
        text-transform: uppercase;
        color: #fff;
        text-shadow: 0 0 10px var(--brand-glow);
      }

      .empty-hint {
        font-size: 0.9rem;
        font-weight: 500;
        line-height: 1.6;
        max-width: 35ch;
        text-align: center;
        color: var(--text-muted);
        letter-spacing: 0.05em;
      }

      .empty-state.standalone {
        padding: 4rem 2rem;
      }

      @media (prefers-reduced-motion: reduce) {
        .table-row,
        .virt-row {
          transition: none !important;
        }
      }
    `,
  ],
})
export class UiTableComponent {
  @Input() columns: { key: string; header: string; width?: string }[] = [];
  @Input() data: unknown[] = [];
  @Input() trackByKey = 'id';
  @Input() variant: TableVariant = 'default';
  /** Activa scroll virtual (CDK) cuando hay suficientes filas. */
  @Input() virtualScroll = false;
  @Input() viewportHeight = 440;
  @Input() rowHeight = 56;

  @ContentChild('cellTemplate') cellTemplate!: TemplateRef<unknown>;

  private themeService = inject(ThemeService);

  get actualRowHeight(): number {
    const density = this.themeService.currentDensity();
    if (density === 'compact') return 44;
    if (density === 'spacious') return 72;
    return this.rowHeight;
  }

  get cellPadding(): string {
    const density = this.themeService.currentDensity();
    if (density === 'compact') return '0.5rem 1rem';
    if (density === 'spacious') return '1.5rem 2rem';
    return '1.25rem 1.5rem';
  }

  get useVirtual(): boolean {
    return this.virtualScroll && this.data.length > 24;
  }

  get gridTemplate(): string {
    if (!this.columns.length) {
      return '1fr';
    }
    return this.columns
      .map((c) => c.width?.replace('px', 'px') ?? 'minmax(0,1fr)')
      .join(' ');
  }

  trackBy(item: unknown) {
    return (item as Record<string, unknown>)[this.trackByKey];
  }

  trackByCdk = (_index: number, item: unknown) =>
    (item as Record<string, unknown>)[this.trackByKey];
}
