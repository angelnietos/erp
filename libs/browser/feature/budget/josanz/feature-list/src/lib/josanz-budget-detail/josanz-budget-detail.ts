import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DocumentItemComponent,
  JosanzFigmaDetailShellComponent,
  SecondaryButtonComponent,
  type JosanzFigmaDetailShellConfig,
  type JosanzStatusPillKey,
} from '@josanz-erp/josanz-ui';

interface BudgetLine {
  id: string;
  name: string;
  detail: string;
  amount: string;
  pillKey: JosanzStatusPillKey;
  status: string;
}

@Component({
  selector: 'lib-josanz-budget-detail',
  standalone: true,
  imports: [
    CommonModule,
    JosanzFigmaDetailShellComponent,
    SecondaryButtonComponent,
    DocumentItemComponent,
  ],
  templateUrl: './josanz-budget-detail.html',
})
export class JosanzBudgetDetailComponent {
  readonly shellConfig: JosanzFigmaDetailShellConfig = {
    title: 'Presupuesto PR-2024-010',
    listRoute: '/budgets',
    tabs: ['General', 'Líneas', 'Documentación'],
    statusLabel: 'Enviado',
    statusPillKey: 'presupuesto',
    saveDisabled: true,
    features: { footerActions: false },
  };

  readonly summaryRows = [
    { label: 'Nº presupuesto', value: 'PR-2024-010' },
    { label: 'Cliente', value: 'Construcciones S.A.' },
    { label: 'Evento vinculado', value: 'Gala anual 2026' },
    { label: 'Fecha', value: '14/05/2024' },
    { label: 'Válido hasta', value: '30/06/2024' },
    { label: 'Estado', value: 'Enviado' },
  ];

  readonly amountRows = [
    { label: 'Base imponible', value: '4.500,00 €' },
    { label: 'IVA (21 %)', value: '945,00 €' },
    { label: 'Total', value: '5.445,00 €' },
  ];

  readonly lines: BudgetLine[] = [
    {
      id: '1',
      name: 'Alquiler material AV',
      detail: '48 h · Sonido + vídeo',
      amount: '2.800,00 €',
      status: 'Confirmado',
      pillKey: 'confirmado',
    },
    {
      id: '2',
      name: 'Mano de obra',
      detail: '4 técnicos',
      amount: '1.700,00 €',
      status: 'Confirmado',
      pillKey: 'confirmado',
    },
  ];

  readonly documents = ['Presupuesto_PR-2024-010.pdf', 'Anexo_equipamiento.pdf'];

  pillStyle(key: JosanzStatusPillKey): Record<string, string> {
    return {
      backgroundColor: `var(--josanz-pill-${key}-bg)`,
      color: `var(--josanz-pill-${key}-text)`,
    };
  }
}
