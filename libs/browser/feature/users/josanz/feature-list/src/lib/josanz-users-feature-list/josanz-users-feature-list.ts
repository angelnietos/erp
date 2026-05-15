import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  MainListLayoutComponent,
  MainTemplateCardComponent,
  BaseListComponent,
} from '@josanz-erp/josanz-ui';

@Component({
  selector: 'lib-josanz-users-list',
  standalone: true,
  imports: [CommonModule, MainListLayoutComponent, MainTemplateCardComponent],
  templateUrl: './josanz-users-feature-list.html',
  styleUrl: './josanz-users-feature-list.css',
})
export class JosanzUsersListComponent extends BaseListComponent {
  private router = inject(Router);

  constructor() {
    super();
    this.title = 'Usuario/as';
    this.primaryBtnLabel = 'Añadir Usuario +';
    this.filterOptions = ['Todas', 'Tipo X', 'Tipo Y', 'Tipo Z'];
  }

  override onAdd() {
    this.router.navigate(['/users/new']);
  }

  openDetail() {
    this.router.navigate(['/users/1']);
  }
}
