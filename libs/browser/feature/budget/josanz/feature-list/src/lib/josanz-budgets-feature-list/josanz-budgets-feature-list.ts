import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainListLayoutComponent, MainTemplateCardComponent, JosanzThemeService } from '@josanz-erp/josanz-ui';

@Component({
  selector: 'josanz-budgets-feature-list',
  standalone: true,
  imports: [CommonModule, MainListLayoutComponent, MainTemplateCardComponent],
  templateUrl: './josanz-budgets-feature-list.html',
})
export class JosanzBudgetsFeatureListComponent {
  readonly themeService = inject(JosanzThemeService);
  title = 'Presupuestos';
  primaryBtnLabel = 'Añadir Presupuesto +';
  filterOptions = ['Todas', 'Borrador', 'Enviado', 'Aceptado', 'Rechazado'];

  onAdd() {
    console.log('Añadir presupuesto');
  }

  onFilter(filter: string) {
    console.log('Filtrar por:', filter);
  }

  onExcel() {
    console.log('Exportar a Excel');
  }
}
