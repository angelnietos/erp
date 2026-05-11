import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainListLayoutComponent, MainTemplateCardComponent, BaseListComponent } from '@josanz-erp/josanz-ui';

@Component({
  selector: 'josanz-clients-list',
  standalone: true,
  imports: [CommonModule, MainListLayoutComponent, MainTemplateCardComponent],
  templateUrl: './feature-list.html',
  styleUrl: './feature-list.css',
})
export class JosanzClientsListComponent extends BaseListComponent {
  constructor() {
    super();
    this.title = 'Clientes';
    this.primaryBtnLabel = 'Añadir Cliente';
  }

  override onAdd() {
    console.log('Lógica específica de Josanz para añadir cliente');
    super.onAdd();
  }
}
