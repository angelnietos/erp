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

  // Datos para Operadores (Base-2)
  operadores = [
    { name: 'Juan Pérez', role: 'Jefe de Equipo', status: 'Activo' },
    { name: 'Ana Belén', role: 'Técnico Senior', status: 'Activo' },
    { name: 'Carlos Ruiz', role: 'Instalador', status: 'Ausente' }
  ];

  // Datos para Presupuestos (Base-3)
  presupuestos = [
    { id: 'PR-2024-010', fecha: '14/05/2024', total: '4.500,00 €', status: 'Enviado' },
    { id: 'PR-2024-011', fecha: '13/05/2024', total: '1.250,00 €', status: 'Aceptado' },
    { id: 'PR-2024-012', fecha: '12/05/2024', total: '12.800,00 €', status: 'Borrador' }
  ];

  // Datos para Albaranes (Base-4)
  albaranes = [
    { id: 'ALB-2024-001', fecha: '14/05/2024', proy: 'Reforma Local B', op: 'Juan Pérez', status: 'Firmado' },
    { id: 'ALB-2024-002', fecha: '14/05/2024', proy: 'Mantenimiento', op: 'Ana Belén', status: 'Pendiente' },
    { id: 'ALB-2024-003', fecha: '13/05/2024', proy: 'Envío Material', op: 'Carlos Ruiz', status: 'Facturado' }
  ];

  setTab(tab: ClientTab) {
    this.activeTab.set(tab);
  }

  onCancel() {
    this.modalClose.emit();
  }
}
