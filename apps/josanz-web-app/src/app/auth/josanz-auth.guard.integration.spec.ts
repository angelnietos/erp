import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { josanzAuthGuard, josanzGuestGuard } from './josanz-auth.guard';
import { AuthService, IdentitySessionHydrationService } from '@josanz-erp/identity-data-access';
import { GlobalAuthStore } from '@josanz-erp/shared-data-access';
import {
  runCanActivateGuard,
  serializeGuardResult,
} from '../../testing/router-guard-testing';

const globalAuthStore = {
  isAuthenticated: jest.fn(() => false),
};
const authService = {
  isBffMode: jest.fn(() => true),
  readPersistedSession: jest.fn(() => null),
};
const sessionHydration = {
  tryRestoreFromBffCookie: jest.fn(async () => false),
};
const router = {
  createUrlTree: jest.fn((commands: string[]) => commands.join('/') as unknown as UrlTree),
  serializeUrl: jest.fn((tree: UrlTree) => String(tree)),
};

describe('Josanz auth guard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    globalAuthStore.isAuthenticated.mockReturnValue(false);
    authService.isBffMode.mockReturnValue(true);
    sessionHydration.tryRestoreFromBffCookie.mockResolvedValue(false);
    TestBed.configureTestingModule({
      providers: [
        { provide: GlobalAuthStore, useValue: globalAuthStore },
        { provide: AuthService, useValue: authService },
        { provide: IdentitySessionHydrationService, useValue: sessionHydration },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('redirects unauthenticated users to login', async () => {
    const result = await runCanActivateGuard(josanzAuthGuard);
    expect(serializeGuardResult(result)).toBe('/auth/login');
  });

  it('allows authenticated users through', async () => {
    globalAuthStore.isAuthenticated.mockReturnValue(true);
    const result = await runCanActivateGuard(josanzAuthGuard);
    expect(result).toBe(true);
  });
});

describe('Josanz guest guard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    globalAuthStore.isAuthenticated.mockReturnValue(false);
    authService.isBffMode.mockReturnValue(true);
    sessionHydration.tryRestoreFromBffCookie.mockResolvedValue(false);
    TestBed.configureTestingModule({
      providers: [
        { provide: GlobalAuthStore, useValue: globalAuthStore },
        { provide: AuthService, useValue: authService },
        { provide: IdentitySessionHydrationService, useValue: sessionHydration },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('allows anonymous users through guest guard', async () => {
    const result = await runCanActivateGuard(josanzGuestGuard);
    expect(result).toBe(true);
  });

  it('redirects authenticated users away from login', async () => {
    globalAuthStore.isAuthenticated.mockReturnValue(true);
    const result = await runCanActivateGuard(josanzGuestGuard);
    expect(serializeGuardResult(result)).toBe('/dashboard');
  });
});
