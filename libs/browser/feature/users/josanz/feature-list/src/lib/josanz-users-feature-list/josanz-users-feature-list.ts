import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainListLayoutComponent, MainTemplateCardComponent, BaseListComponent } from '@josanz-erp/josanz-ui';
import { JosanzUserCreateComponent } from '../josanz-user-create/josanz-user-create';

@Component({
  selector: 'lib-josanz-users-list',
  standalone: true,
  imports: [CommonModule, MainListLayoutComponent, MainTemplateCardComponent, JosanzUserCreateComponent],
  templateUrl: './josanz-users-feature-list.html',
  styleUrl: './josanz-users-feature-list.css',
})
export class JosanzUsersListComponent extends BaseListComponent {
  showCreateModal = false;

  constructor() {
    super();
    this.title = 'Usuario/as';
    this.primaryBtnLabel = 'Añadir Usuario +';
    this.filterOptions = ['Todas', 'Tipo X', 'Tipo Y', 'Tipo Z'];
  }

  override onAdd() {
    this.showCreateModal = true;
  }

  onCloseModal() {
    this.showCreateModal = false;
  }
}
