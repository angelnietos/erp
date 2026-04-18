import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import {
  UiButtonComponent,
  UiInputComponent,
  UiTextareaComponent,
  UiSelectComponent,
  UiCardComponent,
  UiFeaturePageShellComponent,
} from '@josanz-erp/shared-ui-kit';
import { ToastService } from '@josanz-erp/shared-data-access';

interface ServiceForm {
  name: string;
  description: string;
  type: string;
  basePrice: number;
  hourlyRate: number;
}

@Component({
  selector: 'lib-services-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UiButtonComponent,
    UiInputComponent,
    UiTextareaComponent,
    UiSelectComponent,
    UiCardComponent,
    LucideAngularModule,
    UiFeaturePageShellComponent,
  ],
  template: `
    <ui-feature-page-shell [variant]="'widthOnly'" [fadeIn]="true">
    <div class="services-detail__inner">
      <header class="page-header">
        <div class="header-actions">
          <ui-button
            variant="ghost"
            icon="arrow-left"
            (click)="goBack()"
          >
            Volver
          </ui-button>
        </div>
        <div class="header-content">
          <h1 class="page-title">
            {{ isNew ? 'Nuevo Servicio' : 'Editar Servicio' }}
          </h1>
        </div>
        <div class="header-actions">
          <ui-button variant="secondary" icon="x" (click)="goBack()">
            Cancelar
          </ui-button>
          <ui-button variant="primary" icon="save" (click)="onSave()">
            Guardar
          </ui-button>
        </div>
      </header>

      <div class="content-section">
        <ui-card>
          <form class="form-grid">
            <ui-input
              label="Nombre"
              [(ngModel)]="form.name"
              name="name"
              required
            />

            <ui-textarea
              label="Descripción"
              [(ngModel)]="form.description"
              name="description"
            />

            <ui-select
              label="Tipo de Servicio"
              [(ngModel)]="form.type"
              name="type"
              [options]="serviceTypes"
              required
            />

            <ui-input
              label="Precio Base (€)"
              type="number"
              [(ngModel)]="form.basePrice"
              name="basePrice"
              required
            />

            <ui-input
              label="Tarifa Horaria (€)"
              type="number"
              [(ngModel)]="form.hourlyRate"
              name="hourlyRate"
            />
          </form>
        </ui-card>
      </div>
    </div>
    </ui-feature-page-shell>
  `,
  styles: [
    `
      .services-detail__inner {
        padding: 1.5rem;
        max-width: 800px;
        margin: 0 auto;
        width: 100%;
        box-sizing: border-box;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #e5e7eb;
      }

      .header-content h1 {
        margin: 0;
        font-size: 2rem;
        font-weight: 600;
        color: #111827;
      }

      .content-section {
        background: white;
        border-radius: 0.5rem;
        box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
      }

      .form-grid {
        display: grid;
        gap: 1.5rem;
        grid-template-columns: 1fr 1fr;
      }

      .form-grid ui-textarea {
        grid-column: 1 / -1;
      }
    `,
  ],
})
export class ServicesDetailComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  isNew = false;
  form: ServiceForm = {
    name: '',
    description: '',
    type: '',
    basePrice: 0,
    hourlyRate: 0,
  };

  serviceTypes = [
    { label: 'Streaming', value: 'STREAMING' },
    { label: 'Producción', value: 'PRODUCCIÓN' },
    { label: 'LED', value: 'LED' },
    { label: 'Transporte', value: 'TRANSPORTE' },
    { label: 'Personal Técnico', value: 'PERSONAL_TÉCNICO' },
    { label: 'Video Técnico', value: 'VIDEO_TÉCNICO' },
  ];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.isNew = id === 'new' || !id;
    if (!this.isNew && id) {
      this.loadService(id);
    }
  }

  goBack() {
    this.router.navigate(['/services']);
  }

  onSave() {
    const name = this.form.name?.trim();
    if (!name) {
      this.toast.show('El nombre del servicio es obligatorio', 'error');
      return;
    }
    if (!this.form.type) {
      this.toast.show('Selecciona un tipo de servicio', 'error');
      return;
    }
    if (this.form.basePrice == null || this.form.basePrice < 0) {
      this.toast.show('Indica un precio base válido (≥ 0)', 'error');
      return;
    }
    this.toast.show(
      this.isNew ? 'Servicio creado correctamente' : 'Servicio actualizado correctamente',
      'success',
    );
    this.goBack();
  }

  private loadService(id: string) {
    this.form = {
      name: `Servicio ${id}`,
      description: 'Transmisión en vivo básica',
      type: 'STREAMING',
      basePrice: 500,
      hourlyRate: 50,
    };
  }
}
