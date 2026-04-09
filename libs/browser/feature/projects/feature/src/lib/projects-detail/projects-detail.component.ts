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
          <ui-button
            variant="ghost"
            icon="arrow-left"
            (click)="goBack()"
          >
            Volver
          </ui-button>
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
          <ui-button variant="secondary" icon="x" (click)="goBack()">
            Cancelar
          </ui-button>
          <ui-button variant="primary" icon="save" (click)="save()">
            Guardar
          </ui-button>
        </div>
      </header>

      <div class="content-section">
        <ui-card shape="auto" class="form-card">
          <div class="card-section">
            <div class="section-info">
              <h3 class="section-title">Información General</h3>
              <p class="section-desc">Detalles básicos para identificar y describir el proyecto.</p>
            </div>
            <div class="form-grid">
              <ui-input
                label="Nombre del Proyecto"
                [(ngModel)]="form.name"
                placeholder="Ej: Revestimiento Fachada Josanz"
                icon="briefcase"
                required
              >
              </ui-input>
  
              <ui-textarea
                label="Descripción Detallada"
                [(ngModel)]="form.description"
                placeholder="Describe los objetivos y alcance del proyecto..."
                [rows]="4"
              >
              </ui-textarea>
            </div>
          </div>

          <div class="section-divider"></div>

          <div class="card-section">
            <div class="section-info">
              <h3 class="section-title">Planificación y Cliente</h3>
              <p class="section-desc">Define los plazos temporales y el cliente asignado.</p>
            </div>
            <div class="form-grid grid-2">
              <ui-input
                label="Fecha de Inicio"
                type="date"
                icon="calendar"
                [(ngModel)]="form.startDate"
              >
              </ui-input>
  
              <ui-input
                label="Fecha de Fin Estimada"
                type="date"
                icon="calendar"
                [(ngModel)]="form.endDate"
              >
              </ui-input>
  
              <ui-select
                label="Cliente Asociado"
                icon="users"
                [(ngModel)]="form.clientId"
                [options]="clientOptions"
              >
              </ui-select>
            </div>
          </div>
        </ui-card>
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
        align-items: center;
        margin-bottom: 2.5rem;
        padding: 2rem 0 1.5rem 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        position: relative;
      }

      .header-breadcrumb {
        flex: 1;
      }

      .page-title {
        margin: 0 0 0.5rem 0;
        font-size: 1.75rem;
        font-weight: 900;
        letter-spacing: 0.04em;
        font-family: var(--font-display);
        background: linear-gradient(135deg, var(--text-primary) 0%, var(--primary) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .breadcrumb {
        display: flex;
        gap: 0.75rem;
        font-size: 0.7rem;
        font-weight: 800;
        letter-spacing: 0.12em;
        color: var(--text-muted);
        margin-top: 0.5rem;
        text-transform: uppercase;
      }

      .separator {
        opacity: 0.5;
      }

      .header-actions {
        display: flex;
        gap: 0.75rem;
      }

      .form-card {
        padding: 0;
      }

      .card-section {
        padding: 2rem;
        display: grid;
        grid-template-columns: 280px 1fr;
        gap: 3rem;
      }

      .section-info {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .section-title {
        font-size: 0.9rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--text-primary);
        margin: 0;
      }

      .section-desc {
        font-size: 0.75rem;
        color: var(--text-muted);
        line-height: 1.5;
        margin: 0;
      }

      .section-divider {
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--border-soft), transparent);
        opacity: 0.5;
      }

      .form-grid {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
      }

      @media (max-width: 992px) {
        .card-section {
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
      }
    `,
  ],
})
export class ProjectsDetailComponent implements OnInit {
  readonly ArrowLeft = ArrowLeft;
  readonly Save = Save;
  readonly X = X;

  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);

  currentTheme = this.themeService.currentThemeData;

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
    // Mock data for now using the ID
    console.log('Loading project:', id);
    this.form = {
      name: `Proyecto ${id}`,
      description: 'Descripción del proyecto cargado desde el sistema.',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      clientId: 'client-1',
    };
  }
}
