import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  DocumentItemComponent,
  MainDetailLayoutComponent,
  SecondaryButtonComponent,
  type JosanzStatusPillKey,
} from '@josanz-erp/josanz-ui';
import {
  navigateDetailTab,
  readDetailTabFromRoute,
} from '@josanz-erp/josanz-ui';

@Component({
  selector: 'josanz-equipment-detail',
  standalone: true,
  imports: [
    CommonModule,
    MainDetailLayoutComponent,
    SecondaryButtonComponent,
    DocumentItemComponent,
  ],
  templateUrl: './josanz-equipment-detail.html',
})
export class JosanzEquipmentDetailComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  activeTab = signal('Resumen');
  readonly tabs = ['Resumen', 'Stock', 'Mantenimiento', 'Historial'];

  private readonly tabSlugMap: Record<string, string> = {
    Resumen: 'resumen',
    Stock: 'stock',
    Mantenimiento: 'mantenimiento',
    Historial: 'historial',
  };

  readonly specRows = [
    { label: 'Referencia', value: 'EQ-0001' },
    { label: 'Categoría', value: 'Sonido' },
    { label: 'Marca / modelo', value: 'L-Acoustics K2' },
    { label: 'Nº serie', value: 'SN-123456' },
    { label: 'Almacén', value: 'Almacén 01' },
    { label: 'Ubicación', value: 'Rack A-12' },
  ];

  readonly stockRows = [
    { warehouse: 'Almacén 01', qty: '2 uds', status: 'Disponible', pillKey: 'confirmado' as JosanzStatusPillKey },
    { warehouse: 'Almacén 02', qty: '0 uds', status: 'En evento', pillKey: 'en-produccion' as JosanzStatusPillKey },
    { warehouse: 'Taller', qty: '1 ud', status: 'Mantenimiento', pillKey: 'incidencia' as JosanzStatusPillKey },
  ];

  readonly maintenanceFiles = ['ITV técnica 2025.pdf', 'Revisión anual.pdf'];
  readonly historyNotes = [
    { id: '1', text: 'Salida a evento «Gala anual» — 12/05/2026' },
    { id: '2', text: 'Entrada desde proveedor — 03/04/2026' },
    { id: '3', text: 'Alta en inventario — 15/01/2026' },
  ];

  ngOnInit(): void {
    readDetailTabFromRoute(this.route, this.tabSlugMap, this.tabs, this.activeTab);
  }

  pillStyle(key: JosanzStatusPillKey): Record<string, string> {
    return {
      backgroundColor: `var(--josanz-pill-${key}-bg)`,
      color: `var(--josanz-pill-${key}-text)`,
    };
  }

  setTab(tab: string): void {
    this.activeTab.set(tab);
    navigateDetailTab(this.router, this.route, tab, this.tabSlugMap);
  }

  onBack(): void {
    void this.router.navigate(['/equipment']);
  }

  onSave(): void {
    this.onBack();
  }
}
