import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ArrowLeft, Save, X } from 'lucide-angular';
import {
  UiButtonComponent,
  UiInputComponent,
  UiTextareaComponent,
  UiSelectComponent,
  UiCardComponent,
} from '@josanz-erp/shared-ui-kit';

interface ProjectForm {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  clientId: string;
}

@Component({
  selector: 'lib-projects-detail',
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
    <div class="page-container">
      <header class="page-header">
        <div class="header-actions">
          <ui-josanz-button
            variant="ghost"
            icon="arrow-left"
            (click)="goBack()"
          >
            Volver
          </ui-josanz-button>
        </div>
        <div class="header-content">
          <h1 class="page-title">
            {{ isNew ? 'Nuevo Proyecto' : 'Editar Proyecto' }}
          </h1>
        </div>
        <div class="header-actions">
          <ui-josanz-button variant="secondary" icon="x" (click)="goBack()">
            Cancelar
          </ui-josanz-button>
          <ui-josanz-button variant="primary" icon="save" (click)="save()">
            Guardar
          </ui-josanz-button>
        </div>
      </header>

      <div class="content-section">
        <ui-josanz-card>
          <div class="form-grid">
            <ui-josanz-input
              label="Nombre del Proyecto"
              [(ngModel)]="form.name"
              placeholder="Ingrese el nombre del proyecto"
              required
            >
            </ui-josanz-input>

            <ui-josanz-textarea
              label="Descripción"
              [(ngModel)]="form.description"
              placeholder="Descripción del proyecto"
              [rows]="4"
            >
            </ui-josanz-textarea>

            <ui-josanz-input
              label="Fecha de Inicio"
              type="date"
              [(ngModel)]="form.startDate"
            >
            </ui-josanz-input>

            <ui-josanz-input
              label="Fecha de Fin"
              type="date"
              [(ngModel)]="form.endDate"
            >
            </ui-josanz-input>

            <ui-josanz-select
              label="Cliente"
              [(ngModel)]="form.clientId"
              [options]="clientOptions"
            >
            </ui-josanz-select>
          </div>
        </ui-josanz-card>
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

      .header-actions {
        display: flex;
        gap: 0.5rem;
      }

      .content-section {
        background: white;
        border-radius: 0.5rem;
        box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
      }

      .form-grid {
        display: grid;
        gap: 1.5rem;
      }
    `,
  ],
})
export class ProjectsDetailComponent implements OnInit {
  readonly ArrowLeft = ArrowLeft;
  readonly Save = Save;
  readonly X = X;

  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isNew = false;
  projectId: string | null = null;

  form: ProjectForm = {
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    clientId: '',
  };

  clientOptions = [
    { value: '', label: 'Seleccionar cliente' },
    { value: 'client-1', label: 'Cliente Demo 1' },
    { value: 'client-2', label: 'Cliente Demo 2' },
  ];

  ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('id');
    this.isNew = this.projectId === 'new' || !this.projectId;

    if (!this.isNew && this.projectId) {
      this.loadProject(this.projectId);
    }
  }

  goBack() {
    this.router.navigate(['/projects']);
  }

  save() {
    // Implement save logic
    console.log('Saving project:', this.form);
    this.goBack();
  }

  private loadProject(id: string) {
    // Mock data for now
    this.form = {
      name: 'Proyecto Demo',
      description: 'Descripción del proyecto demo',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      clientId: 'client-1',
    };
  }
}
