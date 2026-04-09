import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import {
  UiButtonComponent,
  UiInputComponent,
  UiSelectComponent,
  UiCardComponent,
  UiLoaderComponent,
} from '@josanz-erp/shared-ui-kit';
import { Vehicle, VehicleService } from '@josanz-erp/fleet-data-access';
import { ThemeService, PluginStore, ToastService } from '@josanz-erp/shared-data-access';

@Component({
  selector: 'lib-fleet-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    UiButtonComponent,
    UiInputComponent,
    UiSelectComponent,
    UiCardComponent,
    UiLoaderComponent,
  ],
  template: `
    <div
      class="page-container animate-fade-in"
      [class.high-perf]="pluginStore.highPerformanceMode()"
    >
      @if (isLoading()) {
        <ui-loader message="Cargando ficha de unidad..."></ui-loader>
      } @else if (loadError()) {
        <div class="error-state">
          <lucide-icon name="alert-triangle" size="48" [style.color]="currentTheme().primary"></lucide-icon>
          <h2>UNIDAD NO ENCONTRADA</h2>
          <ui-button variant="primary" (clicked)="goToList()">VOLVER A FLOTA</ui-button>
        </div>
      } @else {
        <header class="page-header" [style.border-bottom-color]="currentTheme().primary + '33'">
          <div class="header-actions">
            <ui-button variant="ghost" icon="arrow-left" (clicked)="goBack()">Volver</ui-button>
          </div>
          <div class="header-breadcrumb">
            <h1 class="page-title text-uppercase glow-text">Editar unidad</h1>
            <div class="breadcrumb">
              <span class="active" [style.color]="currentTheme().primary">FLOTA</span>
              <span class="separator">/</span>
              <span>{{ form.plate || '—' }}</span>
            </div>
          </div>
          <div class="header-actions">
            <ui-button variant="secondary" icon="x" (clicked)="goBack()">Cancelar</ui-button>
            <ui-button variant="primary" icon="save" (clicked)="save()">Guardar</ui-button>
          </div>
        </header>

        <ui-card variant="glass" title="Datos de la unidad">
          <div class="form-grid">
            <ui-input label="Matrícula" [(ngModel)]="form.plate" icon="hash" />
            <div class="row-2">
              <ui-input label="Marca" [(ngModel)]="form.brand" icon="car" />
              <ui-input label="Modelo" [(ngModel)]="form.model" icon="box" />
            </div>
            <div class="row-2">
              <ui-input label="Año" type="number" [(ngModel)]="form.year" icon="calendar" />
              <ui-select
                label="Tipo"
                [(ngModel)]="form.type"
                [options]="typeOptions"
                icon="truck"
              />
            </div>
            <div class="row-2">
              <ui-select
                label="Estado operativo"
                [(ngModel)]="form.status"
                [options]="statusOptions"
                icon="activity"
              />
              <ui-input
                label="Kilometraje"
                type="number"
                [(ngModel)]="form.mileage"
                icon="gauge"
              />
            </div>
            <div class="row-2">
              <ui-input label="Capacidad (kg)" type="number" [(ngModel)]="form.capacity" icon="package" />
              <ui-input label="Conductor actual" [(ngModel)]="form.currentDriver" icon="user" />
            </div>
            <div class="row-2">
              <ui-input label="Seguro hasta" type="date" [(ngModel)]="form.insuranceExpiry" icon="shield" />
              <ui-input label="ITV hasta" type="date" [(ngModel)]="form.itvExpiry" icon="check-square" />
            </div>
          </div>
        </ui-card>
      }
    </div>
  `,
  styles: [
    `
      .page-container {
        padding: 0;
        max-width: 960px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        padding-bottom: 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        flex-wrap: wrap;
        gap: 1rem;
      }
      .header-breadcrumb {
        flex: 1;
        min-width: 200px;
      }
      .glow-text {
        font-size: 1.4rem;
        font-weight: 900;
        color: #fff;
        margin: 0 0 0.35rem 0;
        letter-spacing: 0.05em;
        font-family: var(--font-main);
      }
      .breadcrumb {
        display: flex;
        gap: 8px;
        font-size: 0.6rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        color: var(--text-muted);
      }
      .separator {
        opacity: 0.5;
      }
      .header-actions {
        display: flex;
        gap: 0.75rem;
        align-items: center;
      }
      .form-grid {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        padding: 0.5rem 0;
      }
      .row-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }
      .error-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 360px;
        gap: 1.25rem;
        text-align: center;
      }
      @media (max-width: 640px) {
        .row-2 {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FleetEditComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly vehicleService = inject(VehicleService);
  private readonly toast = inject(ToastService);

  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);

  currentTheme = this.themeService.currentThemeData;

  isLoading = signal(true);
  loadError = signal(false);
  private vehicleId = '';

  form: Partial<Vehicle> = {
    plate: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    type: 'van',
    status: 'available',
    mileage: 0,
    capacity: 0,
    currentDriver: '',
    insuranceExpiry: '',
    itvExpiry: '',
  };

  typeOptions = [
    { value: 'van', label: 'Furgón' },
    { value: 'truck', label: 'Camión' },
    { value: 'car', label: 'Turismo' },
  ];

  statusOptions = [
    { value: 'available', label: 'Disponible' },
    { value: 'in_use', label: 'En ruta' },
    { value: 'maintenance', label: 'Mantenimiento' },
  ];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loadError.set(true);
      this.isLoading.set(false);
      return;
    }
    this.vehicleId = id;
    this.vehicleService.getVehicle(id).subscribe({
      next: (v) => {
        if (v) {
          this.patchForm(v);
          this.loadError.set(false);
          this.isLoading.set(false);
        } else {
          this.fallbackFromList(id);
        }
      },
      error: () => this.fallbackFromList(id),
    });
  }

  private fallbackFromList(id: string) {
    this.vehicleService.getVehicles().subscribe({
      next: (list) => {
        const v = list.find((item) => item.id === id);
        if (v) {
          this.patchForm(v);
          this.loadError.set(false);
        } else {
          this.loadError.set(true);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  private patchForm(v: Vehicle) {
    this.form = {
      plate: v.plate,
      brand: v.brand,
      model: v.model,
      year: v.year,
      type: v.type,
      status: v.status,
      mileage: v.mileage ?? 0,
      capacity: v.capacity ?? 0,
      currentDriver: v.currentDriver ?? '',
      insuranceExpiry: v.insuranceExpiry,
      itvExpiry: v.itvExpiry,
    };
  }

  goBack() {
    if (this.vehicleId) {
      this.router.navigate(['/fleet', this.vehicleId]);
      return;
    }
    this.goToList();
  }

  goToList() {
    this.router.navigate(['/fleet']);
  }

  save() {
    const plate = this.form.plate?.trim();
    if (!plate) {
      this.toast.show('La matrícula es obligatoria', 'error');
      return;
    }
    const payload: Partial<Vehicle> = {
      ...this.form,
      plate,
      brand: (this.form.brand ?? '').trim(),
      model: (this.form.model ?? '').trim(),
      year: Math.floor(Number(this.form.year ?? 0)) || new Date().getFullYear(),
      type: this.form.type ?? 'van',
      status: this.form.status ?? 'available',
      mileage: Math.max(0, Number(this.form.mileage ?? 0)),
      capacity: Math.max(0, Number(this.form.capacity ?? 0)),
      currentDriver: (this.form.currentDriver ?? '').trim() || undefined,
      insuranceExpiry: this.form.insuranceExpiry ?? '',
      itvExpiry: this.form.itvExpiry ?? '',
    };

    this.vehicleService.updateVehicle(this.vehicleId, payload).subscribe({
      next: () => {
        this.toast.show('Unidad actualizada correctamente', 'success');
        this.router.navigate(['/fleet', this.vehicleId]);
      },
      error: () => {
        this.toast.show('No se pudo guardar. Revisa la conexión o los datos.', 'error');
      },
    });
  }
}
