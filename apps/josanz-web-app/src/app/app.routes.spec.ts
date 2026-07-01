import { appRoutes } from './app.routes';
import { josanzAuthGuard, josanzGuestGuard } from './auth/josanz-auth.guard';
import { JosanzAppShellComponent } from './josanz-app-shell.component';

describe('appRoutes', () => {
  it('protects the shell routes and redirects login for guests only', () => {
    const loginRoute = appRoutes.find((route) => route.path === 'auth/login');
    const shellRoute = appRoutes.find((route) => route.path === '');

    expect(loginRoute?.canActivate).toContain(josanzGuestGuard);
    expect(shellRoute?.component).toBe(JosanzAppShellComponent);
    expect(shellRoute?.canActivate).toContain(josanzAuthGuard);
  });

  it('keeps the expected private feature entry points registered', () => {
    const shellRoute = appRoutes.find((route) => route.path === '');
    const childPaths = (shellRoute?.children ?? []).map((route) => route.path);

    expect(childPaths).toEqual(
      expect.arrayContaining([
        '',
        'dashboard',
        'settings',
        'export',
        'reports/new',
        'clients',
        'users',
        'stock',
        'budgets',
        'events',
        'equipment',
        'vehicles',
        'staff',
        'billing',
      ]),
    );
  });
});
