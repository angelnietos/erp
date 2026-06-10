import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  MainListLayoutComponent,
  AdaptiveListRowsComponent,
  ButtonComponent,
  type JosanzAdaptiveListItem,
} from '@josanz-erp/josanz-ui';

@Component({
  selector: 'lib-inventory',
  standalone: true,
  imports: [
    CommonModule,
    MainListLayoutComponent,
    AdaptiveListRowsComponent,
    //ButtonComponent,
  ],
  template: `
    @if (showSuccessToast) {
      <div class="inventory-success-toast" role="status">
        <span aria-hidden="true">✓</span>
        Equipo creado correctamente
        <button
          type="button"
          class="toast-close"
          aria-label="Cerrar"
          (click)="dismissToast()"
        >
          ×
        </button>
      </div>
    }

    <josanz-main-list-layout
      title="Inventario"
      [filterOptions]="filterOptions"
      [primaryBtnLabel]="'Añadir Equipo'"
      [paginationPage]="currentPage()"
      [paginationTotal]="totalPages"
      [figmaCatalogLayout]="true"
      typologyTabsVariant="figma"
      [showViewSelector]="true"
      searchPlaceholder="Buscar equipo o categoría..."
      (primaryAction)="goToNew()"
      (filterChange)="onFilter($event)"
      (paginationChange)="onPageChange($event)"
    >
      <div class="list-header">
        <div class="list-header__row w-full min-w-0 px-1 py-0 md:px-1 md:py-0">
          <div class="list-header__title truncate">Equipo / Categoría</div>
          <div class="list-header__fields">
            <div class="list-header__field list-header__field--w160 truncate">
              Código
            </div>
            <div class="list-header__field truncate">Ubicación</div>
          </div>
          <div class="list-header__status">
            <span class="truncate">Estado</span>
          </div>
        </div>
      </div>

      <josanz-adaptive-list-rows
        [items]="paginatedItems"
        [defaultLabels]="['Código', 'Ubicación']"
        (itemClick)="openDetail($event)"
      ></josanz-adaptive-list-rows>
    </josanz-main-list-layout>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .inventory-success-toast {
        position: fixed;
        top: 80px;
        right: 24px;
        background: var(--josanz-success);
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        z-index: 1000;
        box-shadow: var(--josanz-shadow);
      }
      .toast-close {
        background: none;
        border: none;
        color: inherit;
        font-size: 18px;
        cursor: pointer;
        margin-left: 8px;
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
export class InventoryFeature implements OnInit {
  private readonly router = inject(Router);

  activeCategory = signal('Todos');
  currentPage = signal(1);
  readonly pageSize = 12;
  showSuccessToast = false;

  filterOptions = [
    'Todos',
    'Audio',
    'Video',
    'Estructuras',
    'Iluminación',
    'Accesorios',
  ];

  readonly equipmentItems: JosanzAdaptiveListItem[] = [
    {
      id: '1',
      title: 'Consola Yamaha CL5',
      leadingMark: 'A',
      data: ['AUD-001', 'Sevilla', 'Operador A'],
      labels: ['Código', 'Ubicación'],
      status: 'Disponible',
      statusVariant: 'success',
    },
    {
      id: '2',
      title: 'Proyector Laser 4K',
      leadingMark: 'V',
      data: ['VID-002', 'Madrid'],
      labels: ['Código', 'Ubicación'],
      status: 'En uso',
      statusVariant: 'en-proceso',
    },
    {
      id: '3',
      title: 'Truss 3x3m',
      leadingMark: 'E',
      data: ['EST-003', 'Almacén Central'],
      labels: ['Código', 'Ubicación'],
      status: 'Mantenimiento',
      statusVariant: 'presupuesto',
    },
    {
      id: '4',
      title: 'Micrófono Inalámbrico',
      leadingMark: 'Ac',
      data: ['ACC-004', 'Sevilla'],
      labels: ['Código', 'Ubicación'],
      status: 'Disponible',
      statusVariant: 'success',
    },
    {
      id: '5',
      title: 'Moving Head RGB',
      leadingMark: 'I',
      data: ['ILU-005', 'Almacén Central'],
      labels: ['Código', 'Ubicación'],
      status: 'Disponible',
      statusVariant: 'success',
    },
    {
      id: '6',
      title: 'Consola Digital',
      leadingMark: 'A',
      data: ['AUD-006', 'Madrid'],
      labels: ['Código', 'Ubicación'],
      status: 'Disponible',
      statusVariant: 'success',
    },
  ];

  ngOnInit(): void {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('created') === '1') {
      this.showSuccessToast = true;
      const url = new URL(window.location.href);
      url.searchParams.delete('created');
      void this.router.navigateByUrl(url.pathname + url.search, { replaceUrl: true });
    }
  }

  get filteredItems(): JosanzAdaptiveListItem[] {
    if (this.activeCategory() === 'Todos') {
      return this.equipmentItems;
    }
    return this.equipmentItems.filter((item) =>
      item.title.toLowerCase().includes(this.activeCategory().toLowerCase()),
    );
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredItems.length / this.pageSize));
  }

  get paginatedItems(): JosanzAdaptiveListItem[] {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredItems.slice(start, start + this.pageSize);
  }

  onFilter(option: string): void {
    this.activeCategory.set(option);
    this.currentPage.set(1);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  goToNew(): void {
    void this.router.navigate(['/inventory', 'new']);
  }

  openDetail(item: JosanzAdaptiveListItem): void {
    void this.router.navigate(['/inventory', item.id]);
  }

  dismissToast(): void {
    this.showSuccessToast = false;
  }
}
