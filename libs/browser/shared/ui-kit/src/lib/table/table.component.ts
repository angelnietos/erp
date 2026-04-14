import { Component, Input, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';

export type TableVariant = 'default' | 'striped' | 'glass';

@Component({
  selector: 'ui-table',
  standalone: true,
  imports: [CommonModule, ScrollingModule],
  template: `
    <div
      [ngClass]="['table-container', 'table-' + variant]"
      [class.table-virtual-active]="useVirtual"
    >
      @if (useVirtual && data.length === 0) {
        <div class="empty-state standalone">
          <span class="text-uppercase">No hay registros</span>
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
                    <span class="text-uppercase">No hay registros</span>
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
        border-radius: var(--radius-lg);
        background: var(--surface, var(--bg-secondary));
        border: 1px solid var(--border-soft);
        box-shadow: var(--shadow-sm), var(--shadow-inset-shine);
        position: relative;
      }

      table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        text-align: left;
        min-width: 1200px; /* Prevent squashing - ensuring horizontal scroll */
      }

      thead {
        position: sticky;
        top: 0;
        z-index: 10;
        background: linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.03) 0%,
          rgba(255, 255, 255, 0.01) 100%
        );
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      }

      th {
        padding: 0.6rem;
        font-size: 0.52rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.14em;
        color: var(--text-muted);
        border-bottom: 1px solid var(--border-soft);
        font-family: var(--font-display);
        background: color-mix(in srgb, var(--surface) 80%, var(--brand) 3%);
        user-select: none;
        line-height: 1.2;
      }

      td {
        padding: 0.6rem;
        font-size: 0.72rem;
        color: var(--text-primary);
        border-bottom: 1px solid var(--border-soft);
        transition: var(--transition-fast);
        vertical-align: top;
        font-weight: 500;
        line-height: 1.4;
      }

      .table-row {
        transition: var(--transition-base);
        position: relative;
        background: transparent;
      }

      .table-row:hover td,
      .virt-row.table-row:hover .virt-td {
        background: color-mix(in srgb, var(--brand) 4%, transparent);
        color: var(--text-primary);
      }

      .table-row:hover td:first-child,
      .virt-row.table-row:hover .virt-td:first-child {
        box-shadow: inset 3px 0 0 var(--brand);
      }

      .table-row {
        transition: background 0.18s ease;
      }

      .table-row:last-child td {
        border-bottom: none;
      }

      .virt-head {
        display: grid;
        align-items: center;
        min-height: 40px;
        background: var(--bg-tertiary);
        border-bottom: 1px solid var(--border-vibrant);
        position: sticky;
        top: 0;
        z-index: 10;
        min-width: 1200px;
      }

      .virt-th {
        padding: 1rem 1.25rem;
        font-size: 0.6rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--text-secondary);
        font-family: var(--font-display);
        white-space: nowrap;
      }

      .virt-viewport {
        width: 100%;
        border: none;
      }

      .virt-row {
        display: grid;
        align-items: stretch;
        min-height: 48px;
        border-bottom: 1px solid var(--border-soft);
        transition: var(--transition-base);
        min-width: 1200px;
      }

      .virt-td {
        display: flex;
        align-items: center;
        padding: 0.5rem 1.25rem;
        font-size: 0.85rem;
        color: var(--text-primary);
        min-width: 0;
      }

      .table-striped tbody tr:nth-child(even) td {
        background: rgba(255, 255, 255, 0.015);
      }

      .table-glass {
        background: var(--surface);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid var(--border-vibrant);
      }

      .empty-cell {
        padding: 0;
      }
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        padding: 4rem 2rem;
        color: var(--text-muted);
      }

      .empty-state span {
        font-size: 0.75rem;
        letter-spacing: 0.2em;
        font-weight: 800;
        opacity: 0.5;
        font-family: var(--font-display);
        text-transform: uppercase;
      }

      .empty-state.standalone {
        padding: 4rem 2rem;
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
