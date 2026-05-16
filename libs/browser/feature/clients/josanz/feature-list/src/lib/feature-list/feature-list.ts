import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  AdaptiveListRowsComponent,
  MainListLayoutComponent,
  BaseListComponent,
  type JosanzAdaptiveListItem,
} from '@josanz-erp/josanz-ui';

@Component({
  selector: 'josanz-clients-list',
  standalone: true,
  imports: [
    CommonModule,
    MainListLayoutComponent,
    AdaptiveListRowsComponent,
  ],
  templateUrl: './feature-list.html',
  styleUrl: './feature-list.css',
})
export class JosanzClientsListComponent extends BaseListComponent {
  private router = inject(Router);

  readonly clientLabels = ['Email', 'CIF/NIF', 'Población', 'Última factura'];

  readonly clientItems: JosanzAdaptiveListItem[] = [
    {
      id: 'A12345678',
      title: 'Construcciones S.A.',
      data: ['obras@construcciones.com', 'A12345678', 'Madrid', '14/05/2024'],
      labels: ['Email', 'CIF/NIF', 'Población', 'Última factura'],
      status: 'Activo',
      statusVariant: 'success',
    },
    {
      id: 'B98765432',
      title: 'Reformas García',
      data: ['info@reformasgarcia.es', 'B98765432', 'Barcelona', '10/05/2024'],
      labels: ['Email', 'CIF/NIF', 'Población', 'Última factura'],
      status: 'Inactivo',
      statusVariant: 'primary',
    },
    {
      id: 'A88877766',
      title: 'Hotel Playa Sol',
      data: ['recepcion@hotelplaya.com', 'A88877766', 'Valencia', 'Ayer'],
      labels: ['Email', 'CIF/NIF', 'Población', 'Última factura'],
      status: 'Activo',
      statusVariant: 'success',
    },
    {
      id: 'B11223344',
      title: 'Logística Express',
      data: ['envios@logexpress.com', 'B11223344', 'Sevilla', '08/05/2024'],
      labels: ['Email', 'CIF/NIF', 'Población', 'Última factura'],
      status: 'Activo',
      statusVariant: 'success',
    },
  ];

  get filteredClientItems(): JosanzAdaptiveListItem[] {
    return this.filterItems(this.clientItems);
  }

  constructor() {
    super();
    this.title = 'Clientes';
    this.primaryBtnLabel = 'Añadir Cliente +';
  }

  override onAdd() {
    this.router.navigate(['/clients/new']);
  }

  openDetail() {
    // Para prototipo usamos un ID cualquiera
    this.router.navigate(['/clients/1']);
  }
}
