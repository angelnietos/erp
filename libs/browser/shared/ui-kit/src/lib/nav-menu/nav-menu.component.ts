import { Component, output, inject, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { GlobalAuthStore as AuthStore } from '@josanz-erp/shared-data-access';

export interface NavMenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  badge?: string;
  children?: NavMenuItem[];
  permission?: string;
}

export type NavMenuVariant = 'default' | 'dark' | 'light' | 'primary' | 'ghost' | 'bordered' | 'compact';

@Component({
  selector: 'ui-nav-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <nav class="nav-menu" [class]="'nav-menu-' + variant()">
      <ul class="nav-list">
        @for (item of filteredItems(); track item.id) {
          <li class="nav-item" [class.has-children]="item.children?.length">
            <a
              [routerLink]="item.route"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: item.route === '/' }"
              class="nav-link"
              [attr.title]="item.label"
              (click)="itemClick.emit(item)"
            >
              <span class="nav-icon">
                <lucide-icon [name]="item.icon" size="18" aria-hidden="true"></lucide-icon>
              </span>
              <span class="nav-label">{{ item.label }}</span>
              @if (item.badge) {
                <span class="nav-badge">{{ item.badge }}</span>
              }
            </a>
            @if (item.children?.length) {
              <ul class="nav-children">
                @for (child of item.children; track child.id) {
                  <li class="nav-item">
                    <a
                      [routerLink]="child.route"
                      routerLinkActive="active"
                      class="nav-link child"
                      [attr.title]="child.label"
                      (click)="itemClick.emit(child)"
                    >
                      <span class="nav-icon">
                        <lucide-icon [name]="child.icon" size="18" aria-hidden="true"></lucide-icon>
                      </span>
                      <span class="nav-label">{{ child.label }}</span>
                    </a>
                  </li>
                }
              </ul>
            }
          </li>
        }
      </ul>
    </nav>
  `,
  styles: [`
    :host { display: block; }
    .nav-menu { width: 100%; }
    .nav-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
    .nav-item { display: flex; flex-direction: column; }
    .nav-link {
      display: flex; 
      align-items: center; 
      gap: 14px; 
      padding: 12px 20px;
      border-radius: var(--radius-lg); 
      text-decoration: none; 
      color: var(--text-muted);
      transition: all 0.5s var(--transition-spring); 
      font-size: 0.75rem; 
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      position: relative;
      font-family: var(--font-gaming);
      overflow: hidden;
      isolation: isolate;
    }
    
    /* Holographic Glow Layer */
    .nav-link::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, var(--brand-ambient-strong), transparent 80%);
      transform: translateX(-100%);
      transition: transform 0.6s var(--transition-spring);
      z-index: -1;
      opacity: 0.5;
    }

    .nav-link.child { padding-left: 48px; font-size: 0.7rem; opacity: 0.8; }
    .nav-icon { 
      width: 24px; 
      height: 24px; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      flex-shrink: 0; 
      transition: all 0.5s var(--transition-spring); 
      color: var(--text-muted); 
    }
    
    .nav-badge {
      font-family: var(--font-gaming);
      font-size: 0.65rem; 
      font-weight: 900; 
      padding: 3px 10px;
      border-radius: 100px; 
      background: var(--brand); 
      color: white;
      box-shadow: 0 0 20px var(--brand-glow);
    }

    /* Interactions */
    .nav-link:hover {
      color: #fff;
      transform: translateX(8px) scale(1.02);
      background: rgba(255, 255, 255, 0.03);
    }
    
    .nav-link:hover .nav-icon {
      color: var(--brand);
      transform: scale(1.3) rotate(-8deg);
      filter: drop-shadow(0 0 10px var(--brand-glow));
    }

    /* Active State — Nintendo-Ubisoft Style */
    .nav-link.active {
      color: #fff; 
      background: rgba(255, 255, 255, 0.05);
      box-shadow: 
        inset 0 0 20px var(--brand-ambient),
        0 10px 30px -10px rgba(0,0,0,0.5);
      transform: translateX(12px) scale(1.05);
    }

    /* Active Indicator (Vertical Bar) */
    .nav-link.active::after {
      content: '';
      position: absolute;
      left: 0; top: 15%; bottom: 15%; width: 5px;
      background: var(--brand);
      border-radius: 0 4px 4px 0;
      box-shadow: 0 0 20px var(--brand);
      animation: navIndicatorPulse 2s infinite;
    }

    @keyframes navIndicatorPulse {
      0%, 100% { height: 70%; opacity: 1; }
      50% { height: 40%; opacity: 0.7; }
    }

    .nav-link.active .nav-icon {
      color: var(--brand);
      transform: scale(1.3);
      filter: drop-shadow(0 0 12px var(--brand));
    }

    .nav-link.active::before {
      transform: translateX(0);
    }
  `]
})
export class NavMenuComponent {
  items = input<NavMenuItem[]>([]);
  variant = input<NavMenuVariant>('default');
  readonly itemClick = output<NavMenuItem>();
  
  private readonly authStore = inject(AuthStore);

  /** Visibilidad por contexto (p. ej. shell); no filtrar por permisos RBAC aquí. */
  filteredItems = computed(() => {
    const user = this.authStore.user();
    if (!user) return [];
    return [...this.items()];
  });
}
