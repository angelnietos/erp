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
} from '@josanz-erp/shared-ui-kit';

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
  ],
  template: `
    <div class="page-container page-container--skip-horizontal-inset">
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
  `,
  styles: [
    `
      .page-container {
        padding: 1.5rem;
        max-width: 800px;
        margin: 0 auto;
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
    this.isNew = id === 'new';
    if (!this.isNew) {
      // Load service data
      this.loadService(id!);
    }
  }

  goBack() {
    this.router.navigate(['/services']);
  }

  onSave() {
    // Implement save logic
    console.log('Save service:', this.form);
    this.goBack();
  }

  private loadService(id: string) {
    // Mock data for now
    this.form = {
      name: 'Servicio de Streaming Básico',
      description: 'Transmisión en vivo básica',
      type: 'STREAMING',
      basePrice: 500,
      hourlyRate: 50,
    };
  }
}
