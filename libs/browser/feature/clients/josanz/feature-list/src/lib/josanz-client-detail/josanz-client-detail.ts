import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  DetailCardComponent,
  MainTemplateCardComponent,
  MainDetailLayoutComponent,
  DocumentItemComponent,
  DocumentListComponent,
  EmptyStateComponent,
  navigateDetailTab,
  readDetailTabFromRoute,
  type JosanzEmptyStateIcon,
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
    DocumentListComponent,
    EmptyStateComponent,
  ],
  templateUrl: './josanz-client-detail.html',
})
export class JosanzClientDetailComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  activeTab = signal<string>('Datos cliente');
  readonly tabs = [
    'Datos cliente',
    'Operadores',
    'Presupuestos',
    'Proveedores',
    'Facturas',
    'Productos/eventos',
    'Informes / reportes',
  ];

  private readonly tabSlugMap: Record<string, string> = {
    'Datos cliente': 'datos',
    Operadores: 'operadores',
    Presupuestos: 'presupuestos',
    Proveedores: 'proveedores',
    Facturas: 'facturas',
    'Productos/eventos': 'eventos',
    'Informes / reportes': 'informes',
  };

  getEmptyStateIcon(tab: string): JosanzEmptyStateIcon {
    const icons: Partial<Record<string, JosanzEmptyStateIcon>> = {
      Operadores: 'users',
      Presupuestos: 'documents',
      Proveedores: 'inbox',
      Facturas: 'documents',
      'Productos/eventos': 'search',
      'Informes / reportes': 'calendar',
    };
    return icons[tab] ?? 'inbox';
  }

  presupuestosPropios: string[] = [];
  presupuestosExternos: string[] = [];
  facturas: string[] = [];
  eventos: Array<{
    imageUrl: string;
    title: string;
    badgeText: string;
    subtitle: string;
    description: string;
    tags: string[];
  }> = [];
  operadores: Array<{ name: string; role: string; status: string }> = [];
  proveedores: Array<{ id: string; name: string; status: string }> = [];

  readonly generalInfoRows = [
    { label: 'Razón social', value: 'Construcciones S.A.' },
    { label: 'CIF/NIF', value: 'A12345678' },
    { label: 'Email principal', value: 'obras@construcciones.com' },
  ] as const;

  readonly fiscalAddressRows = [
    { label: 'Calle', value: 'Calle Mayor 1, 4ºB' },
    { label: 'Población', value: 'Madrid (28001)' },
  ] as const;

  ngOnInit(): void {
    readDetailTabFromRoute(this.route, this.tabSlugMap, this.tabs, this.activeTab);

    this.operadores = [
      { name: 'Operador A', role: 'Técnico sonido', status: 'Activo' },
      { name: 'Operador B', role: 'Iluminación', status: 'Activo' },
    ];
    this.presupuestosPropios = ['Presupuesto_2026.pdf', 'Anexo_servicios.pdf'];
    this.presupuestosExternos = ['Presupuesto_cliente.pdf'];
    this.facturas = ['Factura_001.pdf'];
    this.proveedores = [
      { id: 'PROV-01', name: 'Proveedor AV S.L.', status: 'Activo' },
      { id: 'PROV-02', name: 'Logística Norte', status: 'Activo' },
    ];
    this.eventos = [
      {
        imageUrl:
          'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=400&h=400',
        title: 'Evento: Gala anual',
        badgeText: 'Confirmado',
        subtitle: '12/06/2026 · Madrid',
        description: 'Evento corporativo con montaje completo AV.',
        tags: ['Externo', 'Sonido', 'Vídeo'],
      },
    ];
  }

  setTab(tab: string): void {
    this.activeTab.set(tab);
    navigateDetailTab(this.router, this.route, tab, this.tabSlugMap);
  }

  onBack(): void {
    void this.router.navigate(['/clients']);
  }

  onSave(): void {
    void this.router.navigate(['/clients']);
  }

  onCancel(): void {
    this.onBack();
  }
}
