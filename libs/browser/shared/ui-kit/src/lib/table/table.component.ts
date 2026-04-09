import { Component, Input, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TableVariant = 'default' | 'striped' | 'glass';

@Component({
  selector: 'ui-table',
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
            <tr class="table-row">
              @for (col of columns; track col.key) {
                <td>
                  <div class="cell-content">
                    <ng-container 
                      [ngTemplateOutlet]="cellTemplate" 
                      [ngTemplateOutletContext]="{ $implicit: item, key: col.key }">
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
    </div>
  `,
  styles: [`
    .table-container { 
      width: 100%; 
      overflow-x: auto; 
      border-radius: var(--radius-lg); 
      background: var(--bg-secondary);
      border: 1px solid var(--border-soft);
      box-shadow: var(--shadow-sm, 0 4px 24px rgba(0, 0, 0, 0.22)), var(--shadow-inset-shine, inset 0 1px 0 rgba(255, 255, 255, 0.04));
    }

    table { 
      width: 100%; 
      border-collapse: separate; 
      border-spacing: 0;
      text-align: left; 
    }

    thead {
      background: linear-gradient(180deg, color-mix(in srgb, var(--bg-primary) 40%, transparent) 0%, color-mix(in srgb, var(--bg-tertiary) 50%, transparent) 100%);
    }

    th { 
      padding: 0.65rem 1rem;
      font-size: 0.58rem; 
      font-weight: 700; 
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: var(--text-secondary);
      border-bottom: 1px solid var(--border-soft);
      font-family: var(--font-display);
      white-space: nowrap;
    }

    td { 
      padding: 0.65rem 1rem; 
      font-size: 0.76rem; 
      color: var(--text-primary);
      border-bottom: 1px solid var(--border-soft);
      transition: var(--transition-fast);
      vertical-align: middle;
      font-weight: 500;
    }

    .table-row { transition: var(--transition-base); position: relative; }

    .table-row:hover td {
      background: color-mix(in srgb, var(--brand) 4%, var(--bg-tertiary));
      color: var(--text-primary);
    }

    .table-row:hover td:first-child {
      box-shadow: inset 4px 0 0 var(--brand);
    }

    .table-row:last-child td { border-bottom: none; }

    /* Variants */
    .table-striped tbody tr:nth-child(even) td {
      background: rgba(255, 255, 255, 0.01);
    }

    .table-glass {
      background: var(--surface);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }

    .empty-cell { padding: 0; }
    .empty-state { 
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2.5rem 1.5rem;
      color: var(--text-muted); 
      font-size: 0.62rem;
    }
    
    .empty-state span { font-size: 0.8rem; letter-spacing: 0.2em; opacity: 0.6; }
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
