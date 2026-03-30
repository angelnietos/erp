import { Component, Input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

export interface NavMenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  badge?: string;
  children?: NavMenuItem[];
}

export type NavMenuVariant = 'default' | 'dark' | 'light' | 'primary' | 'ghost' | 'bordered' | 'compact';

@Component({
  selector: 'ui-josanz-nav-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <nav class="nav-menu" [class]="'nav-menu-' + variant">
      <ul class="nav-list">
        @for (item of items; track item.id) {
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
                <lucide-icon [name]="item.icon" size="20"></lucide-icon>
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
                        <lucide-icon [name]="child.icon" size="20"></lucide-icon>
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
    .nav-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; }
    .nav-item { display: flex; flex-direction: column; }
    .nav-link {
      display: flex; align-items: center; gap: 12px; padding: 10px 12px;
      border-radius: 8px; text-decoration: none; color: inherit;
      transition: all 0.2s ease; font-size: 0.875rem; font-weight: 500;
    }
    .nav-link.child { padding-left: 36px; font-size: 0.8125rem; }
    .nav-icon { width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .nav-icon lucide-icon { width: 20px; height: 20px; }
    .nav-label { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .nav-badge {
      font-size: 0.6875rem; font-weight: 600; padding: 2px 6px;
      border-radius: 10px; min-width: 18px; text-align: center;
    }
    .nav-children { list-style: none; padding: 0; margin: 4px 0 0 0; display: flex; flex-direction: column; gap: 2px; }

    /* Default Variant (Dark) */
    .nav-menu-default .nav-link { color: #e2e8f0; }
    .nav-menu-default .nav-link:hover { background: rgba(255, 255, 255, 0.05); color: #f8fafc; }
    .nav-menu-default .nav-link.active { background: rgba(14, 165, 233, 0.1); color: #0ea5e9; }
    .nav-menu-default .nav-badge { background: #0ea5e9; color: white; }

    /* Dark Variant */
    .nav-menu-dark .nav-link { color: #94a3b8; }
    .nav-menu-dark .nav-link:hover { background: rgba(255, 255, 255, 0.08); color: #e2e8f0; }
    .nav-menu-dark .nav-link.active { background: #1e293b; color: white; }
    .nav-menu-dark .nav-badge { background: #334155; color: #e2e8f0; }

    /* Light Variant */
    .nav-menu-light .nav-link { color: #64748b; }
    .nav-menu-light .nav-link:hover { background: #f1f5f9; color: #1e293b; }
    .nav-menu-light .nav-link.active { background: #e0e7ff; color: #4f46e5; }
    .nav-menu-light .nav-badge { background: #4f46e5; color: white; }

    /* Primary Variant */
    .nav-menu-primary .nav-link { color: #64748b; }
    .nav-menu-primary .nav-link:hover { background: rgba(79, 70, 229, 0.08); color: #4f46e5; }
    .nav-menu-primary .nav-link.active { background: #4f46e5; color: white; }
    .nav-menu-primary .nav-badge { background: #818cf8; color: white; }

    /* Ghost Variant */
    .nav-menu-ghost .nav-link { color: var(--theme-text, #1E293B); background: transparent; }
    .nav-menu-ghost .nav-link:hover { background: var(--theme-border, #E2E8F0); }
    .nav-menu-ghost .nav-link.active { background: var(--theme-primary, #4F46E5); color: white; }
    .nav-menu-ghost .nav-badge { background: var(--theme-primary, #4F46E5); color: white; }

    /* Bordered Variant */
    .nav-menu-bordered .nav-link { color: #64748b; border: 1px solid transparent; }
    .nav-menu-bordered .nav-link:hover { border-color: #e2e8f0; color: #1e293b; }
    .nav-menu-bordered .nav-link.active { border-color: #4f46e5; background: #e0e7ff; color: #4f46e5; }
    .nav-menu-bordered .nav-badge { background: #4f46e5; color: white; }

    /* Compact Variant */
    .nav-menu-compact .nav-link { padding: 6px 10px; font-size: 0.8125rem; }
    .nav-menu-compact .nav-link.child { padding-left: 28px; font-size: 0.75rem; }
    .nav-menu-compact .nav-icon { width: 16px; height: 16px; }
    .nav-menu-compact .nav-icon lucide-icon { width: 16px; height: 16px; }
    .nav-menu-compact .nav-link { color: #e2e8f0; }
    .nav-menu-compact .nav-link:hover { background: rgba(255, 255, 255, 0.05); color: #f8fafc; }
    .nav-menu-compact .nav-link.active { background: rgba(14, 165, 233, 0.1); color: #0ea5e9; }
    .nav-menu-compact .nav-badge { font-size: 0.625rem; padding: 1px 4px; }
  `]
})
export class NavMenuComponent {
  @Input() items: NavMenuItem[] = [];
  @Input() variant: NavMenuVariant = 'default';
  readonly itemClick = output<NavMenuItem>();
}
