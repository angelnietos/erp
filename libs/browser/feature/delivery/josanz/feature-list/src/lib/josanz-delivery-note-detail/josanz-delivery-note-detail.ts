import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  JosanzFigmaDetailShellComponent,
  type JosanzFigmaDetailShellConfig,
} from '@josanz-erp/josanz-ui';

@Component({
  selector: 'lib-josanz-delivery-note-detail',
  standalone: true,
  imports: [CommonModule, JosanzFigmaDetailShellComponent],
  templateUrl: './josanz-delivery-note-detail.html',
})
export class JosanzDeliveryNoteDetailComponent {
  readonly shellConfig: JosanzFigmaDetailShellConfig = {
    title: 'Detalle de Albarán',
    listRoute: '/delivery-notes',
    tabs: ['General', 'Artículos', 'Firmas'],
    layoutVariant: 'default',
    features: { footerActions: false, headerSave: false },
  };

  readonly infoRows: { label: string; value: string; accent?: boolean }[] = [
    { label: 'Nº albarán', value: 'ALB-2024-055' },
    { label: 'Cliente', value: 'Hotel Playa Sol' },
    { label: 'Fecha de entrega', value: '14/05/2024' },
    { label: 'Estado', value: 'Entregado', accent: true },
  ];

  readonly logisticsRows = [
    { label: 'Dirección de entrega', value: 'Av. del Mar 12, 29640 Fuengirola (Málaga)' },
    { label: 'Transportista', value: 'Logística Sur SL' },
    { label: 'Referencia pedido', value: 'PED-88421' },
    { label: 'Observaciones', value: 'Entrega en muelle B. Contacto recepción: ext. 302.' },
  ] as const;
}
