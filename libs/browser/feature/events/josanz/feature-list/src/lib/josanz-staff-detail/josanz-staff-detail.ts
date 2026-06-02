import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MainDetailLayoutComponent } from '@josanz-erp/josanz-ui';

@Component({
  selector: 'josanz-staff-detail',
  standalone: true,
  imports: [CommonModule, MainDetailLayoutComponent],
  templateUrl: './josanz-staff-detail.html',
})
export class JosanzStaffDetailComponent {
  private readonly router = inject(Router);

  activeTab = signal('Resumen');

  readonly tabs = ['Resumen', 'Contratos', 'Nóminas', 'Ausencias'];

  setTab(tab: string): void {
    this.activeTab.set(tab);
  }

  onBack(): void {
    void this.router.navigate(['/staff']);
  }

  onSave(): void {
    void this.router.navigate(['/staff']);
  }
}
