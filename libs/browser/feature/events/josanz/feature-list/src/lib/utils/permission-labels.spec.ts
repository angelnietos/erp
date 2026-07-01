import { groupPermissions, permissionLabel } from './permission-labels';

describe('permission-labels', () => {
  it('resolves known permission labels', () => {
    expect(permissionLabel('events.view')).toBe('Ver Eventos');
  });

  it('groups permissions by category', () => {
    const groups = groupPermissions(
      ['events.view', 'events.manage', 'clients.view'],
      ['events.manage'],
    );
    expect(groups.length).toBeGreaterThan(0);
    expect(groups.some((g) => g.items.some((i) => i.source === 'extra'))).toBe(true);
  });
});
