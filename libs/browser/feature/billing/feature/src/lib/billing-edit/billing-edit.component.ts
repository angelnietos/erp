import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import {
  UiButtonComponent,
  UiInputComponent,
  UiFeaturePageShellComponent,
} from '@josanz-erp/shared-ui-kit';
import {
  BillingFacade,
  Invoice,
  InvoiceService,
} from '@josanz-erp/billing-data-access';
import { Budget } from '@josanz-erp/budget-api';
import { ToastService } from '@josanz-erp/shared-data-access';

interface InvoiceFormData extends Partial<Invoice> {
  description?: string;
}

@Component({
  selector: 'lib-billing-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    UiButtonComponent,
    UiInputComponent,
    UiFeaturePageShellComponent,
  ],
  template: `
    <ui-feature-page-shell [extraClass]="'billing-edit-root'">
      @if (isHydrating()) {
        <div class="billing-edit__loading">
          <lucide-icon name="loader" class="spin" size="40"></lucide-icon>
          <p>Cargando factura...</p>
        </div>
      } @else if (loadError() && !isCreateMode()) {
        <div class="billing-edit__error">
          <lucide-icon name="alert-triangle" size="48"></lucide-icon>
          <h2>{{ loadError() }}</h2>
          <ui-button variant="glass" (clicked)="goToList()">Volver al listado</ui-button>
        </div>
      } @else {
        <header class="billing-edit__header">
          <ui-button variant="ghost" icon="arrow-left" (clicked)="goBack()">Volver</ui-button>
          <h1 class="billing-edit__title">
            {{ isCreateMode() ? 'Emitir factura' : 'Editar factura' }}
          </h1>
        </header>

        <div class="billing-edit__form">
          @if (!editingInvoice() && isCreateMode()) {
            <p class="billing-edit__hint">
              Selecciona un presupuesto origen para importar datos comerciales de forma automática.
            </p>
            <div class="billing-edit__field">
              <label class="billing-edit__label" for="budget-select-edit">
                <lucide-icon name="file-text" size="16"></lucide-icon>
                Presupuesto origen
              </label>
              <select
                id="budget-select-edit"
                class="billing-edit__select"
                [(ngModel)]="formData.budgetId"
              >
                <option value="">Seleccionar presupuesto...</option>
                @for (option of budgetSelectOptions(); track option.value) {
                  <option [value]="option.value">{{ option.label }}</option>
                }
              </select>
            </div>
          } @else if (editingInvoice(); as inv) {
            <div class="billing-edit__readonly">
              <span class="billing-edit__readonly-label">Cliente</span>
              <span class="billing-edit__readonly-value">{{ inv.clientName }}</span>
            </div>
          }

          <ui-input
            label="Número de factura"
            [(ngModel)]="formData.invoiceNumber"
            placeholder="F/2026/XXXX"
            icon="hash"
          ></ui-input>

          <div class="billing-edit__row">
            <ui-input
              label="Emisión"
              type="date"
              [(ngModel)]="formData.issueDate"
              icon="calendar"
            ></ui-input>
            <ui-input
              label="Vencimiento"
              type="date"
              [(ngModel)]="formData.dueDate"
              icon="calendar-clock"
            ></ui-input>
          </div>

          <ui-input
            label="Descripción"
            [(ngModel)]="formData.description"
            placeholder="Descripción de la factura"
            icon="file-text"
          ></ui-input>

          <div class="billing-edit__notes">
            <label class="billing-edit__label" for="notes-billing-edit">
              <lucide-icon name="sticky-note" size="16"></lucide-icon>
              Notas
            </label>
            <textarea
              id="notes-billing-edit"
              class="billing-edit__textarea"
              [(ngModel)]="formData.notes"
              placeholder="Notas adicionales..."
              rows="3"
            ></textarea>
          </div>

          <div class="billing-edit__actions">
            <ui-button variant="ghost" (clicked)="goBack()">Cancelar</ui-button>
            <ui-button
              variant="solid"
              (clicked)="save()"
              [disabled]="isCreateMode() && !formData.budgetId"
              icon="save"
            >
              {{ editingInvoice() ? 'Guardar cambios' : 'Generar borrador' }}
            </ui-button>
          </div>
        </div>
      }
    </ui-feature-page-shell>
  `,
  styles: [
    `
      .billing-edit__loading,
      .billing-edit__error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        padding: 3rem 1rem;
        text-align: center;
      }
      .billing-edit__error h2 {
        margin: 0;
        font-size: 1rem;
        font-weight: 700;
      }
      .spin {
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
      .billing-edit__header {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 1.5rem;
      }
      .billing-edit__title {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 900;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }
      .billing-edit__form {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        max-width: 560px;
      }
      .billing-edit__hint {
        font-size: 0.75rem;
        color: var(--text-muted);
        margin: 0;
      }
      .billing-edit__field {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }
      .billing-edit__label {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.65rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        color: var(--text-muted);
      }
      .billing-edit__select {
        padding: 0.5rem 0.75rem;
        border-radius: 8px;
        border: 1px solid var(--border-soft);
        background: var(--background);
        color: var(--text);
        font-size: 0.875rem;
      }
      .billing-edit__readonly {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        padding: 0.75rem 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      }
      .billing-edit__readonly-label {
        font-size: 0.55rem;
        font-weight: 800;
        color: var(--text-muted);
        letter-spacing: 0.08em;
      }
      .billing-edit__readonly-value {
        font-size: 0.85rem;
        font-weight: 700;
      }
      .billing-edit__row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }
      @media (max-width: 600px) {
        .billing-edit__row {
          grid-template-columns: 1fr;
        }
      }
      .billing-edit__textarea {
        width: 100%;
        padding: 0.5rem 0.75rem;
        border-radius: 8px;
        border: 1px solid var(--border-soft);
        background: var(--background);
        color: var(--text);
        font-family: inherit;
        font-size: 0.875rem;
        resize: vertical;
        min-height: 80px;
      }
      .billing-edit__actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 0.5rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingEditComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly facade = inject(BillingFacade);
  private readonly invoiceService = inject(InvoiceService);
  private readonly toast = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly isCreateMode = signal(false);
  readonly isHydrating = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly editingInvoice = signal<Invoice | null>(null);

  formData: InvoiceFormData = {
    budgetId: '',
    invoiceNumber: '',
    clientName: '',
    type: 'normal',
    status: 'draft',
    total: 0,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    description: '',
    notes: '',
  };

  budgetSelectOptions = computed(() => {
    const eligible = this.facade.budgets().filter(
      (b: Budget) => b.status === 'ACCEPTED' || b.status === 'SENT',
    );
    return eligible.map((b: Budget) => ({
      label: `#${b.id.slice(0, 8).toUpperCase()} · ${(b.total || 0).toFixed(2)} € · ${b.status}`,
      value: b.id,
    }));
  });

  ngOnInit(): void {
    const path = this.route.snapshot.routeConfig?.path;
    this.isCreateMode.set(path === 'new');

    if (path === 'new') {
      this.facade.loadBudgets();
      const today = new Date().toISOString().split('T')[0];
      this.formData = {
        budgetId: '',
        invoiceNumber: '',
        clientName: '',
        type: 'normal',
        status: 'draft',
        total: 0,
        issueDate: today,
        dueDate: today,
        description: '',
        notes: '',
      };
      return;
    }

    if (path === ':id/edit') {
      const id = this.route.snapshot.paramMap.get('id');
      if (!id) {
        void this.router.navigate(['/billing']);
        return;
      }
      this.isHydrating.set(true);
      this.invoiceService.getInvoice(id).subscribe({
        next: (inv) => {
          this.isHydrating.set(false);
          if (!inv) {
            this.loadError.set('Factura no encontrada.');
            this.cdr.markForCheck();
            return;
          }
          this.editingInvoice.set(inv);
          this.formData = {
            ...inv,
            description: '',
            notes: inv.notes ?? '',
          };
          this.cdr.markForCheck();
        },
        error: () => {
          this.isHydrating.set(false);
          this.loadError.set('No se pudo cargar la factura.');
          this.cdr.markForCheck();
        },
      });
    }
  }

  goToList(): void {
    void this.router.navigate(['/billing']);
  }

  goBack(): void {
    if (this.isCreateMode()) {
      void this.router.navigate(['/billing']);
      return;
    }
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      void this.router.navigate(['/billing', id]);
    } else {
      void this.router.navigate(['/billing']);
    }
  }

  save(): void {
    const invToEdit = this.editingInvoice();
    if (invToEdit) {
      this.facade
        .updateInvoice$(invToEdit.id, {
          invoiceNumber: this.formData.invoiceNumber,
          issueDate: this.formData.issueDate,
          dueDate: this.formData.dueDate,
          notes: this.formData.notes,
        })
        .subscribe({
          next: () => {
            this.toast.show('Factura actualizada', 'success');
            void this.router.navigate(['/billing', invToEdit.id]);
          },
          error: () =>
            this.toast.show('No se pudo actualizar la factura', 'error'),
        });
      return;
    }

    if (!this.formData.budgetId) {
      return;
    }

    const payload: Omit<Invoice, 'id'> = {
      budgetId: this.formData.budgetId,
      invoiceNumber:
        this.formData.invoiceNumber?.trim() ||
        `F/${new Date().getFullYear()}/${String(Date.now()).slice(-4)}`,
      clientName: '—',
      type: 'normal',
      status: 'draft',
      total: 0,
      issueDate:
        this.formData.issueDate || new Date().toISOString().split('T')[0],
      dueDate:
        this.formData.dueDate || new Date().toISOString().split('T')[0],
      notes: this.formData.notes,
    };

    this.invoiceService.createInvoice(payload).subscribe({
      next: (created) => {
        this.facade.upsertInvoice(created);
        this.toast.show('Borrador generado', 'success');
        void this.router.navigate(['/billing', created.id]);
      },
      error: () => {
        this.toast.show('No se pudo crear la factura', 'error');
      },
    });
  }
}
