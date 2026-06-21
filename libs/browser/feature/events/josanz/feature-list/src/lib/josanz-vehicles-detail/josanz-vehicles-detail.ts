import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DocumentItemComponent,
  JosanzFigmaDetailShellComponent,
  SecondaryButtonComponent,
  type JosanzFigmaDetailShellConfig,
  type JosanzStatusPillKey,
} from '@josanz-erp/josanz-ui';

@Component({
  selector: 'josanz-vehicles-detail',
  standalone: true,
  imports: [
    CommonModule,
    JosanzFigmaDetailShellComponent,
    SecondaryButtonComponent,
    DocumentItemComponent,
  ],
  templateUrl: './josanz-vehicles-detail.html',
})
export class JosanzVehiclesDetailComponent {
  readonly shellConfig: JosanzFigmaDetailShellConfig = {
    title: 'Mercedes Sprinter',
    listRoute: '/vehicles',
    tabs: ['Resumen', 'Mantenimiento', 'Historial', 'Multas'],
    statusLabel: 'Disponible',
    statusPillKey: 'confirmado',
    saveDisabled: true,
    features: { footerActions: false },
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

  pillStyle(key: JosanzStatusPillKey): Record<string, string> {
    return {
      backgroundColor: `var(--josanz-pill-${key}-bg)`,
      color: `var(--josanz-pill-${key}-text)`,
    };
  }
}
