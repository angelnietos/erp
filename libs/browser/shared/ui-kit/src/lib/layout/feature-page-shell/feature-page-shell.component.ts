import { Component, Input, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Envuelve el contenido de una vista feature con las clases globales definidas en
 * `apps/frontend/src/styles.css` (`.feature-page-shell` y modificadores).
 * Mantiene un único patrón de ancho, centrado y ritmo vertical.
 *
 * Por defecto expone `role="main"` en el host para marcar el contenido principal de la ruta
 * (WCAG). Desactiva con `mainLandmark` en vistas embebidas o si el layout padre ya define `<main>`.
 */
export type UiFeaturePageShellVariant =
  | 'default'
  | 'compact'
  | 'widthOnly'
  | 'padMd';

@Component({
  selector: 'ui-feature-page-shell',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div [class]="shellClass"><ng-content /></div>`,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        animation: bbPageEntry 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      @keyframes bbPageEntry {
        from {
          opacity: 0;
          transform: scale(0.99) translateY(4px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
    `,
  ],
})
export class UiFeaturePageShellComponent {
  /** Modificador de padding/gap; `default` usa los tokens globales. */
  @Input() variant: UiFeaturePageShellVariant = 'default';

  /**
   * Si es true (por defecto), el host recibe `role="main"` para lectores de pantalla.
   * Pon a false si esta vista no es el contenido principal o ya hay un `<main>` envolvente.
   */
  @Input() mainLandmark = true;

  @Input() fadeIn = false;

  /** `height: 100%` cuando la vista vive dentro de un layout con alto definido. */
  @Input() fillHost = false;

  /** Clases extra (espacio-separadas) en el contenedor interno. */
  @Input() extraClass = '';

  @HostBinding('attr.role')
  get hostMainRole(): 'main' | null {
    return this.mainLandmark ? 'main' : null;
  }

  get shellClass(): string {
    const parts = ['feature-page-shell'];
    switch (this.variant) {
      case 'compact':
        parts.push('feature-page-shell--compact');
        break;
      case 'widthOnly':
        parts.push('feature-page-shell--width-only');
        break;
      case 'padMd':
        parts.push('feature-page-shell--pad-md');
        break;
      default:
        break;
    }
    if (this.fadeIn) {
      parts.push('feature-page-shell--fade-in');
    }
    if (this.fillHost) {
      parts.push('feature-page-shell--fill-host');
    }
    const extra = this.extraClass.trim();
    if (extra) {
      parts.push(extra);
    }
    return parts.join(' ');
  }
}
