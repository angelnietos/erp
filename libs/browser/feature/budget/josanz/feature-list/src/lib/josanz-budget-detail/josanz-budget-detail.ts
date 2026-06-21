import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  DocumentItemComponent,
  MainDetailLayoutComponent,
  SecondaryButtonComponent,
  navigateDetailTab,
  readDetailTabFromRoute,
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
    MainDetailLayoutComponent,
    SecondaryButtonComponent,
    DocumentItemComponent,
  ],
  templateUrl: './josanz-budget-detail.html',
})
export class JosanzBudgetDetailComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  activeTab = signal('General');
  readonly tabs = ['General', 'Líneas', 'Documentación'];

  private readonly tabSlugMap: Record<string, string> = {
    General: 'general',
    Líneas: 'lineas',
    Documentación: 'documentacion',
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
    void this.router.navigate(['/budgets']);
  }

  onSave(): void {
    this.onBack();
  }

  onCancel(): void {
    this.onBack();
  }
}
