import type { JosanzCatalogListRow } from '@josanz-erp/josanz-ui';
import type { JosanzTechnicianListItem } from '../services/josanz-event-api.service';
import { mapTechnicianRoleToPill } from '../josanz-event-detail/josanz-event-detail.payload';

const SKILL_LABELS: Record<string, string> = {
  AUDIO: 'Sonido',
  RF: 'RF',
  ILUMINACION: 'Iluminación',
  ESCENA: 'Escena',
  VIDEO: 'Vídeo',
  STREAMING: 'Streaming',
};

export function formatStaffDisplayId(index: number): string {
  return `ST-${String(index + 1).padStart(4, '0')}`;
}

export function technicianRoleLabel(status: string): string {
  const normalized = status.toUpperCase();
  if (normalized.includes('FREE')) {
    return 'Freelance';
  }
  if (normalized.includes('PRACT')) {
    return 'En prácticas';
  }
  if (normalized === 'ACTIVE' || normalized.includes('TECNIC')) {
    return 'Técnico';
  }
  return status;
}

export function technicianTypologyTab(status: string): string {
  const normalized = status.toUpperCase();
  if (normalized.includes('FREE')) {
    return 'Freelance';
  }
  if (normalized.includes('PRACT')) {
    return 'Prácticas';
  }
  return 'Técnicos';
}

export function technicianSkillsLabel(skills?: string[]): string {
  if (!skills?.length) {
    return '—';
  }
  return skills.map((skill) => SKILL_LABELS[skill.toUpperCase()] ?? skill).join(' · ');
}

export function technicianAvailabilityLabel(): string {
  return 'Disponible';
}

export function technicianDisplayName(
  user: Pick<JosanzTechnicianListItem['user'], 'firstName' | 'lastName'>,
): string {
  return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || '—';
}

export function mapTechnicianToCatalogRow(
  tech: JosanzTechnicianListItem,
  index: number,
): JosanzCatalogListRow {
  const name = technicianDisplayName(tech.user);
  const roleLabel = technicianRoleLabel(tech.status);

  return {
    id: tech.id,
    title: formatStaffDisplayId(index),
    values: [
      name,
      technicianSkillsLabel(tech.skills),
      '—',
      technicianAvailabilityLabel(),
    ],
    typology: technicianTypologyTab(tech.status),
    pillLabel: roleLabel,
    pillVariant: mapTechnicianRoleToPill(tech.status),
  };
}
