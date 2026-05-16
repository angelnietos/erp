import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  DetailCardComponent,
  DocumentItemComponent,
  DocumentListComponent,
  MainDetailLayoutComponent,
  MainTemplateCardComponent,
} from '@josanz-erp/josanz-ui';

@Component({
  selector: 'josanz-event-detail',
  standalone: true,
  imports: [
    CommonModule,
    MainDetailLayoutComponent,
    MainTemplateCardComponent,
    DetailCardComponent,
    DocumentItemComponent,
    DocumentListComponent,
  ],
  templateUrl: './josanz-event-detail.html',
})
export class JosanzEventDetailComponent {
  private readonly router = inject(Router);

  activeTab = signal('General');

  /** Pestañas alineadas con maqueta Josanz Audiovisual / tarjeta de evento en clientes. */
  readonly tabs = [
    'General',
    'Cliente',
    'Operadores',
    'Materiales',
    'Proveedores',
    'Presupuestos',
    'Albarán',
    'Facturas',
    'Notas al staff',
  ];

  readonly generalRows: { label: string; value: string; accent?: boolean }[] = [
    { label: 'ID evento', value: '000000001' },
    { label: 'Nombre', value: 'Congreso anual' },
    { label: 'Tipología', value: 'Externo' },
    { label: 'Fecha', value: '12/06/2026' },
    { label: 'Estado', value: 'Confirmado', accent: true },
  ];

  readonly scheduleRows: { label: string; value: string }[] = [
    { label: 'Montaje', value: '11/06/2026 · 08:00' },
    { label: 'Inicio evento', value: '12/06/2026 · 09:00' },
    { label: 'Desmontaje', value: '12/06/2026 · 20:00' },
  ];

  readonly clientRows: { label: string; value: string }[] = [
    { label: 'Cliente', value: 'Cliente ejemplo S.L.' },
    { label: 'Contacto', value: 'María López' },
    { label: 'Email', value: 'maria@cliente-ejemplo.com' },
    { label: 'Teléfono', value: '+34 600 111 222' },
  ];

  readonly operadores = [
    { name: 'Operador A', role: 'Jefe de equipo', status: 'Activo' },
    { name: 'Operador B', role: 'Técnico AV', status: 'Activo' },
    { name: 'Operador C', role: 'Instalador', status: 'Ausente' },
  ];

  readonly materiales = [
    { ref: 'AV-204', name: 'Pantalla LED 3×2', qty: '2 uds', warehouse: 'Almacén Central' },
    { ref: 'AV-118', name: 'Mesa de mezclas digital', qty: '1 ud', warehouse: 'Almacén Norte' },
    { ref: 'AV-045', name: 'Micrófono inalámbrico', qty: '6 uds', warehouse: 'Almacén Central' },
  ];

  readonly proveedores = [
    { id: 'PRV-001', name: 'Proveedor iluminación', status: 'Activo' },
    { id: 'PRV-014', name: 'Rigging externo', status: 'Activo' },
  ];

  readonly presupuestosPropios = ['Presupuesto_evento_v1.pdf', 'Presupuesto_evento_v2.pdf'];
  readonly presupuestosExternos = ['Presupuesto_proveedor_A.pdf'];

  readonly albaranes = ['Albaran_montaje_001.pdf', 'Albaran_material_002.pdf'];
  readonly facturas = ['Factura_proforma.pdf', 'Factura_final.pdf'];

  readonly staffNotes = [
    {
      author: 'Operador A',
      date: '10/06/2026',
      text: 'Cliente confirma acceso por muelle de carga a partir de las 07:30. Revisar cableado escenario B.',
    },
    {
      author: 'Coordinación',
      date: '08/06/2026',
      text: 'Reservar equipo de respaldo para sistema de audio principal.',
    },
  ];

  readonly resumenCard = {
    imageUrl:
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=400&h=240',
    title: 'Congreso anual',
    badgeText: 'Confirmado',
    subtitle: '12/06/2026 · Cliente ejemplo',
    description:
      'Evento corporativo con montaje previo, sesión plenaria y desmontaje el mismo día. Coordinación AV completa.',
    tags: ['Cliente', 'Operadores', 'Materiales', 'Proveedores', 'Presupuestos', 'Albarán', 'Factura'],
  };

  setTab(tab: string): void {
    this.activeTab.set(tab);
  }

  onBack(): void {
    void this.router.navigate(['/events']);
  }

  onSave(): void {
    void this.router.navigate(['/events']);
  }

  onCancel(): void {
    void this.router.navigate(['/events']);
  }
}
