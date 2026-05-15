import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import type { JosanzStatusPillVariant } from '@josanz-erp/josanz-ui';
import {
  FilterTabsComponent,
  MainListLayoutComponent,
  MainTemplateCardComponent,
} from '@josanz-erp/josanz-ui';

export interface JosanzEventListRow {
  id: string;
  name: string;
  date: string;
  client: string;
  operator: string;
  status: string;
}

@Component({
  selector: 'josanz-events-feature-list',
  standalone: true,
  imports: [
    CommonModule,
    MainListLayoutComponent,
    MainTemplateCardComponent,
    FilterTabsComponent,
  ],
  templateUrl: './josanz-events-feature-list.html',
})
export class JosanzEventsFeatureListComponent {
  private readonly router = inject(Router);

  title = 'Eventos';
  primaryBtnLabel = 'Añadir Evento +';
  /** Fila superior del layout: tipología (maqueta Eventos). */
  filterOptions = ['Todos', 'Externo', 'Hotel', 'Espacio'];
  /** Segunda fila (slot): estados con contadores de ejemplo. */
  statusFilterOptions = [
    'Todos (180)',
    'Borrador (2)',
    'En presupuesto (4)',
    'Confirmado (49)',
    'En producción (37)',
    'Cerrado (25)',
  ];

  activeStatusFilter = 'Todos (180)';

  readonly events: JosanzEventListRow[] = [
    {
      id: '000000001',
      name: 'Congreso anual',
      date: '12/06/2026',
      client: 'Cliente ejemplo',
      operator: 'Operador A',
      status: 'Confirmado',
    },
    {
      id: '000000002',
      name: 'Boda jardín',
      date: '20/06/2026',
      client: 'Hotel Playa Sol',
      operator: 'Operador B',
      status: 'En producción',
    },
    {
      id: '000000003',
      name: 'Feria sector',
      date: '02/07/2026',
      client: 'Espacio Norte',
      operator: 'Operador A',
      status: 'Borrador',
    },
    {
      id: '000000004',
      name: 'Gala benéfica',
      date: '15/05/2026',
      client: 'Externo Media',
      operator: 'Operador C',
      status: 'Facturado',
    },
  ];

  onAdd(): void {
    void this.router.navigate(['/events/new']);
  }

  openDetail(): void {
    void this.router.navigate(['/events/1']);
  }

  onTypologyFilter(value: string): void {
    void value;
    // TODO: filtrar por tipología cuando exista API
  }

  onStatusFilter(option: string): void {
    this.activeStatusFilter = option;
  }

  onExcel(): void {
    // TODO: exportar listado cuando exista API
  }

  pillVariantForStatus(status: string): JosanzStatusPillVariant {
    const s = status.toLowerCase();
    if (s.includes('borrador')) {
      return 'borrador';
    }
    if (s.includes('presupuesto')) {
      return 'presupuesto';
    }
    if (s.includes('confirm')) {
      return 'confirmado';
    }
    if (s.includes('producción') || s.includes('proceso')) {
      return 'en-produccion';
    }
    if (s.includes('cancel')) {
      return 'cancelado';
    }
    if (s.includes('incidencia')) {
      return 'incidencia';
    }
    if (s.includes('pospuesto')) {
      return 'pospuesto';
    }
    if (s.includes('facturado')) {
      return 'facturado';
    }
    if (s.includes('cerrado')) {
      return 'borrador';
    }
    return 'en-proceso';
  }
}
