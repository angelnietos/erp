import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  MainListLayoutComponent,
  MainTemplateCardComponent,
  BaseListComponent,
  JosanzThemeService,
} from '@josanz-erp/josanz-ui';

@Component({
  selector: 'josanz-clients-list',
  standalone: true,
  imports: [
    CommonModule,
    MainListLayoutComponent,
    MainTemplateCardComponent,
  ],
  templateUrl: './feature-list.html',
  styleUrl: './feature-list.css',
})
export class JosanzClientsListComponent extends BaseListComponent {
  readonly themeService = inject(JosanzThemeService);
  private router = inject(Router);

  constructor() {
    super();
    this.title = 'Clientes';
    this.primaryBtnLabel = 'Añadir Cliente +';
  }

  override onAdd() {
    this.router.navigate(['/clients/new']);
  }

  openDetail() {
    // Para prototipo usamos un ID cualquiera
    this.router.navigate(['/clients/1']);
  }
}
