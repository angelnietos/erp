import { Component, Input, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TableVariant = 'default' | 'dark' | 'light' | 'striped' | 'bordered' | 'hover' | 'compact' | 'glass';

@Component({
  selector: 'ui-josanz-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="table-container" [class]="'table-' + variant">
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
            <tr>
              @for (col of columns; track col.key) {
                <td>
                  <ng-container 
                    [ngTemplateOutlet]="cellTemplate" 
                    [ngTemplateOutletContext]="{ $implicit: item, key: col.key }">
                  </ng-container>
                </td>
              }
            </tr>
          } @empty {
            <tr>
              <td [attr.colspan]="columns.length" class="empty-state">
                No hay datos disponibles
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .table-container { 
      width: 100%; 
      overflow-x: auto; 
      border-radius: 8px; 
      background: var(--bg-secondary);
      border: 1px solid var(--border-soft);
      box-shadow: var(--shadow-lg);
    }

    table { 
      width: 100%; 
      border-collapse: collapse; 
      text-align: left; 
    }

    thead {
      background: rgba(0, 0, 0, 0.3);
    }

    th { 
      padding: 1.25rem 1rem;
      font-size: 0.75rem; 
      font-weight: 800; 
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text-secondary);
      border-bottom: 2px solid var(--border-soft);
      font-family: var(--font-display);
    }

    td { 
      padding: 1rem; 
      font-size: 0.9rem; 
      color: var(--text-primary);
      border-bottom: 1px solid var(--border-soft);
      transition: all 0.2s ease;
    }

    tbody tr {
      transition: background 0.3s ease;
    }

    tbody tr:last-child td {
      border-bottom: none;
    }

    /* Default Variant */
    .table-default tr:hover td {
      background: rgba(255, 255, 255, 0.03);
      color: #fff;
    }

    /* Dark Variant */
    .table-dark {
      background: #000;
      border-color: #222;
    }
    .table-dark th {
      background: #0a0a0a;
      border-bottom-color: #333;
    }

    /* Light Variant */
    .table-light {
      background: rgba(255, 255, 255, 0.95);
    }
    .table-light th {
      color: #111;
      border-bottom-color: #ddd;
    }
    .table-light td {
      color: #333;
      border-bottom-color: #eee;
    }
    .table-light tr:hover td {
      background: rgba(0, 0, 0, 0.03);
    }

    /* Striped Variant */
    .table-striped tbody tr:nth-child(even) td {
      background: rgba(255, 255, 255, 0.015);
    }

    /* Bordered Variant */
    .table-bordered td, .table-bordered th {
      border: 1px solid var(--border-soft);
    }

    /* Hover Variant */
    .table-hover tr:hover td {
      background: rgba(240, 62, 62, 0.05);
      border-bottom-color: var(--brand-glow);
    }

    /* Compact Variant */
    .table-compact th, .table-compact td {
      padding: 0.5rem 0.75rem;
    }

    /* Glass Variant */
    .table-glass {
      background: rgba(15, 23, 42, 0.4);
      backdrop-filter: blur(12px);
    }
    .table-glass th {
      background: rgba(0, 0, 0, 0.2);
    }

    .empty-state { 
      text-align: center; 
      padding: 4rem; 
      color: var(--text-muted); 
      font-style: italic; 
      font-weight: 500;
      letter-spacing: 0.05em;
    }
  `],
})
export class UiTableComponent {
  @Input() columns: { key: string, header: string, width?: string }[] = [];
  @Input() data: unknown[] = [];
  @Input() trackByKey = 'id';
  @Input() variant: TableVariant = 'default';

  @ContentChild('cellTemplate') cellTemplate!: TemplateRef<unknown>;

  trackBy(item: unknown) { return (item as Record<string, unknown>)[this.trackByKey]; }
}
