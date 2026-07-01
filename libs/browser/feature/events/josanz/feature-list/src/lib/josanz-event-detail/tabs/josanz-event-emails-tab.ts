import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, SecondaryButtonComponent } from '@josanz-erp/josanz-ui';
import { JosanzEventDetailState } from '../josanz-event-detail.state';

@Component({
  selector: 'josanz-event-emails-tab',
  standalone: true,
  imports: [FormsModule, SecondaryButtonComponent, ButtonComponent],
  template: `
    <section class="josanz-event-section">
      <h3 class="josanz-event-section__title">Emails</h3>

      @for (email of state.emails(); track email.id) {
      <div class="josanz-event-email">
        <div class="josanz-event-email__head">
          <span class="josanz-event-email__time">{{ email.time }}</span>
          <span class="josanz-event-email__subject">{{ email.subject }}</span>
        </div>
        <div class="josanz-event-email__row">
          <span class="josanz-event-email__preview" [class.josanz-event-email__preview--open]="email.expanded">
            {{ email.expanded ? email.body : email.preview }}
          </span>
          <div class="josanz-event-note-row__actions">
            <button type="button" class="josanz-event-icon-btn" aria-label="Editar email" (click)="state.startEditEmail(email)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
            </button>
            <button type="button" class="josanz-event-icon-btn josanz-event-icon-btn--danger" aria-label="Eliminar email" (click)="state.removeEmail(email.id)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg>
            </button>
            <button type="button" class="josanz-event-icon-btn" aria-label="Expandir email" (click)="state.toggleEmail(email.id)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path [attr.d]="email.expanded ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      }

      @if (state.isComposerOpen('email')) {
      <div class="josanz-event-email-form">
        <div class="josanz-event-field">
          <label for="email-date">Fecha</label>
          <input id="email-date" type="text" placeholder="dd/mm/aaaa" [(ngModel)]="state.emailForm.date" />
        </div>
        <div class="josanz-event-field">
          <label for="email-subject">Asunto</label>
          <input id="email-subject" type="text" placeholder="Asunto del email" [(ngModel)]="state.emailForm.subject" />
        </div>
        <div class="josanz-event-field">
          <label for="email-body">Email completo</label>
          <textarea id="email-body" rows="6" placeholder="Cuerpo del email…" [(ngModel)]="state.emailForm.body"></textarea>
        </div>
        <div class="josanz-event-email-form__footer">
          <button type="button" class="josanz-event-note-composer__cancel" (click)="state.closeComposer()">Cancelar</button>
          <josanz-button [label]="state.editingEmailId() ? 'Guardar' : 'Añadir +'" size="sm" [showIcon]="false" (btnClick)="state.saveEmail()"></josanz-button>
        </div>
      </div>
      } @else {
      <div class="josanz-event-section__add" [class.josanz-event-section__add--center]="state.emails().length === 0">
        <josanz-secondary-button label="Añadir +" (btnClick)="state.toggleComposer('email')"></josanz-secondary-button>
      </div>
      }
    </section>
  `,
})
export class JosanzEventEmailsTabComponent {
  readonly state = inject(JosanzEventDetailState);
}
