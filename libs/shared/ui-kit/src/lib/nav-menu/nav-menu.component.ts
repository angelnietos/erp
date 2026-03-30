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
    .nav-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
    .nav-item { display: flex; flex-direction: column; }
    .nav-link {
      display: flex; 
      align-items: center; 
      gap: 14px; 
      padding: 10px 16px;
      border-radius: 4px; 
      text-decoration: none; 
      color: var(--text-secondary);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
      font-size: 0.8rem; 
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      position: relative;
      font-family: var(--font-display);
      border: 1px solid transparent;
    }
    
    .nav-link::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      height: 0%;
      width: 2px;
      background: var(--brand);
      transition: height 0.3s ease;
      box-shadow: 0 0 10px var(--brand-glow);
    }

    .nav-link.child { padding-left: 44px; font-size: 0.75rem; opacity: 0.7; }
    .nav-icon { width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.3s ease; color: var(--text-muted); }
    .nav-label { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .nav-badge {
      font-size: 0.6rem; 
      font-weight: 950; 
      padding: 2px 6px;
      border-radius: 2px; 
      background: var(--brand); 
      color: white;
      box-shadow: 0 0 10px var(--brand-glow);
    }
    .nav-children { list-style: none; padding: 0; margin: 2px 0; display: flex; flex-direction: column; gap: 2px; }

    /* Interactions */
    .nav-link:hover {
      background: rgba(255, 255, 255, 0.03);
      color: #fff;
    }
    
    .nav-link:hover .nav-icon {
      transform: translateX(3px);
      color: var(--brand);
    }

    .nav-link.active {
      background: rgba(240, 62, 62, 0.12); 
      color: #fff; 
      border-right: 1px solid var(--brand);
    }
    
    .nav-link.active .nav-icon {
      color: var(--brand);
      filter: drop-shadow(0 0 5px var(--brand-glow));
    }
    
    .nav-link.active::before {
      height: 70%;
    }

    /* Variant Modifiers */
    .nav-menu-dark .nav-link { color: var(--text-muted); background: rgba(0, 0, 0, 0.2); }
    .nav-menu-dark .nav-link.active { background: #000; border-color: var(--brand); }

    .nav-menu-primary .nav-link.active { background: var(--brand); color: white; border: none; }
    .nav-menu-primary .nav-badge { background: #fff; color: var(--brand); }

    .nav-menu-bordered .nav-link { border: 1px solid var(--border-soft); }
    .nav-menu-bordered .nav-link.active { border-color: var(--brand); }

    .nav-menu-compact .nav-link { padding: 6px 12px; font-size: 0.7rem; }
    .nav-menu-compact .nav-icon { width: 16px; height: 16px; }
  `]
})
export class NavMenuComponent {
  @Input() items: NavMenuItem[] = [];
  @Input() variant: NavMenuVariant = 'default';
  readonly itemClick = output<NavMenuItem>();
}
