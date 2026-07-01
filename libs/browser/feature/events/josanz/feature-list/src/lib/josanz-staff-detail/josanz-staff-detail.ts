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
import { JosanzEventApiService, type JosanzTechnicianListItem } from '../services/josanz-event-api.service';
import { mapTechnicianRoleToPill } from '../josanz-event-detail/josanz-event-detail.payload';
import {
  formatStaffDisplayId,
  technicianDisplayName,
  technicianRoleLabel,
  technicianSkillsLabel,
  technicianAvailabilityLabel,
} from '../josanz-staff/josanz-staff.mapper';

@Component({
  selector: 'josanz-staff-detail',
  standalone: true,
  imports: [
    CommonModule,
    JosanzFigmaDetailShellComponent,
    SecondaryButtonComponent,
    DocumentItemComponent,
  ],
  templateUrl: './josanz-staff-detail.html',
})
export class JosanzStaffDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly eventApi = inject(JosanzEventApiService);

  readonly technician = signal<JosanzTechnicianListItem | null>(null);
  readonly displayIndex = signal(0);
  readonly loading = signal(true);

  readonly shellConfig = computed<JosanzFigmaDetailShellConfig>(() => {
    const tech = this.technician();
    if (!tech) {
      return {
        title: 'Staff',
        listRoute: '/staff',
        tabs: ['Resumen', 'Contratos', 'Nóminas', 'Ausencias'],
        statusLabel: '—',
        statusPillKey: 'staff-tecnico',
        saveDisabled: true,
        features: { footerActions: false },
      };
    }

    const role = technicianRoleLabel(tech.status);
    return {
      title: technicianDisplayName(tech.user),
      listRoute: '/staff',
      tabs: ['Resumen', 'Contratos', 'Nóminas', 'Ausencias'],
      statusLabel: role,
      statusPillKey: mapTechnicianRoleToPill(tech.status),
      saveDisabled: true,
      features: { footerActions: false },
    };
  });

  readonly avatarUrl = computed(() => {
    const tech = this.technician();
    if (!tech) {
      return 'https://i.pravatar.cc/96?img=12';
    }
    return tech.avatarUrl ?? `https://i.pravatar.cc/96?u=${encodeURIComponent(tech.id)}`;
  });

  readonly heroMeta = computed(() => {
    const tech = this.technician();
    if (!tech) {
      return '';
    }
    const skills = technicianSkillsLabel(tech.skills);
    const contract =
      tech.status.toUpperCase().includes('FREE') ? 'Freelance' : 'Contrato indefinido';
    return `Especialidad: ${skills} · ${contract}`;
  });

  readonly heroDescription = computed(() => this.technician()?.bio?.trim() ?? '');

  readonly personalRows = computed(() => {
    const tech = this.technician();
    if (!tech) {
      return [];
    }

    const role = technicianRoleLabel(tech.status);
    return [
      { label: 'Referencia', value: formatStaffDisplayId(this.displayIndex()) },
      { label: 'Nombre', value: technicianDisplayName(tech.user) },
      { label: 'Perfil', value: technicianSkillsLabel(tech.skills) },
      { label: 'Teléfono', value: '—' },
      { label: 'Email', value: tech.user.email },
      { label: 'Tipo', value: role },
      { label: 'Disponibilidad', value: technicianAvailabilityLabel() },
    ];
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
      .listTechnicians()
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

  pillStyle(key: JosanzStatusPillKey): Record<string, string> {
    return {
      backgroundColor: `var(--josanz-pill-${key}-bg)`,
      color: `var(--josanz-pill-${key}-text)`,
    };
  }
}
