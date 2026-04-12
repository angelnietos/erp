import {
  Component,
  OnInit,
  signal,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import {
  UiCardComponent,
  UiButtonComponent,
  UiBadgeComponent,
  UiLoaderComponent,
  UiStatCardComponent,
} from '@josanz-erp/shared-ui-kit';
import { ThemeService, PluginStore } from '@josanz-erp/shared-data-access';
import { VehicleService, Vehicle } from '@josanz-erp/fleet-data-access';
import { openPrintableDocument } from '@josanz-erp/shared-utils';

@Component({
  selector: 'lib-fleet-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    UiCardComponent,
    UiButtonComponent,
    UiBadgeComponent,
    UiLoaderComponent,
    UiStatCardComponent,
  ],
  template: `
    <div
      class="page-container animate-fade-in"
      [class.high-perf]="pluginStore.highPerformanceMode()"
    >
      @if (isLoading()) {
        <ui-loader message="Sincronizando unidad móvil..."></ui-loader>
      } @else if (vehicle()) {
        <header
          class="page-header"
          [style.border-bottom-color]="currentTheme().primary + '33'"
        >
          <div class="header-breadcrumb">
            <button class="back-btn" routerLink="/fleet">
              <lucide-icon name="arrow-left" size="14"></lucide-icon>
              VOLVER A LOGÍSTICA
            </button>
            <h1
              class="page-title text-uppercase glow-text"
              [style.text-shadow]="'0 0 20px ' + currentTheme().primary + '44'"
            >
              {{ vehicle()?.brand }} {{ vehicle()?.model }}
            </h1>
            <div class="breadcrumb">
              <span class="active" [style.color]="currentTheme().primary"
                >MATRÍCULA: {{ vehicle()?.plate }}</span
              >
              <span class="separator">/</span>
              <span>ESTADO: {{ getStatusLabel(vehicle()?.status) }}</span>
            </div>
          </div>
          <div class="header-actions">
            <ui-button
              variant="glass"
              size="md"
              icon="wrench"
              (click)="onMaintenance()"
              >MANTENIMIENTO</ui-button
            >
            <ui-button
              variant="primary"
              size="md"
              icon="map-pin"
              (click)="onActiveRoutes()"
              >RUTAS ACTIVAS</ui-button
            >
          </div>
        </header>

        <div class="stats-row">
          <ui-stat-card
            label="Kilometraje Total"
            [value]="vehicle()?.mileage?.toLocaleString() + ' KM'"
            icon="gauge"
            [accent]="true"
          >
          </ui-stat-card>
          <ui-stat-card
            label="ITV Vence"
            [value]="formatDate(vehicle()?.itvExpiry)"
            icon="calendar-check"
            [trend]="isExpired(vehicle()?.itvExpiry) ? -1 : 1"
          >
          </ui-stat-card>
          <ui-stat-card
            label="Conductor Actual"
            [value]="vehicle()?.currentDriver || 'SIN ASIGNAR'"
            icon="user-check"
          >
          </ui-stat-card>
        </div>

        <div class="content-grid">
          <div class="main-column">
            <ui-card variant="glass" title="Especificaciones del Vehículo">
              <div class="spec-grid">
                <div class="spec-item">
                  <span class="label">TIPO UNIDAD</span>
                  <ui-badge variant="info">{{
                    vehicle()?.type | uppercase
                  }}</ui-badge>
                </div>
                <div class="spec-item">
                  <span class="label">CAPACIDAD CARGA</span>
                  <span class="value">{{ vehicle()?.capacity }} KG</span>
                </div>
                <div class="spec-item">
                  <span class="label">AÑO MATRÍCULA</span>
                  <span class="value">{{ vehicle()?.year }}</span>
                </div>
                <div class="spec-item">
                  <span class="label">SEGURO VIGENTE</span>
                  <span class="value">{{
                    formatDate(vehicle()?.insuranceExpiry)
                  }}</span>
                </div>
              </div>
            </ui-card>

            <ui-card variant="glass" title="Historial de Movimientos">
              <p class="empty-text text-friendly">
                No hay movimientos operativos registrados en las últimas 24h.
              </p>
            </ui-card>
          </div>

          <div class="side-column">
            <ui-card variant="glass" title="Monitor de Estado">
              <div class="status-monitor">
                <div class="status-indicator" [class]="vehicle()?.status"></div>
                <div class="status-details">
                  <span class="status-text">{{
                    getStatusLabel(vehicle()?.status)
                  }}</span>
                  <span class="status-subtext">Actualizado: hace 12 min</span>
                </div>
              </div>
            </ui-card>

            <ui-card variant="glass" title="Documentación Digital">
              <div class="doc-list">
                <button
                  type="button"
                  class="doc-item"
                  (click)="downloadTechnicalSheet()"
                >
                  <lucide-icon name="file-text" size="16"></lucide-icon>
                  <span>FICHA TÉCNICA.PDF</span>
                </button>
                <button
                  type="button"
                  class="doc-item"
                  (click)="downloadInsurancePolicy()"
                >
                  <lucide-icon name="shield-check" size="16"></lucide-icon>
                  <span>PÓLIZA SEGURO.PDF</span>
                </button>
              </div>
            </ui-card>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .page-container {
        padding: 0;
        max-width: 100%;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .back-btn {
        background: none;
        border: none;
        color: var(--text-muted);
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.6rem;
        font-weight: 800;
        cursor: pointer;
        padding: 0;
        margin-bottom: 0.5rem;
        transition: color 0.3s;
      }
      .back-btn:hover {
        color: #fff;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        padding-bottom: 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }

      .glow-text {
        font-size: 1.6rem;
        font-weight: 900;
        color: #fff;
        margin: 0;
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
        margin-top: 0.5rem;
      }

      .stats-row {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .content-grid {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 1.5rem;
      }
      .main-column,
      .side-column {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .spec-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
        padding: 0.5rem 0;
      }
      .spec-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        padding-bottom: 0.5rem;
      }
      .spec-item .label {
        font-size: 0.55rem;
        font-weight: 700;
        color: var(--text-muted);
        letter-spacing: 0.1em;
      }
      .spec-item .value {
        font-size: 0.65rem;
        font-weight: 800;
        color: #fff;
      }

      .status-monitor {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.5rem 0;
      }
      .status-indicator {
        width: 12px;
        height: 12px;
        border-radius: 50%;
      }
      .status-indicator.available {
        background: var(--success);
        box-shadow: 0 0 10px var(--success-glow);
      }
      .status-indicator.in_use {
        background: var(--brand);
        box-shadow: 0 0 10px var(--brand-glow);
      }
      .status-indicator.maintenance {
        background: var(--warning);
        box-shadow: 0 0 10px var(--warning-glow);
      }
      .status-text {
        display: block;
        font-size: 0.8rem;
        font-weight: 900;
        color: #fff;
        text-transform: uppercase;
      }
      .status-subtext {
        font-size: 0.55rem;
        color: var(--text-muted);
      }

      .doc-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .doc-item {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        margin: 0;
        padding: 12px;
        background: rgba(255, 255, 255, 0.02);
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.05);
        font: inherit;
        font-size: 0.65rem;
        font-weight: 700;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.3s;
        user-select: none;
        text-align: left;
      }
      .doc-item:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #fff;
        border-color: var(--brand);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      .doc-item:active {
        transform: translateY(0);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      .doc-item lucide-icon {
        color: var(--brand);
        transition: color 0.3s;
      }
      .doc-item:hover lucide-icon {
        color: #fff;
      }

      .empty-text {
        color: var(--text-muted);
        font-size: 0.75rem;
        text-align: center;
        padding: 1rem 0;
      }

      /* PDF Print Styles */
      @media print {
        .vehicle-header {
          margin-bottom: 2rem;
          text-align: center;
        }
        .vehicle-header h2 {
          color: #333;
          margin-bottom: 0.5rem;
        }
        .vehicle-header p {
          color: #666;
          margin: 0.25rem 0;
        }

        .specs-section {
          margin: 2rem 0;
        }
        .specs-section h3 {
          color: #333;
          border-bottom: 2px solid #333;
          padding-bottom: 0.5rem;
        }

        .spec-table {
          margin-top: 1rem;
        }
        .spec-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid #eee;
        }
        .spec-row .label {
          font-weight: bold;
          color: #333;
        }
        .spec-row .value {
          color: #666;
        }

        .insurance-header {
          margin-bottom: 2rem;
          text-align: center;
        }
        .insurance-header h2 {
          color: #333;
          margin-bottom: 0.5rem;
        }

        .policy-details {
          margin: 2rem 0;
        }
        .policy-details h3 {
          color: #333;
          border-bottom: 2px solid #333;
          padding-bottom: 0.5rem;
        }

        .coverage-list {
          margin-top: 1rem;
        }
        .coverage-item {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px solid #eee;
        }
        .coverage-type {
          font-weight: bold;
          color: #333;
        }
        .coverage-status {
          color: #28a745;
          font-weight: bold;
        }

        .validity-section {
          margin: 2rem 0;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
        }
        .validity-section h3 {
          color: #333;
          margin-bottom: 1rem;
        }

        .footer-note {
          margin-top: 3rem;
          padding-top: 1rem;
          border-top: 1px solid #dee2e6;
          text-align: center;
          color: #6c757d;
          font-size: 0.85rem;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FleetDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(VehicleService);
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);

  currentTheme = this.themeService.currentThemeData;
  vehicle = signal<Vehicle | null>(null);
  isLoading = signal(true);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      // Using real service with mock timeout
      setTimeout(() => {
        this.service.getVehicles().subscribe((list) => {
          const v = list.find((item) => item.id === id);
          this.vehicle.set(v || null);
          this.isLoading.set(false);
        });
      }, 500);
    }
  }

  onMaintenance() {
    const id = this.vehicle()?.id;
    if (id) this.router.navigate(['/fleet', id, 'edit']);
  }

  onActiveRoutes() {
    this.router.navigate(['/fleet'], { queryParams: { filter: 'in_use' } });
  }

  getStatusLabel(status: string | undefined): string {
    switch (status) {
      case 'available':
        return 'OPERATIVO';
      case 'in_use':
        return 'EN RUTA';
      case 'maintenance':
        return 'EN TALLER';
      default:
        return 'DESCONOCIDO';
    }
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES');
  }

  isExpired(date: string | undefined): boolean {
    if (!date) return false;
    return new Date(date) < new Date();
  }

  downloadTechnicalSheet(): void {
    const v = this.vehicle();
    if (!v) return;

    const body = `
      <h1>Ficha Técnica del Vehículo</h1>
      <div class="vehicle-header">
        <h2>${v.brand} ${v.model}</h2>
        <p><strong>Matrícula:</strong> ${v.plate}</p>
        <p><strong>Año:</strong> ${v.year}</p>
      </div>

      <div class="specs-section">
        <h3>Especificaciones Técnicas</h3>
        <div class="spec-table">
          <div class="spec-row"><span class="label">Tipo de Unidad:</span><span class="value">${v.type}</span></div>
          <div class="spec-row"><span class="label">Capacidad de Carga:</span><span class="value">${v.capacity} KG</span></div>
          <div class="spec-row"><span class="label">Kilometraje Total:</span><span class="value">${v.mileage?.toLocaleString()} KM</span></div>
          <div class="spec-row"><span class="label">Estado Actual:</span><span class="value">${this.getStatusLabel(v.status)}</span></div>
          <div class="spec-row"><span class="label">ITV Vence:</span><span class="value">${this.formatDate(v.itvExpiry)}</span></div>
          <div class="spec-row"><span class="label">Seguro Vigente:</span><span class="value">${this.formatDate(v.insuranceExpiry)}</span></div>
          <div class="spec-row"><span class="label">Conductor Actual:</span><span class="value">${v.currentDriver || 'Sin asignar'}</span></div>
        </div>
      </div>

      <div class="footer-note">
        <p><em>Fecha de generación: ${new Date().toLocaleDateString('es-ES')}</em></p>
      </div>
    `;

    openPrintableDocument(`Ficha Técnica - ${v.plate}`, body);
  }

  downloadInsurancePolicy(): void {
    const v = this.vehicle();
    if (!v) return;

    const body = `
      <h1>Póliza de Seguro del Vehículo</h1>
      <div class="insurance-header">
        <h2>Información de la Póliza</h2>
        <p><strong>Vehículo:</strong> ${v.brand} ${v.model}</p>
        <p><strong>Matrícula:</strong> ${v.plate}</p>
        <p><strong>Fecha de Emisión:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
      </div>

      <div class="policy-details">
        <h3>Detalles de Cobertura</h3>
        <div class="coverage-list">
          <div class="coverage-item">
            <span class="coverage-type">Responsabilidad Civil Obligatoria</span>
            <span class="coverage-status">✓ Cubierto</span>
          </div>
          <div class="coverage-item">
            <span class="coverage-type">Daños Propios</span>
            <span class="coverage-status">✓ Cubierto</span>
          </div>
          <div class="coverage-item">
            <span class="coverage-type">Robo e Incendio</span>
            <span class="coverage-status">✓ Cubierto</span>
          </div>
          <div class="coverage-item">
            <span class="coverage-type">Asistencia en Carretera 24h</span>
            <span class="coverage-status">✓ Cubierto</span>
          </div>
          <div class="coverage-item">
            <span class="coverage-type">Cobertura de Carga</span>
            <span class="coverage-status">✓ Cubierto hasta ${v.capacity} KG</span>
          </div>
        </div>
      </div>

      <div class="validity-section">
        <h3>Vigencia de la Póliza</h3>
        <p><strong>Fecha de Vencimiento:</strong> ${this.formatDate(v.insuranceExpiry)}</p>
        <p><strong>Estado:</strong> ${this.isExpired(v.insuranceExpiry) ? 'EXPIRADA - RENOVAR INMEDIATAMENTE' : 'VIGENTE'}</p>
      </div>

      <div class="footer-note">
        <p><em>Para póliza oficial, contactar con la compañía aseguradora</em></p>
        <p><em>Fecha de generación: ${new Date().toLocaleDateString('es-ES')}</em></p>
      </div>
    `;

    openPrintableDocument(`Póliza Seguro - ${v.plate}`, body);
  }
}
