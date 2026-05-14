import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  MainDetailLayoutComponent
} from '@josanz-erp/josanz-ui';

@Component({
  selector: 'lib-josanz-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    MainDetailLayoutComponent
  ],
  templateUrl: './josanz-user-detail.html',
})
export class JosanzUserDetailComponent {
  private router = inject(Router);

  activeTab = signal<string>('Datos usuario');
  tabs = ['Datos usuario', 'Permisos', 'Actividad'];

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

  setTab(tab: string) {
    this.activeTab.set(tab);
  }

  onBack() {
    this.router.navigate(['/users']);
  }

  onSave() {
    console.log('Guardando cambios del usuario...');
    this.onBack();
  }

  onCancel() {
    this.onBack();
  }
}
