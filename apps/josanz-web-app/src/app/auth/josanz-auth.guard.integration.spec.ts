import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { appRoutes } from '../app.routes';
import { josanzAuthGuard, josanzGuestGuard } from './josanz-auth.guard';
import { JosanzDemoAuthService } from './josanz-demo-auth.service';
import { runCanActivateGuard, serializeGuardResult } from '../../testing/router-guard-testing';

describe('Josanz auth guards integration', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter(appRoutes)],
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('redirects anonymous users from private routes to login', () => {
    const result = runCanActivateGuard(josanzAuthGuard);

    expect(serializeGuardResult(result)).toBe('/auth/login');
  });

  it('allows authenticated users through private routes', () => {
    TestBed.inject(JosanzDemoAuthService).login();

    const result = runCanActivateGuard(josanzAuthGuard);

    expect(serializeGuardResult(result)).toBe(true);
  });

  it('redirects authenticated users away from login', () => {
    TestBed.inject(JosanzDemoAuthService).login();

    const result = runCanActivateGuard(josanzGuestGuard);

    expect(serializeGuardResult(result)).toBe('/dashboard');
  });
});
