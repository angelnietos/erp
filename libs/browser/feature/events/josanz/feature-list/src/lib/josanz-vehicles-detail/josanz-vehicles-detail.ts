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
} from '../josanz-detail-tab-route';

@Component({
  selector: 'josanz-vehicles-detail',
  standalone: true,
  imports: [
    CommonModule,
    MainDetailLayoutComponent,
    SecondaryButtonComponent,
    DocumentItemComponent,
  ],
  templateUrl: './josanz-vehicles-detail.html',
})
export class JosanzVehiclesDetailComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  activeTab = signal('Resumen');
  readonly tabs = ['Resumen', 'Mantenimiento', 'Historial', 'Multas'];

  private readonly tabSlugMap: Record<string, string> = {
    Resumen: 'resumen',
    Mantenimiento: 'mantenimiento',
    Historial: 'historial',
    Multas: 'multas',
  };

  readonly vehicleRows = [
    { label: 'Matrícula', value: '1234 KLM' },
    { label: 'Marca / modelo', value: 'Mercedes Sprinter' },
    { label: 'Base', value: 'Almacén 01' },
    { label: 'Responsable', value: 'Carlos Ruiz' },
    { label: 'Próxima ITV', value: '12/12/2026' },
    { label: 'Kilometraje', value: '84.320 km' },
  ];

  readonly maintenanceFiles = ['ITV 2026.pdf', 'Seguro anual.pdf', 'Revisión taller.pdf'];
  readonly historyNotes = [
    { id: '1', text: 'Salida ruta evento Norte — 18/05/2026' },
    { id: '2', text: 'Repostaje y limpieza — 10/05/2026' },
    { id: '3', text: 'Entrada en flota — 02/01/2024' },
  ];
  readonly fines = [
    { id: '1', label: 'Multa aparcamiento', amount: '45,00 €', status: 'Pagada', pillKey: 'confirmado' as JosanzStatusPillKey },
    { id: '2', label: 'Exceso velocidad', amount: '120,00 €', status: 'Pendiente', pillKey: 'presupuesto' as JosanzStatusPillKey },
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
    void this.router.navigate(['/vehicles']);
  }

  onSave(): void {
    this.onBack();
  }
}
