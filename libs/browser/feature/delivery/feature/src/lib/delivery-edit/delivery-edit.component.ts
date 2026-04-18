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
  UiTextareaComponent,
  UiSelectComponent,
  UiCardComponent,
  UiLoaderComponent,
} from '@josanz-erp/shared-ui-kit';
import {
  DeliveryFacade,
  DeliveryNote,
  DeliveryNoteService,
} from '@josanz-erp/delivery-data-access';
import { ThemeService, PluginStore, ToastService } from '@josanz-erp/shared-data-access';

@Component({
  selector: 'lib-delivery-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    UiButtonComponent,
    UiInputComponent,
    UiTextareaComponent,
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
        <ui-loader message="Cargando albarán..."></ui-loader>
      } @else if (loadError() && !isCreateMode) {
        <div class="error-state">
          <lucide-icon name="alert-triangle" size="48" [style.color]="currentTheme().primary"></lucide-icon>
          <h2>ALBARÁN NO ENCONTRADO</h2>
          <ui-button variant="primary" (clicked)="goToList()">VOLVER AL LISTADO</ui-button>
        </div>
      } @else {
        <header class="page-header" [style.border-bottom-color]="currentTheme().primary + '33'">
          <div class="header-actions">
            <ui-button variant="ghost" icon="arrow-left" (clicked)="goBack()">Volver</ui-button>
          </div>
          <div class="header-breadcrumb">
            <h1 class="page-title text-uppercase glow-text">
              {{ isCreateMode ? 'Nuevo albarán' : 'Editar albarán' }}
            </h1>
            <div class="breadcrumb">
              <span class="active" [style.color]="currentTheme().primary">ALBARANES</span>
              <span class="separator">/</span>
              <span>{{ form.budgetId || '—' }}</span>
            </div>
          </div>
          <div class="header-actions">
            <ui-button variant="secondary" icon="x" (clicked)="goBack()">Cancelar</ui-button>
            <ui-button variant="primary" icon="save" (clicked)="save()">Guardar</ui-button>
          </div>
        </header>

        <ui-card variant="glass" title="Datos del albarán">
          <div class="form-grid">
            <ui-input
              label="Referencia presupuesto"
              [(ngModel)]="form.budgetId"
              placeholder="#PR-0000"
              icon="file-text"
            />
            <ui-input
              label="Cliente receptor"
              [(ngModel)]="form.clientName"
              placeholder="Razón social"
              icon="user"
            />
            <ui-select
              label="Estado"
              [(ngModel)]="form.status"
              [options]="statusOptions"
              icon="activity"
            />
            <div class="row-2">
              <ui-input
                label="Fecha de salida"
                type="date"
                [(ngModel)]="form.deliveryDate"
                icon="calendar"
              />
              <ui-input
                label="Retorno previsto"
                type="date"
                [(ngModel)]="form.returnDate"
                icon="rotate-ccw"
              />
            </div>
            <ui-input
              label="Unidades consignadas"
              type="number"
              [(ngModel)]="form.itemsCount"
              icon="box"
            />
            <ui-textarea
              label="Notas de operación"
              [(ngModel)]="form.notes"
              placeholder="Observaciones"
              [rows]="4"
            />
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
export class DeliveryEditComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly facade = inject(DeliveryFacade);
  private readonly api = inject(DeliveryNoteService);
  private readonly toast = inject(ToastService);

  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);

  currentTheme = this.themeService.currentThemeData;

  isLoading = signal(true);
  loadError = signal(false);
  private noteId = '';
  /** Ruta `/delivery/new`. */
  isCreateMode = false;

  form: Partial<DeliveryNote> = {
    budgetId: '',
    clientName: '',
    status: 'draft',
    deliveryDate: '',
    returnDate: '',
    itemsCount: 0,
    notes: '',
  };

  statusOptions = [
    { value: 'draft', label: 'Borrador' },
    { value: 'pending', label: 'Pendiente' },
    { value: 'signed', label: 'Firmado' },
    { value: 'completed', label: 'Completado' },
  ];

  ngOnInit() {
    if (this.route.snapshot.routeConfig?.path === 'new') {
      this.isCreateMode = true;
      this.noteId = '';
      this.isLoading.set(false);
      this.loadError.set(false);
      return;
    }
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loadError.set(true);
      this.isLoading.set(false);
      return;
    }
    this.noteId = id;
    this.api.getDeliveryNote(id).subscribe({
      next: (n) => {
        if (!n) {
          this.loadFromList(id);
          return;
        }
        this.applyNote(n);
        this.isLoading.set(false);
      },
      error: () => this.loadFromList(id),
    });
  }

  private loadFromList(id: string) {
    this.api.getDeliveryNotes().subscribe({
      next: (list) => {
        const n = list.find((x) => x.id === id);
        if (n) {
          this.applyNote(n);
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

  private applyNote(n: DeliveryNote) {
    this.form = {
      budgetId: n.budgetId,
      clientName: n.clientName,
      status: n.status,
      deliveryDate: n.deliveryDate,
      returnDate: n.returnDate,
      itemsCount: n.itemsCount,
      notes: n.notes ?? '',
    };
    this.loadError.set(false);
  }

  goBack() {
    if (this.isCreateMode) {
      this.goToList();
      return;
    }
    if (this.noteId) {
      this.router.navigate(['/delivery', this.noteId]);
      return;
    }
    this.goToList();
  }

  goToList() {
    this.router.navigate(['/delivery']);
  }

  save() {
    const budgetId = this.form.budgetId?.trim();
    const clientName = this.form.clientName?.trim();
    if (!budgetId || !clientName) {
      this.toast.show('Presupuesto y cliente son obligatorios', 'error');
      return;
    }
    const itemsCount = Math.max(0, Math.floor(Number(this.form.itemsCount ?? 0)));

    const body: Omit<DeliveryNote, 'id'> = {
      budgetId,
      clientName,
      status: (this.form.status ?? 'draft') as DeliveryNote['status'],
      deliveryDate: this.form.deliveryDate ?? '',
      returnDate: this.form.returnDate ?? '',
      itemsCount,
      notes: (this.form.notes ?? '').trim() || undefined,
    };

    if (this.isCreateMode) {
      this.facade.createDeliveryNote(body).subscribe({
        next: (n) => {
          this.toast.show('Albarán creado', 'success');
          this.router.navigate(['/delivery', n.id]);
        },
        error: () =>
          this.toast.show('No se pudo crear el albarán.', 'error'),
      });
      return;
    }

    this.facade
      .updateDeliveryNote(this.noteId, {
        ...this.form,
        budgetId,
        clientName,
        status: this.form.status ?? 'draft',
        itemsCount,
        notes: (this.form.notes ?? '').trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.toast.show('Albarán actualizado', 'success');
          this.router.navigate(['/delivery', this.noteId]);
        },
        error: () =>
          this.toast.show('No se pudo guardar el albarán.', 'error'),
      });
  }
}
