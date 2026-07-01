import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputComponent, JosanzFormDateFieldComponent, JosanzFormTimeFieldComponent } from '@josanz-erp/josanz-ui';
import { eventDateGroupAt } from '../../josanz-event-form.helpers';
import { JOSANZ_EVENT_UI_TYPES, type JosanzEventUiType } from '../../josanz-event-form.utils';
import { JosanzEventDetailState } from '../josanz-event-detail.state';

@Component({
  selector: 'josanz-event-hero',
  standalone: true,
  imports: [ReactiveFormsModule, InputComponent, JosanzFormDateFieldComponent, JosanzFormTimeFieldComponent],
  template: `
    <article class="josanz-event-hero" [formGroup]="form">
      <div class="josanz-event-hero__media josanz-event-hero__media--logo">
        <img [src]="state.heroImage" alt="" />
      </div>
      <div class="josanz-event-hero__body">
        <h2 class="josanz-event-hero__typology">Evento: {{ typologyLabel }}</h2>

        <div class="josanz-event-hero__meta-grid">
          <p>
            <span class="josanz-event-hero__meta-label">Fecha:</span>
            <span class="josanz-event-hero__meta-value">{{ meta.date }}</span>
          </p>
          <p>
            <span class="josanz-event-hero__meta-label">Operador:</span>
            <span class="josanz-event-hero__meta-value">{{ meta.operator }}</span>
          </p>
          <p>
            <span class="josanz-event-hero__meta-label">Lugar:</span>
            <span class="josanz-event-hero__meta-value">{{ meta.location }}</span>
          </p>
        </div>

        @if (state.isComposerOpen('hero-details')) {
        <div class="josanz-event-hero__details">
          <div class="josanz-event-create__type-row josanz-event-detail__type-row" role="group" aria-label="Tipo de evento">
            @for (type of eventTypes; track type) {
            <button
              type="button"
              class="josanz-event-create__type-pill"
              [class.josanz-event-create__type-pill--active]="selectedType === type"
              (click)="typeSelected.emit(type)"
            >
              {{ type }}
            </button>
            }
          </div>
          <div class="josanz-event-detail__fields">
            <josanz-input label="Nombre evento" controlName="nombre" [parentForm]="form" [required]="true"></josanz-input>
            <div formArrayName="eventDates">
              <div class="josanz-event-create__grid-2" [formGroupName]="0">
                <josanz-form-date-field label="Fecha evento" controlName="fecha" [parentForm]="eventDateGroup(0)" [required]="true"></josanz-form-date-field>
                <josanz-form-time-field label="Hora evento" controlName="hora" [parentForm]="eventDateGroup(0)"></josanz-form-time-field>
              </div>
            </div>
            <josanz-input
              label="Localización"
              controlName="localizacion"
              [parentForm]="form"
              [required]="selectedType === 'Evento externo'"
            ></josanz-input>
          </div>
        </div>
        } @else if (!hasDescription) {
        <button type="button" class="josanz-event-figma-add-btn" (click)="state.toggleHeroDetails()">
          Añadir información +
        </button>
        }

        @if (hasDescription || state.isComposerOpen('hero-details')) {
        <textarea
          class="josanz-event-hero__desc-input"
          formControlName="descripcion"
          rows="3"
          placeholder="Descripción del evento…"
        ></textarea>
        }
      </div>
    </article>
  `,
})
export class JosanzEventHeroComponent {
  readonly state = inject(JosanzEventDetailState);
  readonly eventTypes = JOSANZ_EVENT_UI_TYPES;

  @Input({ required: true }) form!: FormGroup;
  @Input({ required: true }) selectedType!: JosanzEventUiType;
  @Input({ required: true }) typologyLabel!: string;
  @Input({ required: true }) meta!: { date: string; operator: string; location: string };
  @Input({ required: true }) hasDescription!: boolean;

  @Output() typeSelected = new EventEmitter<JosanzEventUiType>();

  eventDateGroup(index: number): FormGroup {
    return eventDateGroupAt(this.form, index);
  }
}
