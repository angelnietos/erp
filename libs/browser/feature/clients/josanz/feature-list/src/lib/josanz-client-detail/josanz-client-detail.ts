import { Component, EventEmitter, Output, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  DetailCardComponent,
  MainTemplateCardComponent,
  MainDetailLayoutComponent,
  DocumentItemComponent,
  DocumentListComponent,
  EmptyStateComponent,
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
  @Output() modalClose = new EventEmitter<void>();

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

  // Empty state icons based on tab
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

  // Archivos para Presupuestos
  presupuestosPropios: string[] = [];
  presupuestosExternos: string[] = [];

  // Archivos para Facturas
  facturas: string[] = [];

  // Datos para Eventos (Cards enriquecidas)
  eventos: Array<{
    imageUrl: string;
    title: string;
    badgeText: string;
    subtitle: string;
    description: string;
    tags: string[];
  }> = [];

  // Datos para Operadores
  operadores: Array<{ name: string; role: string; status: string }> = [];

  // Datos para Proveedores
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
    const tabSlug = this.route.snapshot.queryParamMap.get('tab');
    if (tabSlug) {
      const tab = Object.entries(this.tabSlugMap).find(([, slug]) => slug === tabSlug)?.[0];
      if (tab && this.tabs.includes(tab)) {
        this.activeTab.set(tab);
      }
    }
  }

  setTab(tab: string) {
    this.activeTab.set(tab);
    const slug = this.tabSlugMap[tab];
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: slug ?? tab.toLowerCase() },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
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
