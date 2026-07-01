import { Component, OnInit, computed, inject, signal } from '@angular/core';
import {
  JosanzCatalogListComponent,
  JOSANZ_CATALOG_STAFF_TABS,
  type JosanzCatalogListConfig,
} from '@josanz-erp/josanz-ui';
import { finalize } from 'rxjs';
import { JosanzEventApiService, type JosanzTechnicianListItem } from '../services/josanz-event-api.service';
import { mapTechnicianToCatalogRow } from '../josanz-staff/josanz-staff.mapper';

@Component({
  selector: 'josanz-staff-list',
  standalone: true,
  imports: [JosanzCatalogListComponent],
  template: `<josanz-catalog-list [config]="listConfig()" />`,
})
export class JosanzStaffListComponent implements OnInit {
  private readonly eventApi = inject(JosanzEventApiService);

  private readonly technicians = signal<JosanzTechnicianListItem[]>([]);
  private readonly loading = signal(false);

  private readonly baseConfig: Omit<
    JosanzCatalogListConfig,
    'rows' | 'summaryLine' | 'paginationTotal' | 'loading'
  > = {
    title: 'Staff',
    primaryBtnLabel: 'Añadir personal',
    titleColumnLabel: 'Ref.',
    statusColumnLabel: 'Tipo',
    rowLabels: ['Nombre', 'Perfil', 'Teléfono', 'Disponibilidad'],
    addRoute: '/staff/new',
    detailRoute: '/staff',
    filterOptions: JOSANZ_CATALOG_STAFF_TABS,
    features: {
      advancedFilters: false,
      statusFilters: false,
    },
    paginationVariant: 'numbered',
    statusBadgeStyle: 'outline',
    loadingPlaceholderCount: 4,
  };

  readonly listConfig = computed<JosanzCatalogListConfig>(() => {
    const technicians = this.technicians();
    const rows = technicians.map((tech, index) => mapTechnicianToCatalogRow(tech, index));
    const total = technicians.length;

    return {
      ...this.baseConfig,
      rows,
      paginationTotal: total,
      loading: this.loading() && rows.length === 0,
      summaryLine: {
        before: `${total} personas · `,
        emphasis: `${total} en catálogo`,
        after: '',
      },
    };
  });

  ngOnInit(): void {
    this.loading.set(true);
    this.eventApi
      .listTechnicians('catalog')
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (technicians) => this.technicians.set(technicians),
        error: () => this.technicians.set([]),
      });
  }
}
