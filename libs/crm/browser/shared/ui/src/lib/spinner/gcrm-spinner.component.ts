import { Component, Input } from '@angular/core';

@Component({
  selector: 'gcrm-spinner',
  standalone: true,
  templateUrl: './gcrm-spinner.component.html',
  styleUrl: './gcrm-spinner.component.css',
})
export class GcrmSpinnerComponent {
  /** Texto para lectores de pantalla (el elemento visible es decorativo). */
  @Input() label = 'Cargando';
  @Input() size: 'sm' | 'md' = 'md';
}
