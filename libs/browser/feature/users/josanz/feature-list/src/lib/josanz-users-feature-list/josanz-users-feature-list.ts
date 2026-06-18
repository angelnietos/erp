import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  AdaptiveListRowsComponent,
  ListTemplateHeaderRowComponent,
  MainListLayoutComponent,
  BaseListComponent,
  type JosanzAdaptiveListItem,
} from '@josanz-erp/josanz-ui';

@Component({
  selector: 'lib-josanz-users-list',
  standalone: true,
  imports: [
    CommonModule,
    MainListLayoutComponent,
    AdaptiveListRowsComponent,
    ListTemplateHeaderRowComponent,
  ],
  templateUrl: './josanz-users-feature-list.html',
  styleUrl: './josanz-users-feature-list.css',
})
export class JosanzUsersListComponent extends BaseListComponent {
  private router = inject(Router);

  readonly userLabels = ['Email', 'Teléfono', 'Rol', 'Último acceso'];

  readonly userItems: JosanzAdaptiveListItem[] = [
    {
      id: 'admin@josanz.com',
      title: 'Admin Josanz',
      data: [
        'admin@josanz.com',
        '+34 600 000 001',
        'Administrador',
        'Hace 5 min',
      ],
      labels: ['Email', 'Teléfono', 'Rol', 'Último acceso'],
      status: 'Activo',
      statusVariant: 'success',
    },
    {
      id: 'juan.perez@josanz.com',
      title: 'Juan Pérez',
      data: ['juan.perez@josanz.com', '+34 600 000 002', 'Operario', 'Ayer'],
      labels: ['Email', 'Teléfono', 'Rol', 'Último acceso'],
      status: 'Activo',
      statusVariant: 'success',
    },
    {
      id: 'ana.belen@josanz.com',
      title: 'Ana Belén',
      data: [
        'ana.belen@josanz.com',
        '+34 600 000 003',
        'Logística',
        '12/05/2024',
      ],
      labels: ['Email', 'Teléfono', 'Rol', 'Último acceso'],
      status: 'Ausente',
      statusVariant: 'warning',
    },
  ];

  get filteredUserItems(): JosanzAdaptiveListItem[] {
    return this.filterItems(this.userItems);
  }

  constructor() {
    super();
    this.title = 'Usuario/as';
    this.primaryBtnLabel = 'Añadir Usuario +';
    this.filterOptions = ['Todas', 'Tipo X', 'Tipo Y', 'Tipo Z'];
  }

  override onAdd() {
    this.router.navigate(['/users/new']);
  }

  openDetail(item: JosanzAdaptiveListItem): void {
    void this.router.navigate(['/users', item.id]);
  }
}
