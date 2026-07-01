import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService } from '@josanz-erp/clients-data-access';
import {
  JosanzCatalogListComponent,
  JOSANZ_CATALOG_CLIENT_TABS,
  mapClientToCatalogRow,
  type JosanzCatalogListConfig,
} from '@josanz-erp/josanz-ui';

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
  private readonly clientService = inject(ClientService);

  showSuccessToast = false;
  successToastMessage = 'Cliente creado correctamente';

  config: JosanzCatalogListConfig = {
    title: 'Clientes',
    primaryBtnLabel: 'Añadir Cliente',
    titleColumnLabel: 'Nombre cliente',
    rowLabels: ['Teléfono', 'Email', 'Operador'],
    statusColumnLabel: 'Tipo',
    rows: [],
    addRoute: '/clients/new',
    detailRoute: '/clients',
    filterOptions: JOSANZ_CATALOG_CLIENT_TABS,
    withLeadingMark: true,
    summaryLine: {
      before: '0 clientes · ',
      emphasis: '0 activos',
      after: '',
    },
    features: {
      advancedFilters: false,
      statusFilters: false,
    },
    paginationTotal: 1,
    paginationVariant: 'numbered',
    pageSize: 10,
    statusBadgeStyle: 'outline',
  };

  ngOnInit(): void {
    const created = this.route.snapshot.queryParamMap.get('created') === '1';
    const updated = this.route.snapshot.queryParamMap.get('updated') === '1';
    if (created || updated) {
      this.successToastMessage = created
        ? 'Cliente creado correctamente'
        : 'Cliente actualizado correctamente';
      this.showSuccessToast = true;
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        replaceUrl: true,
      });
    }
    this.loadClients();
  }

  dismissToast(): void {
    this.showSuccessToast = false;
  }

  private loadClients(): void {
    this.clientService.getClients().subscribe({
      next: (clients) => {
        const rows = clients.map((client, index) => mapClientToCatalogRow(client, index));
        const total = clients.length;
        const pageSize = this.config.pageSize ?? 10;
        this.config = {
          ...this.config,
          rows,
          summaryLine: {
            before: `${total} clientes · `,
            emphasis: `${total} activos`,
            after: '',
          },
          paginationTotal: Math.max(1, Math.ceil(total / pageSize)),
        };
      },
    });
  }
}
