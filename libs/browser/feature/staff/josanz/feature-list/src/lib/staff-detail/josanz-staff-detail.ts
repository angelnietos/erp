import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import {
  DocumentItemComponent,
  JosanzFigmaDetailShellComponent,
  SecondaryButtonComponent,
  type JosanzFigmaDetailShellConfig,
  type JosanzStatusPillKey,
} from '@josanz-erp/josanz-ui';
import { GlobalAuthStore, rbacAllows } from '@josanz-erp/shared-data-access';
import { JosanzEventApiService, type JosanzTechnicianListItem } from '@josanz-erp/josanz-events-data-access';
import { mapTechnicianRoleToPill } from '@josanz-erp/josanz-events-feature-list';
import {
  technicianDisplayName,
  technicianRoleLabel,
} from '../staff/josanz-staff.mapper';
import { JosanzStaffPermissionsTabComponent } from './josanz-staff-permissions-tab';
import { JosanzStaffSummaryTabComponent } from './josanz-staff-summary-tab';
import { JosanzDocumentUploadModalComponent, JosanzDocumentUploadData } from './josanz-document-upload-modal';
import { JosanzAbsenceRegisterModalComponent, JosanzAbsenceFormData } from './josanz-absence-register-modal';

@Component({
  selector: 'josanz-staff-detail',
  standalone: true,
  imports: [
    CommonModule,
    JosanzFigmaDetailShellComponent,
    SecondaryButtonComponent,
    DocumentItemComponent,
    JosanzStaffPermissionsTabComponent,
    JosanzStaffSummaryTabComponent,
    JosanzDocumentUploadModalComponent,
    JosanzAbsenceRegisterModalComponent,
  ],
  templateUrl: './josanz-staff-detail.html',
  styleUrl: './josanz-staff-detail.scss',
})
export class JosanzStaffDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly eventApi = inject(JosanzEventApiService);
  private readonly authStore = inject(GlobalAuthStore);

  readonly canViewUsers = rbacAllows(this.authStore, 'users.view', 'users.manage');

  readonly technician = signal<JosanzTechnicianListItem | null>(null);
  readonly displayIndex = signal(0);
  readonly loading = signal(true);

  readonly showContractModal = signal(false);
  readonly showPayrollModal = signal(false);
  readonly showAbsenceModal = signal(false);

  readonly isOwnProfile = computed(() => {
    const tech = this.technician();
    const sessionId = this.authStore.user()?.id;
    return Boolean(tech && sessionId && tech.user.id === sessionId);
  });

  readonly canAccessPermissions = computed(
    () => this.canViewUsers() || this.isOwnProfile(),
  );

  readonly shellConfig = computed<JosanzFigmaDetailShellConfig>(() => {
    const tech = this.technician();
    const tabs = ['Resumen', 'Permisos', 'Contratos', 'Nóminas', 'Ausencias'];

    if (!tech) {
      return {
        title: 'Staff',
        listRoute: '/staff',
        tabs,
        statusLabel: '—',
        statusPillKey: 'staff-tecnico',
        features: { footerActions: false, headerSave: false },
      };
    }

    const role = technicianRoleLabel(tech.status);
    return {
      title: technicianDisplayName(tech.user),
      listRoute: '/staff',
      tabs,
      statusLabel: role,
      statusPillKey: mapTechnicianRoleToPill(tech.status),
      features: { footerActions: false, headerSave: false },
    };
  });

  readonly contractFiles = ['Contrato indefinido.pdf', 'Anexo horario.pdf'];
  readonly payrollFiles = ['Nómina abril 2026.pdf', 'Nómina marzo 2026.pdf'];
  readonly absences = [
    {
      id: '1',
      range: '01/08 – 15/08/2026',
      type: 'Vacaciones',
      pillKey: 'confirmado' as JosanzStatusPillKey,
    },
    {
      id: '2',
      range: '12/03/2026',
      type: 'Permiso',
      pillKey: 'en-proceso' as JosanzStatusPillKey,
    },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.eventApi
      .listTechnicians('catalog')
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (technicians) => {
          const index = technicians.findIndex((row) => row.id === id);
          this.displayIndex.set(index >= 0 ? index : 0);
          this.technician.set(technicians.find((row) => row.id === id) ?? null);
        },
        error: () => this.technician.set(null),
      });
  }

  onStaffSaved(updated: JosanzTechnicianListItem): void {
    this.technician.set(updated);
  }

  openContractModal(): void {
    this.showContractModal.set(true);
  }

  openPayrollModal(): void {
    this.showPayrollModal.set(true);
  }

  openAbsenceModal(): void {
    this.showAbsenceModal.set(true);
  }

  onContractUploaded(data: JosanzDocumentUploadData): void {
    console.log('Contract uploaded:', data);
    this.showContractModal.set(false);
  }

  onPayrollUploaded(data: JosanzDocumentUploadData): void {
    console.log('Payroll uploaded:', data);
    this.showPayrollModal.set(false);
  }

  onAbsenceRegistered(data: JosanzAbsenceFormData): void {
    console.log('Absence registered:', data);
    this.showAbsenceModal.set(false);
  }

  pillStyle(key: JosanzStatusPillKey): Record<string, string> {
    return {
      backgroundColor: `var(--josanz-pill-${key}-bg)`,
      color: `var(--josanz-pill-${key}-text)`,
    };
  }
}