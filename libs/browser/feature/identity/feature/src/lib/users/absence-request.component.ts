import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  TechnicianApiService,
  TimeOffApiService,
  ToastService,
  GlobalAuthStore,
  rbacAllows,
  type Technician as ApiTechnician,
  type TimeOffRequestRow,
} from '@josanz-erp/shared-data-access';
import { LucideAngularModule } from 'lucide-angular';
import {
  UiFeatureHeaderComponent,
  UiFeatureAccessDeniedComponent,
  UiTabsComponent,
  UiCardComponent,
  UiButtonComponent,
  type TabItem,
  UiFeaturePageShellComponent,
} from '@josanz-erp/shared-ui-kit';

function enumerateDatesInclusive(startIso: string, endIso: string): string[] {
  const out: string[] = [];
  const a = new Date(`${startIso}T12:00:00`);
  const b = new Date(`${endIso}T12:00:00`);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime()) || a > b) {
    return [];
  }
  for (let d = new Date(a); d <= b; d.setDate(d.getDate() + 1)) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    out.push(`${y}-${m}-${day}`);
  }
  return out;
}

@Component({
  selector: 'lib-absence-request',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    RouterLink,
    LucideAngularModule,
    UiFeatureHeaderComponent,
    UiFeatureAccessDeniedComponent,
    UiTabsComponent,
    UiCardComponent,
    UiButtonComponent,
    UiFeaturePageShellComponent,
  ],
  template: `
    @if (!canAccess()) {
      <ui-feature-access-denied
        message="No tienes permiso para solicitar ausencias."
        permissionHint="users.view"
      />
    } @else {
      <ui-feature-page-shell [variant]="'compact'" [extraClass]="'availability-container'">
        <nav class="back-row">
          <a routerLink="/users/availability" class="back-link">
            <lucide-icon name="chevron-left" size="18"></lucide-icon>
            Volver al calendario
          </a>
        </nav>

        <ui-feature-header
          title="Solicitar días"
          [subtitle]="headerSubtitle"
          icon="calendar-plus"
        />

        @if (canManageTeam()) {
          <ui-card shape="auto" class="pending-card">
            <div class="pending-head">
              <h2 class="pending-title">
                <lucide-icon name="inbox" size="22"></lucide-icon>
                Solicitudes pendientes de aprobación
              </h2>
              <ui-button
                shape="outline"
                color="secondary"
                size="sm"
                [loading]="loadingPending()"
                (clicked)="refreshPending()"
              >
                Actualizar
              </ui-button>
            </div>
            @if (pendingRequests().length === 0 && !loadingPending()) {
              <p class="pending-empty">No hay solicitudes pendientes.</p>
            } @else {
              <ul class="pending-list">
                @for (r of pendingRequests(); track r.id) {
                  <li class="pending-item">
                    <div class="pending-meta">
                      <span class="pending-kind">{{ kindLabel(r.kind) }}</span>
                      <span class="pending-dates"
                        >{{ r.startDate | date: 'dd/MM/yyyy' }} — {{ r.endDate | date: 'dd/MM/yyyy' }}</span
                      >
                      <span class="pending-who">{{ technicianLabel(r) }}</span>
                    </div>
                    <div class="pending-actions">
                      <ui-button color="success" shape="solid" size="sm" (clicked)="approve(r.id)">Aprobar</ui-button>
                      <ui-button color="danger" shape="outline" size="sm" (clicked)="reject(r.id)">Rechazar</ui-button>
                    </div>
                  </li>
                }
              </ul>
            }
          </ui-card>
        }

        <ui-card shape="auto" class="request-card main-form-card">
          <ui-tabs
            [tabs]="tabs"
            [activeTab]="activeTab()"
            variant="underline"
            (tabChange)="onTabChange($event)"
          />

          <div class="tab-panels">
            @if (activeTab() === 'vacation') {
              <section class="panel" aria-labelledby="vac-title">
                <h2 id="vac-title" class="panel-title">Vacaciones</h2>
                <p class="panel-hint">
                  La solicitud queda <strong>pendiente de aprobación</strong> por RRHH. No se aplica al calendario hasta
                  ser aprobada.
                </p>
                @if (canManageTeam()) {
                  <label class="field full">
                    <span>Solicitar para (opcional = tú mismo)</span>
                    <select [value]="onBehalfTechnicianId()" (change)="onBehalfTechnicianId.set($any($event.target).value)">
                      <option value="">— Yo / mi ficha técnica —</option>
                      @for (t of techniciansOptions(); track t.id) {
                        <option [value]="t.id">{{ t.name }}</option>
                      }
                    </select>
                  </label>
                }
                <div class="field-row">
                  <label class="field">
                    <span>Desde</span>
                    <input type="date" [value]="vacationStart()" (input)="vacationStart.set($any($event.target).value)" />
                  </label>
                  <label class="field">
                    <span>Hasta</span>
                    <input type="date" [value]="vacationEnd()" (input)="vacationEnd.set($any($event.target).value)" />
                  </label>
                </div>
                <label class="field full">
                  <span>Notas (opcional)</span>
                  <textarea
                    rows="2"
                    [value]="vacationNotes()"
                    (input)="vacationNotes.set($any($event.target).value)"
                    placeholder="Ej. verano, puente, etc."
                  ></textarea>
                </label>
                <ui-button
                  color="primary"
                  shape="solid"
                  size="md"
                  [loading]="submitting()"
                  [disabled]="!canSubmitVacation()"
                  (clicked)="submitVacation()"
                >
                  Enviar solicitud
                </ui-button>
              </section>
            }

            @if (activeTab() === 'medical') {
              <section class="panel" aria-labelledby="med-title">
                <h2 id="med-title" class="panel-title">Ausencias</h2>
                <p class="panel-hint">
                  Igual que las vacaciones: <strong>pendiente de aprobación</strong> antes de reflejarse en el cuadrante.
                </p>
                @if (canManageTeam()) {
                  <label class="field full">
                    <span>Solicitar para (opcional)</span>
                    <select [value]="onBehalfTechnicianId()" (change)="onBehalfTechnicianId.set($any($event.target).value)">
                      <option value="">— Yo / mi ficha técnica —</option>
                      @for (t of techniciansOptions(); track t.id) {
                        <option [value]="t.id">{{ t.name }}</option>
                      }
                    </select>
                  </label>
                }
                <label class="field full">
                  <span>Tipo de ausencia</span>
                  <select [value]="medicalKind()" (change)="medicalKind.set($any($event.target).value)">
                    @for (opt of medicalOptions; track opt.value) {
                      <option [value]="opt.value">{{ opt.label }}</option>
                    }
                  </select>
                </label>
                <div class="field-row">
                  <label class="field">
                    <span>Desde</span>
                    <input type="date" [value]="medicalStart()" (input)="medicalStart.set($any($event.target).value)" />
                  </label>
                  <label class="field">
                    <span>Hasta</span>
                    <input type="date" [value]="medicalEnd()" (input)="medicalEnd.set($any($event.target).value)" />
                  </label>
                </div>
                <label class="field full">
                  <span>Detalle / referencia (opcional)</span>
                  <textarea
                    rows="2"
                    [value]="medicalNotes()"
                    (input)="medicalNotes.set($any($event.target).value)"
                    placeholder="Ej. parte de baja, resolución…"
                  ></textarea>
                </label>
                <ui-button
                  color="primary"
                  shape="solid"
                  size="md"
                  [loading]="submitting()"
                  [disabled]="!canSubmitMedical()"
                  (clicked)="submitMedical()"
                >
                  Enviar solicitud
                </ui-button>
              </section>
            }
          </div>

          @if (techFootnote(); as tf) {
            <p class="tech-footnote">
              <lucide-icon name="user" size="14"></lucide-icon>
              {{ tf }}
            </p>
          }
          @if (profileMissing()) {
            <p class="warn-banner">
              Tu usuario no tiene ficha de técnico en este tenant: no puedes enviar solicitudes. Contacta con
              administración.
            </p>
          }
        </ui-card>
      </ui-feature-page-shell>
    }
  `,
  styles: [
    `
      .back-row {
        margin-top: 0.25rem;
      }
      .back-link {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--brand);
        text-decoration: none;
      }
      .back-link:hover {
        text-decoration: underline;
      }
      .pending-card {
        padding: 1.25rem 1.5rem !important;
        border-radius: 18px !important;
        border: 1px solid var(--border-soft);
        background: linear-gradient(
          165deg,
          color-mix(in srgb, var(--brand) 6%, var(--theme-surface, #fff)) 0%,
          var(--theme-surface, #fff) 100%
        );
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
      }
      .pending-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
        margin-bottom: 0.75rem;
      }
      .pending-title {
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1.05rem;
        font-weight: 700;
        color: var(--text-primary);
      }
      .pending-empty {
        margin: 0;
        font-size: 0.9rem;
        color: var(--text-muted);
      }
      .pending-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.65rem;
      }
      .pending-item {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        padding: 0.85rem 1rem;
        border-radius: 12px;
        border: 1px solid var(--border-soft);
        background: var(--bg-secondary, #f7f7f7);
      }
      .pending-meta {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        min-width: 0;
      }
      .pending-kind {
        font-size: 0.72rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--brand);
      }
      .pending-dates {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--text-primary);
      }
      .pending-who {
        font-size: 0.8rem;
        color: var(--text-muted);
      }
      .pending-actions {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
      .request-card.main-form-card {
        padding: 1.75rem 2rem !important;
        border-radius: 22px !important;
        border: 1px solid color-mix(in srgb, var(--border-soft) 90%, var(--brand) 8%);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.6) inset,
          0 12px 40px rgba(0, 0, 0, 0.06);
      }
      .request-card ui-tabs {
        display: block;
        width: 100%;
      }
      .request-card ::ng-deep .tabs.tabs-underline {
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
      }
      .tab-panels {
        margin-top: 1.5rem;
      }
      .panel-title {
        margin: 0 0 0.5rem;
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--text-primary);
        letter-spacing: -0.02em;
      }
      .panel-hint {
        margin: 0 0 1.25rem;
        font-size: 0.92rem;
        color: var(--text-muted);
        line-height: 1.5;
      }
      .field-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }
      @media (max-width: 560px) {
        .field-row {
          grid-template-columns: 1fr;
        }
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        margin-bottom: 1rem;
      }
      .field.full {
        grid-column: 1 / -1;
      }
      .field span {
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--text-muted);
      }
      .field input[type='date'],
      .field select,
      .field textarea {
        font: inherit;
        padding: 0.6rem 0.8rem;
        border-radius: 12px;
        border: 1px solid var(--border-soft);
        background: var(--theme-surface, #fff);
        color: var(--text-primary);
      }
      .field textarea {
        resize: vertical;
        min-height: 3.5rem;
      }
      ui-button {
        margin-top: 0.5rem;
      }
      .tech-footnote {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        margin: 1.25rem 0 0;
        font-size: 0.88rem;
        color: var(--text-muted);
      }
      .warn-banner {
        margin: 1rem 0 0;
        padding: 0.85rem 1.1rem;
        border-radius: 12px;
        background: color-mix(in srgb, var(--warning) 16%, transparent);
        border: 1px solid color-mix(in srgb, var(--warning) 40%, transparent);
        font-size: 0.88rem;
        color: var(--text-primary);
        line-height: 1.45;
      }
    `,
  ],
})
export class AbsenceRequestComponent implements OnInit {
  private readonly techApi = inject(TechnicianApiService);
  private readonly timeOff = inject(TimeOffApiService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly authStore = inject(GlobalAuthStore);

  readonly canAccess = rbacAllows(this.authStore, 'users.view', 'users.manage');
  readonly canManageTeam = rbacAllows(this.authStore, 'users.manage');

  readonly headerSubtitle =
    'Las solicitudes siguen un flujo de aprobación. El calendario solo se actualiza cuando RRHH aprueba (excepto gestores con permiso users.manage).';

  readonly tabs: TabItem[] = [
    { id: 'vacation', label: 'Vacaciones', icon: 'umbrella' },
    { id: 'medical', label: 'Ausencias', icon: 'activity' },
  ];

  activeTab = signal<'vacation' | 'medical'>('vacation');

  vacationStart = signal('');
  vacationEnd = signal('');
  vacationNotes = signal('');

  medicalStart = signal('');
  medicalEnd = signal('');
  medicalNotes = signal('');
  medicalKind = signal<'sick' | 'permit' | 'legal'>('sick');

  readonly medicalOptions: { value: 'sick' | 'permit' | 'legal'; label: string }[] = [
    { value: 'sick', label: 'Baja o ausencia médica (IT / parte)' },
    { value: 'permit', label: 'Permiso retribuido / asuntos propios' },
    { value: 'legal', label: 'Permiso legal (matrimonio, fallecimiento, etc.)' },
  ];

  /** Ficha técnica resuelta (GET /technicians/me). */
  profileOk = signal<boolean | null>(null);
  myTechnicianLabel = signal<string | null>(null);
  onBehalfTechnicianId = signal('');
  techniciansOptions = signal<{ id: string; name: string }[]>([]);

  pendingRequests = signal<TimeOffRequestRow[]>([]);
  loadingPending = signal(false);

  submitting = signal(false);

  readonly profileMissing = computed(() => this.profileOk() === false);

  readonly techFootnote = computed(() => {
    if (this.canManageTeam()) {
      return null;
    }
    const name = this.myTechnicianLabel();
    if (name) {
      return `Solicitudes asociadas a tu ficha: ${name}.`;
    }
    return null;
  });

  ngOnInit(): void {
    const today = new Date();
    const iso = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    this.vacationStart.set(iso(today));
    this.vacationEnd.set(iso(today));
    this.medicalStart.set(iso(today));
    this.medicalEnd.set(iso(today));

    void this.bootstrapProfile();

    this.route.queryParamMap.subscribe((q) => {
      const tid = (q.get('techId') ?? '').trim();
      if (tid && /^[0-9a-f-]{36}$/i.test(tid)) {
        this.onBehalfTechnicianId.set(tid);
      }
    });
  }

  private async bootstrapProfile(): Promise<void> {
    try {
      const me = await firstValueFrom(this.techApi.getMyTechnician());
      this.profileOk.set(true);
      const u = me.user;
      const label = [u?.firstName, u?.lastName].filter(Boolean).join(' ').trim() || u?.email || 'Tu ficha';
      this.myTechnicianLabel.set(label);
    } catch {
      this.profileOk.set(false);
      this.myTechnicianLabel.set(null);
    }

    if (this.canManageTeam()) {
      try {
        const list = await firstValueFrom(this.techApi.getTechnicians());
        this.techniciansOptions.set(
          (list ?? []).map((t: ApiTechnician) => ({
            id: t.id,
            name: `${t.user?.firstName ?? ''} ${t.user?.lastName ?? ''}`.trim() || t.user?.email || t.id,
          })),
        );
      } catch {
        this.techniciansOptions.set([]);
      }
      void this.refreshPending();
    }
  }

  refreshPending(): void {
    if (!this.canManageTeam()) {
      return;
    }
    this.loadingPending.set(true);
    this.timeOff.getPending().subscribe({
      next: (rows) => {
        this.pendingRequests.set(rows ?? []);
        this.loadingPending.set(false);
      },
      error: () => {
        this.loadingPending.set(false);
        this.toast.show('No se pudieron cargar las solicitudes pendientes.', 'error');
      },
    });
  }

  kindLabel(kind: string): string {
    return kind === 'VACATION' ? 'Vacaciones' : 'Ausencia';
  }

  technicianLabel(r: TimeOffRequestRow): string {
    const u = r.technician?.user;
    const n = [u?.firstName, u?.lastName].filter(Boolean).join(' ').trim();
    return n || u?.email || r.technicianId;
  }

  approve(id: string): void {
    this.timeOff.approve(id).subscribe({
      next: () => {
        this.toast.show('Solicitud aprobada y aplicada al calendario.', 'success');
        this.refreshPending();
      },
      error: (err: unknown) => this.toast.show(this.httpErr(err), 'error'),
    });
  }

  reject(id: string): void {
    this.timeOff.reject(id).subscribe({
      next: () => {
        this.toast.show('Solicitud rechazada.', 'success');
        this.refreshPending();
      },
      error: (err: unknown) => this.toast.show(this.httpErr(err), 'error'),
    });
  }

  onTabChange(id: string): void {
    if (id === 'vacation' || id === 'medical') {
      this.activeTab.set(id);
    }
  }

  canSubmitVacation(): boolean {
    const s = this.vacationStart();
    const e = this.vacationEnd();
    if (!s || !e || enumerateDatesInclusive(s, e).length === 0) {
      return false;
    }
    if (this.canManageTeam()) {
      return true;
    }
    return this.profileOk() === true;
  }

  canSubmitMedical(): boolean {
    const s = this.medicalStart();
    const e = this.medicalEnd();
    if (!s || !e || enumerateDatesInclusive(s, e).length === 0) {
      return false;
    }
    if (this.canManageTeam()) {
      return true;
    }
    return this.profileOk() === true;
  }

  submitVacation(): void {
    const tid = this.onBehalfTechnicianId().trim();
    const body = {
      kind: 'VACATION' as const,
      startDate: this.vacationStart(),
      endDate: this.vacationEnd(),
      notes: this.vacationNotes().trim() || undefined,
      ...(tid ? { technicianId: tid } : {}),
    };
    this.postTimeOff(body, 'Solicitud de vacaciones enviada. Queda pendiente de aprobación.');
  }

  submitMedical(): void {
    const body = {
      kind: 'ABSENCE' as const,
      startDate: this.medicalStart(),
      endDate: this.medicalEnd(),
      notes: this.medicalNotes().trim() || undefined,
      absenceSubtype: this.medicalKind(),
      ...(this.onBehalfTechnicianId().trim()
        ? { technicianId: this.onBehalfTechnicianId().trim() }
        : {}),
    };
    this.postTimeOff(body, 'Solicitud de ausencia enviada. Queda pendiente de aprobación.');
  }

  private postTimeOff(
    body: Parameters<TimeOffApiService['create']>[0],
    okMsg: string,
  ): void {
    this.submitting.set(true);
    this.timeOff.create(body).subscribe({
      next: () => {
        this.submitting.set(false);
        this.toast.show(okMsg, 'success', 4000);
        if (this.canManageTeam()) {
          this.refreshPending();
        }
      },
      error: (err: unknown) => {
        this.submitting.set(false);
        this.toast.show(this.httpErr(err), 'error', 5000);
      },
    });
  }

  private httpErr(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error;
      if (typeof body === 'object' && body !== null && 'message' in body) {
        const m = (body as { message: unknown }).message;
        if (typeof m === 'string' && m.trim()) {
          return m;
        }
        if (Array.isArray(m) && m.length) {
          return m.map(String).join(' ');
        }
      }
      if (err.status === 401) {
        return 'Sesión no válida. Vuelve a entrar.';
      }
      if (err.status === 403) {
        return 'No tienes permiso para esta acción.';
      }
    }
    return 'No se pudo completar la operación.';
  }
}
