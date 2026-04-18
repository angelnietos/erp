import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import {
  UiButtonComponent,
  UiInputComponent,
  UiFeaturePageShellComponent,
} from '@josanz-erp/shared-ui-kit';
import { Rental, RentalService } from '@josanz-erp/rentals-data-access';
import { ToastService } from '@josanz-erp/shared-data-access';

interface RentalFormData extends Partial<Rental> {
  description?: string;
  validUntil?: string;
  notes?: string;
}

@Component({
  selector: 'lib-rentals-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    UiButtonComponent,
    UiInputComponent,
    UiFeaturePageShellComponent,
  ],
  template: `
    <ui-feature-page-shell [extraClass]="'rentals-edit-root'">
      @if (isHydrating()) {
        <div class="rentals-edit__loading">
          <lucide-icon name="loader" class="spin" size="40"></lucide-icon>
          <p>Cargando expediente...</p>
        </div>
      } @else if (loadError() && !isCreateMode()) {
        <div class="rentals-edit__error">
          <lucide-icon name="alert-triangle" size="48"></lucide-icon>
          <h2>{{ loadError() }}</h2>
          <ui-button variant="glass" (clicked)="goToList()">Volver al listado</ui-button>
        </div>
      } @else {
        <header class="rentals-edit__header">
          <ui-button variant="ghost" icon="arrow-left" (clicked)="goBack()">Volver</ui-button>
          <h1 class="rentals-edit__title">
            {{ isCreateMode() ? 'Nuevo expediente' : 'Editar expediente' }}
          </h1>
        </header>

        @if (formErrors().length > 0) {
          <div class="rentals-edit__errors">
            @for (error of formErrors(); track $index) {
              <div class="rentals-edit__err">
                <lucide-icon name="alert-circle" size="16"></lucide-icon>
                <span>{{ error }}</span>
              </div>
            }
          </div>
        }

        <div class="rentals-edit__form">
          <div class="rentals-edit__section">
            <h4 class="rentals-edit__section-title">Información general</h4>
            <div class="rentals-edit__grid">
              <ui-input
                label="Cliente *"
                [(ngModel)]="formData.clientName"
                icon="building"
                placeholder="Nombre del cliente"
              ></ui-input>
              <ui-input
                label="ID cliente"
                [(ngModel)]="formData.clientId"
                icon="hash"
                placeholder="ID del cliente"
              ></ui-input>
            </div>
          </div>

          <div class="rentals-edit__section">
            <h4 class="rentals-edit__section-title">Condiciones del alquiler</h4>
            <div class="rentals-edit__grid">
              <ui-input
                label="Fecha inicio"
                [(ngModel)]="formData.startDate"
                icon="calendar"
                type="date"
              ></ui-input>
              <ui-input
                label="Fecha fin"
                [(ngModel)]="formData.endDate"
                icon="calendar"
                type="date"
              ></ui-input>
              <ui-input
                label="Número de items"
                [(ngModel)]="formData.itemsCount"
                icon="package"
                type="number"
                placeholder="0"
              ></ui-input>
              <ui-input
                label="Importe total (€)"
                [(ngModel)]="formData.totalAmount"
                icon="euro"
                type="number"
                placeholder="0.00"
              ></ui-input>
              <ui-input
                label="Descripción"
                [(ngModel)]="formData.description"
                icon="file-text"
                placeholder="Descripción del alquiler"
              ></ui-input>
              <div class="rentals-edit__field">
                <label class="rentals-edit__label" for="valid-until-rental-edit">
                  <lucide-icon name="calendar" size="16"></lucide-icon>
                  Válido hasta
                </label>
                <input
                  id="valid-until-rental-edit"
                  type="date"
                  class="rentals-edit__date-input"
                  [(ngModel)]="formData.validUntil"
                  [min]="getMinDate()"
                />
              </div>
            </div>
            <div class="rentals-edit__notes">
              <label class="rentals-edit__label" for="notes-rental-edit">
                <lucide-icon name="sticky-note" size="16"></lucide-icon>
                Notas
              </label>
              <textarea
                id="notes-rental-edit"
                class="rentals-edit__textarea"
                [(ngModel)]="formData.notes"
                placeholder="Notas adicionales..."
                rows="3"
              ></textarea>
            </div>
          </div>

          <div class="rentals-edit__actions">
            <ui-button variant="ghost" (clicked)="goBack()">Cancelar</ui-button>
            <ui-button
              variant="solid"
              (clicked)="save()"
              [loading]="isSaving()"
              icon="save"
            >
              {{ editingId() ? 'Guardar cambios' : 'Crear expediente' }}
            </ui-button>
          </div>
        </div>
      }
    </ui-feature-page-shell>
  `,
  styles: [
    `
      .rentals-edit__loading,
      .rentals-edit__error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        padding: 3rem 1rem;
        text-align: center;
      }
      .rentals-edit__error h2 {
        margin: 0;
        font-size: 1rem;
        font-weight: 700;
      }
      .spin {
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
      .rentals-edit__header {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 1rem;
      }
      .rentals-edit__title {
        margin: 0;
        font-size: 1.2rem;
        font-weight: 900;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }
      .rentals-edit__errors {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }
      .rentals-edit__err {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.8rem;
        color: var(--danger, #ef4444);
      }
      .rentals-edit__form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        max-width: 720px;
      }
      .rentals-edit__section-title {
        margin: 0 0 0.75rem;
        font-size: 0.7rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        color: var(--text-muted);
      }
      .rentals-edit__grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }
      @media (max-width: 700px) {
        .rentals-edit__grid {
          grid-template-columns: 1fr;
        }
      }
      .rentals-edit__field {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }
      .rentals-edit__label {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.65rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        color: var(--text-muted);
      }
      .rentals-edit__date-input {
        padding: 0.5rem 0.75rem;
        border-radius: 8px;
        border: 1px solid var(--border-soft);
        background: var(--background);
        color: var(--text);
        font-size: 0.875rem;
      }
      .rentals-edit__textarea {
        width: 100%;
        padding: 0.5rem 0.75rem;
        border-radius: 8px;
        border: 1px solid var(--border-soft);
        background: var(--background);
        color: var(--text);
        font-family: inherit;
        font-size: 0.875rem;
        resize: vertical;
        min-height: 80px;
      }
      .rentals-edit__actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 0.5rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RentalsEditComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly rentalService = inject(RentalService);
  private readonly toast = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly isCreateMode = signal(false);
  readonly isHydrating = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly editingId = signal<string | null>(null);
  readonly formErrors = signal<string[]>([]);
  readonly isSaving = signal(false);

  formData: RentalFormData = {
    clientId: '',
    clientName: '',
    startDate: '',
    endDate: '',
    itemsCount: 0,
    totalAmount: 0,
    status: 'DRAFT',
    description: '',
    validUntil: '',
    notes: '',
  };

  ngOnInit(): void {
    const path = this.route.snapshot.routeConfig?.path;
    this.isCreateMode.set(path === 'new');

    if (path === 'new') {
      this.formData = {
        clientId: '',
        clientName: '',
        status: 'DRAFT',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        itemsCount: 0,
        totalAmount: 0,
        description: '',
        validUntil: '',
        notes: '',
      };
      return;
    }

    if (path === ':id/edit') {
      const id = this.route.snapshot.paramMap.get('id');
      if (!id) {
        void this.router.navigate(['/rentals']);
        return;
      }
      this.editingId.set(id);
      this.isHydrating.set(true);
      this.rentalService.getRental(id).subscribe({
        next: (r) => {
          this.isHydrating.set(false);
          if (!r) {
            this.loadError.set('Expediente no encontrado.');
            this.cdr.markForCheck();
            return;
          }
          this.formData = {
            ...r,
            description: '',
            validUntil: '',
            notes: '',
          };
          this.cdr.markForCheck();
        },
        error: () => {
          this.isHydrating.set(false);
          this.loadError.set('No se pudo cargar el expediente.');
          this.cdr.markForCheck();
        },
      });
    }
  }

  getMinDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  goToList(): void {
    void this.router.navigate(['/rentals']);
  }

  goBack(): void {
    if (this.isCreateMode()) {
      void this.router.navigate(['/rentals']);
      return;
    }
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      void this.router.navigate(['/rentals', id]);
    } else {
      void this.router.navigate(['/rentals']);
    }
  }

  save(): void {
    const errors: string[] = [];

    if (!this.formData.clientName?.trim()) {
      errors.push('El cliente es obligatorio');
    }

    if (this.formData.startDate && this.formData.endDate) {
      const startDate = new Date(this.formData.startDate);
      const endDate = new Date(this.formData.endDate);
      if (endDate <= startDate) {
        errors.push('La fecha de fin debe ser posterior a la fecha de inicio');
      }
    }

    if (this.formData.totalAmount !== undefined && this.formData.totalAmount < 0) {
      errors.push('El importe total no puede ser negativo');
    }

    if (
      this.formData.validUntil &&
      new Date(this.formData.validUntil) < new Date()
    ) {
      errors.push('La fecha de validez no puede ser anterior a hoy');
    }

    if (this.formData.description && this.formData.description.length > 500) {
      errors.push('La descripción no puede exceder 500 caracteres');
    }

    if (this.formData.notes && this.formData.notes.length > 1000) {
      errors.push('Las notas no pueden exceder 1000 caracteres');
    }

    if (errors.length > 0) {
      this.formErrors.set(errors);
      return;
    }

    this.formErrors.set([]);
    this.isSaving.set(true);

    const editId = this.editingId();
    if (editId) {
      this.rentalService.updateRental(editId, this.formData).subscribe({
        next: (upd) => {
          this.rentalService.upsertListCache(upd);
          this.isSaving.set(false);
          this.toast.show('Expediente actualizado correctamente', 'success');
          void this.router.navigate(['/rentals', upd.id]);
        },
        error: () => {
          this.isSaving.set(false);
          this.toast.show('Error al actualizar el expediente', 'error');
        },
      });
    } else {
      this.rentalService
        .createRental(this.formData as Omit<Rental, 'id' | 'createdAt'>)
        .subscribe({
          next: (newR) => {
            this.rentalService.upsertListCache(newR);
            this.isSaving.set(false);
            this.toast.show('Expediente creado correctamente', 'success');
            void this.router.navigate(['/rentals', newR.id]);
          },
          error: () => {
            this.isSaving.set(false);
            this.toast.show('Error al crear el expediente', 'error');
          },
        });
    }
  }
}
