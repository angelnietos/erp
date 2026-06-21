import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  MainDetailLayoutComponent,
  navigateDetailTab,
  readDetailTabFromRoute,
} from '@josanz-erp/josanz-ui';

@Component({
  selector: 'lib-josanz-user-detail',
  standalone: true,
  imports: [CommonModule, MainDetailLayoutComponent],
  templateUrl: './josanz-user-detail.html',
})
export class JosanzUserDetailComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  activeTab = signal<string>('Datos usuario');
  readonly tabs = ['Datos usuario', 'Permisos', 'Actividad'];

  private readonly tabSlugMap: Record<string, string> = {
    'Datos usuario': 'datos',
    Permisos: 'permisos',
    Actividad: 'actividad',
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

  ngOnInit(): void {
    readDetailTabFromRoute(this.route, this.tabSlugMap, this.tabs, this.activeTab);
  }

  setTab(tab: string): void {
    this.activeTab.set(tab);
    navigateDetailTab(this.router, this.route, tab, this.tabSlugMap);
  }

  onBack(): void {
    void this.router.navigate(['/users']);
  }

  onSave(): void {
    void this.router.navigate(['/users']);
  }

  onCancel(): void {
    this.onBack();
  }
}
