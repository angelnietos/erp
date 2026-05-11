import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainListLayoutComponent, MainTemplateCardComponent, BaseListComponent } from '@josanz-erp/josanz-ui';
import { JosanzClientCreateComponent } from '../josanz-client-create/josanz-client-create';

@Component({
  selector: 'josanz-clients-list',
  standalone: true,
  imports: [
    CommonModule,
    MainListLayoutComponent,
    MainTemplateCardComponent,
    JosanzClientCreateComponent,
  ],
  templateUrl: './feature-list.html',
  styleUrl: './feature-list.css',
})
export class JosanzClientsListComponent extends BaseListComponent {
  showCreateModal = signal(false);

  constructor() {
    super();
    this.title = 'Clientes';
    this.primaryBtnLabel = 'Añadir Cliente';
  }

  override onAdd() {
    this.showCreateModal.set(true);
  }

  onModalClose() {
    this.showCreateModal.set(false);
  }
}
