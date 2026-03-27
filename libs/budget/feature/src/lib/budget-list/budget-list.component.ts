import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BudgetStore } from '@josanz-erp/budget-data-access';
import { UiTableComponent, UiCardComponent, UiButtonComponent } from '@josanz-erp/shared-ui-kit';
import { LucideAngularModule, Plus, FileText, Download } from 'lucide-angular';

@Component({
  selector: 'lib-budget-list',
  standalone: true,
  imports: [CommonModule, RouterModule, UiTableComponent, UiCardComponent, UiButtonComponent, LucideAngularModule],
  template: `
    <div class="page-header">
      <div class="titles">
        <h1>Presupuestos</h1>
        <p>Gestiona cotizaciones y rango de reserva para eventos</p>
      </div>
      <ui-josanz-button [icon]="Plus" routerLink="/budgets/create">Nuevo Presupuesto</ui-josanz-button>
    </div>

    <ui-josanz-card title="Historial de Presupuestos">
      <ui-josanz-table [columns]="columns" [data]="store.budgets()">
        <ng-template #cellTemplate let-item let-key="key">
          @switch (key) {
            @case ('id') { <span class="mono-id">#{{ item.id.slice(0, 8) }}</span> }
            @case ('status') { <span class="badge" [class]="item.status.toLowerCase()">{{ item.status }}</span> }
            @case ('total') { <strong>{{ item.total | currency:'EUR' }}</strong> }
            @case ('createdAt') { {{ item.createdAt | date:'dd/MM/yyyy' }} }
            @case ('startDate') { {{ item.startDate | date:'dd/MM/yyyy' }} }
            @case ('endDate') { {{ item.endDate | date:'dd/MM/yyyy' }} }
            @case ('actions') {
              <div class="actions">
                <button class="icon-btn"><i-lucide [name]="FileText"></i-lucide></button>
                <button class="icon-btn"><i-lucide [name]="Download"></i-lucide></button>
              </div>
            }
            @default { {{ item[key] }} }
          }
        </ng-template>
      </ui-josanz-table>
    </ui-josanz-card>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    .titles { display: flex; flex-direction: column; gap: 4px; }
    h1 { font-size: 24px; font-weight: 700; color: white; margin: 0; }
    p { color: #94A3B8; margin: 0; }
    .mono-id { font-family: monospace; color: #94A3B8; }
    .badge { padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
    .badge.draft { background: rgba(148, 163, 184, 0.15); color: #CBD5E1; }
    .badge.accepted { background: rgba(16, 185, 129, 0.15); color: #6EE7B7; }
    .badge.sent { background: rgba(59, 130, 246, 0.2); color: #93C5FD; }
    .badge.rejected { background: rgba(239, 68, 68, 0.2); color: #FCA5A5; }
    .actions { display: flex; gap: 8px; justify-content: flex-end; }
    .icon-btn { 
      background: none; border: none; color: #94A3B8; cursor: pointer; padding: 4px;
      transition: color 0.2s;
    }
    .icon-btn:hover { color: white; }
    @media (max-width: 900px) {
      .page-header { flex-direction: column; align-items: flex-start; gap: 12px; }
    }
  `],
})
export class BudgetListComponent implements OnInit {
  store = inject(BudgetStore);
  Plus = Plus;
  FileText = FileText;
  Download = Download;

  columns = [
    { key: 'id', header: 'Referencia', width: '120px' },
    { key: 'createdAt', header: 'Fecha', width: '150px' },
    { key: 'startDate', header: 'Inicio', width: '120px' },
    { key: 'endDate', header: 'Fin', width: '120px' },
    { key: 'clientId', header: 'Cliente' },
    { key: 'total', header: 'Total', width: '150px' },
    { key: 'status', header: 'Estado', width: '120px' },
    { key: 'actions', header: '', width: '100px' },
  ];

  ngOnInit() {
    this.store.loadBudgets();
  }
}
