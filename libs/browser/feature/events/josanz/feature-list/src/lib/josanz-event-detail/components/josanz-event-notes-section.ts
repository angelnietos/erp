import { Component, Input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '@josanz-erp/josanz-ui';
import { JosanzEventDetailState } from '../josanz-event-detail.state';

@Component({
  selector: 'josanz-event-notes-section',
  standalone: true,
  imports: [FormsModule, ButtonComponent],
  template: `
    <section
      class="josanz-event-section"
      [class.josanz-event-section--figma-empty]="state.notesFor(kind).length === 0 && !state.isComposerOpen(composerId)"
    >
      <h3 class="josanz-event-section__title">{{ title }}</h3>

      @for (note of state.notesFor(kind); track note.id) {
        @if (state.editingNoteId() === note.id) {
        <div class="josanz-event-note-composer">
          <input
            type="text"
            class="josanz-event-note-composer__input"
            [(ngModel)]="state.editingNoteText"
            (keydown.enter)="state.saveNote(kind, note.id)"
          />
          <div class="josanz-event-note-composer__footer">
            <button type="button" class="josanz-event-note-composer__cancel" (click)="state.cancelEditNote()">
              Cancelar
            </button>
            <josanz-button label="Guardar" size="sm" [showIcon]="false" (btnClick)="state.saveNote(kind, note.id)"></josanz-button>
          </div>
        </div>
        } @else {
        <div class="josanz-event-note-row">
          <span class="josanz-event-note-row__text">{{ note.text }}</span>
          <div class="josanz-event-note-row__actions">
            <button type="button" class="josanz-event-icon-btn" aria-label="Editar nota" (click)="state.startEditNote(note)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            </button>
            <button type="button" class="josanz-event-icon-btn josanz-event-icon-btn--danger" aria-label="Eliminar nota" (click)="state.removeNote(kind, note.id)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              </svg>
            </button>
          </div>
        </div>
        }
      }

      @if (state.isComposerOpen(composerId)) {
      <div class="josanz-event-note-composer">
        <input
          type="text"
          class="josanz-event-note-composer__input"
          [placeholder]="placeholder"
          [(ngModel)]="state.noteDraft"
          (keydown.enter)="state.addNote(kind)"
        />
        <div class="josanz-event-note-composer__footer">
          <button type="button" class="josanz-event-note-composer__cancel" (click)="state.closeComposer()">
            Cancelar
          </button>
          <josanz-button label="Añadir +" size="sm" [showIcon]="false" (btnClick)="state.addNote(kind)"></josanz-button>
        </div>
      </div>
      } @else if (state.notesFor(kind).length > 0) {
      <div class="josanz-event-section__add">
        <button type="button" class="josanz-event-figma-add-btn" (click)="state.toggleComposer(composerId)">
          Añadir +
        </button>
      </div>
      } @else {
      <div class="josanz-event-section__empty-action">
        <button type="button" class="josanz-event-figma-add-btn" (click)="state.toggleComposer(composerId)">
          Añadir +
        </button>
      </div>
      }
    </section>
  `,
})
export class JosanzEventNotesSectionComponent {
  readonly state = inject(JosanzEventDetailState);

  @Input({ required: true }) kind!: 'event' | 'staff';
  @Input({ required: true }) title!: string;
  @Input({ required: true }) placeholder!: string;

  get composerId() {
    return this.state.composerIdFor(this.kind);
  }
}
