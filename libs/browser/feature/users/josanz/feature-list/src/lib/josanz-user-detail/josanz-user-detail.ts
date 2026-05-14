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
