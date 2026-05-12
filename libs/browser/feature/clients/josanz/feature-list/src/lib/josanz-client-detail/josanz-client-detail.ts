import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ModalComponent,
  DetailCardComponent,
} from '@josanz-erp/josanz-ui';

type ClientTab = 'datos' | 'operadores' | 'eventos';

@Component({
  selector: 'lib-josanz-client-detail',
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent,
    DetailCardComponent,
  ],
  templateUrl: './josanz-client-detail.html',
  styleUrl: './josanz-client-detail.css',
})
export class JosanzClientDetailComponent {
  @Output() close = new EventEmitter<void>();

  activeTab = signal<ClientTab>('eventos'); // Por defecto eventos para la demo

  // Datos mock para los eventos
  eventos = [
    {
      imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=186&h=186',
      title: 'Evento: Nombre evento',
      badgeText: 'Nuevo',
      subtitle: 'dd/mm/aaaa',
      description: 'Explicación breve lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.',
      tags: ['Cliente', 'Operadores', 'Materiales', 'Proveedores', 'Presupuestos', 'Albarán', 'Factura']
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=186&h=186',
      title: 'Evento: Nombre evento',
      badgeText: 'Nuevo',
      subtitle: 'dd/mm/aaaa',
      description: 'Explicación breve lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.',
      tags: ['Cliente', 'Operadores', 'Materiales', 'Proveedores', 'Presupuestos', 'Albarán', 'Factura']
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=186&h=186',
      title: 'Evento: Nombre evento',
      badgeText: 'Nuevo',
      subtitle: 'dd/mm/aaaa',
      description: 'Explicación breve lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.',
      tags: ['Cliente', 'Operadores', 'Materiales', 'Proveedores', 'Presupuestos', 'Albarán', 'Factura']
    }
  ];

  setTab(tab: ClientTab) {
    this.activeTab.set(tab);
  }

  onCancel() {
    this.close.emit();
  }
}
