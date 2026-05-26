import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  MainListLayoutComponent,
  AdaptiveListRowsComponent,
  type JosanzAdaptiveListItem,
} from '@josanz-erp/josanz-ui';

@Component({
  selector: 'lib-josanz-users-shell',
  standalone: true,
  imports: [
    CommonModule,
    MainListLayoutComponent,
    AdaptiveListRowsComponent,
  ],
  template: `
    <josanz-main-list-layout
      title="Usuarios"
      [filterOptions]="filterOptions"
      [primaryBtnLabel]="'Nuevo Usuario'"
      [paginationPage]="paginationPageValue"
      [paginationTotal]="paginationTotalValue"
      [figmaCatalogLayout]="true"
      typologyTabsVariant="figma"
      [showViewSelector]="true"
      searchPlaceholder="Buscar usuario o email..."
      (primaryAction)="goToNew()"
      (filterChange)="onFilter($event)"
      (paginationChange)="onPageChange($event)"
    >
      <div class="list-header">
        <div class="list-header__row w-full min-w-0 px-1 py-0 md:px-1 md:py-0">
          <div class="list-header__title truncate">Usuario / Nombre</div>
          <div class="list-header__fields">
            <div class="list-header__field truncate">Email</div>
            <div class="list-header__field truncate">Rol</div>
          </div>
          <div class="list-header__status"><span class="truncate">Estado</span></div>
        </div>
      </div>

      <josanz-adaptive-list-rows
        [items]="paginatedItems"
        [defaultLabels]="['Email', 'Rol']"
        (itemClick)="openDetail($event)"
      ></josanz-adaptive-list-rows>
    </josanz-main-list-layout>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .list-header {
        padding: 8px 0;
      }
      .list-header__row {
        display: flex;
        align-items: center;
        gap: 16px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--josanz-text-muted);
      }
    `,
  ],
})
export class JosanzUsersShell {
  private readonly router = inject(Router);

  activeRole = signal('Todos');
  currentPage = signal(1);
  readonly pageSize = 15;

  filterOptions = ['Todos', 'Administrador', 'Operador', 'Técnico', 'Cliente'];

  readonly userItems: JosanzAdaptiveListItem[] = [
    {
      id: '1',
      title: 'Juan Pérez',
      leadingMark: 'JP',
      data: ['juan@josanz.com', 'Administrador'],
      labels: ['Email', 'Rol'],
      status: 'Activo',
      statusVariant: 'success',
    },
    {
      id: '2',
      title: 'Ana Belén',
      leadingMark: 'AB',
      data: ['ana@josanz.com', 'Operador'],
      labels: ['Email', 'Rol'],
      status: 'Activo',
      statusVariant: 'success',
    },
    {
      id: '3',
      title: 'Carlos Ruiz',
      leadingMark: 'CR',
      data: ['carlos@josanz.com', 'Técnico'],
      labels: ['Email', 'Rol'],
      status: 'Ausente',
      statusVariant: 'warning',
    },
    {
      id: '4',
      title: 'María López',
      leadingMark: 'ML',
      data: ['maria@cliente.com', 'Cliente'],
      labels: ['Email', 'Rol'],
      status: 'Inactivo',
      statusVariant: 'borrador',
    },
    {
      id: '5',
      title: 'Pedro Sánchez',
      leadingMark: 'PS',
      data: ['pedro@josanz.com', 'Administrador'],
      labels: ['Email', 'Rol'],
      status: 'Activo',
      statusVariant: 'success',
    },
  ];

  get filteredItems(): JosanzAdaptiveListItem[] {
    if (this.activeRole() === 'Todos') {
      return this.userItems;
    }
    return this.userItems.filter((item) =>
      item.data.some((d) => d.toLowerCase().includes(this.activeRole().toLowerCase())),
    );
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredItems.length / this.pageSize));
  }

  get paginationPageValue(): number {
    return this.currentPage();
  }

  get paginationTotalValue(): number {
    return this.totalPages;
  }

  get paginatedItems(): JosanzAdaptiveListItem[] {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredItems.slice(start, start + this.pageSize);
  }

  onFilter(option: string): void {
    this.activeRole.set(option);
    this.currentPage.set(1);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  goToNew(): void {
    void this.router.navigate(['/users', 'new']);
  }

  openDetail(item: JosanzAdaptiveListItem): void {
    void this.router.navigate(['/users', item.id]);
  }
}