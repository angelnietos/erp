import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import {
  UiCardComponent,
  UiSelectComponent,
  UiButtonComponent,
  UiModalComponent,
  UiBadgeComponent,
} from '@josanz-erp/shared-ui-kit';
import {
  AIBotStore,
  GlobalAuthStore,
  PrivacyApiService,
  ToastService,
} from '@josanz-erp/shared-data-access';
import type {
  PrivacyPolicyDto,
  PrivacySecurityStatusDto,
} from '@josanz-erp/shared-data-access';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'lib-settings-security-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    UiCardComponent,
    UiSelectComponent,
    UiButtonComponent,
    UiModalComponent,
    UiBadgeComponent,
  ],
  template: `
    <section class="content-section animate-slide-up">
      <div class="section-breadcrumb">
        <span>Cuenta</span>
        <lucide-icon name="chevron-right" size="12"></lucide-icon>
        <span class="current">Seguridad y privacidad</span>
      </div>
      <div class="section-title">
        <h2>Seguridad y privacidad</h2>
        <p>Sesión, cumplimiento RGPD y controles de protección de datos</p>
      </div>

      @if (loading()) {
        <p class="loading-hint">Cargando estado de cumplimiento…</p>
      }

      @if (securityStatus(); as status) {
        <div class="status-strip">
          <div class="status-chip" [class.ok]="status.encryptionAtRest" [class.warn]="!status.encryptionAtRest">
            <lucide-icon name="lock" size="14"></lucide-icon>
            Cifrado en reposo
            <ui-badge [variant]="status.encryptionAtRest ? 'success' : 'warning'">
              {{ status.encryptionAtRest ? 'Activo' : 'Configurar clave' }}
            </ui-badge>
          </div>
          <div class="status-chip ok">
            <lucide-icon name="eye-off" size="14"></lucide-icon>
            Enmascaramiento PII
            <ui-badge variant="success">Activo</ui-badge>
          </div>
          <div class="status-chip ok">
            <lucide-icon name="scroll-text" size="14"></lucide-icon>
            Auditoría
            <ui-badge variant="info">{{ status.auditRetentionDays }} días</ui-badge>
          </div>
        </div>
      }

      <div class="grid-config">
        <ui-card variant="glass" class="prefs-card">
          <h3 class="config-subtitle">
            <lucide-icon name="clock" size="16" aria-hidden="true"></lucide-icon> Sesión
          </h3>
          <div class="form-group">
            <ui-select
              label="Tiempo de espera de sesión"
              [options]="sessionTimeoutOptions"
              [(ngModel)]="sessionTimeoutValue"
            ></ui-select>
          </div>
        </ui-card>

        <ui-card variant="glass" class="prefs-card">
          <h3 class="config-subtitle">
            <lucide-icon name="trash2" size="16" aria-hidden="true"></lucide-icon> Gestión de datos (IA)
          </h3>
          <div class="pref-row no-border">
            <div class="pref-text">
              <h4>Auto-archivo de chats</h4>
              <p>Mueve conversaciones antiguas al historial automáticamente</p>
            </div>
            <div
              class="toggle-wrapper"
              (click)="aiBotStore.autoArchive.set(!aiBotStore.autoArchive())"
              (keydown.enter)="aiBotStore.autoArchive.set(!aiBotStore.autoArchive())"
              (keydown.space)="aiBotStore.autoArchive.set(!aiBotStore.autoArchive())"
              [class.active]="aiBotStore.autoArchive()"
              tabindex="0"
              role="switch"
              [attr.aria-checked]="aiBotStore.autoArchive()"
              aria-label="Auto-archivo de chats"
            >
              <div class="toggle-handle"></div>
            </div>
          </div>
        </ui-card>
      </div>

      <ui-card variant="glass" class="privacy-card">
        <h3 class="config-subtitle">
          <lucide-icon name="shield-check" size="16" aria-hidden="true"></lucide-icon>
          Privacidad (RGPD)
        </h3>
        <p class="privacy-lead">
          Ejerce tus derechos de acceso, portabilidad y supresión sobre tus datos personales en la plataforma.
        </p>

        @if (policy(); as pol) {
          <div class="policy-grid">
            <div class="policy-block">
              <span class="policy-label">Versión</span>
              <strong>{{ pol.version }}</strong>
            </div>
            <div class="policy-block">
              <span class="policy-label">Contacto DPO</span>
              <a class="policy-link" [href]="'mailto:' + pol.contactDpo">{{ pol.contactDpo }}</a>
            </div>
          </div>

          <h4 class="policy-sub">Retención de datos</h4>
          <ul class="retention-list">
            @for (entry of retentionEntries(pol); track entry.key) {
              <li>
                <span>{{ entry.label }}</span>
                <strong>{{ entry.days }} días</strong>
              </li>
            }
          </ul>

          <h4 class="policy-sub">Tus derechos</h4>
          <ul class="rights-list">
            @for (right of pol.rights; track right) {
              <li>{{ right }}</li>
            }
          </ul>
        }

        <div class="privacy-actions">
          <ui-button
            variant="solid"
            size="sm"
            icon="download"
            [loading]="exporting()"
            (clicked)="exportMyData()"
          >
            Exportar mis datos (JSON)
          </ui-button>
          <ui-button
            variant="outline"
            size="sm"
            color="danger"
            icon="eraser"
            [loading]="erasing()"
            (clicked)="openErasureModal()"
          >
            Anonimizar telemetría IA
          </ui-button>
        </div>
        <p class="privacy-note">
          La exportación incluye perfil, actividad de auditoría reciente y telemetría IA.
          La anonimización no elimina facturas ni registros con obligación legal de conservación.
        </p>
      </ui-card>
    </section>

    <ui-modal
      [isOpen]="erasureModalOpen()"
      title="Confirmar anonimización"
      color="danger"
      shape="glass"
      [showFooter]="true"
      (closed)="closeErasureModal()"
    >
      <p>
        Se anonimizarán tus interacciones con la IA (resúmenes, metadatos y correo en telemetría).
        Esta acción no se puede deshacer.
      </p>
      <div modal-footer class="modal-actions">
        <ui-button variant="ghost" size="sm" (clicked)="closeErasureModal()">Cancelar</ui-button>
        <ui-button
          variant="solid"
          color="danger"
          size="sm"
          [loading]="erasing()"
          (clicked)="confirmErasure()"
        >
          Anonimizar ahora
        </ui-button>
      </div>
    </ui-modal>
  `,
  styles: [
    `
      .section-breadcrumb {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
        font-size: 0.75rem;
        font-weight: 700;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .section-breadcrumb .current {
        color: var(--brand);
      }

      .section-title h2 {
        font-size: 1.5rem;
        font-weight: 900;
        color: #fff;
        margin: 0;
        letter-spacing: -0.02em;
      }
      .section-title p {
        font-size: 0.9rem;
        color: #64748b;
        margin: 0.5rem 0 0 0;
      }

      .loading-hint {
        color: #94a3b8;
        font-size: 0.85rem;
        margin-bottom: 1rem;
      }

      .status-strip {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin: 1.25rem 0 1.75rem;
      }
      .status-chip {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.85rem;
        border-radius: 999px;
        font-size: 0.78rem;
        font-weight: 700;
        background: rgba(15, 23, 42, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: #e2e8f0;
      }
      .status-chip.ok lucide-icon {
        color: #34d399;
      }
      .status-chip.warn lucide-icon {
        color: #fbbf24;
      }

      .grid-config {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
        gap: 1.5rem;
        margin-bottom: 1.5rem;
      }

      .privacy-card {
        margin-top: 0.5rem;
      }

      .config-subtitle {
        font-size: 1rem;
        font-weight: 800;
        color: #fff;
        margin: 0 0 1rem 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .config-subtitle lucide-icon {
        color: var(--brand);
      }

      .form-group {
        margin-top: 1rem;
      }

      .pref-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.5rem 0;
        border-top: 1px solid rgba(0, 0, 0, 0.05);
      }
      .pref-row.no-border {
        border-top: none;
        padding-top: 0;
      }
      .pref-text {
        flex: 1;
        padding-right: 2rem;
      }
      .pref-text h4 {
        font-size: 0.95rem;
        font-weight: 700;
        color: #0f172a;
        margin: 0 0 0.35rem;
        line-height: 1.3;
      }
      .pref-text p {
        font-size: 0.8rem;
        color: #64748b;
        margin: 0;
        line-height: 1.5;
      }

      .toggle-wrapper {
        width: 48px;
        height: 24px;
        background: rgba(15, 23, 42, 0.15);
        border-radius: 99px;
        position: relative;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        border: 1px solid rgba(0, 0, 0, 0.05);
      }
      .toggle-wrapper.active {
        background: var(--brand);
      }
      .toggle-handle {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 18px;
        height: 18px;
        background: #fff;
        border-radius: 50%;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      }
      .toggle-wrapper.active .toggle-handle {
        left: 26px;
      }

      .privacy-lead {
        color: #64748b;
        font-size: 0.875rem;
        margin: 0 0 1.25rem;
        line-height: 1.55;
      }

      .policy-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 1rem;
        margin-bottom: 1.25rem;
      }
      .policy-block {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      .policy-label {
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #94a3b8;
        font-weight: 700;
      }
      .policy-link {
        color: var(--brand);
        font-weight: 700;
        text-decoration: none;
      }
      .policy-sub {
        font-size: 0.85rem;
        font-weight: 800;
        color: #0f172a;
        margin: 1rem 0 0.5rem;
      }

      .retention-list,
      .rights-list {
        margin: 0;
        padding: 0;
        list-style: none;
      }
      .retention-list li {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.45rem 0;
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        font-size: 0.82rem;
        color: #475569;
      }
      .rights-list li {
        font-size: 0.82rem;
        color: #475569;
        padding: 0.25rem 0 0.25rem 1rem;
        position: relative;
      }
      .rights-list li::before {
        content: '•';
        position: absolute;
        left: 0;
        color: var(--brand);
      }

      .privacy-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin-top: 1.5rem;
      }
      .privacy-note {
        margin: 1rem 0 0;
        font-size: 0.75rem;
        color: #94a3b8;
        line-height: 1.5;
      }

      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        width: 100%;
      }
    `,
  ],
})
export class SettingsSecurityTabComponent implements OnInit {
  public readonly aiBotStore = inject(AIBotStore);
  private readonly privacyApi = inject(PrivacyApiService);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(GlobalAuthStore);

  readonly loading = signal(true);
  readonly exporting = signal(false);
  readonly erasing = signal(false);
  readonly erasureModalOpen = signal(false);
  readonly policy = signal<PrivacyPolicyDto | null>(null);
  readonly securityStatus = signal<PrivacySecurityStatusDto | null>(null);

  readonly sessionTimeoutOptions = [
    { value: 15, label: '15 Minutos' },
    { value: 30, label: '30 Minutos' },
    { value: 60, label: '1 Hora' },
    { value: 0, label: 'Nunca (No recomendado)' },
  ];

  get sessionTimeoutValue() {
    return this.aiBotStore.sessionTimeout();
  }
  set sessionTimeoutValue(v: number) {
    this.aiBotStore.sessionTimeout.set(v);
  }

  ngOnInit(): void {
    forkJoin({
      policy: this.privacyApi.getPolicy(),
      status: this.privacyApi.getSecurityStatus(),
    }).subscribe({
      next: ({ policy, status }) => {
        this.policy.set(policy);
        this.securityStatus.set(status);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.show('No se pudo cargar la información de privacidad', 'error');
      },
    });
  }

  retentionEntries(pol: PrivacyPolicyDto): { key: string; label: string; days: number }[] {
    const labels: Record<string, string> = {
      audit_logs: 'Logs de auditoría',
      domain_events: 'Eventos de dominio',
      ai_insights: 'Telemetría IA',
      invoices: 'Facturas (obligación legal)',
    };
    return Object.entries(pol.retentionDays).map(([key, days]) => ({
      key,
      label: labels[key] ?? key,
      days,
    }));
  }

  exportMyData(): void {
    this.exporting.set(true);
    this.privacyApi.exportMyData().subscribe({
      next: (data) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `josanz-datos-${this.auth.user()?.id ?? 'usuario'}-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.exporting.set(false);
        this.toast.show('Exportación completada', 'success');
      },
      error: () => {
        this.exporting.set(false);
        this.toast.show('Error al exportar datos', 'error');
      },
    });
  }

  openErasureModal(): void {
    this.erasureModalOpen.set(true);
  }

  closeErasureModal(): void {
    this.erasureModalOpen.set(false);
  }

  confirmErasure(): void {
    this.erasing.set(true);
    this.privacyApi.anonymizeMyTelemetry().subscribe({
      next: (result) => {
        this.erasing.set(false);
        this.erasureModalOpen.set(false);
        this.toast.show(
          `Telemetría anonimizada (${result.anonymizedInsights} registros)`,
          'success',
        );
      },
      error: () => {
        this.erasing.set(false);
        this.toast.show('No se pudo anonimizar la telemetría', 'error');
      },
    });
  }
}
