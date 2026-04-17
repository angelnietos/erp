import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  TechnicianApiService,
  ToastService,
  GlobalAuthStore,
  rbacAllows,
  type Technician as ApiTechnician,
} from '@josanz-erp/shared-data-access';
import { LucideAngularModule } from 'lucide-angular';
import {
  UiFeatureHeaderComponent,
  UiFeatureAccessDeniedComponent,
  UiTabsComponent,
  UiCardComponent,
  UiButtonComponent,
  type TabItem,
} from '@josanz-erp/shared-ui-kit';

/** Rango inclusive de fechas ISO `YYYY-MM-DD` (mediodía local para evitar saltos DST). */
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
    RouterLink,
    LucideAngularModule,
    UiFeatureHeaderComponent,
    UiFeatureAccessDeniedComponent,
    UiTabsComponent,
    UiCardComponent,
    UiButtonComponent,
  ],
  template: `
    @if (!canAccess()) {
      <ui-feature-access-denied
        message="No tienes permiso para solicitar ausencias."
        permissionHint="users.view"
      />
    } @else {
      <div class="absence-request-page availability-container">
        <nav class="back-row">
          <a routerLink="/users/availability" class="back-link">
            <lucide-icon name="chevron-left" size="18"></lucide-icon>
            Volver a disponibilidad
          </a>
        </nav>

        <ui-feature-header
          title="Solicitar días"
          subtitle="Elige el motivo, el rango de fechas y envía. Se aplicará al técnico seleccionado en el calendario."
          icon="calendar-plus"
        />

        <ui-card shape="auto" class="request-card">
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
                  Bloquea el rango como <strong>vacaciones</strong> en el cuadrante.
                </p>
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
                  Enviar solicitud de vacaciones
                </ui-button>
              </section>
            }

            @if (activeTab() === 'medical') {
              <section class="panel" aria-labelledby="med-title">
                <h2 id="med-title" class="panel-title">Ausencias (médica, legal u otros permisos)</h2>
                <p class="panel-hint">
                  Elige el tipo de ausencia y el rango de fechas. Se registrará en el cuadrante con el estado correspondiente.
                </p>
                <label class="field full">
                  <span>Tipo de ausencia</span>
                  <select
                    [value]="medicalKind()"
                    (change)="medicalKind.set($any($event.target).value)"
                  >
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
                    placeholder="Ej. parte de baja, resolución, días de permiso retribuido…"
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
                  Registrar ausencia
                </ui-button>
              </section>
            }
          </div>

          @if (techLabel()) {
            <p class="tech-footnote">
              <lucide-icon name="user" size="14"></lucide-icon>
              Técnico: <strong>{{ techLabel() }}</strong>
            </p>
          }
          @if (isMockTechnician()) {
            <p class="warn-banner">
              El técnico activo es de demostración. Inicia sesión con datos reales o selecciona un técnico del ERP en el
              calendario y vuelve aquí.
            </p>
          }
        </ui-card>
      </div>
    }
  `,
  styles: [
    `
      .absence-request-page {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 0 1rem 2rem;
      }
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
      .request-card {
        padding: 1.5rem 1.75rem !important;
        border-radius: 20px !important;
        border: 1px solid var(--border-soft);
      }
      /* La barra de pestañas usa todo el ancho para que Vacaciones + Ausencias se vean siempre. */
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
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--text-primary);
      }
      .panel-hint {
        margin: 0 0 1.25rem;
        font-size: 0.9rem;
        color: var(--text-muted);
        line-height: 1.45;
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
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--text-muted);
      }
      .field input[type='date'],
      .field select,
      .field textarea {
        font: inherit;
        padding: 0.55rem 0.75rem;
        border-radius: var(--radius-md, 10px);
        border: 1px solid var(--border-soft);
        background: var(--bg-secondary, #f7f7f7);
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
        font-size: 0.85rem;
        color: var(--text-muted);
      }
      .warn-banner {
        margin: 1rem 0 0;
        padding: 0.75rem 1rem;
        border-radius: var(--radius-md, 10px);
        background: color-mix(in srgb, var(--warning) 18%, transparent);
        border: 1px solid color-mix(in srgb, var(--warning) 45%, transparent);
        font-size: 0.85rem;
        color: var(--text-primary);
      }
    `,
  ],
})
export class AbsenceRequestComponent implements OnInit {
  private readonly api = inject(TechnicianApiService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly authStore = inject(GlobalAuthStore);

  readonly canAccess = rbacAllows(this.authStore, 'users.view', 'users.manage');

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
  /** Valores internos; se mapean a tipo API al enviar. */
  medicalKind = signal<'sick' | 'permit' | 'legal'>('sick');

  readonly medicalOptions: { value: 'sick' | 'permit' | 'legal'; label: string }[] = [
    { value: 'sick', label: 'Baja o ausencia médica (IT / parte)' },
    { value: 'permit', label: 'Permiso retribuido / asuntos propios' },
    { value: 'legal', label: 'Permiso legal (matrimonio, fallecimiento, etc.)' },
  ];

  technicianId = signal<string>('');
  technicianName = signal<string | null>(null);
  submitting = signal(false);

  readonly techLabel = computed(() => {
    const name = this.technicianName();
    const id = this.technicianId();
    if (name) {
      return name;
    }
    if (id === 'me') {
      return 'Yo (primer técnico del tenant)';
    }
    return id ? id : null;
  });

  readonly isMockTechnician = computed(() => /^t\d+$/i.test(this.technicianId().trim()));

  ngOnInit(): void {
    const today = new Date();
    const iso = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    this.vacationStart.set(iso(today));
    this.vacationEnd.set(iso(today));
    this.medicalStart.set(iso(today));
    this.medicalEnd.set(iso(today));

    this.route.queryParamMap.subscribe((q) => {
      const tid = (q.get('techId') ?? '').trim();
      if (tid) {
        this.technicianId.set(tid);
        void this.resolveTechnicianName(tid);
      } else {
        this.technicianId.set('me');
        this.technicianName.set(null);
      }
    });
  }

  private async resolveTechnicianName(id: string): Promise<void> {
    if (id === 'me' || /^t\d+$/i.test(id)) {
      this.technicianName.set(null);
      return;
    }
    try {
      const list = await firstValueFrom(this.api.getTechnicians());
      const t = (list ?? []).find((x: ApiTechnician) => x.id === id);
      if (t?.user) {
        const n = `${t.user.firstName ?? ''} ${t.user.lastName ?? ''}`.trim();
        this.technicianName.set(n || t.user.email || null);
      } else {
        this.technicianName.set(null);
      }
    } catch {
      this.technicianName.set(null);
    }
  }

  onTabChange(id: string): void {
    if (id === 'vacation' || id === 'medical') {
      this.activeTab.set(id);
    }
  }

  canSubmitVacation(): boolean {
    if (this.isMockTechnician()) {
      return false;
    }
    const s = this.vacationStart();
    const e = this.vacationEnd();
    if (!s || !e) {
      return false;
    }
    return enumerateDatesInclusive(s, e).length > 0 && this.isPersistableTechnicianId(this.technicianId());
  }

  canSubmitMedical(): boolean {
    if (this.isMockTechnician()) {
      return false;
    }
    const s = this.medicalStart();
    const e = this.medicalEnd();
    if (!s || !e) {
      return false;
    }
    return enumerateDatesInclusive(s, e).length > 0 && this.isPersistableTechnicianId(this.technicianId());
  }

  submitVacation(): void {
    const dates = enumerateDatesInclusive(this.vacationStart(), this.vacationEnd());
    if (!dates.length) {
      this.toast.show('Revisa las fechas: el rango no es válido.', 'error');
      return;
    }
    const notes = this.vacationNotes().trim();
    const slots = dates.map((date) => ({
      date,
      type: 'HOLIDAY',
      ...(notes ? { notes } : {}),
    }));
    this.runBulk(slots, 'Vacaciones registradas en el cuadrante.');
  }

  submitMedical(): void {
    const dates = enumerateDatesInclusive(this.medicalStart(), this.medicalEnd());
    if (!dates.length) {
      this.toast.show('Revisa las fechas: el rango no es válido.', 'error');
      return;
    }
    const kind = this.medicalKind();
    const extra = this.medicalNotes().trim();
    let type = 'SICK_LEAVE';
    let notes = extra;
    if (kind === 'permit') {
      type = 'UNAVAILABLE';
      notes = [extra, 'Permiso retribuido / asuntos propios'].filter(Boolean).join(' — ');
    } else if (kind === 'legal') {
      type = 'UNAVAILABLE';
      notes = [extra, 'Permiso legal'].filter(Boolean).join(' — ');
    } else {
      notes = [extra, 'Ausencia médica'].filter(Boolean).join(' — ');
    }
    const slots = dates.map((date) => ({
      date,
      type,
      ...(notes ? { notes } : {}),
    }));
    this.runBulk(slots, 'Ausencia registrada en el cuadrante.');
  }

  private runBulk(
    slots: { date: string; type: string; notes?: string }[],
    successMsg: string,
  ): void {
    const id = this.technicianId().trim() || 'me';
    if (!this.isPersistableTechnicianId(id)) {
      this.toast.show('Selecciona un técnico válido en el calendario (UUID) o usa “yo”.', 'error');
      return;
    }
    this.submitting.set(true);
    this.api.setBulkAvailability(id, slots).subscribe({
      next: (res) => {
        this.submitting.set(false);
        this.toast.show(`${successMsg} (${res.saved} día(s)).`, 'success', 3500);
      },
      error: (err: unknown) => {
        this.submitting.set(false);
        console.error(err);
        this.toast.show(this.bulkErrorMessage(err), 'error', 5000);
      },
    });
  }

  private bulkErrorMessage(err: unknown): string {
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
        return 'Sesión o tenant no válido. Vuelve a iniciar sesión.';
      }
      if (err.status === 404) {
        return 'Técnico no encontrado.';
      }
    }
    return 'No se pudo guardar. Reinténtalo.';
  }

  private isPersistableTechnicianId(id: string): boolean {
    const v = id.trim();
    if (v === 'me') {
      return true;
    }
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
  }
}
