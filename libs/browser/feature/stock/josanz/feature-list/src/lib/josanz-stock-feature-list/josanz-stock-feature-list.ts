import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainListLayoutComponent, MainTemplateCardComponent, BaseListComponent, ButtonComponent, FilterTabsComponent } from '@josanz-erp/josanz-ui';

@Component({
  selector: 'josanz-stock-list',
  standalone: true,
  imports: [CommonModule, MainListLayoutComponent, MainTemplateCardComponent, ButtonComponent, FilterTabsComponent],
  templateUrl: './josanz-stock-feature-list.html',
  styleUrl: './josanz-stock-feature-list.css',
})
export class JosanzStockListComponent extends BaseListComponent {
  constructor() {
    super();
    this.title = 'Stock';
    this.primaryBtnLabel = 'Añadir Producto';
    this.filterOptions = ['Todos', 'Almacén 01', 'Almacén 02', 'Almacén 03'];
  }

  onAddWarehouse() {
    console.log('Nuevo almacén clicado');
  }
}
