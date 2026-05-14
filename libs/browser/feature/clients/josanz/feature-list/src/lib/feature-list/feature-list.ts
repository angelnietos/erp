import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  MainListLayoutComponent,
  MainTemplateCardComponent,
  BaseListComponent,
  JosanzThemeService,
} from '@josanz-erp/josanz-ui';
import { JosanzClientCreateComponent } from '../josanz-client-create/josanz-client-create';
import { JosanzClientDetailComponent } from '../josanz-client-detail/josanz-client-detail';

@Component({
  selector: 'josanz-clients-list',
  standalone: true,
  imports: [
    CommonModule,
    MainListLayoutComponent,
    MainTemplateCardComponent,
    JosanzClientCreateComponent,
    JosanzClientDetailComponent,
  ],
  templateUrl: './feature-list.html',
  styleUrl: './feature-list.css',
})
export class JosanzClientsListComponent extends BaseListComponent {
  readonly themeService = inject(JosanzThemeService);
  private router = inject(Router);
  showCreateModal = signal(false);

  constructor() {
    super();
    this.title = 'Clientes';
    this.primaryBtnLabel = 'Añadir Cliente +';
  }

  override onAdd() {
    this.showCreateModal.set(true);
  }

  onModalClose() {
    this.showCreateModal.set(false);
  }

  openDetail() {
    // Para prototipo usamos un ID cualquiera
    this.router.navigate(['/clients/1']);
  }
}
