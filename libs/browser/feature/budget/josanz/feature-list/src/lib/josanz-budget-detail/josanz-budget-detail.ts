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
