import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
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
  UiLoaderComponent,
  UiBadgeComponent,
  UiFeaturePageShellComponent,
} from '@josanz-erp/shared-ui-kit';
import { ThemeService, PluginStore, ToastService } from '@josanz-erp/shared-data-access';
import { ClientService } from '@josanz-erp/clients-data-access';
import { Project, ProjectService, ProjectsFacade } from '@josanz-erp/projects-data-access';

interface ProjectForm {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  clientId: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
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
    UiLoaderComponent,
    UiBadgeComponent,
    LucideAngularModule,
    UiFeaturePageShellComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ui-feature-page-shell
      [variant]="'widthOnly'"
      [fadeIn]="true"
      [extraClass]="pluginStore.highPerformanceMode() ? 'perf-optimized' : ''"
    >
      <div class="projects-detail__stack">
      @if (!isNew && isLoading()) {
        <div class="page-loading">
          <ui-loader message="Cargando proyecto…"></ui-loader>
        </div>
      } @else if (!isNew && loadError()) {
        <div class="page-error">
          <lucide-icon name="alert-circle" size="48" class="page-error-icon" aria-hidden="true"></lucide-icon>
          <p>{{ loadError() }}</p>
          <div class="page-error-actions">
            <ui-button variant="solid" (clicked)="reload()">Reintentar</ui-button>
            <ui-button variant="ghost" (clicked)="goBack()">Volver al listado</ui-button>
          </div>
        </div>
      } @else {
        <header class="page-header" [style.border-bottom-color]="currentTheme().primary + '33'">
          <div class="header-actions">
            <ui-button
              variant="ghost"
              icon="arrow-left"
              (clicked)="goBack()"
              [aria-label]="'Volver al listado de proyectos'"
            >
              Volver
            </ui-button>
          </div>
          <div class="header-breadcrumb">
            <h1 class="page-title text-uppercase glow-text">{{ pageTitle() }}</h1>
            <div class="breadcrumb">
              <span class="active" [style.color]="currentTheme().primary">GESTIÓN OPERATIVA</span>
              <span class="separator">/</span>
              <span>PROYECTOS</span>
            </div>
          </div>
          <div class="header-actions">
            @if (isViewMode()) {
              <ui-button variant="primary" icon="pencil" (clicked)="goEdit()">Editar</ui-button>
            } @else {
              <ui-button
                variant="secondary"
                icon="x"
                (clicked)="goBack()"
                [aria-label]="'Cancelar edición y volver al listado de proyectos'"
              >
                Cancelar
              </ui-button>
              <ui-button variant="primary" icon="save" [disabled]="saving()" (clicked)="save()">
                {{ saving() ? 'Guardando…' : 'Guardar' }}
              </ui-button>
            }
          </div>
        </header>

        <div class="content-section">
          @if (isViewMode() && loadedProject(); as p) {
            <ui-card shape="auto" class="form-card">
              <div class="view-grid">
                <div class="view-block">
                  <span class="view-label">Nombre</span>
                  <p class="view-value">{{ p.name }}</p>
                </div>
                <div class="view-block span-2">
                  <span class="view-label">Descripción</span>
                  <p class="view-value">{{ p.description || '—' }}</p>
                </div>
                <div class="view-block">
                  <span class="view-label">Estado</span>
                  <ui-badge [variant]="statusVariant(p.status)">{{ p.status }}</ui-badge>
                </div>
                <div class="view-block">
                  <span class="view-label">Cliente</span>
                  <p class="view-value">{{ resolveClientLabel(p) }}</p>
                </div>
                <div class="view-block">
                  <span class="view-label">Inicio</span>
                  <p class="view-value">{{ p.startDate || '—' }}</p>
                </div>
                <div class="view-block">
                  <span class="view-label">Fin</span>
                  <p class="view-value">{{ p.endDate || '—' }}</p>
                </div>
              </div>
            </ui-card>
          } @else {
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
                    name="projName"
                    placeholder="Ej: Revestimiento Fachada Josanz"
                    icon="briefcase"
                    [attr.readonly]="isViewMode() ? true : null"
                  >
                  </ui-input>

                  <ui-textarea
                    label="Descripción Detallada"
                    [(ngModel)]="form.description"
                    name="projDesc"
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
                    name="startDate"
                  >
                  </ui-input>

                  <ui-input
                    label="Fecha de Fin Estimada"
                    type="date"
                    icon="calendar"
                    [(ngModel)]="form.endDate"
                    name="endDate"
                  >
                  </ui-input>

                  <ui-select
                    label="Estado"
                    icon="activity"
                    [(ngModel)]="form.status"
                    name="status"
                    [options]="statusOptions"
                  >
                  </ui-select>

                  <ui-select
                    label="Cliente Asociado"
                    icon="users"
                    [(ngModel)]="form.clientId"
                    name="clientId"
                    [options]="clientOptions()"
                  >
                  </ui-select>
                </div>
              </div>
            </ui-card>
          }
        </div>
      }
      </div>
    </ui-feature-page-shell>
  `,
  styles: [
    `
      .projects-detail__stack {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        width: 100%;
      }

      .page-loading,
      .page-error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 4rem 1.5rem;
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

      .view-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.25rem 2rem;
        padding: 2rem;
      }
      .view-grid .span-2 {
        grid-column: 1 / -1;
      }
      .view-label {
        font-size: 0.65rem;
        font-weight: 800;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--text-muted);
        display: block;
        margin-bottom: 0.35rem;
      }
      .view-value {
        margin: 0;
        font-size: 0.95rem;
        color: var(--text-primary);
        line-height: 1.45;
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
        .view-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class ProjectsDetailComponent implements OnInit {
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly projectService = inject(ProjectService);
  private readonly projectsFacade = inject(ProjectsFacade);
  private readonly clientService = inject(ClientService);

  /** Clientes del tenant para el desplegable (ordenados por nombre). */
  private readonly clientsForSelect = signal<{ id: string; name: string }[]>([]);

  /** Opciones para `ui-select`: vacío + clientes reales del API. */
  readonly clientOptions = computed(() => {
    const rows = this.clientsForSelect();
    return [
      { value: '', label: 'Sin cliente asignado' },
      ...rows.map((c) => ({ value: c.id, label: c.name })),
    ];
  });

  currentTheme = this.themeService.currentThemeData;

  isNew = false;
  projectId: string | null = null;
  isLoading = signal(false);
  loadError = signal<string | null>(null);
  saving = signal(false);
  loadedProject = signal<Project | null>(null);

  /** Ruta /projects/:id sin /edit → solo lectura. */
  isViewMode = computed(() => {
    if (this.isNew || !this.projectId) {
      return false;
    }
    return !this.router.url.includes('/edit');
  });

  pageTitle = computed(() => {
    if (this.isNew) {
      return 'NUEVO PROYECTO';
    }
    if (this.isViewMode()) {
      return 'PROYECTO';
    }
    return 'EDITAR PROYECTO';
  });

  form: ProjectForm = {
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    clientId: '',
    status: 'ACTIVE',
  };

  statusOptions = [
    { value: 'ACTIVE', label: 'Activo' },
    { value: 'COMPLETED', label: 'Completado' },
    { value: 'CANCELLED', label: 'Cancelado' },
  ];

  ngOnInit() {
    this.loadClientsForSelect();
    this.projectId = this.route.snapshot.paramMap.get('id');
    this.isNew = this.projectId === 'new' || !this.projectId;

    this.projectsFacade.loadProjects(false);

    if (!this.isNew && this.projectId) {
      this.loadProject(this.projectId);
    }
  }

  private loadClientsForSelect(): void {
    this.clientService.getClients().subscribe({
      next: (list) => {
        const sorted = [...(list ?? [])].sort((a, b) =>
          a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }),
        );
        this.clientsForSelect.set(sorted.map((c) => ({ id: c.id, name: c.name })));
      },
      error: () => {
        this.clientsForSelect.set([]);
      },
    });
  }

  reload(): void {
    if (this.projectId) {
      this.loadProject(this.projectId);
    }
  }

  goBack(): void {
    void this.router.navigate(['/projects']);
  }

  goEdit(): void {
    if (this.projectId) {
      void this.router.navigate(['/projects', this.projectId, 'edit']);
    }
  }

  /** Nombre de cliente en vista lectura: API + resolución por lista cargada. */
  resolveClientLabel(p: Project): string {
    if (p.clientName?.trim()) {
      return p.clientName.trim();
    }
    const id = p.clientId;
    if (!id) {
      return '—';
    }
    return this.clientsForSelect().find((c) => c.id === id)?.name ?? '—';
  }

  statusVariant(s: Project['status']): 'success' | 'warning' | 'info' | 'danger' | 'secondary' {
    switch (s) {
      case 'ACTIVE':
        return 'success';
      case 'COMPLETED':
        return 'info';
      case 'CANCELLED':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  save(): void {
    if (!this.form.name?.trim()) {
      this.toast.show('El nombre del proyecto es obligatorio', 'error');
      return;
    }

    this.saving.set(true);

    const body: Omit<Project, 'id' | 'createdAt'> = {
      name: this.form.name.trim(),
      description: this.form.description?.trim() || undefined,
      status: this.form.status,
      startDate: this.form.startDate || undefined,
      endDate: this.form.endDate || undefined,
      clientId: this.form.clientId || undefined,
      clientName: undefined,
      notes: undefined,
    };

    if (this.isNew) {
      this.projectService.createProject(body).subscribe({
        next: (created) => {
          this.projectsFacade.patchProjectCache(created);
          this.toast.show('Proyecto creado correctamente', 'success');
          this.saving.set(false);
          void this.router.navigate(['/projects', created.id]);
        },
        error: () => {
          this.toast.show('No se pudo crear el proyecto', 'error');
          this.saving.set(false);
        },
      });
      return;
    }

    if (!this.projectId) {
      this.saving.set(false);
      return;
    }

    this.projectService.updateProject(this.projectId, body).subscribe({
      next: (updated) => {
        this.projectsFacade.patchProjectCache(updated);
        this.loadedProject.set(updated);
        this.toast.show('Proyecto actualizado correctamente', 'success');
        this.saving.set(false);
        const pid = this.projectId;
        if (pid) {
          void this.router.navigate(['/projects', pid]);
        }
      },
      error: () => {
        this.toast.show('No se pudo guardar el proyecto', 'error');
        this.saving.set(false);
      },
    });
  }

  private loadProject(id: string): void {
    this.loadError.set(null);

    const cached = this.projectsFacade.findProjectInCache(id);
    if (cached) {
      this.applyProjectToView(cached);
      this.isLoading.set(false);
    } else {
      this.isLoading.set(true);
    }

    this.projectService.getProject(id).subscribe({
      next: (c) => {
        if (c) {
          this.projectsFacade.patchProjectCache(c);
          this.applyProjectToView(c);
          this.loadError.set(null);
        } else if (!cached) {
          this.loadError.set('No se encontró el proyecto.');
        }
        this.isLoading.set(false);
      },
      error: () => {
        if (!cached) {
          this.loadError.set('No se pudo cargar el proyecto.');
        }
        this.isLoading.set(false);
      },
    });
  }

  private applyProjectToView(c: Project): void {
    this.loadedProject.set(c);
    this.form = {
      name: c.name || '',
      description: c.description || '',
      startDate: c.startDate || '',
      endDate: c.endDate || '',
      clientId: c.clientId || '',
      status: c.status,
    };
  }
}
