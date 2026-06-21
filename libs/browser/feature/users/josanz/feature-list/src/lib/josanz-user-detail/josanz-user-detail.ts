import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  JosanzFigmaDetailShellComponent,
  type JosanzFigmaDetailShellConfig,
} from '@josanz-erp/josanz-ui';

@Component({
  selector: 'lib-josanz-user-detail',
  standalone: true,
  imports: [CommonModule, JosanzFigmaDetailShellComponent],
  templateUrl: './josanz-user-detail.html',
})
export class JosanzUserDetailComponent {
  readonly shellConfig: JosanzFigmaDetailShellConfig = {
    title: 'Juan Pérez',
    listRoute: '/users',
    tabs: ['Datos usuario', 'Permisos', 'Actividad'],
    tabSlugMap: {
      'Datos usuario': 'datos',
      Permisos: 'permisos',
      Actividad: 'actividad',
    },
    statusLabel: 'Activo',
    statusPillKey: 'confirmado',
    features: { footerActions: false },
  };

  readonly personalRows: { label: string; value: string }[] = [
    { label: 'Nombre completo', value: 'Juan Pérez' },
    { label: 'Email', value: 'juan.perez@josanz.com' },
    { label: 'Teléfono', value: '+34 600 000 002' },
    { label: 'Rol', value: 'Operario' },
  ];

  readonly accessRows: { label: string; value: string; accent?: boolean }[] = [
    { label: 'Estado de la cuenta', value: 'Activa', accent: true },
    { label: 'Último acceso', value: 'Hoy, 09:42 (Europe/Madrid)' },
    { label: 'Idioma', value: 'Español' },
    { label: 'Zona horaria', value: 'UTC+1' },
  ];
}
