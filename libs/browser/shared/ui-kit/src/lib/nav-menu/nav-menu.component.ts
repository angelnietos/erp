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
      gap: 12px; 
      padding: 10px 16px;
      border-radius: var(--radius-md); 
      text-decoration: none; 
      color: var(--text-muted);
      transition: all 0.4s var(--transition-spring); 
      font-size: 0.7rem; 
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      position: relative;
      font-family: var(--font-display);
      border: 1px solid transparent;
      overflow: hidden;
      isolation: isolate;
    }
    
    .nav-link::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, var(--brand-ambient-strong), transparent);
      transform: translateX(-100%);
      transition: transform 0.4s var(--transition-spring);
      z-index: -1;
    }

    .nav-link.child { padding-left: 44px; font-size: 0.65rem; opacity: 0.7; }
    .nav-icon { width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.4s var(--transition-spring); color: var(--text-muted); }
    .nav-label { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    
    .nav-badge {
      font-family: var(--font-gaming);
      font-size: 0.6rem; 
      font-weight: 900; 
      padding: 2px 8px;
      border-radius: 4px; 
      background: var(--brand); 
      color: white;
      box-shadow: 0 0 15px var(--brand-glow);
    }

    /* Interactions */
    .nav-link:hover {
      color: #fff;
      transform: translateX(5px);
      background: rgba(255, 255, 255, 0.02);
    }
    
    .nav-link:hover .nav-icon {
      color: var(--brand);
      transform: scale(1.2) rotate(-5deg);
    }

    .nav-link.active {
      background: var(--brand-ambient-strong); 
      color: #fff; 
      border-left: 4px solid var(--brand);
      box-shadow: inset 4px 0 15px var(--brand-glow);
      transform: translateX(8px);
    }
    
    .nav-link.active .nav-icon {
      color: var(--brand);
      filter: drop-shadow(0 0 8px var(--brand-glow));
      transform: scale(1.2);
    }

    .nav-link.active::before {
      transform: translateX(0);
    }

    /* Variant Modifiers */
    .nav-menu-primary .nav-link.active { 
      background: linear-gradient(90deg, var(--brand), var(--brand-muted));
      color: white; 
      border: none;
      box-shadow: 0 4px 15px var(--brand-ambient-strong);
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
