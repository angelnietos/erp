import type { UserPayload } from '@josanz-erp/identity-api';
import { canUserDeleteEvent, isEventDeleteAdmin } from './event-delete-access';

describe('event-delete-access', () => {
  const admin: UserPayload = {
    id: 'admin-1',
    email: 'admin@test.local',
    roles: ['SuperAdmin'],
    permissions: [],
  };

  const user: UserPayload = {
    id: 'user-1',
    email: 'user@test.local',
    roles: ['authenticated'],
    permissions: [],
  };

  it('treats SuperAdmin as delete admin', () => {
    expect(isEventDeleteAdmin(admin)).toBe(true);
  });

  it('allows creator to delete own event', () => {
    expect(canUserDeleteEvent({ createdByUserId: 'user-1' }, user)).toBe(true);
  });

  it('denies delete for events created by someone else', () => {
    expect(canUserDeleteEvent({ createdByUserId: 'other-1' }, user)).toBe(false);
  });

  it('denies delete for legacy events without creator unless admin', () => {
    expect(canUserDeleteEvent({ createdByUserId: null }, user)).toBe(false);
    expect(canUserDeleteEvent({ createdByUserId: null }, admin)).toBe(true);
  });
});
