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
  selector: 'josanz-equipment-detail',
  standalone: true,
  imports: [
    CommonModule,
    JosanzFigmaDetailShellComponent,
    SecondaryButtonComponent,
    DocumentItemComponent,
  ],
  templateUrl: './josanz-equipment-detail.html',
})
export class JosanzEquipmentDetailComponent {
  readonly shellConfig: JosanzFigmaDetailShellConfig = {
    title: 'Line array L-Acoustics',
    listRoute: '/equipment',
    tabs: ['Resumen', 'Stock', 'Mantenimiento', 'Historial'],
    statusLabel: 'Disponible',
    statusPillKey: 'confirmado',
    saveDisabled: true,
    features: { footerActions: false },
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

  pillStyle(key: JosanzStatusPillKey): Record<string, string> {
    return {
      backgroundColor: `var(--josanz-pill-${key}-bg)`,
      color: `var(--josanz-pill-${key}-text)`,
    };
  }
}
