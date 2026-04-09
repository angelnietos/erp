import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
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
import { ClientService, Client } from '@josanz-erp/clients-data-access';
import { ToastService } from '@josanz-erp/shared-data-access';

interface ClientForm {
  name: string;
  email: string;
  phone: string;
  sector: string;
  fiscalId: string;
  address: string;
  notes: string;
}

@Component({
  selector: 'lib-clients-edit',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
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
    <div class="edit-container">
      @if (isLoading()) {
        <div class="edit-loading">
          <ui-loader message="Cargando cliente..."></ui-loader>
        </div>
      } @else {
        <!-- HEADER -->
        <header class="edit-header">
          <button class="back-btn" (click)="goBack()">
            <lucide-icon name="arrow-left" size="18"></lucide-icon>
          </button>
          <div class="edit-header-info">
            <div class="edit-breadcrumb">CLIENTES / EDITAR</div>
            <h1 class="edit-title">{{ isNew ? 'Nuevo Cliente' : (form.name || 'Editar Cliente') }}</h1>
          </div>
          <div class="edit-header-actions">
            <ui-button variant="ghost" icon="x" (click)="goBack()">Cancelar</ui-button>
            <ui-button variant="solid" icon="save" [disabled]="isSaving()" (click)="onSave()">
              {{ isSaving() ? 'Guardando...' : 'Guardar Cambios' }}
            </ui-button>
          </div>
        </header>

        <!-- FORM -->
        <div class="edit-body">
          <ui-card>
            <div class="form-grid">
              <ui-input
                label="Nombre de empresa / cliente *"
                [(ngModel)]="form.name"
                name="name"
                placeholder="Ej: Audiovisuales Madrid S.L."
              />

              <ui-select
                label="Sector"
                [(ngModel)]="form.sector"
                name="sector"
                [options]="sectorOptions"
              />

              <ui-input
                label="Email"
                type="email"
                [(ngModel)]="form.email"
                name="email"
                placeholder="contacto@empresa.es"
              />

              <ui-input
                label="Teléfono"
                [(ngModel)]="form.phone"
                name="phone"
                placeholder="+34 900 000 000"
              />

              <ui-input
                label="NIF / CIF"
                [(ngModel)]="form.fiscalId"
                name="fiscalId"
                placeholder="B12345678"
              />

              <ui-input
                label="Dirección"
                [(ngModel)]="form.address"
                name="address"
                placeholder="Calle, número, ciudad"
              />

              <ui-textarea
                label="Notas internas"
                [(ngModel)]="form.notes"
                name="notes"
                placeholder="Observaciones, preferencias, historial..."
                class="span-2"
              />
            </div>
          </ui-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .edit-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
    }

    .edit-loading {
      display: flex;
      justify-content: center;
      padding: 4rem;
    }

    .edit-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-soft);
    }

    .back-btn {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-soft);
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;
      flex-shrink: 0;
    }
    .back-btn:hover {
      background: var(--brand-ambient);
      color: var(--brand);
      border-color: var(--brand-border-soft);
    }

    .edit-header-info {
      flex: 1;
    }

    .edit-breadcrumb {
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: 0.15em;
      color: var(--text-muted);
      margin-bottom: 0.25rem;
    }

    .edit-title {
      margin: 0;
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--text-primary);
    }

    .edit-header-actions {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    .edit-body {
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
      padding: 1.5rem;
    }

    .span-2 {
      grid-column: 1 / -1;
    }

    @media (max-width: 640px) {
      .form-grid { grid-template-columns: 1fr; }
      .edit-header { flex-wrap: wrap; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientsEditComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly clientService = inject(ClientService);
  private readonly toast = inject(ToastService);

  isLoading = signal(false);
  isSaving = signal(false);
  isNew = false;
  clientId = '';

  form: ClientForm = {
    name: '',
    email: '',
    phone: '',
    sector: '',
    fiscalId: '',
    address: '',
    notes: '',
  };

  sectorOptions = [
    { label: 'Selecciona sector...', value: '' },
    { label: 'Producción', value: 'PRODUCTION' },
    { label: 'Eventos', value: 'EVENTS' },
    { label: 'Hostelería', value: 'HOSPITALITY' },
    { label: 'Educación', value: 'EDUCATION' },
    { label: 'Corporativo', value: 'CORPORATE' },
    { label: 'Entretenimiento', value: 'ENTERTAINMENT' },
    { label: 'Otros', value: 'OTHER' },
  ];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.isNew = !id || id === 'new';

    if (!this.isNew && id) {
      this.clientId = id;
      this.loadClient(id);
    }
  }

  private loadClient(id: string) {
    this.isLoading.set(true);
    this.clientService.getClient(id).subscribe({
      next: (c) => {
        if (c) {
          this.form = {
            name: c.name || '',
            email: c.email || '',
            phone: c.phone || '',
            sector: c.sector || '',
            fiscalId: (c as any).fiscalId || '',
            address: (c as any).address || '',
            notes: (c as any).notes || '',
          };
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.show('No se pudo cargar el cliente', 'error');
        this.isLoading.set(false);
      },
    });
  }

  onSave() {
    if (!this.form.name?.trim()) {
      this.toast.show('El nombre del cliente es obligatorio', 'error');
      return;
    }

    this.isSaving.set(true);

    const patch: Partial<Client> = {
      name: this.form.name,
      email: this.form.email,
      phone: this.form.phone,
      sector: this.form.sector as any,
    };

    if (this.isNew) {
      this.clientService.createClient(patch as any).subscribe({
        next: (created) => {
          this.toast.show('✅ Cliente creado correctamente', 'success');
          this.isSaving.set(false);
          this.router.navigate(['/clients', created.id]);
        },
        error: () => {
          this.toast.show('Error al crear el cliente', 'error');
          this.isSaving.set(false);
        },
      });
    } else {
      this.clientService.updateClient(this.clientId, patch).subscribe({
        next: () => {
          this.toast.show('✅ Cliente actualizado correctamente', 'success');
          this.isSaving.set(false);
          this.router.navigate(['/clients', this.clientId]);
        },
        error: () => {
          this.toast.show('Error al guardar los cambios', 'error');
          this.isSaving.set(false);
        },
      });
    }
  }

  goBack() {
    if (this.clientId) {
      this.router.navigate(['/clients', this.clientId]);
    } else {
      this.router.navigate(['/clients']);
    }
  }
}
