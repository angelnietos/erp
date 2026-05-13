import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainListLayoutComponent, MainTemplateCardComponent, BaseListComponent, ButtonComponent, MainTabsComponent, FilterTabsComponent } from '@josanz-erp/josanz-ui';

@Component({
  selector: 'josanz-stock-list',
  standalone: true,
  imports: [CommonModule, MainListLayoutComponent, MainTemplateCardComponent, ButtonComponent, MainTabsComponent, FilterTabsComponent],
  templateUrl: './josanz-stock-feature-list.html',
  styleUrl: './josanz-stock-feature-list.css',
})
export class JosanzStockListComponent extends BaseListComponent {
  activeType = 'Productos / lotes';
  secondaryFilterOptions = ['Todos', 'Almacén 01', 'Almacén 02', 'Almacén 03'];
  
  constructor() {
    super();
    this.title = 'Stock';
    this.primaryBtnLabel = 'Añadir Producto +';
    this.filterOptions = ['Todos', 'Equipo X', 'Equipo Y', 'Equipo Z'];
  }

  onSecondaryFilterChange(filter: string) {
    console.log('Filtro secundario:', filter);
  }

  onTypeChange(type: string) {
    this.activeType = type;
  }

  onAddWarehouse() {
    console.log('Nuevo almacén clicado');
  }
}
