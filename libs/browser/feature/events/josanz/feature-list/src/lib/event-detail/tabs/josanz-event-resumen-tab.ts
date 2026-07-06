import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import type { JosanzEventUiType } from '../../utils/josanz-event-form.utils';
import { JosanzEventDocumentsSectionComponent } from '../components/josanz-event-documents-section';
import { JosanzEventHeroComponent } from '../components/josanz-event-hero';
import { JosanzEventNotesSectionComponent } from '../components/josanz-event-notes-section';

@Component({
  selector: 'josanz-event-resumen-tab',
  standalone: true,
  imports: [JosanzEventHeroComponent, JosanzEventNotesSectionComponent, JosanzEventDocumentsSectionComponent],
  template: `
    <josanz-event-hero
      [form]="form"
      [selectedType]="selectedType"
      [typologyLabel]="typologyLabel"
      [meta]="meta"
      [hasDescription]="hasDescription"
      (typeSelected)="typeSelected.emit($event)"
    />

    <josanz-event-notes-section
      kind="event"
      title="Notas al evento"
      placeholder="Escribe una nota…"
    />

    <josanz-event-notes-section
      kind="staff"
      title="Notas al staff"
      placeholder="Indicaciones para el staff…"
    />

    <josanz-event-documents-section title="Inspiración del evento" uploadTarget="inspiration" />
  `,
})
export class JosanzEventResumenTabComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input({ required: true }) selectedType!: JosanzEventUiType;
  @Input({ required: true }) typologyLabel!: string;
  @Input({ required: true }) meta!: { date: string; operator: string; location: string };
  @Input({ required: true }) hasDescription!: boolean;

  @Output() typeSelected = new EventEmitter<JosanzEventUiType>();
}
