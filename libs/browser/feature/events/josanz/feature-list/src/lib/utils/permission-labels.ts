import { PERMISSIONS_CATALOG } from '@josanz-erp/identity-api';

const LABEL_BY_ID = new Map(PERMISSIONS_CATALOG.map((entry) => [entry.id, entry.label]));
const CATEGORY_BY_ID = new Map(PERMISSIONS_CATALOG.map((entry) => [entry.id, entry.category]));

export function permissionLabel(id: string): string {
  return LABEL_BY_ID.get(id) ?? id;
}

export function permissionCategory(id: string): string {
  return CATEGORY_BY_ID.get(id) ?? 'General';
}

export interface PermissionGroup {
  category: string;
  items: Array<{ id: string; label: string; source: 'role' | 'extra' | 'wildcard' }>;
}

export function groupPermissions(
  permissionIds: string[],
  extraIds: string[] = [],
): PermissionGroup[] {
  const extraSet = new Set(extraIds);
  const groups = new Map<string, PermissionGroup['items']>();

  for (const id of permissionIds) {
    const category = permissionCategory(id);
    if (!groups.has(category)) {
      groups.set(category, []);
    }
    groups.get(category)!.push({
      id,
      label: permissionLabel(id),
      source: id === '*' ? 'wildcard' : extraSet.has(id) ? 'extra' : 'role',
    });
  }

  return Array.from(groups.entries())
    .map(([category, items]) => ({
      category,
      items: items.sort((a, b) => a.label.localeCompare(b.label, 'es')),
    }))
    .sort((a, b) => a.category.localeCompare(b.category, 'es'));
}
