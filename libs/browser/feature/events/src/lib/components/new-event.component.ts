import {
  Component,
  signal,
  OnInit,
  OnDestroy,
  inject,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AIFormBridgeService, ToastService } from '@josanz-erp/shared-data-access';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { LucideAngularModule, ArrowLeft, Calendar, Clock, MapPin, Users, Save, X } from 'lucide-angular';
import {
  UiCardComponent,
  UiButtonComponent,
  UiInputComponent,
  UiTextareaComponent,
  UiSelectComponent,
  UiLoaderComponent,
  UiBadgeComponent,
} from '@josanz-erp/shared-ui-kit';
import { EventItem, EventsStateService } from '../services/events-state.service';

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
    UiLoaderComponent,
    UiBadgeComponent,
    LucideAngularModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-container animate-fade-in">
      @if (!isNew() && isLoading()) {
        <div class="page-loading">
          <ui-loader message="Cargando evento…"></ui-loader>
        </div>
      } @else if (!isNew() && loadError()) {
        <div class="page-error">
          <lucide-icon name="alert-circle" size="48" class="page-error-icon"></lucide-icon>
          <p>{{ loadError() }}</p>
          <div class="page-error-actions">
            <ui-button variant="solid" (clicked)="reload()">Reintentar</ui-button>
            <ui-button variant="ghost" [routerLink]="['/events']">Volver al listado</ui-button>
          </div>
        </div>
      } @else {
        <header class="page-header">
          <div class="header-breadcrumb">
            <ui-button variant="ghost" [routerLink]="['/events']" class="back-button">
              <lucide-icon [img]="ArrowLeftIcon" size="16"></lucide-icon>
              Volver
            </ui-button>
            <h1 class="page-title text-uppercase">{{ pageTitle() }}</h1>
            <div class="breadcrumb">
              <span class="active">GESTIÓN</span>
              <span class="separator">/</span>
              <span>EVENTOS</span>
              <span class="separator">/</span>
              <span>{{ isNew() ? 'NUEVO' : isViewMode() ? 'DETALLE' : 'EDITAR' }}</span>
            </div>
          </div>
        </header>

        @if (isViewMode() && loaded(); as ev) {
          <ui-card>
            <div class="view-body">
              <div class="view-row">
                <span class="view-label">Título</span>
                <p class="view-value">{{ ev.title }}</p>
              </div>
              <div class="view-row span-2">
                <span class="view-label">Descripción</span>
                <p class="view-value">{{ ev.description || '—' }}</p>
              </div>
              <div class="view-row">
                <span class="view-label">Estado</span>
                <ui-badge [variant]="statusVariant(ev.status)">{{ getStatusLabel(ev.status) }}</ui-badge>
              </div>
              <div class="view-row">
                <span class="view-label">Tipo</span>
                <p class="view-value">{{ typeLabel(ev.type) }}</p>
              </div>
              <div class="view-row">
                <span class="view-label">Fecha</span>
                <p class="view-value">{{ ev.date }} · {{ ev.time }}</p>
              </div>
              <div class="view-row">
                <span class="view-label">Ubicación</span>
                <p class="view-value">{{ ev.location || '—' }}</p>
              </div>
              <div class="view-row">
                <span class="view-label">Aforo</span>
                <p class="view-value">{{ ev.attendees }} / {{ ev.capacity }}</p>
              </div>
              <div class="view-row">
                <span class="view-label">Organizador</span>
                <p class="view-value">{{ ev.organizer || '—' }}</p>
              </div>
              <div class="view-actions">
                <ui-button variant="primary" (clicked)="goEdit()">Editar</ui-button>
              </div>
            </div>
          </ui-card>
        } @else {
          <form [formGroup]="eventForm" (ngSubmit)="onSubmit()" class="form-container">
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
                    <ui-input label="Fecha" type="date" formControlName="date" required>
                      <lucide-icon [img]="CalendarIcon" size="16" slot="prefix"></lucide-icon>
                    </ui-input>

                    <ui-input label="Hora de Inicio" type="time" formControlName="startTime" required>
                      <lucide-icon [img]="ClockIcon" size="16" slot="prefix"></lucide-icon>
                    </ui-input>

                    <ui-input label="Hora de Fin" type="time" formControlName="endTime">
                      <lucide-icon [img]="ClockIcon" size="16" slot="prefix"></lucide-icon>
                    </ui-input>

                    <div class="form-spacer"></div>
                  </div>
                </div>

                <div class="form-section">
                  <h2 class="section-title">Ubicación y Capacidad</h2>

                  <div class="form-grid">
                    <ui-input label="Ubicación" placeholder="Sala, dirección, enlace virtual…" formControlName="location">
                      <lucide-icon [img]="MapPinIcon" size="16" slot="prefix"></lucide-icon>
                    </ui-input>

                    <ui-input label="Capacidad Máxima" type="number" placeholder="0" formControlName="capacity">
                      <lucide-icon [img]="UsersIcon" size="16" slot="prefix"></lucide-icon>
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
                    <ui-input label="Organizador" placeholder="Nombre del organizador" formControlName="organizer"></ui-input>

                    <ui-input label="Contacto" placeholder="Email o teléfono de contacto" formControlName="contact"></ui-input>

                    <ui-input label="Costo" type="number" step="0.01" placeholder="0.00" formControlName="cost"></ui-input>

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
              <ui-button variant="ghost" type="button" [routerLink]="['/events']">
                <lucide-icon [img]="XIcon" size="16"></lucide-icon>
                Cancelar
              </ui-button>

              <ui-button variant="primary" type="submit" [disabled]="eventForm.invalid || isSubmitting()">
                <lucide-icon [img]="SaveIcon" size="16"></lucide-icon>
                {{ isSubmitting() ? 'Guardando…' : 'Guardar evento' }}
              </ui-button>
            </div>
          </form>
        }
      }
    </div>
  `,
  styles: [
    `
      .page-loading,
      .page-error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 4rem 1rem;
        text-align: center;
        gap: 0.75rem;
      }
      .page-error-icon {
        color: var(--error);
        opacity: 0.9;
      }
      .page-error p {
        margin: 0;
        color: var(--text-muted);
        max-width: 28ch;
      }
      .page-error-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        justify-content: center;
        margin-top: 0.5rem;
      }

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
        color: var(--text-primary);
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

      .view-body {
        padding: 1.5rem;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem 1.5rem;
      }
      .view-row.span-2 {
        grid-column: 1 / -1;
      }
      .view-label {
        font-size: 0.65rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--text-muted);
        display: block;
        margin-bottom: 0.25rem;
      }
      .view-value {
        margin: 0;
        font-size: 0.95rem;
        color: var(--text-primary);
      }
      .view-actions {
        grid-column: 1 / -1;
        margin-top: 0.5rem;
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
        border: 1px solid var(--border-soft);
        border-radius: 0.5rem;
        background: var(--surface);
      }

      .section-title {
        margin: 0 0 1.5rem 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-primary);
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
        border-top: 1px solid var(--border-soft);
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
        .view-body {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class NewEventComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly aiFormBridge = inject(AIFormBridgeService);
  private readonly toast = inject(ToastService);
  private readonly eventsState = inject(EventsStateService);

  readonly ArrowLeftIcon = ArrowLeft;
  readonly CalendarIcon = Calendar;
  readonly ClockIcon = Clock;
  readonly MapPinIcon = MapPin;
  readonly UsersIcon = Users;
  readonly SaveIcon = Save;
  readonly XIcon = X;

  isSubmitting = signal(false);
  isLoading = signal(false);
  loadError = signal<string | null>(null);
  eventId = signal<string | null>(null);
  isNew = signal(true);
  loaded = signal<EventItem | null>(null);

  isViewMode = computed(() => {
    if (this.isNew()) {
      return false;
    }
    const id = this.eventId();
    if (!id) {
      return false;
    }
    return !this.router.url.includes('/edit');
  });

  pageTitle = computed(() => {
    if (this.isNew()) {
      return 'NUEVO EVENTO';
    }
    if (this.isViewMode()) {
      return 'DETALLE DEL EVENTO';
    }
    return 'EDITAR EVENTO';
  });

  eventForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    type: ['other'],
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
    { label: 'Completado', value: 'completed' },
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

    const path = this.route.snapshot.routeConfig?.path ?? '';
    const id = this.route.snapshot.paramMap.get('id');
    const isNewRoute = path === 'new' || !id;

    this.isNew.set(isNewRoute);
    this.eventId.set(id);

    if (!isNewRoute && id) {
      this.loadEvent(id);
    }
  }

  ngOnDestroy() {
    this.aiFormBridge.unregisterForm(this.eventForm);
  }

  reload(): void {
    const id = this.eventId();
    if (id) {
      this.loadEvent(id);
    }
  }

  goEdit(): void {
    const id = this.eventId();
    if (id) {
      void this.router.navigate(['/events', id, 'edit']);
    }
  }

  statusVariant(
    s: EventItem['status'],
  ): 'primary' | 'success' | 'warning' | 'info' | 'danger' | 'secondary' {
    switch (s) {
      case 'active':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getStatusLabel(s: EventItem['status']): string {
    const m: Record<string, string> = {
      active: 'Activo',
      completed: 'Completado',
      cancelled: 'Cancelado',
      draft: 'Borrador',
    };
    return m[s] ?? s;
  }

  typeLabel(t: EventItem['type']): string {
    const o = this.eventTypes.find((x) => x.value === t);
    return o?.label ?? t;
  }

  private loadEvent(id: string): void {
    this.isLoading.set(true);
    this.loadError.set(null);
    queueMicrotask(() => {
      const ev = this.eventsState.getById(id);
      if (!ev) {
        this.loadError.set('No se encontró el evento.');
        this.loaded.set(null);
        this.isLoading.set(false);
        return;
      }
      this.loaded.set(ev);
      this.eventForm.patchValue({
        title: ev.title,
        description: ev.description,
        type: ev.type,
        status: ev.status,
        date: ev.date,
        startTime: ev.time,
        endTime: '',
        location: ev.location,
        capacity: ev.capacity,
        organizer: ev.organizer,
        cost: ev.cost,
      });
      this.isLoading.set(false);
    });
  }

  onSubmit() {
    if (this.isViewMode()) {
      return;
    }
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const v = this.eventForm.getRawValue();

    const payload: Omit<EventItem, 'id' | 'createdAt'> = {
      title: v.title,
      description: v.description || '',
      date: v.date,
      time: v.startTime || '09:00',
      location: v.location || '',
      status: v.status as EventItem['status'],
      attendees: 0,
      capacity: Number(v.capacity) || 0,
      type: (v.type || 'other') as EventItem['type'],
      organizer: v.organizer || '',
      cost: Number(v.cost) || 0,
    };

    if (this.isNew()) {
      const created = this.eventsState.create(payload);
      this.toast.show('Evento creado correctamente', 'success');
      this.isSubmitting.set(false);
      void this.router.navigate(['/events', created.id]);
      return;
    }

    const id = this.eventId();
    if (!id) {
      this.isSubmitting.set(false);
      return;
    }

    const updated = this.eventsState.update(id, payload);
    if (updated) {
      this.toast.show('Evento actualizado correctamente', 'success');
      void this.router.navigate(['/events', id]);
    } else {
      this.toast.show('No se pudo guardar el evento', 'error');
    }
    this.isSubmitting.set(false);
  }
}
