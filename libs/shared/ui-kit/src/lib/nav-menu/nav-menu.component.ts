import { Component, Input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface NavMenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  badge?: string;
  children?: NavMenuItem[];
}

@Component({
  selector: 'ui-josanz-nav-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="nav-menu">
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
              <span class="nav-icon">{{ item.icon }}</span>
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
                      <span class="nav-icon">{{ child.icon }}</span>
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
    :host {
      display: block;
    }

    .nav-menu {
      width: 100%;
    }

    .nav-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-item {
      display: flex;
      flex-direction: column;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 8px;
      text-decoration: none;
      color: inherit;
      transition: all 0.2s ease;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .nav-link:hover {
      background: rgba(255, 255, 255, 0.05);
      color: #f8fafc;
    }

    .nav-link.active {
      background: rgba(14, 165, 233, 0.1);
      color: #0ea5e9;
    }

    .nav-link.child {
      padding-left: 36px;
      font-size: 0.8125rem;
    }

    .nav-icon {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .nav-label {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .nav-badge {
      background: #0ea5e9;
      color: white;
      font-size: 0.6875rem;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 10px;
      min-width: 18px;
      text-align: center;
    }

    .nav-children {
      list-style: none;
      padding: 0;
      margin: 4px 0 0 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
  `]
})
export class NavMenuComponent {
  @Input() items: NavMenuItem[] = [];
  readonly itemClick = output<NavMenuItem>();
}
