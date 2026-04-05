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
import { ThemeService, PluginStore } from '@josanz-erp/shared-data-access';

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
    <div class="page-container animate-fade-in" [class.perf-optimized]="pluginStore.highPerformanceMode()">
      <header class="page-header" [style.border-bottom-color]="currentTheme().primary + '33'">
        <div class="header-actions">
          <ui-josanz-button
            variant="ghost"
            icon="arrow-left"
            (click)="goBack()"
          >
            Volver
          </ui-josanz-button>
        </div>
        <div class="header-breadcrumb">
          <h1 class="page-title text-uppercase glow-text">
            {{ isNew ? 'Nuevo Proyecto' : 'Editar Proyecto' }}
          </h1>
          <div class="breadcrumb">
            <span class="active" [style.color]="currentTheme().primary">GESTIÓN OPERATIVA</span>
            <span class="separator">/</span>
            <span>PROYECTOS</span>
          </div>
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
        <ui-josanz-card variant="glass">
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
        padding: 0;
        max-width: 100%;
        margin: 0 auto;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }

      .header-breadcrumb {
        flex: 1;
      }

      .page-title {
        margin: 0 0 0.5rem 0;
        font-size: 2.25rem;
        font-weight: 700;
        letter-spacing: 0.025em;
      }

      .breadcrumb {
        display: flex;
        gap: 0.5rem;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        color: var(--text-muted);
        margin-top: 0.5rem;
      }

      .separator {
        opacity: 0.5;
      }

      .header-actions {
        display: flex;
        gap: 0.5rem;
      }

      .content-section {
        background: transparent;
      }

      .form-grid {
        display: grid;
        gap: 1.5rem;
      }

      .glow-text {
        text-transform: uppercase;
        font-size: 1.6rem;
        font-weight: 800;
        margin: 0;
      }
    `,
  ],
})
export class ProjectsDetailComponent implements OnInit {
  readonly ArrowLeft = ArrowLeft;
  readonly Save = Save;
  readonly X = X;
  readonly pluginStore = inject(PluginStore);
  readonly currentTheme = inject(ThemeService).currentTheme;

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
