import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  MainDetailLayoutComponent
} from '@josanz-erp/josanz-ui';

@Component({
  selector: 'lib-josanz-budget-detail',
  standalone: true,
  imports: [
    CommonModule,
    MainDetailLayoutComponent
  ],
  templateUrl: './josanz-budget-detail.html',
})
export class JosanzBudgetDetailComponent {
  private router = inject(Router);

  activeTab = signal<string>('General');
  tabs = ['General', 'Líneas', 'Documentación'];

  readonly infoRows: { label: string; value: string; accent?: boolean }[] = [
    { label: 'Nº presupuesto', value: 'PRE-2024-001' },
    { label: 'Cliente', value: 'Construcciones S.A.' },
    { label: 'Fecha', value: '14/05/2024' },
    { label: 'Estado', value: 'Borrador', accent: true },
  ];

  readonly amountRows: { label: string; value: string; highlight?: boolean }[] = [
    { label: 'Base imponible', value: '12.450,00 €' },
    { label: 'IVA (21%)', value: '2.614,50 €' },
    { label: 'Total', value: '15.064,50 €', highlight: true },
    { label: 'Válido hasta', value: '30/06/2024' },
  ];

  setTab(tab: string) {
    this.activeTab.set(tab);
  }

  onBack() {
    this.router.navigate(['/budgets']);
  }

  onSave() {
    console.log('Guardando presupuesto...');
    this.onBack();
  }

  onCancel() {
    this.onBack();
  }
}
