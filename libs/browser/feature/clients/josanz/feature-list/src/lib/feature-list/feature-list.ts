import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainListLayoutComponent, MainTemplateCardComponent } from '@josanz-erp/josanz-ui';

@Component({
  selector: 'josanz-clients-list',
  standalone: true,
  imports: [CommonModule, MainListLayoutComponent, MainTemplateCardComponent],
  templateUrl: './feature-list.html',
  styleUrl: './feature-list.css',
})
export class JosanzClientsListComponent {
  onAddClient() {
    console.log('Añadir cliente clicado');
  }

  onFilterChange(filter: string) {
    console.log('Filtro cambiado a:', filter);
  }
}
