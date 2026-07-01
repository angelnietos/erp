import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, EMPTY, finalize, merge, startWith, tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ClientService, ClientsFacade, type Client } from '@josanz-erp/clients-data-access';
import { AuthStore } from '@josanz-erp/identity-data-access';
import {
  ButtonComponent,
  JosanzDeleteConfirmHostComponent,
  JosanzDeleteConfirmService,
  JosanzFigmaDetailShellComponent,
  CatalogThemeFacade,
  eventStatusOptionsFromTheme,
  resolveEventStatusLabel,
  resolveEventStatusPillKey,
  resolveEventStatusPillColor,
  typologyTabFromApi,
  type JosanzFigmaDetailShellConfig,
} from '@josanz-erp/josanz-ui';
import { JosanzEventApiService, type JosanzEventRecord } from '../services/josanz-event-api.service';
import { JosanzEventsFacade } from '../services/josanz-events.facade';
import {
  statusPillKeyFromApi,
  type JosanzEventUiType,
} from '../josanz-event-form.utils';
import {
  applyDefaultEventStatusColor,
  createJosanzEventForm,
  formatEventMetaParts,
  mergeEventClients,
  operatorOptionsForClient,
  operatorSelectHint,
  patchJosanzEventForm,
  syncOperatorForClient,
  updateEventLocationValidators,
  updateOperatorValidators,
} from '../josanz-event-form.helpers';
import { JosanzEventUploadModalComponent } from './components/josanz-event-upload-modal';
import { JosanzEventDocumentsSectionComponent } from './components/josanz-event-documents-section';
import { JosanzEventDetailState } from './josanz-event-detail.state';
import { JosanzEventClienteTabComponent } from './tabs/josanz-event-cliente-tab';
import { JosanzEventEmailsTabComponent } from './tabs/josanz-event-emails-tab';
import { JosanzEventPresupuestosTabComponent } from './tabs/josanz-event-presupuestos-tab';
import { JosanzEventResumenTabComponent } from './tabs/josanz-event-resumen-tab';
import { JosanzEventStaffTabComponent } from './tabs/josanz-event-staff-tab';
import { canUserDeleteEvent } from '../utils/event-delete-access';

@Component({
  selector: 'josanz-event-detail',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    JosanzFigmaDetailShellComponent,
    JosanzDeleteConfirmHostComponent,
    JosanzEventUploadModalComponent,
    JosanzEventResumenTabComponent,
    JosanzEventClienteTabComponent,
    JosanzEventStaffTabComponent,
    JosanzEventPresupuestosTabComponent,
    JosanzEventDocumentsSectionComponent,
    JosanzEventEmailsTabComponent,
  ],
  providers: [JosanzEventDetailState],
  templateUrl: './josanz-event-detail.html',
})
export class JosanzEventDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly eventApi = inject(JosanzEventApiService);
  private readonly eventsFacade = inject(JosanzEventsFacade);
  private readonly clientService = inject(ClientService);
  private readonly clientsFacade = inject(ClientsFacade);
  private readonly catalogTheme = inject(CatalogThemeFacade);
  private readonly authStore = inject(AuthStore);
  readonly deleteConfirm = inject(JosanzDeleteConfirmService);
  readonly detailState = inject(JosanzEventDetailState);

  readonly statusOptions = computed(() =>
    eventStatusOptionsFromTheme(this.catalogTheme.mergedTheme()).map((option) => ({
      label: option.label,
      value: option.value,
    })),
  );

  readonly event = signal<JosanzEventRecord | null>(null);
  readonly clients = signal<Client[]>([]);
  readonly selectedType = signal<JosanzEventUiType>('Evento externo');
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly validationBanner = signal('');
  readonly deleteErrorMessage = signal('');
  readonly showSaveToast = signal(false);

  private readonly formRevision = signal(0);
  private readonly detailRevision = signal(0);
  private initialSnapshot = '';
  private baselineCaptured = false;

  form: FormGroup = createJosanzEventForm(this.fb);

  private readonly selectedClientId = toSignal(
    this.form.get('clientId')!.valueChanges.pipe(startWith('')),
    { initialValue: '' },
  );
  private readonly nombreValue = toSignal(
    this.form.get('nombre')!.valueChanges.pipe(startWith('')),
    { initialValue: '' },
  );
  private readonly statusValue = toSignal(
    this.form.get('status')!.valueChanges.pipe(startWith('DRAFT')),
    { initialValue: 'DRAFT' },
  );

  readonly hasUnsavedChanges = computed(() => {
    this.formRevision();
    this.detailRevision();
    if (this.loading() || !this.baselineCaptured) {
      return false;
    }
    return this.serializeState() !== this.initialSnapshot;
  });

  readonly canSave = computed(
    () =>
      !this.loading() &&
      !this.saving() &&
      this.form.valid &&
      this.hasUnsavedChanges(),
  );

  readonly saveStatusHint = computed(() => {
    if (this.loading()) {
      return '';
    }
    if (!this.form.valid) {
      return 'Completa los campos obligatorios para guardar.';
    }
    if (!this.hasUnsavedChanges()) {
      return 'Sin cambios pendientes.';
    }
    return 'Tienes cambios sin guardar.';
  });

  private readonly baseShell: Omit<
    JosanzFigmaDetailShellConfig,
    'title' | 'statusLabel' | 'statusPillKey' | 'saveDisabled'
  > = {
    listRoute: '/events',
    tabs: [
      'Resumen',
      'Cliente',
      'Staff',
      'Presupuestos',
      'Albaranes',
      'Facturas',
      'Informes / reportes',
      'Emails',
    ],
    tabSlugMap: {
      Resumen: 'resumen',
      Cliente: 'cliente',
      Staff: 'staff',
      Presupuestos: 'presupuestos',
      Albaranes: 'albaranes',
      Facturas: 'facturas',
      'Informes / reportes': 'informes',
      Emails: 'emails',
    },
    saveLabel: 'Guardar cambios',
    features: { footerActions: false, headerSave: true },
  };

  readonly shellConfig = computed<JosanzFigmaDetailShellConfig>(() => {
    const nombre = (this.nombreValue() ?? '').trim() || this.event()?.name || 'Evento';
    const status = (this.statusValue() as string) || this.event()?.status || 'DRAFT';
    return {
      ...this.baseShell,
      title: nombre,
      statusLabel: resolveEventStatusLabel(status, this.catalogTheme.mergedTheme()),
      statusPillKey: resolveEventStatusPillKey(status, this.catalogTheme.mergedTheme()) as ReturnType<typeof statusPillKeyFromApi>,
      tabAlerts: this.detailState.tabAlerts(),
      tabAlertHints: this.detailState.tabAlertHints(),
      saveDisabled: !this.canSave(),
    };
  });

  readonly heroTypologyLabel = computed(() => typologyTabFromApi(this.selectedType()));
  readonly heroMetaParts = computed(() => formatEventMetaParts(this.form, this.clients()));
  readonly heroHasDescription = computed(() =>
    Boolean((this.form.get('descripcion')?.value ?? '').toString().trim()),
  );
  readonly clientOptions = computed(() =>
    this.clients().map((client) => ({ label: client.name, value: client.id })),
  );
  readonly operatorOptions = computed(() =>
    operatorOptionsForClient(this.clients(), this.selectedClientId() ?? ''),
  );
  readonly operatorHint = computed(() =>
    operatorSelectHint(this.clients(), this.selectedClientId() ?? ''),
  );
  readonly budgetClientLabel = computed(() => {
    const operator = this.heroMetaParts().operator;
    return operator === '—' ? 'Cliente' : operator;
  });

  readonly canDeleteEvent = computed(() => {
    const current = this.event();
    if (!current || this.loading()) {
      return false;
    }
    return canUserDeleteEvent(current, this.authStore.user());
  });

  private eventId = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      void this.router.navigate(['/events']);
      return;
    }
    this.eventId = id;
    this.detailState.bindForm(() => this.detailRevision.update((n) => n + 1));
    this.catalogTheme.loadCatalogTheme();

    merge(this.form.valueChanges, this.form.statusChanges)
      .pipe(startWith(null))
      .subscribe(() => this.formRevision.update((n) => n + 1));

    if (this.route.snapshot.queryParamMap.get('updated') === '1') {
      this.showSaveToast.set(true);
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        replaceUrl: true,
      });
    }

    this.clientsFacade.loadClients();
    this.clientService.getClients().subscribe({
      next: (apiClients) => {
        const clients = mergeEventClients(apiClients, this.clientsFacade.clients());
        this.clients.set(clients);
        this.loadEvent(clients);
      },
      error: () => this.loadEvent([]),
    });

    this.eventApi.listTechnicians().subscribe({
      next: (technicians) => this.detailState.setStaffCatalogFromApi(technicians),
      error: () => this.detailState.setStaffCatalogFromApi([]),
    });

    this.form.get('clientId')?.valueChanges.subscribe((clientId: string) => {
      syncOperatorForClient(this.form, clientId, this.clients());
      updateOperatorValidators(this.form, this.clients(), clientId);
      updateEventLocationValidators(this.form, this.selectedType());
    });

    this.form.get('status')?.valueChanges.subscribe((status: string) => {
      applyDefaultEventStatusColor(this.form, status, this.catalogTheme);
    });
  }

  selectType(type: JosanzEventUiType): void {
    this.selectedType.set(type);
    updateEventLocationValidators(this.form, type);
    this.detailRevision.update((n) => n + 1);
  }

  onBack(): void {
    if (!this.confirmLeaveIfDirty()) {
      return;
    }
    void this.router.navigate(['/events']);
  }

  onShellTabChange(): void {
    this.detailState.showBudgetPicker.set(false);
    this.detailState.closeComposer();
  }

  onSave(): void {
    if (!this.canSave()) {
      return;
    }
    this.validationBanner.set('');
    if (this.form.invalid || this.saving() || this.loading()) {
      this.form.markAllAsTouched();
      this.validationBanner.set('Revisa los campos obligatorios antes de guardar.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    let payload;
    try {
      payload = this.detailState.buildSavePayload(this.form, this.selectedType());
    } catch {
      this.validationBanner.set('Revisa los campos obligatorios antes de guardar.');
      this.saving.set(false);
      return;
    }

    this.eventsFacade
      .updateEvent(this.eventId, payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (updated) => {
          this.event.set(updated);
          patchJosanzEventForm(
            this.fb,
            this.form,
            updated,
            this.clients(),
            this.catalogTheme,
            this.selectedType,
          );
          this.detailState.hydrateFromRecord(updated);
          this.captureBaseline();
          this.showSaveToast.set(true);
        },
        error: () => {
          this.errorMessage.set('No se pudo guardar el evento. Revisa los datos e inténtalo de nuevo.');
        },
      });
  }

  dismissSaveToast(): void {
    this.showSaveToast.set(false);
  }

  onDeleteClick(): void {
    const current = this.event();
    if (!current || this.loading() || this.deleteConfirm.busy() || !this.canDeleteEvent()) {
      return;
    }

    this.deleteErrorMessage.set('');
    this.deleteConfirm.ask({
      feature: 'events',
      itemName: current.name,
      onConfirm: () =>
        this.eventsFacade.deleteEvent$(this.eventId).pipe(
          tap(() => {
            void this.router.navigate(['/events'], { queryParams: { deleted: '1' } });
          }),
          catchError((error: unknown) => {
            const status =
              error instanceof HttpErrorResponse ? error.status : null;
            this.deleteErrorMessage.set(
              status === 403
                ? 'No tienes permiso para eliminar este evento.'
                : 'No se pudo eliminar el evento. Inténtalo de nuevo.',
            );
            return EMPTY;
          }),
        ),
    });
  }

  private loadEvent(clients: Client[]): void {
    this.loading.set(true);
    this.eventsFacade
      .ensureEvent(this.eventId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (event) => {
          if (!event) {
            this.errorMessage.set('No se pudo cargar el evento.');
            return;
          }
          this.event.set(event);
          patchJosanzEventForm(
            this.fb,
            this.form,
            event,
            clients,
            this.catalogTheme,
            this.selectedType,
          );
          this.detailState.hydrateFromRecord(event);
          this.maybeCaptureBaselineAfterHydrate();
        },
        error: () => this.errorMessage.set('No se pudo cargar el evento.'),
      });
  }

  private serializeState(): string {
    return this.detailState.serializePersistedState(this.form, this.selectedType());
  }

  private captureBaseline(): void {
    this.initialSnapshot = this.serializeState();
    this.form.markAsPristine();
    this.baselineCaptured = true;
    this.formRevision.update((n) => n + 1);
    this.detailRevision.update((n) => n + 1);
  }

  private maybeCaptureBaselineAfterHydrate(): void {
    const preserveUserEdits = this.baselineCaptured && this.hasUnsavedChanges();
    if (!preserveUserEdits) {
      queueMicrotask(() => this.captureBaseline());
    }
  }

  private confirmLeaveIfDirty(): boolean {
    if (!this.hasUnsavedChanges()) {
      return true;
    }
    return window.confirm(
      'Tienes cambios sin guardar. ¿Quieres salir sin guardar?',
    );
  }
}
