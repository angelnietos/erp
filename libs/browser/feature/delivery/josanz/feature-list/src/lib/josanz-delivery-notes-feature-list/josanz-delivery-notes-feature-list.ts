import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  MainListLayoutComponent, 
  MainTemplateCardComponent 
} from '@josanz-erp/josanz-ui';

@Component({
  selector: 'josanz-delivery-notes-feature-list',
  standalone: true,
  imports: [CommonModule, MainListLayoutComponent, MainTemplateCardComponent],
  templateUrl: './josanz-delivery-notes-feature-list.html',
})
export class JosanzDeliveryNotesFeatureListComponent {
  title = 'Albaranes';
  primaryBtnLabel = 'Añadir Albarán +';
  filterOptions = ['Todas', 'Pendiente', 'Firmado', 'Facturado'];

  onAdd() {
    console.log('Añadir albarán');
  }

  onFilter(filter: string) {
    console.log('Filtrar por:', filter);
  }

  onExcel() {
    console.log('Exportar a Excel');
  }
}
