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
            <lucide-icon name="chevron-left" size="18" aria-hidden="true"></lucide-icon>
            Volver al calendario
          </a>
        </nav>

        <ui-feature-header
          title="Solicitar días"
          breadcrumbLead="RECURSOS HUMANOS"
          breadcrumbTail="AUSENCIAS Y PERMISOS"
          [subtitle]="headerSubtitle"
          icon="calendar-plus"
        />

        @if (canManageTeam()) {
          <ui-card shape="auto" class="pending-card">
            <div class="pending-head">
              <h2 class="pending-title">
                <lucide-icon name="inbox" size="22" aria-hidden="true"></lucide-icon>
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
                    <select [value]="onBehalfTechnicianId()" (change)="onBehalfTechnicianId.set(formFieldValue($event))">
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
                    <input type="date" [value]="vacationStart()" (input)="vacationStart.set(formFieldValue($event))" />
                  </label>
                  <label class="field">
                    <span>Hasta</span>
                    <input type="date" [value]="vacationEnd()" (input)="vacationEnd.set(formFieldValue($event))" />
                  </label>
                </div>
                <label class="field full">
                  <span>Notas (opcional)</span>
                  <textarea
                    rows="2"
                    [value]="vacationNotes()"
                    (input)="vacationNotes.set(formFieldValue($event))"
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
                    <select [value]="onBehalfTechnicianId()" (change)="onBehalfTechnicianId.set(formFieldValue($event))">
                      <option value="">— Yo / mi ficha técnica —</option>
                      @for (t of techniciansOptions(); track t.id) {
                        <option [value]="t.id">{{ t.name }}</option>
                      }
                    </select>
                  </label>
                }
                <label class="field full">
                  <span>Tipo de ausencia</span>
                  <select [value]="medicalKind()" (change)="onMedicalKindChange($event)">
                    @for (opt of medicalOptions; track opt.value) {
                      <option [value]="opt.value">{{ opt.label }}</option>
                    }
                  </select>
                </label>
                <div class="field-row">
                  <label class="field">
                    <span>Desde</span>
                    <input type="date" [value]="medicalStart()" (input)="medicalStart.set(formFieldValue($event))" />
                  </label>
                  <label class="field">
                    <span>Hasta</span>
                    <input type="date" [value]="medicalEnd()" (input)="medicalEnd.set(formFieldValue($event))" />
                  </label>
                </div>
                <label class="field full">
                  <span>Detalle / referencia (opcional)</span>
                  <textarea
                    rows="2"
                    [value]="medicalNotes()"
                    (input)="medicalNotes.set(formFieldValue($event))"
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
              <lucide-icon name="user" size="14" aria-hidden="true"></lucide-icon>
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
      .availability-container {
        animation: fadeIn 0.4s ease-out forwards;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .back-row {
        margin-bottom: 1.5rem;
        margin-top: 0.5rem;
      }
      .back-link {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--text-muted, #64748b);
        text-decoration: none;
        padding: 0.5rem 0.75rem;
        border-radius: 8px;
        transition: all 0.2s ease;
        background: transparent;
        margin-left: -0.75rem;
      }
      .back-link:hover {
        background: var(--bg-hover, #f1f5f9);
        color: var(--brand, #2563eb);
        transform: translateX(-3px);
      }
      .pending-card {
        padding: 1.5rem 2rem !important;
        border-radius: 20px !important;
        border: 1px solid color-mix(in srgb, var(--brand) 15%, transparent);
        background: linear-gradient(145deg, color-mix(in srgb, var(--brand) 4%, var(--theme-surface, #fff)) 0%, var(--theme-surface, #fff) 100%);
        box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 2px 5px rgba(0,0,0,0.02);
      }
      .pending-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
        margin-bottom: 1.25rem;
      }
      .pending-title {
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.6rem;
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--text-primary);
        letter-spacing: -0.01em;
      }
      .pending-empty {
        margin: 0;
        font-size: 0.95rem;
        color: var(--text-muted);
        padding: 1.5rem;
        text-align: center;
        background: var(--bg-secondary, #f8fafc);
        border-radius: 12px;
        border: 1px dashed var(--border-soft);
      }
      .pending-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
      }
      .pending-item {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 1rem 1.25rem;
        border-radius: 14px;
        border: 1px solid var(--border-soft);
        background: var(--theme-surface, #fff);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .pending-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px -6px rgba(0, 0, 0, 0.08);
        border-color: color-mix(in srgb, var(--brand) 30%, transparent);
      }
      .pending-meta {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        min-width: 0;
      }
      .pending-kind {
        font-size: 0.75rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--brand);
      }
      .pending-dates {
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--text-primary);
      }
      .pending-who {
        font-size: 0.85rem;
        color: var(--text-muted);
      }
      .pending-actions {
        display: flex;
        gap: 0.6rem;
        flex-wrap: wrap;
      }
      .request-card.main-form-card {
        padding: 2rem 2.5rem !important;
        border-radius: 24px !important;
        border: 1px solid rgba(255, 255, 255, 0.8);
        background: rgba(255, 255, 255, 0.6);
        backdrop-filter: blur(20px);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.8) inset,
          0 16px 48px -8px rgba(0, 0, 0, 0.06),
          0 4px 12px -2px rgba(0, 0, 0, 0.03);
      }
      :host-context([data-theme='dark']) .request-card.main-form-card {
        background: rgba(30, 41, 59, 0.6);
        border-color: rgba(255, 255, 255, 0.08);
        box-shadow: 
          0 1px 0 rgba(255, 255, 255, 0.05) inset,
          0 16px 48px -8px rgba(0, 0, 0, 0.4);
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
        margin-top: 2rem;
        animation: fadeSlide 0.3s ease-out forwards;
      }
      @keyframes fadeSlide {
        from { opacity: 0; transform: translateY(5px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .panel-title {
        margin: 0 0 0.5rem;
        font-size: 1.3rem;
        font-weight: 800;
        color: var(--text-primary);
        letter-spacing: -0.02em;
      }
      .panel-hint {
        margin: 0 0 1.5rem;
        font-size: 0.95rem;
        color: var(--text-muted);
        line-height: 1.6;
        background: color-mix(in srgb, var(--brand) 5%, transparent);
        padding: 0.75rem 1rem;
        border-radius: 10px;
        border-left: 3px solid var(--brand);
      }
      .field-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.25rem;
      }
      @media (max-width: 640px) {
        .field-row {
          grid-template-columns: 1fr;
        }
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        margin-bottom: 1.25rem;
      }
      .field.full {
        grid-column: 1 / -1;
      }
      .field span {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-muted);
        margin-left: 0.25rem;
      }
      .field input[type='date'],
      .field select,
      .field textarea {
        font: inherit;
        padding: 0.75rem 1rem;
        border-radius: 14px;
        border: 2px solid transparent;
        background: var(--bg-secondary, #f1f5f9);
        color: var(--text-primary);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 2px 4px rgba(0,0,0,0.02) inset;
      }
      .field input[type='date']:hover,
      .field select:hover,
      .field textarea:hover {
        background: var(--bg-hover, #e2e8f0);
      }
      .field input[type='date']:focus,
      .field select:focus,
      .field textarea:focus {
        outline: none;
        background: var(--theme-surface, #fff);
        border-color: var(--brand);
        box-shadow: 0 0 0 4px color-mix(in srgb, var(--brand) 20%, transparent);
      }
      .field textarea {
        resize: vertical;
        min-height: 4.5rem;
        line-height: 1.5;
      }
      ui-button {
        margin-top: 1rem;
        display: inline-block;
      }
      .tech-footnote {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 2rem 0 0;
        font-size: 0.9rem;
        color: var(--text-muted);
        padding-top: 1.25rem;
        border-top: 1px dashed var(--border-soft);
      }
      .warn-banner {
        margin: 1.5rem 0 0;
        padding: 1rem 1.25rem;
        border-radius: 14px;
        background: color-mix(in srgb, var(--warning) 12%, transparent);
        border: 1px solid color-mix(in srgb, var(--warning) 30%, transparent);
        font-size: 0.95rem;
        color: var(--text-primary);
        line-height: 1.5;
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      .warn-banner::before {
        content: '⚠️';
        font-size: 1.2rem;
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

  formFieldValue(event: Event): string {
    return (event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)
      .value;
  }

  onMedicalKindChange(event: Event): void {
    const v = (event.target as HTMLSelectElement).value;
    if (v === 'sick' || v === 'permit' || v === 'legal') {
      this.medicalKind.set(v);
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
