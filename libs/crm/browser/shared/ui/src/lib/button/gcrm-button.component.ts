import { Component, Input } from '@angular/core';

export type GcrmButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

@Component({
  selector: 'gcrm-button',
  standalone: true,
  templateUrl: './gcrm-button.component.html',
  styleUrl: './gcrm-button.component.css',
})
export class GcrmButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: GcrmButtonVariant = 'primary';
  @Input() disabled = false;
  @Input() block = false;
  /** Expone `aria-busy` en el `<button>` nativo (p. ej. envío en curso). */
  @Input() busy = false;
  /** Accesible cuando el contenido visible no basta (icono solo, etc.). */
  @Input() ariaLabel: string | null = null;
}
