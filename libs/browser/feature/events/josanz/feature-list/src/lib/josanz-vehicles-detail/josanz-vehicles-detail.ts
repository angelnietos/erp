import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MainDetailLayoutComponent } from '@josanz-erp/josanz-ui';

@Component({
  selector: 'josanz-vehicles-detail',
  standalone: true,
  imports: [CommonModule, MainDetailLayoutComponent],
  templateUrl: './josanz-vehicles-detail.html',
})
export class JosanzVehiclesDetailComponent {
  private readonly router = inject(Router);

  activeTab = signal('Resumen');
  
  readonly tabs = ['Resumen', 'Mantenimiento', 'Historial', 'Multas'];

  setTab(tab: string): void {
    this.activeTab.set(tab);
  }

  onBack(): void {
    void this.router.navigate(['/vehicles']);
  }

  onSave(): void {
    void this.router.navigate(['/vehicles']);
  }
}
