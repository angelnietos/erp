import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DocumentItemComponent,
  JosanzFigmaDetailShellComponent,
  SecondaryButtonComponent,
  type JosanzFigmaDetailShellConfig,
  type JosanzStatusPillKey,
} from '@josanz-erp/josanz-ui';

@Component({
  selector: 'josanz-staff-detail',
  standalone: true,
  imports: [
    CommonModule,
    JosanzFigmaDetailShellComponent,
    SecondaryButtonComponent,
    DocumentItemComponent,
  ],
  templateUrl: './josanz-staff-detail.html',
})
export class JosanzStaffDetailComponent {
  readonly shellConfig: JosanzFigmaDetailShellConfig = {
    title: 'Laura Martín',
    listRoute: '/staff',
    tabs: ['Resumen', 'Contratos', 'Nóminas', 'Ausencias'],
    statusLabel: 'Técnico',
    statusPillKey: 'staff-tecnico',
    saveDisabled: true,
    features: { footerActions: false },
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

  pillStyle(key: JosanzStatusPillKey): Record<string, string> {
    return {
      backgroundColor: `var(--josanz-pill-${key}-bg)`,
      color: `var(--josanz-pill-${key}-text)`,
    };
  }
}
