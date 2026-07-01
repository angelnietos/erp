import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientsFacade } from '@josanz-erp/clients-data-access';
import {
  JosanzCatalogListComponent,
  JOSANZ_CATALOG_CLIENT_TABS,
  mapClientToCatalogRow,
  CatalogThemeFacade,
  type JosanzCatalogListConfig,
} from '@josanz-erp/josanz-ui';

const CLIENT_LIST_PAGE_SIZE = 10;

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
  private readonly clientsFacade = inject(ClientsFacade);
  private readonly catalogTheme = inject(CatalogThemeFacade);

  readonly showSuccessToast = signal(false);
  readonly successToastMessage = signal('Cliente creado correctamente');

  private readonly baseConfig: Omit<JosanzCatalogListConfig, 'rows' | 'summaryLine' | 'paginationTotal'> = {
    title: 'Clientes',
    primaryBtnLabel: 'Añadir Cliente',
    titleColumnLabel: 'Nombre cliente',
    rowLabels: ['Teléfono', 'Email', 'Operador'],
    statusColumnLabel: 'Tipo',
    addRoute: '/clients/new',
    detailRoute: '/clients',
    filterOptions: JOSANZ_CATALOG_CLIENT_TABS,
    withLeadingMark: true,
    features: {
      advancedFilters: false,
      statusFilters: false,
    },
    paginationVariant: 'numbered',
    pageSize: CLIENT_LIST_PAGE_SIZE,
    statusBadgeStyle: 'outline',
    loadingPlaceholderCount: 5,
  };

  readonly listConfig = computed<JosanzCatalogListConfig>(() => {
    const clients = this.clientsFacade.clients();
    const loading = this.clientsFacade.isLoading();
    const theme = this.catalogTheme.mergedTheme();
    const rows = clients.map((client, index) =>
      mapClientToCatalogRow(client, index, theme),
    );
    const total = clients.length;

    return {
      ...this.baseConfig,
      rows,
      loading: loading && rows.length === 0,
      summaryLine: {
        before: `${total} clientes · `,
        emphasis: `${total} activos`,
        after: '',
      },
      paginationTotal: Math.max(1, Math.ceil(total / CLIENT_LIST_PAGE_SIZE)),
    };
  });

  ngOnInit(): void {
    this.catalogTheme.loadCatalogTheme();

    const created = this.route.snapshot.queryParamMap.get('created') === '1';
    const updated = this.route.snapshot.queryParamMap.get('updated') === '1';

    if (created || updated) {
      this.successToastMessage.set(
        created ? 'Cliente creado correctamente' : 'Cliente actualizado correctamente',
      );
      this.showSuccessToast.set(true);
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        replaceUrl: true,
      });
      this.clientsFacade.loadClients();
      return;
    }

    this.clientsFacade.loadClients();
  }

  dismissToast(): void {
    this.showSuccessToast.set(false);
  }
}
