import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  DocumentItemComponent,
  MainDetailLayoutComponent,
  SecondaryButtonComponent,
  type JosanzStatusPillKey,
} from '@josanz-erp/josanz-ui';
import {
  navigateDetailTab,
  readDetailTabFromRoute,
} from '@josanz-erp/josanz-ui';

@Component({
  selector: 'josanz-staff-detail',
  standalone: true,
  imports: [
    CommonModule,
    MainDetailLayoutComponent,
    SecondaryButtonComponent,
    DocumentItemComponent,
  ],
  templateUrl: './josanz-staff-detail.html',
})
export class JosanzStaffDetailComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  activeTab = signal('Resumen');
  readonly tabs = ['Resumen', 'Contratos', 'Nóminas', 'Ausencias'];

  private readonly tabSlugMap: Record<string, string> = {
    Resumen: 'resumen',
    Contratos: 'contratos',
    'Nóminas': 'nominas',
    Ausencias: 'ausencias',
  };

  readonly avatarUrl = 'https://i.pravatar.cc/96?img=12';
  readonly personalRows = [
    { label: 'Nombre', value: 'Laura Martín' },
    { label: 'Perfil', value: 'Técnica sonido' },
    { label: 'Teléfono', value: '+34 619 000 101' },
    { label: 'Email', value: 'laura.martin@ejemplo.com' },
    { label: 'Tipo', value: 'Técnico' },
    { label: 'Disponibilidad', value: 'Disponible' },
  ];

  readonly contractFiles = ['Contrato indefinido.pdf', 'Anexo horario.pdf'];
  readonly payrollFiles = ['Nómina abril 2026.pdf', 'Nómina marzo 2026.pdf'];
  readonly absences = [
    { id: '1', range: '01/08 – 15/08/2026', type: 'Vacaciones', pillKey: 'confirmado' as JosanzStatusPillKey },
    { id: '2', range: '12/03/2026', type: 'Permiso', pillKey: 'en-proceso' as JosanzStatusPillKey },
  ];

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
    void this.router.navigate(['/staff']);
  }

  onSave(): void {
    this.onBack();
  }
}
