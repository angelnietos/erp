import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MainDetailLayoutComponent } from '@josanz-erp/josanz-ui';

@Component({
  selector: 'josanz-billing-detail',
  standalone: true,
  imports: [CommonModule, MainDetailLayoutComponent],
  templateUrl: './josanz-billing-detail.html',
})
export class JosanzBillingDetailComponent {
  private readonly router = inject(Router);

  activeTab = signal('Resumen');
  
  readonly tabs = ['Resumen', 'Líneas', 'Cobros', 'Emails'];

  setTab(tab: string): void {
    this.activeTab.set(tab);
  }

  onBack(): void {
    void this.router.navigate(['/billing']);
  }

  onSave(): void {
    void this.router.navigate(['/billing']);
  }
}
