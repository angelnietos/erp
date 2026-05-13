import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'josanz-main-template-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main-template-card.html',
  styleUrl: './main-template-card.css',
})
export class MainTemplateCardComponent {
  @Input() title = 'Facturación General';
  @Input() status = 'Pendiente';
  @Input() statusVariant: 'primary' | 'success' | 'warning' | 'error' = 'warning';
  @Input() data: string[] = ['ID: #4502', 'Fecha: 12/05/2026', 'Total: 1.250€', 'Vencimiento: 30 días'];
}
