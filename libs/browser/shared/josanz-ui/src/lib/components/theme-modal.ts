import { Component, EventEmitter, Output } from '@angular/core';
import { ModalComponent } from './modal';
import { ButtonComponent } from './button';
import { ThemePersonalizationPanelComponent } from './theme-personalization-panel';

/** @deprecated Preferir Ajustes → pestaña Personalización. Se mantiene por compatibilidad en Storybook. */
@Component({
  selector: 'josanz-theme-modal',
  standalone: true,
  imports: [ModalComponent, ButtonComponent, ThemePersonalizationPanelComponent],
  template: `
    <josanz-modal title="Personalización Josanz" width="min(900px, 95vw)" (close)="modalClose.emit()">
      <josanz-theme-personalization-panel />
      <div footer-actions class="w-full flex justify-end">
        <josanz-button label="Aplicar Cambios" variant="primary" size="lg" (btnClick)="modalClose.emit()"></josanz-button>
      </div>
    </josanz-modal>
  `,
})
export class ThemeModalComponent {
  @Output() modalClose = new EventEmitter<void>();
}
