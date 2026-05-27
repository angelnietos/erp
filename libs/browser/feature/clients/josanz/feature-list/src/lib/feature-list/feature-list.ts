import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AdaptiveListRowsComponent,
  ButtonComponent,
  ListTemplateHeaderRowComponent,
  MainListLayoutComponent,
  ModalComponent,
  BaseListComponent,
  type JosanzAdaptiveListItem,
  type JosanzStatusPillKey,
} from '@josanz-erp/josanz-ui';

@Component({
  selector: 'lib-clients-list',
  standalone: true,
  imports: [
    CommonModule,
    MainListLayoutComponent,
    AdaptiveListRowsComponent,
    ListTemplateHeaderRowComponent,
    ModalComponent,
    ButtonComponent,
  ],
  templateUrl: './feature-list.html',
  styleUrl: './feature-list.css',
})
export class JosanzClientsListComponent extends BaseListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  activeTypology = 'Todos';
  showSuccessToast = false;
  showSuccessModal = false;
  currentPage = 1;
  readonly pageSize = 10;

  override readonly filterOptions = [
    'Todos',
    'Tipo cliente 1',
    'Tipo cliente 2',
    'Tipo cliente 3',
    'Tipo cliente 4',
  ];

  readonly clientFieldLabels = ['Teléfono', 'Email', 'Operador'];
  readonly clientLabels = [...this.clientFieldLabels, 'Tipo'];

  readonly clientItems: JosanzAdaptiveListItem[] = [
    {
      id: '1',
      title: 'Cliente ejemplo',
      leadingMark: 'NB',
      data: ['000000000', 'email@email.com', 'Operador A, Operador B, Operador C'],
      labels: this.clientLabels,
      status: 'Nuevo',
      statusVariant: 'cliente-nuevo',
    },
    {
      id: '2',
      title: 'Cliente ejemplo',
      leadingMark: 'CE',
      data: ['000000000', 'email@email.com', 'Operador A, Operador B'],
      labels: this.clientLabels,
      status: 'Tipo cliente',
      statusVariant: 'cliente-tipo-pink',
    },
    {
      id: '3',
      title: 'Cliente ejemplo',
      leadingMark: 'CE',
      data: ['000000000', 'email@email.com', 'Operador A'],
      labels: this.clientLabels,
      status: 'Tipo cliente',
      statusVariant: 'cliente-tipo-green',
    },
    {
      id: '4',
      title: 'Cliente ejemplo',
      data: ['000000000', 'email@email.com', 'Operador A, Operador B, Operador C'],
      labels: this.clientLabels,
      status: 'Tipo cliente',
      statusVariant: 'cliente-tipo-yellow',
    },
    {
      id: '5',
      title: 'Cliente ejemplo',
      leadingMark: 'CE',
      data: ['000000000', 'email@email.com', 'Operador A'],
      labels: this.clientLabels,
      status: 'Tipo cliente',
      statusVariant: 'cliente-tipo-pink',
    },
    {
      id: '6',
      title: 'Cliente ejemplo 6',
      leadingMark: 'CL',
      data: ['000000001', 'cliente@ejemplo.com', 'Operador D'],
      labels: this.clientLabels,
      status: 'Activo',
      statusVariant: 'cliente-tipo-green',
    },
    {
      id: '7',
      title: 'Cliente ejemplo 7',
      leadingMark: 'TE',
      data: ['000000002', 'test@demo.com', 'Operador E'],
      labels: this.clientLabels,
      status: 'Borrador',
      statusVariant: 'cliente-tipo-yellow',
    },
  ];

  constructor() {
    super();
    this.title = 'Clientes';
    this.primaryBtnLabel = 'Añadir Cliente';
  }

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('created') === '1') {
      this.showSuccessToast = true;
      this.showSuccessModal = true;
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        replaceUrl: true,
      });
    }
  }

  get filteredClientItems(): JosanzAdaptiveListItem[] {
    let items = this.filterItems(this.clientItems);
    if (this.activeTypology !== 'Todos') {
      items = items.filter((item) => item.statusVariant === this.typologyPillKey(this.activeTypology));
    }
    return items;
  }

  // Paginación
  get totalPages(): number {
    return Math.ceil(this.filteredClientItems.length / this.pageSize);
  }

  get paginatedItems(): JosanzAdaptiveListItem[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredClientItems.slice(start, start + this.pageSize);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  typologyPillKey(tab: string): JosanzStatusPillKey | undefined {
    const map: Record<string, JosanzStatusPillKey> = {
      'Tipo cliente 1': 'cliente-tipo-pink',
      'Tipo cliente 2': 'cliente-tipo-green',
      'Tipo cliente 3': 'cliente-tipo-yellow',
      'Tipo cliente 4': 'cliente-nuevo',
    };
    return map[tab];
  }

  override onFilter(option: string): void {
    this.activeTypology = option;
    this.currentPage = 1;
    super.onFilter(option);
  }

  override onAdd(): void {
    void this.router.navigate(['/clients/new']);
  }

  openDetail(item: JosanzAdaptiveListItem): void {
    void this.router.navigate(['/clients', item.id]);
  }

  dismissToast(): void {
    this.showSuccessToast = false;
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
  }

  // Excel export placeholder
  override onExcel(): void {
    console.log('Exportando clientes a Excel...');
  }
}
