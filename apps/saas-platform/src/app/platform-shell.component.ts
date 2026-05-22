import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { clearPlatformToken } from './platform-auth.interceptor';

@Component({
  standalone: true,
  selector: 'app-platform-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="platform">
      <header class="top" role="banner">
        <div class="top-inner">
          <a routerLink="/tenants" class="brand" aria-label="Babooni Platform — inicio">
            <span class="brand-mark">BABOONI</span>
            <span class="brand-sub">PLATFORM</span>
          </a>

          <nav class="tabs" aria-label="Secciones del panel">
            <a
              routerLink="/tenants"
              routerLinkActive="tab--active"
              [routerLinkActiveOptions]="{ exact: true }"
              class="tab"
            >
              Organizaciones
            </a>
            <a routerLink="/metrics" routerLinkActive="tab--active" class="tab">Métricas</a>
          </nav>

          <button type="button" class="btn-logout" (click)="logout()">
            <span class="btn-logout-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M18 9l3 3m0 0-3 3m3-3H9"
                />
              </svg>
            </span>
            Cerrar sesión
          </button>
        </div>
      </header>

      <div class="body">
        <router-outlet />
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-height: 100vh;
      font-family: var(--sp-font-sans);
      color: var(--sp-text);
      background: transparent;
    }

    .platform {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .top {
      position: sticky;
      top: 0;
      z-index: 30;
      border-bottom: 1px solid var(--sp-line);
      background: linear-gradient(
        180deg,
        rgba(4, 8, 18, 0.94) 0%,
        rgba(4, 10, 22, 0.82) 100%
      );
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
    }

    .top-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: clamp(0.75rem, 2vw, 1rem) clamp(1rem, 3.5vw, 2rem);
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1rem 1.5rem;
    }

    .brand {
      display: flex;
      flex-direction: column;
      line-height: 1;
      padding: 0.4rem 0.85rem;
      border: 1px solid var(--sp-line);
      border-radius: 6px;
      background: linear-gradient(145deg, rgba(255, 255, 255, 0.05), transparent);
      box-shadow: var(--sp-shadow-soft);
      text-decoration: none;
      color: inherit;
      transition: border-color 0.18s ease, box-shadow 0.18s ease;
    }

    .brand:hover {
      border-color: var(--sp-line-strong);
      box-shadow: 0 8px 28px rgba(0, 40, 120, 0.12);
    }

    .brand-mark {
      font-family: var(--sp-font-display);
      font-weight: 700;
      font-size: 1.32rem;
      letter-spacing: 0.14em;
      color: var(--sp-text);
    }

    .brand-sub {
      font-family: var(--sp-font-display);
      font-weight: 600;
      font-size: 0.65rem;
      letter-spacing: 0.38em;
      color: var(--sp-accent-secondary);
    }

    .tabs {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.2rem;
      border-radius: 10px;
      border: 1px solid var(--sp-line);
      background: rgba(0, 0, 0, 0.22);
    }

    .tab {
      padding: 0.45rem 0.95rem;
      border-radius: 8px;
      font-size: 0.84rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      color: var(--sp-muted);
      text-decoration: none;
      transition: color 0.15s ease, background 0.15s ease;
    }

    .tab:hover {
      color: var(--sp-text);
      background: rgba(255, 255, 255, 0.04);
    }

    .tab.tab--active {
      color: #fff;
      background: linear-gradient(
        180deg,
        rgba(0, 75, 147, 0.45) 0%,
        rgba(0, 55, 110, 0.55) 100%
      );
      box-shadow: 0 2px 12px rgba(0, 75, 147, 0.25);
    }

    .btn-logout {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.52rem 1rem;
      border: 1px solid rgba(0, 75, 147, 0.45);
      border-radius: var(--sp-radius-sm);
      background: linear-gradient(185deg, rgba(0, 75, 147, 0.2), rgba(0, 40, 90, 0.35));
      color: var(--sp-text);
      font-family: inherit;
      font-size: 0.83rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
      box-shadow: 0 4px 18px rgba(0, 50, 130, 0.12);
      margin-left: auto;
    }

    .btn-logout:hover {
      transform: translateY(-1px);
      border-color: rgba(89, 168, 244, 0.55);
      box-shadow: 0 8px 26px rgba(0, 75, 147, 0.22);
    }

    .btn-logout-icon {
      display: inline-flex;
      width: 1.1rem;
      height: 1.1rem;
    }

    .btn-logout-icon svg {
      width: 100%;
      height: 100%;
    }

    .body {
      flex: 1;
      min-height: 0;
    }

    @media (max-width: 720px) {
      .top-inner {
        flex-direction: column;
        align-items: stretch;
      }

      .tabs {
        order: 3;
        width: 100%;
        justify-content: center;
      }

      .btn-logout {
        margin-left: 0;
        justify-content: center;
      }
    }
  `,
})
export class PlatformShellComponent {
  private readonly router = inject(Router);

  logout(): void {
    clearPlatformToken();
    void this.router.navigateByUrl('/login');
  }
}
