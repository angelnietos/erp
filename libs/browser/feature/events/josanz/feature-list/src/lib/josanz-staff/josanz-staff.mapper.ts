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

const ROLE_COLORS: Record<string, string> = {
  SuperAdmin: '#6366f1',
  Administrador: '#8b5cf6',
  Responsable: '#3b82f6',
  Usuario: '#10b981',
  Freelance: '#f59e0b',
  'En prácticas': '#06b6d4',
  Técnico: '#0f1e2f',
};

export function formatStaffDisplayId(index: number): string {
  return `ST-${String(index + 1).padStart(4, '0')}`;
}

export function technicianRoleLabel(status: string): string {
  const normalized = status.toUpperCase();
  if (normalized === 'OFFICE_SUPERADMIN') {
    return 'SuperAdmin';
  }
  if (normalized === 'OFFICE_ADMIN') {
    return 'Administrador';
  }
  if (normalized === 'OFFICE_RESPONSABLE') {
    return 'Responsable';
  }
  if (normalized === 'OFFICE_USUARIO') {
    return 'Usuario';
  }
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

export function technicianRoleColor(status: string): string {
  const label = technicianRoleLabel(status);
  return ROLE_COLORS[label] ?? '#64748b';
}

export function technicianTypologyTab(status: string): string {
  const normalized = status.toUpperCase();
  if (normalized.startsWith('OFFICE_')) {
    return 'Oficina';
  }
  if (normalized.includes('FREE')) {
    return 'Freelance';
  }
  if (normalized.includes('PRACT')) {
    return 'Prácticas';
  }
  return 'Técnicos';
}

export function technicianProfileLabel(
  tech: Pick<JosanzTechnicianListItem, 'status' | 'skills'>,
): string {
  const normalized = tech.status.toUpperCase();
  if (normalized.startsWith('OFFICE_')) {
    return `${technicianRoleLabel(tech.status)} · ERP`;
  }
  return technicianSkillsLabel(tech.skills);
}

export function technicianSkillsLabel(skills?: string[]): string {
  if (!skills?.length) {
    return '—';
  }
  return skills.map((skill) => technicianSkillChipLabel(skill)).join(' · ');
}

export function technicianSkillChipLabel(skill: string): string {
  return SKILL_LABELS[skill.toUpperCase()] ?? skill;
}

export function technicianAvailabilityLabel(): string {
  return 'Disponible';
}

export function technicianDisplayName(
  user: Pick<JosanzTechnicianListItem['user'], 'firstName' | 'lastName'>,
): string {
  return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || '—';
}

export function technicianInitials(
  user: Pick<JosanzTechnicianListItem['user'], 'firstName' | 'lastName'>,
): string {
  return [user.firstName?.[0], user.lastName?.[0]]
    .filter((char): char is string => !!char)
    .map((c) => c.toUpperCase())
    .join('') || 'ST';
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
    leadingMark: technicianInitials(tech.user),
    values: [
      name,
      technicianProfileLabel(tech),
      '—',
      technicianAvailabilityLabel(),
    ],
    typology: technicianTypologyTab(tech.status),
    pillLabel: roleLabel,
    pillVariant: mapTechnicianRoleToPill(tech.status),
    railColor: technicianRoleColor(tech.status),
  };
}

