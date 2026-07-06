import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DocumentItemComponent,
  JosanzFigmaDetailShellComponent,
  SecondaryButtonComponent,
  type JosanzFigmaDetailShellConfig,
  type JosanzStatusPillKey,
} from '@josanz-erp/josanz-ui';

interface BillingLine {
  id: string;
  name: string;
  detail: string;
  amount: string;
  pillKey: JosanzStatusPillKey;
  status: string;
}

@Component({
  selector: 'josanz-billing-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    JosanzFigmaDetailShellComponent,
    SecondaryButtonComponent,
    DocumentItemComponent,
  ],
  templateUrl: './josanz-billing-detail.html',
})
export class JosanzBillingDetailComponent {
  readonly shellConfig: JosanzFigmaDetailShellConfig = {
    title: 'Factura FAC-2026-001',
    listRoute: '/billing',
    tabs: ['Resumen', 'Líneas', 'Cobros', 'Emails'],
    statusLabel: 'Pendiente cobro',
    statusPillKey: 'presupuesto',
    saveDisabled: true,
    features: { footerActions: false },
  };

  readonly summaryRows = [
    { label: 'Cliente', value: 'Cliente ejemplo S.L.' },
    { label: 'Nº factura', value: 'FAC-2026-001' },
    { label: 'Fecha emisión', value: '12/05/2026' },
    { label: 'Base imponible', value: '4.850,00 €' },
    { label: 'IVA (21 %)', value: '1.018,50 €' },
    { label: 'Total', value: '5.868,50 €' },
  ];

  readonly lines: BillingLine[] = [
    { id: '1', name: 'Alquiler material AV', detail: 'Evento Gala', amount: '3.200,00 €', status: 'Confirmado', pillKey: 'confirmado' },
    { id: '2', name: 'Mano de obra', detail: '48 h técnicos', amount: '1.650,00 €', status: 'Confirmado', pillKey: 'confirmado' },
  ];

  readonly payments = [
    { id: '1', date: '20/05/2026', method: 'Transferencia', amount: '2.934,25 €', status: 'Cobrado', pillKey: 'facturado' as JosanzStatusPillKey },
    { id: '2', date: '—', method: 'Pendiente', amount: '2.934,25 €', status: 'Pendiente', pillKey: 'presupuesto' as JosanzStatusPillKey },
  ];

  readonly invoiceFiles = ['Factura FAC-2026-001.pdf'];
  readonly emails = [
    { id: '1', time: '09:30', subject: 'Envío factura FAC-2026-001', preview: 'Adjuntamos factura correspondiente al evento…' },
  ];
  emailForm = { date: 'dd/mm/aaaa', subject: '', body: '' };

  pillStyle(key: JosanzStatusPillKey): Record<string, string> {
    return {
      backgroundColor: `var(--josanz-pill-${key}-bg)`,
      color: `var(--josanz-pill-${key}-text)`,
    };
  }
}
