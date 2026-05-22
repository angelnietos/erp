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
      transition: all 0.3s ease; 
      font-size: 0.85rem; 
      font-weight: 600;
      position: relative;
    }
    
    .nav-link.child { padding-left: 44px; font-size: 0.8rem; }
    .nav-icon { 
      width: 20px; 
      height: 20px; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      flex-shrink: 0; 
      transition: color 0.3s ease; 
      color: var(--text-muted); 
    }
    
    .nav-badge {
      font-size: 0.65rem; 
      font-weight: 700; 
      padding: 2px 8px;
      border-radius: 100px; 
      background: var(--brand); 
      color: white;
    }

    /* Interactions */
    .nav-link:hover {
      color: var(--text-primary);
      background: rgba(var(--brand-rgb), 0.05);
    }
    
    .nav-link:hover .nav-icon {
      color: var(--brand);
    }

    /* Active State */
    .nav-link.active {
      color: var(--brand); 
      background: rgba(var(--brand-rgb), 0.08);
      font-weight: 700;
    }

    /* Active Indicator */
    .nav-link.active::after {
      content: '';
      position: absolute;
      left: 0; top: 20%; bottom: 20%; width: 3px;
      background: var(--brand);
      border-radius: 0 4px 4px 0;
    }

    .nav-link.active .nav-icon {
      color: var(--brand);
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
