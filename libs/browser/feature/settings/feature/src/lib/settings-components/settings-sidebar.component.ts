import { Component, signal, computed, inject, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthStore } from '@josanz-erp/identity-data-access';

export type SettingsTab =
  | 'general'
  | 'ai'
  | 'buddy'
  | 'plugins'
  | 'notifications'
  | 'security'
  | 'roles'
  | 'labs'
  | 'profile'
  | 'appearance';

@Component({
  selector: 'lib-settings-sidebar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule],
  template: `
    <aside class="settings-sidebar">
      <a routerLink="/" class="settings-exit-link" title="Volver al panel principal">
        <lucide-icon name="arrow-left" size="16" aria-hidden="true"></lucide-icon>
        <span>Volver al ERP</span>
      </a>

      <div class="sidebar-header">
        <h1 class="glow-text">Sistema</h1>
        <p class="subtitle">Panel de Control</p>
      </div>

      <nav class="settings-nav">
        <div class="nav-section-label">Personal</div>
        <button type="button" class="nav-item" [class.active]="activeTabSig() === 'profile'" (click)="setTab('profile')">
          <lucide-icon name="user" size="16" aria-hidden="true"></lucide-icon>
          <span>Mi Perfil</span>
        </button>
        <button type="button" class="nav-item" [class.active]="activeTabSig() === 'notifications'" (click)="setTab('notifications')">
          <lucide-icon name="bell" size="16" aria-hidden="true"></lucide-icon>
          <span>Notificaciones</span>
        </button>

        <div class="nav-section-label">Motor Visual</div>
        <button type="button" class="nav-item luxe-nav-item" [class.active]="activeTabSig() === 'appearance'" (click)="setTab('appearance')">
          <lucide-icon name="sparkles" size="16" aria-hidden="true"></lucide-icon>
          <span>Atmósfera</span>
        </button>
        <button type="button" class="nav-item" [class.active]="activeTabSig() === 'general'" (click)="setTab('general')">
          <lucide-icon name="sliders" size="16" aria-hidden="true"></lucide-icon>
          <span>General</span>
        </button>

        <div class="nav-section-label">Inteligencia</div>
        <button type="button" class="nav-item" [class.active]="activeTabSig() === 'ai'" (click)="setTab('ai')">
          <lucide-icon name="bot" size="16" aria-hidden="true"></lucide-icon>
          <span>Agentes (API)</span>
        </button>
        <button type="button" class="nav-item" [class.active]="activeTabSig() === 'buddy'" (click)="setTab('buddy')">
          <lucide-icon name="smile" size="16" aria-hidden="true"></lucide-icon>
          <span>Compañeros</span>
        </button>

        <div class="nav-section-label">Organización</div>
        <button type="button" class="nav-item" [class.active]="activeTabSig() === 'security'" (click)="setTab('security')">
          <lucide-icon name="lock" size="16" aria-hidden="true"></lucide-icon>
          <span>Seguridad</span>
        </button>
        @if (canSeeRolesAdmin()) {
          <button type="button" class="nav-item" [class.active]="activeTabSig() === 'roles'" (click)="setTab('roles')">
            <lucide-icon name="shield-check" size="16" aria-hidden="true"></lucide-icon>
            <span>Roles</span>
          </button>
        }
        <button type="button" class="nav-item" [class.active]="activeTabSig() === 'plugins'" (click)="setTab('plugins')">
          <lucide-icon name="puzzle" size="16" aria-hidden="true"></lucide-icon>
          <span>Módulos</span>
        </button>
        <button type="button" class="nav-item" [class.active]="activeTabSig() === 'labs'" (click)="setTab('labs')">
          <lucide-icon name="flask-conical" size="16" aria-hidden="true"></lucide-icon>
          <span>Labs</span>
        </button>
      </nav>

      <div class="sidebar-footer">
        <div class="status-indicator">
          <lucide-icon name="shield" size="14" aria-hidden="true"></lucide-icon>
          <span>Núcleo Seguro v3.2</span>
        </div>
      </div>
    </aside>
  `,
  styles: [
    `
      .settings-sidebar {
        background:
          linear-gradient(180deg, rgba(4, 8, 19, 0.98), rgba(2, 6, 23, 0.96));
        border-right: 1px solid rgba(148, 163, 184, 0.12);
        display: flex;
        flex-direction: column;
        padding: 1.25rem 0.9rem;
        box-shadow: 18px 0 46px rgba(0, 0, 0, 0.22);
        height: calc(100vh - var(--bb-topbar-height, 64px));
        max-height: calc(100vh - var(--bb-topbar-height, 64px));
        position: sticky;
        top: 0;
        align-self: start;
        overflow-y: auto;
        overflow-x: hidden;
        z-index: 30;
        flex-shrink: 0;
      }

      .settings-exit-link {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        margin: 0 0.75rem 0.85rem;
        padding: 0.55rem 0.7rem;
        border-radius: 10px;
        border: 1px solid rgba(148, 163, 184, 0.18);
        background: rgba(15, 23, 42, 0.45);
        color: #e2e8f0;
        font-size: 0.78rem;
        font-weight: 700;
        text-decoration: none;
        transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
      }

      .settings-exit-link:hover {
        background: color-mix(in srgb, var(--brand, #6366f1) 14%, rgba(15, 23, 42, 0.6));
        border-color: color-mix(in srgb, var(--brand, #6366f1) 35%, transparent);
        color: #fff;
      }

      .sidebar-header {
        margin-bottom: 1.25rem;
        padding: 0.75rem 0.75rem 1rem;
        border-bottom: 1px solid rgba(148, 163, 184, 0.1);
      }

      .sidebar-header h1 {
        font-size: 1.25rem;
        font-weight: 900;
        letter-spacing: -0.02em;
        color: #f8fafc;
        margin: 0;
      }

      .sidebar-header .subtitle {
        font-size: 0.65rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #94a3b8;
        margin-top: 0.25rem;
      }

      .nav-section-label {
        font-size: 0.6rem;
        font-weight: 800;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        margin: 1rem 0 0.35rem 0.75rem;
        opacity: 0.72;
      }

      .settings-nav {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
        overflow-y: auto;
        padding-right: 0.15rem;
        scrollbar-width: thin;
        scrollbar-color: color-mix(in srgb, var(--brand, #6366f1) 45%, transparent) transparent;
      }

      .nav-item {
        display: flex;
        align-items: center;
        gap: 0.7rem;
        padding: 0.68rem 0.75rem;
        border-radius: 12px;
        color: #cbd5e1;
        font-size: 0.82rem;
        font-weight: 600;
        transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
        cursor: pointer;
        border: 1px solid transparent;
        background: transparent;
        text-align: left;
      }

      .nav-item:hover {
        background: color-mix(in srgb, var(--brand, #6366f1) 10%, transparent);
        color: #f8fafc;
        border-color: color-mix(in srgb, var(--brand, #6366f1) 18%, transparent);
      }

      .nav-item.active {
        background: linear-gradient(
          135deg,
          color-mix(in srgb, var(--brand, #6366f1) 88%, white),
          var(--brand, #6366f1)
        );
        color: #fff;
        border-color: color-mix(in srgb, var(--brand, #6366f1) 55%, white);
        box-shadow: 0 10px 28px color-mix(in srgb, var(--brand, #6366f1) 28%, transparent);
      }

      .sidebar-footer {
        margin-top: 1rem;
        padding: 0.75rem;
        opacity: 0.85;
        border-top: 1px solid rgba(148, 163, 184, 0.1);
      }

      .status-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.6rem;
        font-weight: 800;
        text-transform: uppercase;
        color: #94a3b8;
      }

      @media (max-width: 1100px) {
        .settings-sidebar {
          height: auto;
          max-height: none;
          position: sticky;
          top: 0;
          z-index: 40;
          padding: 0.85rem 1rem 1rem;
          border-right: 0;
          border-bottom: 1px solid rgba(148, 163, 184, 0.16);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .settings-exit-link {
          margin: 0 0 0.65rem;
          width: fit-content;
        }

        .settings-nav {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 0.45rem;
          max-height: 40vh;
          overflow-y: auto;
        }

        .nav-section-label {
          grid-column: 1 / -1;
          margin: 0.65rem 0 0.15rem 0.25rem;
        }

        .sidebar-footer {
          display: none;
        }
      }
    `,
  ],
})
export class SettingsSidebarComponent implements OnChanges {
  protected readonly _authStore = inject(AuthStore);

  @Input() set activeTab(value: SettingsTab) {
    this.activeTabSig.set(value);
  }
  @Output() activeTabChange = new EventEmitter<SettingsTab>();

  readonly activeTabSig = signal<SettingsTab>('profile');

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeTab'] && changes['activeTab'].currentValue !== undefined) {
      this.activeTabSig.set(changes['activeTab'].currentValue);
    }
  }

  readonly canSeeRolesAdmin = computed(() => {
    const p = this._authStore.user()?.permissions ?? [];
    return p.includes('*') || p.includes('roles.manage');
  });

  setTab(tab: SettingsTab): void {
    this.activeTabSig.set(tab);
    this.activeTabChange.emit(tab);
  }
}