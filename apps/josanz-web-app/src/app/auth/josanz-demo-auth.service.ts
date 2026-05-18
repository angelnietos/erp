import { Injectable, signal } from '@angular/core';

const DEMO_SESSION_KEY = 'josanz-web-demo-session';

/** Sesión local sin API (prototipo Josanz web). */
@Injectable({ providedIn: 'root' })
export class JosanzDemoAuthService {
  private readonly authenticated = signal(this.readStoredSession());

  isAuthenticated(): boolean {
    return this.authenticated();
  }

  login(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(DEMO_SESSION_KEY, '1');
    }
    this.authenticated.set(true);
  }

  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(DEMO_SESSION_KEY);
    }
    this.authenticated.set(false);
  }

  private readStoredSession(): boolean {
    return (
      typeof localStorage !== 'undefined' &&
      localStorage.getItem(DEMO_SESSION_KEY) === '1'
    );
  }
}
