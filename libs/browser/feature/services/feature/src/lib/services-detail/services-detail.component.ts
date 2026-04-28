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
import { PluginStore, ThemeService, ToastService } from '@josanz-erp/shared-data-access';

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
    <ui-feature-page-shell
      [variant]="'widthOnly'"
      [fadeIn]="true"
      [extraClass]="
        'services-detail-page' + (pluginStore.highPerformanceMode() ? ' perf-optimized' : '')
      "
    >
      <div class="services-detail__stack">
        <header class="page-header" [style.border-bottom-color]="currentTheme().primary + '33'">
          <div class="header-actions">
            <ui-button
              variant="ghost"
              icon="arrow-left"
              (clicked)="goBack()"
              [aria-label]="'Volver al listado de servicios'"
            >
              Volver
            </ui-button>
          </div>
          <div class="header-breadcrumb">
            <h1 class="page-title text-uppercase glow-text">
              {{ isNew ? 'NUEVO SERVICIO' : 'EDITAR SERVICIO' }}
            </h1>
            <div class="breadcrumb">
              <span class="active" [style.color]="currentTheme().primary">CATÁLOGO</span>
              <span class="separator">/</span>
              <span>SERVICIOS</span>
            </div>
          </div>
          <div class="header-actions">
            <ui-button variant="secondary" icon="x" (clicked)="goBack()"> Cancelar </ui-button>
            <ui-button variant="primary" icon="save" (clicked)="onSave()"> Guardar </ui-button>
          </div>
        </header>

        <div class="content-section">
          <ui-card shape="auto" class="form-card">
            <div class="card-section">
              <div class="section-info">
                <h3 class="section-title">Datos del servicio</h3>
                <p class="section-desc">Información usada en catálogo, presupuestos y ofertas.</p>
              </div>
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
            </div>
          </ui-card>
        </div>
      </div>
    </ui-feature-page-shell>
  `,
  styles: [
    `
      .services-detail__stack {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        width: 100%;
        max-width: var(--feature-page-max-width, 1400px);
        margin: 0 auto;
        padding: 0 var(--feature-page-padding, 1.5rem) 2rem;
        box-sizing: border-box;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0;
        padding: 1.5rem 0 1.25rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        position: relative;
        flex-wrap: wrap;
        gap: 1rem;
      }

      .header-breadcrumb {
        flex: 1;
        min-width: 12rem;
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
        background-clip: text;
      }

      .breadcrumb {
        display: flex;
        gap: 0.75rem;
        font-size: 0.7rem;
        font-weight: 800;
        letter-spacing: 0.12em;
        color: var(--text-muted);
        margin-top: 0.35rem;
        text-transform: uppercase;
      }

      .breadcrumb .active {
        opacity: 1;
      }

      .separator {
        opacity: 0.5;
      }

      .header-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        align-items: center;
      }

      .content-section {
        /* Sin caja clara flotante: el surface lo aporta ui-card. */
        background: transparent;
      }

      .form-card {
        padding: 0;
        border-radius: var(--radius-md, 10px);
        overflow: hidden;
      }

      .card-section {
        padding: 1.75rem 2rem 2rem;
        display: grid;
        grid-template-columns: 260px 1fr;
        gap: 2.5rem;
        align-items: start;
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

      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.25rem 1.5rem;
      }

      .form-grid ui-textarea {
        grid-column: 1 / -1;
      }

      @media (max-width: 920px) {
        .card-section {
          grid-template-columns: 1fr;
          gap: 1.5rem;
          padding: 1.25rem 1.25rem 1.5rem;
        }

        .form-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class ServicesDetailComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  readonly themeService = inject(ThemeService);
  readonly pluginStore = inject(PluginStore);

  readonly currentTheme = this.themeService.currentThemeData;

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
    void this.router.navigate(['/services']);
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
