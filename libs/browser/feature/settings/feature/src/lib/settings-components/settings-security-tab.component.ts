import { Component, inject, OnInit, signal, computed } from '@angular/core';
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
  PrivacyRequestDto,
  PrivacyRequestStatus,
  RopaDocumentDto,
  DpiaDocumentDto,
} from '@josanz-erp/shared-data-access';
import { downloadPrivacyJsonExport } from '@josanz-erp/shared-data-access';
import { AuthStore, AuthService, IDENTITY_AUTH_MODE_SESSION_KEY } from '@josanz-erp/identity-data-access';
import { FormsModule } from '@angular/forms';
import { forkJoin, firstValueFrom } from 'rxjs';

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

      <ui-card variant="glass" class="prefs-card password-card">
        <h3 class="config-subtitle">
          <lucide-icon name="key" size="16" aria-hidden="true"></lucide-icon>
          Contraseña
        </h3>
        @if (canChangeLocalPassword()) {
          <div class="password-form">
            <div class="form-group">
              <label class="form-label" for="current-pw">Contraseña actual</label>
              <input
                id="current-pw"
                type="password"
                class="luxe-input"
                [(ngModel)]="changePwCurrent"
                autocomplete="current-password"
              />
            </div>
            <div class="form-group">
              <label class="form-label" for="new-pw">Nueva contraseña</label>
              <input
                id="new-pw"
                type="password"
                class="luxe-input"
                [(ngModel)]="changePwNew"
                autocomplete="new-password"
                minlength="8"
              />
            </div>
            <div class="form-group">
              <label class="form-label" for="confirm-pw">Confirmar nueva contraseña</label>
              <input
                id="confirm-pw"
                type="password"
                class="luxe-input"
                [(ngModel)]="changePwConfirm"
                autocomplete="new-password"
              />
            </div>
            <ui-button
              variant="primary"
              [loading]="changingPassword()"
              [disabled]="!canSubmitPasswordChange()"
              (clicked)="submitPasswordChange()"
            >
              Actualizar contraseña
            </ui-button>
          </div>
        } @else {
          <p class="password-hint">
            Tu cuenta usa <strong>Keycloak SSO</strong>. Para cambiar la contraseña, usa el portal de
            identidad de tu organización o contacta al administrador.
          </p>
        }
      </ui-card>

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

        <h4 class="policy-sub">Solicitar borrado de cuenta</h4>
        <p class="privacy-lead compact">
          Abre una solicitud en la cola DPO. Un responsable revisará obligaciones legales antes de ejecutar.
        </p>
        <ui-button
          variant="outline"
          size="sm"
          color="danger"
          icon="user-x"
          [loading]="requestingAccountErasure()"
          (clicked)="requestAccountErasure()"
        >
          Solicitar borrado de cuenta (DPO)
        </ui-button>

        @if (myRequests().length) {
          <h4 class="policy-sub">Mis solicitudes</h4>
          <ul class="request-list">
            @for (r of myRequests(); track r.id) {
              <li>
                <span>{{ r.type }} · {{ r.status }}</span>
                <small>{{ r.createdAt | date: 'short' }}</small>
              </li>
            }
          </ul>
        }
      </ui-card>

      @if (canManagePrivacy()) {
        <ui-card variant="glass" class="privacy-card dpo-card">
          <h3 class="config-subtitle">
            <lucide-icon name="clipboard-list" size="16" aria-hidden="true"></lucide-icon>
            Cola DPO (admin)
          </h3>
          @if (dpoQueue().length === 0) {
            <p class="privacy-lead compact">No hay solicitudes pendientes.</p>
          } @else {
            <ul class="dpo-queue">
              @for (item of dpoQueue(); track item.id) {
                <li class="dpo-item">
                  <div class="dpo-item-head">
                    <ui-badge [variant]="statusVariant(item.status)">{{ item.status }}</ui-badge>
                    <strong>{{ item.type }}</strong>
                    <small>{{ item.createdAt | date: 'short' }}</small>
                  </div>
                  @if (item.userMessage) {
                    <p class="dpo-msg">{{ item.userMessage }}</p>
                  }
                  <div class="dpo-actions">
                    @if (item.status === 'PENDING' || item.status === 'IN_REVIEW') {
                      <ui-button size="sm" variant="ghost" (clicked)="review(item.id, 'APPROVED')">
                        Aprobar
                      </ui-button>
                      <ui-button size="sm" variant="ghost" color="danger" (clicked)="review(item.id, 'REJECTED')">
                        Rechazar
                      </ui-button>
                    }
                    @if (item.status === 'APPROVED') {
                      <ui-button
                        size="sm"
                        variant="solid"
                        color="danger"
                        [loading]="executingId() === item.id"
                        (clicked)="execute(item.id)"
                      >
                        Ejecutar
                      </ui-button>
                    }
                  </div>
                </li>
              }
            </ul>
          }
        </ui-card>
      }

      @if (ropa(); as ropaDoc) {
        <ui-card variant="glass" class="privacy-card compliance-card">
          <h3 class="config-subtitle">
            <lucide-icon name="file-text" size="16" aria-hidden="true"></lucide-icon>
            ROPA — Registro de tratamientos (art. 30)
          </h3>
          <p class="privacy-lead compact">
            Versión {{ ropaDoc.version }} · Actualizado {{ ropaDoc.updatedAt }}
          </p>
          <div class="compliance-table-wrap">
            <table class="compliance-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tratamiento</th>
                  <th>Base legal</th>
                  <th>Retención</th>
                </tr>
              </thead>
              <tbody>
                @for (t of ropaDoc.treatments; track t.id) {
                  <tr>
                    <td>{{ t.id }}</td>
                    <td>{{ t.name }}</td>
                    <td>{{ t.lawfulBasis }}</td>
                    <td>{{ t.retentionDays ? t.retentionDays + ' d' : '—' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <ui-button variant="ghost" size="sm" icon="download" (clicked)="downloadRopa()">
            Descargar ROPA (JSON)
          </ui-button>
        </ui-card>
      }

      @if (dpia(); as dpiaDoc) {
        <ui-card variant="glass" class="privacy-card compliance-card">
          <h3 class="config-subtitle">
            <lucide-icon name="shield-check" size="16" aria-hidden="true"></lucide-icon>
            DPIA — Evaluación de impacto (art. 35)
          </h3>
          <p class="privacy-lead compact">{{ dpiaDoc.conclusion }}</p>
          <ui-badge [variant]="dpiaDoc.acceptable ? 'success' : 'warning'">
            {{ dpiaDoc.acceptable ? 'Riesgo residual admisible' : 'Revisión requerida' }}
          </ui-badge>
          <ul class="dpia-risks">
            @for (r of dpiaDoc.risks; track r.id) {
              <li>
                <strong>{{ r.id }}</strong> — {{ r.description }}
                <span class="risk-meta">{{ r.level }} · {{ r.status }}</span>
              </li>
            }
          </ul>
          <ui-button variant="ghost" size="sm" icon="download" (clicked)="downloadDpia()">
            Descargar DPIA (JSON)
          </ui-button>
        </ui-card>
      }
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

      .privacy-lead.compact {
        margin-bottom: 0.75rem;
      }

      .request-list,
      .dpo-queue {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .request-list li {
        display: flex;
        justify-content: space-between;
        font-size: 0.82rem;
        padding: 0.35rem 0;
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        color: #475569;
      }

      .dpo-card {
        margin-top: 1.5rem;
      }
      .dpo-item {
        padding: 1rem 0;
        border-bottom: 1px solid rgba(0, 0, 0, 0.08);
      }
      .dpo-item-head {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
      }
      .dpo-msg {
        font-size: 0.8rem;
        color: #64748b;
        margin: 0 0 0.5rem;
      }
      .dpo-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .compliance-card {
        margin-top: 1.5rem;
      }
      .compliance-table-wrap {
        overflow-x: auto;
        margin: 1rem 0;
      }
      .compliance-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.78rem;
      }
      .compliance-table th,
      .compliance-table td {
        padding: 0.45rem 0.6rem;
        border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        text-align: left;
        color: #475569;
      }
      .compliance-table th {
        font-weight: 800;
        color: #0f172a;
      }
      .dpia-risks {
        list-style: none;
        margin: 1rem 0;
        padding: 0;
      }
      .dpia-risks li {
        font-size: 0.82rem;
        color: #475569;
        padding: 0.4rem 0;
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      }
      .risk-meta {
        display: block;
        font-size: 0.72rem;
        color: #94a3b8;
        margin-top: 0.15rem;
      }
      .password-card {
        margin-bottom: 1.5rem;
      }
      .password-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        max-width: 420px;
      }
      .form-label {
        display: block;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        margin-bottom: 0.35rem;
        color: #64748b;
      }
      .luxe-input {
        width: 100%;
        padding: 0.65rem 0;
        border: none;
        border-bottom: 1px solid rgba(148, 163, 184, 0.4);
        background: transparent;
        color: inherit;
        font-size: 0.95rem;
      }
      .luxe-input:focus {
        outline: none;
        border-bottom-color: var(--brand-primary, #f03e3e);
      }
      .password-hint {
        font-size: 0.9rem;
        color: #64748b;
        line-height: 1.5;
        margin: 0;
      }
    `,
  ],
})
export class SettingsSecurityTabComponent implements OnInit {
  public readonly aiBotStore = inject(AIBotStore);
  private readonly privacyApi = inject(PrivacyApiService);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(GlobalAuthStore);
  private readonly authStore = inject(AuthStore);
  private readonly authService = inject(AuthService);

  readonly loading = signal(true);
  readonly exporting = signal(false);
  readonly erasing = signal(false);
  readonly erasureModalOpen = signal(false);
  readonly policy = signal<PrivacyPolicyDto | null>(null);
  readonly securityStatus = signal<PrivacySecurityStatusDto | null>(null);
  readonly myRequests = signal<PrivacyRequestDto[]>([]);
  readonly dpoQueue = signal<PrivacyRequestDto[]>([]);
  readonly requestingAccountErasure = signal(false);
  readonly executingId = signal<string | null>(null);
  readonly ropa = signal<RopaDocumentDto | null>(null);
  readonly dpia = signal<DpiaDocumentDto | null>(null);
  readonly changingPassword = signal(false);
  changePwCurrent = '';
  changePwNew = '';
  changePwConfirm = '';

  readonly canChangeLocalPassword = computed(() => {
    const mode = this.authStore.authMode();
    if (mode === 'keycloak') return false;
    if (mode === 'local') return true;
    if (typeof sessionStorage !== 'undefined') {
      return sessionStorage.getItem(IDENTITY_AUTH_MODE_SESSION_KEY) !== 'keycloak';
    }
    return true;
  });

  readonly canManagePrivacy = computed(() => {
    const p = this.auth.permissions();
    return p.includes('*') || p.includes('privacy.manage');
  });

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
      mine: this.privacyApi.myRequests(),
      ropa: this.privacyApi.getRopa(),
      dpia: this.privacyApi.getDpia(),
    }).subscribe({
      next: ({ policy, status, mine, ropa, dpia }) => {
        this.policy.set(policy);
        this.securityStatus.set(status);
        this.myRequests.set(mine);
        this.ropa.set(ropa);
        this.dpia.set(dpia);
        this.loading.set(false);
        if (this.canManagePrivacy()) {
          this.loadDpoQueue();
        }
      },
      error: () => {
        this.loading.set(false);
        this.toast.show('No se pudo cargar la información de privacidad', 'error');
      },
    });
  }

  loadDpoQueue(): void {
    this.privacyApi.listDpoQueue().subscribe({
      next: (rows) => this.dpoQueue.set(rows),
      error: () => this.toast.show('No se pudo cargar la cola DPO', 'error'),
    });
  }

  statusVariant(status: PrivacyRequestStatus): string {
    if (status === 'APPROVED' || status === 'COMPLETED') return 'success';
    if (status === 'REJECTED') return 'danger';
    if (status === 'PARTIAL') return 'warning';
    return 'info';
  }

  requestAccountErasure(): void {
    this.requestingAccountErasure.set(true);
    this.privacyApi
      .createRequest({
        type: 'ACCOUNT_ERASURE',
        userMessage: 'Solicitud de borrado de cuenta desde Configuración',
      })
      .subscribe({
        next: (r) => {
          this.requestingAccountErasure.set(false);
          this.myRequests.update((list) => [r, ...list]);
          this.toast.show('Solicitud enviada a la cola DPO', 'success');
          if (this.canManagePrivacy()) this.loadDpoQueue();
        },
        error: () => {
          this.requestingAccountErasure.set(false);
          this.toast.show('No se pudo crear la solicitud', 'error');
        },
      });
  }

  review(id: string, status: PrivacyRequestStatus): void {
    this.privacyApi.reviewRequest(id, { status }).subscribe({
      next: () => {
        this.toast.show(`Solicitud ${status}`, 'success');
        this.loadDpoQueue();
        this.privacyApi.myRequests().subscribe((m) => this.myRequests.set(m));
      },
      error: () => this.toast.show('Error al revisar solicitud', 'error'),
    });
  }

  execute(id: string): void {
    this.executingId.set(id);
    this.privacyApi.executeRequest(id).subscribe({
      next: (r) => {
        this.executingId.set(null);
        this.toast.show(`Ejecutada (${r.status})`, 'success');
        this.loadDpoQueue();
        this.privacyApi.myRequests().subscribe((m) => this.myRequests.set(m));
      },
      error: () => {
        this.executingId.set(null);
        this.toast.show('Error al ejecutar solicitud', 'error');
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
        downloadPrivacyJsonExport(
          data,
          `josanz-datos-${this.auth.user()?.id ?? 'usuario'}`,
        );
        this.exporting.set(false);
        this.toast.show('Exportación completada', 'success');
      },
      error: () => {
        this.exporting.set(false);
        this.toast.show('Error al exportar datos', 'error');
      },
    });
  }

  downloadRopa(): void {
    const doc = this.ropa();
    if (doc) downloadPrivacyJsonExport(doc, 'ropa-josanz');
  }

  downloadDpia(): void {
    const doc = this.dpia();
    if (doc) downloadPrivacyJsonExport(doc, 'dpia-josanz');
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

  canSubmitPasswordChange(): boolean {
    return (
      this.changePwCurrent.trim().length > 0 &&
      this.changePwNew.length >= 8 &&
      this.changePwNew === this.changePwConfirm
    );
  }

  async submitPasswordChange(): Promise<void> {
    if (!this.canSubmitPasswordChange()) {
      this.toast.show('Revisa los campos de contraseña', 'error');
      return;
    }
    this.changingPassword.set(true);
    try {
      await firstValueFrom(
        this.authService.changePassword(this.changePwCurrent, this.changePwNew),
      );
      this.changePwCurrent = '';
      this.changePwNew = '';
      this.changePwConfirm = '';
      this.toast.show('Contraseña actualizada', 'success');
    } catch (err: unknown) {
      const raw = (err as { error?: { message?: string | string[] } })?.error?.message;
      const msg = Array.isArray(raw) ? raw.join(', ') : raw;
      this.toast.show(msg ?? 'No se pudo cambiar la contraseña', 'error');
    } finally {
      this.changingPassword.set(false);
    }
  }
}
