import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  AdaptiveListRowsComponent,
  ListTemplateHeaderRowComponent,
  MainListLayoutComponent,
  filterAdaptiveListItems,
  type JosanzAdaptiveListItem,
} from '@josanz-erp/josanz-ui';

@Component({
  selector: 'josanz-budgets-feature-list',
  standalone: true,
  imports: [
    CommonModule,
    MainListLayoutComponent,
    AdaptiveListRowsComponent,
    ListTemplateHeaderRowComponent,
  ],
  templateUrl: './josanz-budgets-feature-list.html',
})
export class JosanzBudgetsFeatureListComponent {
  private router = inject(Router);

  searchQuery = '';

  title = 'Presupuestos';
  filterOptions = ['Todos', 'Cliente A', 'Cliente B', 'Cliente C'];

  readonly summaryLine = {
    before: '42 presupuestos · ',
    emphasis: '8 aceptados',
    after: '',
  };

  readonly budgetLabels = ['Cliente', 'Fecha', 'Validez', 'Total'];

  readonly budgetItems: JosanzAdaptiveListItem[] = [
    {
      id: 'PR-2024-010',
      title: 'PR-2024-010',
      data: ['Construcciones S.A.', '14/05/2024', '30 días', '4.500,00 €'],
      labels: this.budgetLabels,
      status: 'Enviado',
      statusVariant: 'presupuesto',
    },
    {
      id: 'PR-2024-011',
      title: 'PR-2024-011',
      data: ['Reformas García', '13/05/2024', '15 días', '1.250,00 €'],
      labels: this.budgetLabels,
      status: 'Aceptado',
      statusVariant: 'confirmado',
    },
    {
      id: 'PR-2024-012',
      title: 'PR-2024-012',
      data: ['Hotel Playa Sol', '12/05/2024', '30 días', '12.800,00 €'],
      labels: this.budgetLabels,
      status: 'Borrador',
      statusVariant: 'borrador',
    },
    {
      id: 'PR-2024-013',
      title: 'PR-2024-013',
      data: ['Paco Montajes', '10/05/2024', '7 días', '850,00 €'],
      labels: this.budgetLabels,
      status: 'Rechazado',
      statusVariant: 'cancelado',
    },
  ];

  get filteredBudgetItems(): JosanzAdaptiveListItem[] {
    return filterAdaptiveListItems(this.budgetItems, this.searchQuery);
  }

  onSearch(value: string): void {
    this.searchQuery = value;
  }

  onAdd(): void {
    void this.router.navigate(['/budgets/new']);
  }

  openDetail(item: JosanzAdaptiveListItem): void {
    void this.router.navigate(['/budgets', item.id]);
  }

  onFilter(filter: string): void {
    console.log('Filtrar por:', filter);
  }

  onExcel(): void {
    console.log('Exportar a Excel');
  }
}
