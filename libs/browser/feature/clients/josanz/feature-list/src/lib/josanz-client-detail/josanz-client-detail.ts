import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ModalComponent,
  DetailCardComponent,
  ButtonComponent,
  MainTemplateCardComponent
} from '@josanz-erp/josanz-ui';

type ClientTab = 'datos' | 'operadores' | 'presupuestos' | 'albaranes' | 'facturas' | 'productos_eventos' | 'informes';

@Component({
  selector: 'lib-josanz-client-detail',
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent,
    DetailCardComponent,
    ButtonComponent,
    MainTemplateCardComponent
  ],
  templateUrl: './josanz-client-detail.html',
  styleUrl: './josanz-client-detail.css',
})
export class JosanzClientDetailComponent {
  @Output() modalClose = new EventEmitter<void>();

  activeTab = signal<ClientTab>('datos');

  // Datos para Eventos (Cards enriquecidas)
  eventos = [
    {
      imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=186&h=186',
      title: 'Evento: Nombre evento',
      badgeText: 'Nuevo',
      subtitle: 'dd/mm/aaaa',
      description: 'Explicación breve lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      tags: ['Cliente', 'Operadores', 'Materiales', 'Proveedores', 'Presupuestos', 'Albarán', 'Factura']
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=186&h=186',
      title: 'Evento: Nombre evento',
      badgeText: 'Nuevo',
      subtitle: 'dd/mm/aaaa',
      description: 'Explicación breve lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      tags: ['Cliente', 'Operadores', 'Materiales', 'Proveedores', 'Presupuestos', 'Albarán', 'Factura']
    }
  ];

  // Datos para Operadores
  operadores = [
    { name: 'Juan Pérez', role: 'Jefe de Equipo', status: 'Activo' },
    { name: 'Ana Belén', role: 'Técnico Senior', status: 'Activo' },
    { name: 'Carlos Ruiz', role: 'Instalador', status: 'Ausente' }
  ];

  // Datos para Presupuestos
  presupuestos = [
    { id: 'PR-2024-010', fecha: '14/05/2024', total: '4.500,00 €', status: 'Enviado' },
    { id: 'PR-2024-011', fecha: '13/05/2024', total: '1.250,00 €', status: 'Aceptado' }
  ];

  // Datos para Albaranes
  albaranes = [
    { id: 'ALB-2024-001', fecha: '14/05/2024', proy: 'Reforma Local B', op: 'Juan Pérez', status: 'Firmado' },
    { id: 'ALB-2024-002', fecha: '14/05/2024', proy: 'Mantenimiento', op: 'Ana Belén', status: 'Pendiente' }
  ];

  setTab(tab: ClientTab) {
    this.activeTab.set(tab);
  }

  onCancel() {
    this.modalClose.emit();
  }
}
