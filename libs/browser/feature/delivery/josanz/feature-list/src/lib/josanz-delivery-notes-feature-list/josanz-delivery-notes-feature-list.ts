import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  AdaptiveListRowsComponent,
  ListTemplateHeaderRowComponent,
  MainListLayoutComponent,
  filterAdaptiveListItems,
  type JosanzAdaptiveListItem,
} from '@josanz-erp/josanz-ui';

@Component({
  selector: 'josanz-delivery-notes-feature-list',
  standalone: true,
  imports: [CommonModule, MainListLayoutComponent, AdaptiveListRowsComponent, ListTemplateHeaderRowComponent],
  templateUrl: './josanz-delivery-notes-feature-list.html',
})
export class JosanzDeliveryNotesFeatureListComponent {
  private router = inject(Router);

  searchQuery = '';

  title = 'Albaranes';
  primaryBtnLabel = 'Añadir Albarán +';
  filterOptions = ['Todas', 'Pendiente', 'Firmado', 'Facturado'];

  readonly deliveryLabels = ['Cliente', 'Fecha', 'Proyecto', 'Operador'];

  readonly deliveryItems: JosanzAdaptiveListItem[] = [
    {
      id: 'ALB-2024-001',
      title: 'ALB-2024-001',
      data: ['Construcciones S.A.', '14/05/2024', 'Reforma Local B', 'Juan Pérez'],
      labels: ['Cliente', 'Fecha', 'Proyecto', 'Operador'],
      status: 'Firmado',
      statusVariant: 'primary',
    },
    {
      id: 'ALB-2024-002',
      title: 'ALB-2024-002',
      data: ['Instalaciones Eléctricas', '14/05/2024', 'Mantenimiento Anual', 'Ana Belén'],
      labels: ['Cliente', 'Fecha', 'Proyecto', 'Operador'],
      status: 'Pendiente',
      statusVariant: 'warning',
    },
    {
      id: 'ALB-2024-003',
      title: 'ALB-2024-003',
      data: ['Logística Norte', '13/05/2024', 'Envío Urgente', 'Carlos Ruiz'],
      labels: ['Cliente', 'Fecha', 'Proyecto', 'Operador'],
      status: 'Facturado',
      statusVariant: 'facturado',
    },
    {
      id: 'ALB-2024-004',
      title: 'ALB-2024-004',
      data: ['Hotel Playa Sol', '12/05/2024', 'Instalación LED', 'Juan Pérez'],
      labels: ['Cliente', 'Fecha', 'Proyecto', 'Operador'],
      status: 'Firmado',
      statusVariant: 'primary',
    },
  ];

  get filteredDeliveryItems(): JosanzAdaptiveListItem[] {
    return filterAdaptiveListItems(this.deliveryItems, this.searchQuery);
  }

  onSearch(value: string): void {
    this.searchQuery = value;
  }

  onAdd() {
    this.router.navigate(['/delivery-notes/new']);
  }

  openDetail() {
    this.router.navigate(['/delivery-notes/1']);
  }

  onFilter(filter: string) {
    console.log('Filtrar por:', filter);
  }

  onExcel() {
    console.log('Exportar a Excel');
  }
}
