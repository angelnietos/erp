import { Component, EventEmitter, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  DetailCardComponent,
  MainTemplateCardComponent,
  MainDetailLayoutComponent,
  DocumentItemComponent,
  DocumentListComponent
} from '@josanz-erp/josanz-ui';

@Component({
  selector: 'lib-josanz-client-detail',
  standalone: true,
  imports: [
    CommonModule,
    DetailCardComponent,
    MainTemplateCardComponent,
    MainDetailLayoutComponent,
    DocumentItemComponent,
    DocumentListComponent
  ],
  templateUrl: './josanz-client-detail.html',
  styleUrl: './josanz-client-detail.css',
})
export class JosanzClientDetailComponent {
  private router = inject(Router);
  @Output() modalClose = new EventEmitter<void>();

  activeTab = signal<string>('Datos cliente');
  tabs = ['Datos cliente', 'Operadores', 'Presupuestos', 'Proveedores', 'Facturas', 'Productos/eventos', 'Informes / reportes'];


  // Archivos para Presupuestos
  presupuestosPropios = [
    'Presupuesto01.pdf',
    'Presupuesto02.pdf',
    'Presupuesto03.pdf'
  ];
  presupuestosExternos = [
    'Presupuesto01.pdf',
    'Presupuesto02.pdf',
    'Presupuesto03.pdf'
  ];

  // Archivos para Facturas
  facturas = [
    'Factura01.pdf',
    'Factura02.pdf',
    'Factura03.pdf'
  ];

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

  // Datos para Proveedores (reemplazando Albaranes)
  proveedores = [
    { id: 'PROV-001', name: 'Suministros Industriales S.A.', status: 'Activo' },
    { id: 'PROV-002', name: 'Mantenimiento Logístico', status: 'Inactivo' }
  ];

  setTab(tab: string) {
    this.activeTab.set(tab);
  }

  onBack() {
    this.router.navigate(['/clients']);
  }

  onSave() {
    console.log('Guardando cambios del cliente...');
    this.onBack();
  }

  onCancel() {
    this.onBack();
  }
}

