import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainListLayoutComponent, MainTemplateCardComponent, BaseListComponent } from '@josanz-erp/josanz-ui';

@Component({
  selector: 'josanz-users-list',
  standalone: true,
  imports: [CommonModule, MainListLayoutComponent, MainTemplateCardComponent],
  templateUrl: './josanz-users-feature-list.html',
  styleUrl: './josanz-users-feature-list.css',
})
export class JosanzUsersListComponent extends BaseListComponent {
  constructor() {
    super();
    this.title = 'Usuario/as';
    this.primaryBtnLabel = 'Añadir Usuario';
  }
}
