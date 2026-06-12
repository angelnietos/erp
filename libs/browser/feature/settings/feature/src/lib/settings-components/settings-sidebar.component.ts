import { Component, signal, computed, inject, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule, LucideAngularModule],
  template: `
    <aside class="settings-sidebar">
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
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(60px) saturate(1.5);
        border-right: 1px solid rgba(0, 0, 0, 0.05);
        display: flex;
        flex-direction: column;
        padding: 3.5rem 1.75rem;
        box-shadow: 15px 0 60px rgba(0, 0, 0, 0.02);
      }

      .sidebar-header {
        margin-bottom: 3rem;
        padding-left: 1rem;
      }

      .sidebar-header h1 {
        font-size: 1.25rem;
        font-weight: 900;
        letter-spacing: -0.02em;
        color: #0f172a;
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
        font-size: 0.65rem;
        font-weight: 800;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin: 1.5rem 0 0.5rem 1rem;
        opacity: 0.8;
      }

      .settings-nav {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
      }

      .nav-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        border-radius: 12px;
        color: #475569;
        font-size: 0.88rem;
        font-weight: 600;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        cursor: pointer;
        border: none;
        background: transparent;
        text-align: left;
      }

      .nav-item:hover {
        background: rgba(255, 255, 255, 0.6);
        color: var(--brand);
        transform: translateX(4px);
      }

      .nav-item.active {
        background: #ffffff;
        color: var(--brand);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
        transform: translateX(6px);
      }

      .sidebar-footer {
        margin-top: auto;
        padding: 1rem;
        opacity: 0.4;
      }

      .status-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.6rem;
        font-weight: 800;
        text-transform: uppercase;
        color: #64748b;
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