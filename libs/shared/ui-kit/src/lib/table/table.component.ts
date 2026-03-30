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
    .table-container { width: 100%; overflow-x: auto; border-radius: 12px; }

    /* Default Variant */
    .table-default {
      background: rgba(255,255,255,0.01);
    }
    .table-default th {
      color: #94A3B8;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .table-default td {
      color: #E2E8F0;
      border-bottom: 1px solid rgba(255,255,255,0.03);
    }
    .table-default tr:hover td {
      background: rgba(255,255,255,0.02);
    }

    /* Dark Variant */
    .table-dark {
      background: #1E293B;
    }
    .table-dark th {
      color: #94A3B8;
      border-bottom: 1px solid #334155;
    }
    .table-dark td {
      color: #E2E8F0;
      border-bottom: 1px solid #334155;
    }
    .table-dark tr:hover td {
      background: #334155;
    }

    /* Light Variant */
    .table-light {
      background: #FFFFFF;
    }
    .table-light th {
      color: #64748B;
      border-bottom: 1px solid #E2E8F0;
    }
    .table-light td {
      color: #1E293B;
      border-bottom: 1px solid #F1F5F9;
    }
    .table-light tr:hover td {
      background: #F8FAFC;
    }

    /* Striped Variant */
    .table-striped {
      background: transparent;
    }
    .table-striped th {
      color: #94A3B8;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .table-striped td {
      color: #E2E8F0;
      border-bottom: 1px solid rgba(255,255,255,0.03);
    }
    .table-striped tbody tr:nth-child(odd) td {
      background: rgba(255,255,255,0.02);
    }
    .table-striped tr:hover td {
      background: rgba(255,255,255,0.05);
    }

    /* Bordered Variant */
    .table-bordered {
      background: transparent;
    }
    .table-bordered th {
      color: #94A3B8;
      border: 1px solid rgba(255,255,255,0.05);
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .table-bordered td {
      color: #E2E8F0;
      border: 1px solid rgba(255,255,255,0.03);
    }
    .table-bordered tr:hover td {
      background: rgba(255,255,255,0.02);
    }

    /* Hover Variant */
    .table-hover {
      background: transparent;
    }
    .table-hover th {
      color: #94A3B8;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .table-hover td {
      color: #E2E8F0;
      border-bottom: 1px solid rgba(255,255,255,0.03);
    }
    .table-hover tr:hover td {
      background: rgba(79, 70, 229, 0.1);
    }

    /* Compact Variant */
    .table-compact {
      background: transparent;
    }
    .table-compact th {
      color: #94A3B8;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      padding: 8px 12px;
    }
    .table-compact td {
      color: #E2E8F0;
      border-bottom: 1px solid rgba(255,255,255,0.03);
      padding: 8px 12px;
    }
    .table-compact tr:hover td {
      background: rgba(255,255,255,0.02);
    }

    /* Glass Variant */
    .table-glass {
      background: rgba(255,255,255,0.05);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.1);
    }
    .table-glass th {
      color: rgba(255,255,255,0.7);
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .table-glass td {
      color: #E2E8F0;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .table-glass tr:hover td {
      background: rgba(255,255,255,0.05);
    }

    table { width: 100%; border-collapse: collapse; text-align: left; }
    th { padding: 16px; font-size: 13px; font-weight: 500; }
    td { padding: 16px; font-size: 14px; }
    .empty-state { text-align: center; padding: 48px; color: #64748B; font-style: italic; }
  `],
})
export class UiTableComponent {
  @Input() columns: { key: string, header: string, width?: string }[] = [];
  @Input() data: any[] = [];
  @Input() trackByKey = 'id';
  @Input() variant: TableVariant = 'default';

  @ContentChild('cellTemplate') cellTemplate!: TemplateRef<any>;

  trackBy(item: any) { return item[this.trackByKey]; }
}
