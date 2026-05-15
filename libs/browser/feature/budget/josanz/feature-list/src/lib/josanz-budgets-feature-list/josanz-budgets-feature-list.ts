import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MainListLayoutComponent, MainTemplateCardComponent } from '@josanz-erp/josanz-ui';

@Component({
  selector: 'josanz-budgets-feature-list',
  standalone: true,
  imports: [CommonModule, MainListLayoutComponent, MainTemplateCardComponent],
  templateUrl: './josanz-budgets-feature-list.html',
})
export class JosanzBudgetsFeatureListComponent {
  private router = inject(Router);
  
  title = 'Presupuestos';
  primaryBtnLabel = 'Añadir Presupuesto +';
  filterOptions = ['Todas', 'Borrador', 'Enviado', 'Aceptado', 'Rechazado'];

  onAdd() {
    this.router.navigate(['/budgets/new']);
  }

  openDetail() {
    this.router.navigate(['/budgets/1']);
  }

  onFilter(filter: string) {
    console.log('Filtrar por:', filter);
  }

  onExcel() {
    console.log('Exportar a Excel');
  }
}

