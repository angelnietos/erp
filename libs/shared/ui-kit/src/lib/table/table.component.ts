import { Component, Input, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-josanz-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="table-container">
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
    .table-container { width: 100%; overflow-x: auto; background: rgba(255,255,255,0.01); border-radius: 12px; }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th { padding: 16px; font-size: 13px; font-weight: 500; color: #94A3B8; border-bottom: 1px solid rgba(255,255,255,0.05); }
    td { padding: 16px; font-size: 14px; color: #E2E8F0; border-bottom: 1px solid rgba(255,255,255,0.03); }
    tr:hover td { background: rgba(255,255,255,0.02); }
    .empty-state { text-align: center; padding: 48px; color: #64748B; font-style: italic; }
  `],
})
export class UiTableComponent {
  @Input() columns: { key: string, header: string, width?: string }[] = [];
  @Input() data: any[] = [];
  @Input() trackByKey = 'id';

  @ContentChild('cellTemplate') cellTemplate!: TemplateRef<any>;

  trackBy(item: any) { return item[this.trackByKey]; }
}
