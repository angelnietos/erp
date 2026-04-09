import { Component, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AIFormBridgeService } from '@josanz-erp/shared-data-access';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  LucideAngularModule,
  Calendar,
  Clock,
  MapPin,
  Users,
  Save,
  X,
  ArrowLeft,
} from 'lucide-angular';
import {
  UiCardComponent,
  UiButtonComponent,
  UiInputComponent,
  UiTextareaComponent,
  UiSelectComponent,
} from '@josanz-erp/shared-ui-kit';

@Component({
  selector: 'lib-new-event',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    UiCardComponent,
    UiButtonComponent,
    UiInputComponent,
    UiTextareaComponent,
    UiSelectComponent,
    LucideAngularModule,
  ],
  template: `
    <div class="page-container animate-fade-in">
      <header class="page-header">
        <div class="header-breadcrumb">
          <ui-button
            variant="ghost"
            [routerLink]="['/events']"
            class="back-button"
          >
            <lucide-icon [img]="ArrowLeftIcon" size="16"></lucide-icon>
            Volver
          </ui-button>
          <h1 class="page-title text-uppercase">Nuevo Evento</h1>
          <div class="breadcrumb">
            <span class="active">GESTIÓN</span>
            <span class="separator">/</span>
            <span>EVENTOS</span>
            <span class="separator">/</span>
            <span>NUEVO</span>
          </div>
        </div>
      </header>

      <form
        [formGroup]="eventForm"
        (ngSubmit)="onSubmit()"
        class="form-container"
      >
        <ui-card>
          <div class="form-content">
            <div class="form-section">
              <h2 class="section-title">Información General</h2>

              <div class="form-grid">
                <ui-input
                  label="Título del Evento"
                  placeholder="Ingrese el título del evento"
                  formControlName="title"
                  required
                ></ui-input>

                <ui-textarea
                  label="Descripción"
                  placeholder="Describa el evento..."
                  formControlName="description"
                  [rows]="4"
                ></ui-textarea>

                <ui-select
                  label="Tipo de Evento"
                  formControlName="type"
                  [options]="eventTypes"
                  placeholder="Seleccione el tipo"
                ></ui-select>

                <ui-select
                  label="Estado"
                  formControlName="status"
                  [options]="statusOptions"
                  placeholder="Seleccione el estado"
                ></ui-select>
              </div>
            </div>

            <div class="form-section">
              <h2 class="section-title">Fecha y Hora</h2>

              <div class="form-grid">
                <ui-input
                  label="Fecha"
                  type="date"
                  formControlName="date"
                  required
                >
                  <lucide-icon
                    [img]="CalendarIcon"
                    size="16"
                    slot="prefix"
                  ></lucide-icon>
                </ui-input>

                <ui-input
                  label="Hora de Inicio"
                  type="time"
                  formControlName="startTime"
                  required
                >
                  <lucide-icon
                    [img]="ClockIcon"
                    size="16"
                    slot="prefix"
                  ></lucide-icon>
                </ui-input>

                <ui-input
                  label="Hora de Fin"
                  type="time"
                  formControlName="endTime"
                >
                  <lucide-icon
                    [img]="ClockIcon"
                    size="16"
                    slot="prefix"
                  ></lucide-icon>
                </ui-input>

                <div class="form-spacer"></div>
              </div>
            </div>

            <div class="form-section">
              <h2 class="section-title">Ubicación y Capacidad</h2>

              <div class="form-grid">
                <ui-input
                  label="Ubicación"
                  placeholder="Sala, dirección, enlace virtual..."
                  formControlName="location"
                >
                  <lucide-icon
                    [img]="MapPinIcon"
                    size="16"
                    slot="prefix"
                  ></lucide-icon>
                </ui-input>

                <ui-input
                  label="Capacidad Máxima"
                  type="number"
                  placeholder="0"
                  formControlName="capacity"
                >
                  <lucide-icon
                    [img]="UsersIcon"
                    size="16"
                    slot="prefix"
                  ></lucide-icon>
                </ui-input>

                <ui-select
                  label="Tipo de Ubicación"
                  formControlName="locationType"
                  [options]="locationTypes"
                  placeholder="Seleccione el tipo"
                ></ui-select>

                <div class="form-spacer"></div>
              </div>
            </div>

            <div class="form-section">
              <h2 class="section-title">Información Adicional</h2>

              <div class="form-grid">
                <ui-input
                  label="Organizador"
                  placeholder="Nombre del organizador"
                  formControlName="organizer"
                ></ui-input>

                <ui-input
                  label="Contacto"
                  placeholder="Email o teléfono de contacto"
                  formControlName="contact"
                ></ui-input>

                <ui-input
                  label="Costo"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  formControlName="cost"
                ></ui-input>

                <ui-select
                  label="Moneda"
                  formControlName="currency"
                  [options]="currencyOptions"
                  placeholder="Seleccione moneda"
                ></ui-select>
              </div>
            </div>
          </div>
        </ui-card>

        <div class="form-actions">
          <ui-button
            variant="ghost"
            type="button"
            [routerLink]="['/events']"
          >
            <lucide-icon [img]="XIcon" size="16"></lucide-icon>
            Cancelar
          </ui-button>

          <ui-button
            variant="primary"
            type="submit"
            [disabled]="eventForm.invalid || isSubmitting()"
          >
            <lucide-icon [img]="SaveIcon" size="16"></lucide-icon>
            {{ isSubmitting() ? 'Guardando...' : 'Guardar Evento' }}
          </ui-button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .page-container {
        padding: 0;
        max-width: 800px;
        margin: 0 auto;
      }

      .page-header {
        margin-bottom: 2rem;
      }

      .header-breadcrumb {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .back-button {
        align-self: flex-start;
        margin-bottom: 0.5rem;
      }

      .page-title {
        margin: 0;
        font-size: 2rem;
        font-weight: 700;
        letter-spacing: 0.025em;
        color: #fff;
      }

      .breadcrumb {
        display: flex;
        gap: 8px;
        font-size: 0.6rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        color: var(--text-muted);
      }

      .breadcrumb .active {
        color: var(--primary);
      }

      .breadcrumb .separator {
        opacity: 0.5;
      }

      .form-container {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .form-content {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .form-section {
        padding: 1.5rem;
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 0.5rem;
        background: rgba(255, 255, 255, 0.02);
      }

      .section-title {
        margin: 0 0 1.5rem 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #fff;
      }

      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
      }

      .form-spacer {
        grid-column: span 2;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        padding-top: 2rem;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
      }

      @media (max-width: 768px) {
        .form-grid {
          grid-template-columns: 1fr;
        }

        .form-spacer {
          grid-column: span 1;
        }

        .form-actions {
          flex-direction: column;
        }

        .page-title {
          font-size: 1.5rem;
        }
      }
    `,
  ],
})
export class NewEventComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly aiFormBridge = inject(AIFormBridgeService);

  // Icon references
  readonly ArrowLeftIcon = ArrowLeft;
  readonly CalendarIcon = Calendar;
  readonly ClockIcon = Clock;
  readonly MapPinIcon = MapPin;
  readonly UsersIcon = Users;
  readonly SaveIcon = Save;
  readonly XIcon = X;

  isSubmitting = signal(false);

  eventForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    type: [''],
    status: ['active'],
    date: ['', Validators.required],
    startTime: ['', Validators.required],
    endTime: [''],
    location: [''],
    locationType: [''],
    capacity: [0],
    organizer: [''],
    contact: [''],
    cost: [0],
    currency: ['EUR'],
  });

  // ... rest of the properties ...
  eventTypes = [
    { label: 'Conferencia', value: 'conference' },
    { label: 'Taller', value: 'workshop' },
    { label: 'Reunión', value: 'meeting' },
    { label: 'Evento Social', value: 'social' },
    { label: 'Presentación', value: 'presentation' },
    { label: 'Otro', value: 'other' },
  ];

  statusOptions = [
    { label: 'Activo', value: 'active' },
    { label: 'Borrador', value: 'draft' },
    { label: 'Cancelado', value: 'cancelled' },
  ];

  locationTypes = [
    { label: 'Presencial', value: 'in-person' },
    { label: 'Virtual', value: 'virtual' },
    { label: 'Híbrido', value: 'hybrid' },
  ];

  currencyOptions = [
    { label: 'EUR', value: 'EUR' },
    { label: 'USD', value: 'USD' },
    { label: 'GBP', value: 'GBP' },
  ];

  ngOnInit() {
    this.aiFormBridge.registerForm(this.eventForm);
  }

  ngOnDestroy() {
    this.aiFormBridge.unregisterForm(this.eventForm);
  }

  onSubmit() {
    if (this.eventForm.valid) {
      this.isSubmitting.set(true);

      // Simulate API call
      setTimeout(() => {
        console.log('Event created:', this.eventForm.value);
        this.isSubmitting.set(false);
        this.router.navigate(['/events']);
      }, 1000);
    } else {
      // Mark all fields as touched to show validation errors
      this.eventForm.markAllAsTouched();
    }
  }
}
