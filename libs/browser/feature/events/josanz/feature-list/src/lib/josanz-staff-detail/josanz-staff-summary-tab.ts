import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import {
  ButtonComponent,
  ChipInputComponent,
  InputComponent,
  JosanzFigmaSuccessToastComponent,
  SelectComponent,
  type JosanzSelectOption,
} from '@josanz-erp/josanz-ui';
import { GlobalAuthStore, rbacAllows } from '@josanz-erp/shared-data-access';
import {
  JosanzEventApiService,
  type JosanzTechnicianListItem,
} from '../services/josanz-event-api.service';
import {
  formatStaffDisplayId,
  technicianDisplayName,
  technicianRoleLabel,
  technicianSkillChipLabel,
  technicianSkillsLabel,
} from '../josanz-staff/josanz-staff.mapper';
import { mapTechnicianRoleToPill } from '../josanz-event-detail/josanz-event-detail.payload';
import type { JosanzStatusPillKey } from '@josanz-erp/josanz-ui';

const SKILL_LABEL_TO_KEY: Record<string, string> = {
  Sonido: 'AUDIO',
  RF: 'RF',
  Iluminación: 'ILUMINACION',
  Escena: 'ESCENA',
  Vídeo: 'VIDEO',
  Video: 'VIDEO',
  Streaming: 'STREAMING',
};

@Component({
  selector: 'josanz-staff-summary-tab',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    SelectComponent,
    ChipInputComponent,
    ButtonComponent,
    JosanzFigmaSuccessToastComponent,
  ],
  templateUrl: './josanz-staff-summary-tab.html',
  styleUrl: './josanz-staff-summary-tab.scss',
})
export class JosanzStaffSummaryTabComponent implements OnChanges {
  @Input({ required: true }) technician!: JosanzTechnicianListItem;
  @Input() displayIndex = 0;
  @Output() saved = new EventEmitter<JosanzTechnicianListItem>();

  private readonly fb = inject(FormBuilder);
  private readonly eventApi = inject(JosanzEventApiService);
  private readonly authStore = inject(GlobalAuthStore);

  readonly canManageUsers = rbacAllows(this.authStore, 'users.manage');
  readonly saving = signal(false);
  readonly showToast = signal(false);
  readonly error = signal('');
  readonly profilePanelOpen = signal(true);

  readonly statusOptions: JosanzSelectOption[] = [
    { label: 'Técnico', value: 'ACTIVE' },
    { label: 'Freelance', value: 'FREELANCE' },
  ];

  readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    bio: [''],
    status: ['ACTIVE', Validators.required],
    skills: [[] as string[]],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['technician']) {
      this.patchForm(this.technician);
    }
  }

  get avatarUrl(): string {
    return (
      this.technician.avatarUrl ??
      `https://i.pravatar.cc/96?u=${encodeURIComponent(this.technician.id)}`
    );
  }

  get displayName(): string {
    return technicianDisplayName({
      firstName: this.form.controls.firstName.value,
      lastName: this.form.controls.lastName.value,
    });
  }

  get roleLabel(): string {
    return technicianRoleLabel(this.form.controls.status.value);
  }

  get statusPillKey(): JosanzStatusPillKey {
    return mapTechnicianRoleToPill(this.form.controls.status.value);
  }

  get skillChips(): string[] {
    return this.form.controls.skills.value;
  }

  get heroMeta(): string {
    return this.form.controls.status.value.toUpperCase().includes('FREE')
      ? 'Freelance'
      : 'Contrato indefinido';
  }

  get referenceLabel(): string {
    return formatStaffDisplayId(this.displayIndex);
  }

  get skillsSummary(): string {
    return technicianSkillsLabel(this.skillsToApiKeys(this.form.controls.skills.value));
  }

  canEdit(): boolean {
    const sessionId = this.authStore.user()?.id;
    const isSelf = sessionId != null && sessionId === this.technician.user.id;
    return this.canManageUsers() || isSelf;
  }

  save(): void {
    if (!this.canEdit() || this.saving()) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Revisa los campos obligatorios antes de guardar.');
      return;
    }

    const raw = this.form.getRawValue();
    this.saving.set(true);
    this.error.set('');

    this.eventApi
      .updateTechnician(this.technician.id, {
        firstName: raw.firstName.trim(),
        lastName: raw.lastName.trim(),
        email: raw.email.trim(),
        bio: raw.bio.trim(),
        status: raw.status,
        skills: this.skillsToApiKeys(raw.skills),
      })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (updated) => {
          this.patchForm(updated);
          this.showToast.set(true);
          this.saved.emit(updated);
        },
        error: () => {
          this.error.set('No se pudieron guardar los datos. Inténtalo de nuevo.');
        },
      });
  }

  dismissToast(): void {
    this.showToast.set(false);
  }

  toggleProfilePanel(): void {
    this.profilePanelOpen.update(open => !open);
  }

  pillStyle(key: JosanzStatusPillKey): Record<string, string> {
    return {
      backgroundColor: `var(--josanz-pill-${key}-bg)`,
      color: `var(--josanz-pill-${key}-text)`,
    };
  }

  private patchForm(tech: JosanzTechnicianListItem): void {
    this.form.patchValue({
      firstName: tech.user.firstName ?? '',
      lastName: tech.user.lastName ?? '',
      email: tech.user.email ?? '',
      bio: tech.bio ?? '',
      status: tech.status ?? 'ACTIVE',
      skills: (tech.skills ?? []).map((skill) => technicianSkillChipLabel(skill)),
    });
    this.syncFormAccess();
    this.form.markAsPristine();
  }

  private syncFormAccess(): void {
    if (!this.canEdit()) {
      this.form.disable({ emitEvent: false });
      return;
    }
    this.form.enable({ emitEvent: false });
    if (!this.canManageUsers()) {
      this.form.controls.email.disable({ emitEvent: false });
    }
  }

  private skillsToApiKeys(labels: string[]): string[] {
    return labels
      .map((label) => {
        const trimmed = label.trim();
        if (SKILL_LABEL_TO_KEY[trimmed]) {
          return SKILL_LABEL_TO_KEY[trimmed];
        }
        return trimmed.toUpperCase();
      })
      .filter(Boolean);
  }
}