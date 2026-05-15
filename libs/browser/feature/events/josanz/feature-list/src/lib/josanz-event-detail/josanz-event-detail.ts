import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MainDetailLayoutComponent } from '@josanz-erp/josanz-ui';

@Component({
  selector: 'josanz-event-detail',
  standalone: true,
  imports: [CommonModule, MainDetailLayoutComponent],
  templateUrl: './josanz-event-detail.html',
})
export class JosanzEventDetailComponent {
  private readonly router = inject(Router);

  activeTab = signal('General');
  readonly tabs = ['General', 'Cliente', 'Recursos'];

  readonly infoRows: { label: string; value: string; accent?: boolean }[] = [
    { label: 'ID evento', value: '000000001' },
    { label: 'Nombre', value: 'Congreso anual' },
    { label: 'Fecha', value: '12/06/2026' },
    { label: 'Estado', value: 'Confirmado', accent: true },
  ];

  setTab(tab: string): void {
    this.activeTab.set(tab);
  }

  onBack(): void {
    void this.router.navigate(['/events']);
  }

  onSave(): void {
    void this.router.navigate(['/events']);
  }

  onCancel(): void {
    void this.router.navigate(['/events']);
  }
}
