import { TestBed } from '@angular/core/testing';
import { JosanzDemoAuthService } from './josanz-demo-auth.service';

const DEMO_SESSION_KEY = 'josanz-web-demo-session';

describe('JosanzDemoAuthService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('starts unauthenticated when no demo session exists', () => {
    const service = TestBed.inject(JosanzDemoAuthService);

    expect(service.isAuthenticated()).toBe(false);
  });

  it('persists login and clears it on logout', () => {
    const service = TestBed.inject(JosanzDemoAuthService);

    service.login();
    expect(service.isAuthenticated()).toBe(true);
    expect(localStorage.getItem(DEMO_SESSION_KEY)).toBe('1');

    service.logout();
    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem(DEMO_SESSION_KEY)).toBeNull();
  });

  it('hydrates authentication state from localStorage', () => {
    localStorage.setItem(DEMO_SESSION_KEY, '1');

    const service = TestBed.inject(JosanzDemoAuthService);

    expect(service.isAuthenticated()).toBe(true);
  });
});
