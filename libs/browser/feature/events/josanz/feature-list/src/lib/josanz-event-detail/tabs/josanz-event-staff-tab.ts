import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectComponent } from '@josanz-erp/josanz-ui';
import { JosanzEventDetailState } from '../josanz-event-detail.state';

@Component({
  selector: 'josanz-event-staff-tab',
  standalone: true,
  imports: [CommonModule, SelectComponent],
  template: `
    <section class="josanz-event-section">
      <div class="josanz-event-section-header">
        <h3 class="josanz-event-section__title m-0">Staff</h3>
        @if (state.staffMembers().length > 0) {
        <span class="josanz-event-staff-count">{{ state.staffMembers().length }} miembro(s)</span>
        }
      </div>

      <div class="josanz-event-staff-grid">
        @for (member of state.staffMembers(); track member.id) {
        <article class="josanz-event-staff-card">
          <div class="josanz-event-staff-card__info">
            <div class="josanz-event-staff-card__avatar">
              <span>{{ member.name.charAt(0).toUpperCase() }}</span>
            </div>
            <div class="josanz-event-staff-card__copy">
              <strong>{{ member.name }}</strong>
              <span class="josanz-event-staff-card__tag" [ngStyle]="state.pillStyle(member.pillKey)">{{ member.tag }}</span>
            </div>
          </div>
          <div class="josanz-event-staff-card__actions">
            <button type="button" class="josanz-event-icon-btn" aria-label="Editar miembro" (click)="state.openStaffPicker(member.id)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            </button>
            <button type="button" class="josanz-event-icon-btn josanz-event-icon-btn--danger" aria-label="Quitar miembro" (click)="state.removeStaffMember(member.id)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              </svg>
            </button>
          </div>
        </article>
        }

        @if (state.isComposerOpen('staff-picker')) {
        <article class="josanz-event-staff-card josanz-event-staff-card--picker">
          <josanz-select
            label="Miembro staff"
            placeholder="Selecciona un miembro"
            [options]="state.staffOptions()"
            [required]="true"
            (valueChange)="state.onStaffPicked($event)"
          ></josanz-select>
          <button type="button" class="josanz-event-note-composer__cancel" (click)="state.closeComposer()">Cancelar</button>
        </article>
        } @else {
        <article class="josanz-event-staff-card josanz-event-staff-card--add">
          <button type="button" class="josanz-event-figma-add-btn" (click)="state.toggleComposer('staff-picker')">
            + Añadir miembro
          </button>
        </article>
        }
      </div>
    </section>
  `,
})
export class JosanzEventStaffTabComponent {
  readonly state = inject(JosanzEventDetailState);
}
