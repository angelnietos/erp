import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MainDetailLayoutComponent } from '@josanz-erp/josanz-ui';

@Component({
  selector: 'josanz-equipment-detail',
  standalone: true,
  imports: [CommonModule, MainDetailLayoutComponent],
  templateUrl: './josanz-equipment-detail.html',
})
export class JosanzEquipmentDetailComponent {
  private readonly router = inject(Router);

  activeTab = signal('Resumen');

  readonly tabs = ['Resumen', 'Stock', 'Mantenimiento', 'Historial'];

  setTab(tab: string): void {
    this.activeTab.set(tab);
  }

  onBack(): void {
    void this.router.navigate(['/equipment']);
  }

  onSave(): void {
    void this.router.navigate(['/equipment']);
  }
}
