import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  JosanzCatalogListComponent,
  JOSANZ_CATALOG_CLIENT_TABS,
  type JosanzCatalogListConfig,
} from '@josanz-erp/josanz-ui';
import type { JosanzCatalogListRow } from '@josanz-erp/josanz-ui';

const CLIENT_ROWS: JosanzCatalogListRow[] = [
  {
    id: '1',
    title: 'Cliente ejemplo',
    leadingMark: 'NB',
    values: ['000000000', 'email@email.com', 'Operador A, Operador B, Operador C'],
    typology: 'Tipo cliente 4',
    pillLabel: 'Nuevo',
    pillVariant: 'cliente-nuevo',
  },
  {
    id: '2',
    title: 'Cliente ejemplo',
    leadingMark: 'CE',
    values: ['000000000', 'email@email.com', 'Operador A, Operador B'],
    typology: 'Tipo cliente 1',
    pillLabel: 'Tipo cliente',
    pillVariant: 'cliente-tipo-pink',
  },
  {
    id: '3',
    title: 'Cliente ejemplo',
    leadingMark: 'CE',
    values: ['000000000', 'email@email.com', 'Operador A'],
    typology: 'Tipo cliente 2',
    pillLabel: 'Tipo cliente',
    pillVariant: 'cliente-tipo-green',
  },
  {
    id: '4',
    title: 'Cliente ejemplo',
    values: ['000000000', 'email@email.com', 'Operador A, Operador B, Operador C'],
    typology: 'Tipo cliente 3',
    pillLabel: 'Tipo cliente',
    pillVariant: 'cliente-tipo-yellow',
  },
  {
    id: '5',
    title: 'Cliente ejemplo',
    leadingMark: 'CE',
    values: ['000000000', 'email@email.com', 'Operador A'],
    typology: 'Tipo cliente 1',
    pillLabel: 'Tipo cliente',
    pillVariant: 'cliente-tipo-pink',
  },
  {
    id: '6',
    title: 'Cliente ejemplo 6',
    leadingMark: 'CL',
    values: ['000000001', 'cliente@ejemplo.com', 'Operador D'],
    typology: 'Tipo cliente 2',
    pillLabel: 'Activo',
    pillVariant: 'cliente-tipo-green',
  },
  {
    id: '7',
    title: 'Cliente ejemplo 7',
    leadingMark: 'TE',
    values: ['000000002', 'test@demo.com', 'Operador E'],
    typology: 'Tipo cliente 3',
    pillLabel: 'Borrador',
    pillVariant: 'cliente-tipo-yellow',
  },
];

@Component({
  selector: 'lib-clients-list',
  standalone: true,
  imports: [CommonModule, JosanzCatalogListComponent],
  templateUrl: './feature-list.html',
  styleUrl: './feature-list.css',
})
export class JosanzClientsListComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  showSuccessToast = false;

  readonly config: JosanzCatalogListConfig = {
    title: 'Clientes',
    primaryBtnLabel: 'Añadir Cliente',
    titleColumnLabel: 'Nombre cliente',
    rowLabels: ['Teléfono', 'Email', 'Operador'],
    statusColumnLabel: 'Tipo',
    rows: CLIENT_ROWS,
    addRoute: '/clients/new',
    detailRoute: '/clients',
    filterOptions: JOSANZ_CATALOG_CLIENT_TABS,
    withLeadingMark: true,
    summaryLine: {
      before: '7 clientes · ',
      emphasis: '6 activos',
      after: '',
    },
    paginationTotal: 20,
    paginationVariant: 'numbered',
    statusBadgeStyle: 'outline',
  };

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('created') === '1') {
      this.showSuccessToast = true;
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        replaceUrl: true,
      });
    }
  }

  dismissToast(): void {
    this.showSuccessToast = false;
  }
}
