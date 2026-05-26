import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface JosanzBreadcrumbNavItem {
  label: string;
  href?: string;
  routerLink?: string | readonly string[];
  current?: boolean;
  disabled?: boolean;
}

@Component({
  selector: 'josanz-breadcrumb-nav',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="w-full" [attr.aria-label]="ariaLabel || 'Ruta de navegación'">
      <ol class="m-0 flex list-none flex-wrap items-center gap-2 p-0 text-sm">
        @for (item of items; track item.label; let last = $last) {
          <li class="flex min-w-0 items-center gap-2">
            @if (!item.disabled && !item.current && !last && item.routerLink) {
              <a
                class="max-w-[180px] truncate font-black no-underline transition hover:underline"
                [routerLink]="item.routerLink"
                [style.color]="'var(--josanz-primary)'"
                (click)="itemClick.emit(item)"
              >
                {{ item.label }}
              </a>
            } @else if (!item.disabled && !item.current && !last && item.href) {
              <a
                class="max-w-[180px] truncate font-black no-underline transition hover:underline"
                [href]="item.href"
                [style.color]="'var(--josanz-primary)'"
                (click)="itemClick.emit(item)"
              >
                {{ item.label }}
              </a>
            } @else {
              <span
                class="max-w-[180px] truncate font-black"
                [style.color]="item.current || last ? 'var(--josanz-text)' : 'var(--josanz-text-muted)'"
                [attr.aria-current]="item.current || last ? 'page' : null"
              >
                {{ item.label }}
              </span>
            }

            @if (!last) {
              <span class="select-none text-xs" [style.color]="'var(--josanz-text-muted)'" aria-hidden="true">
                {{ separator }}
              </span>
            }
          </li>
        }
      </ol>
    </nav>
  `,
})
export class BreadcrumbNavComponent {
  @Input() items: JosanzBreadcrumbNavItem[] = [];
  @Input() separator = '/';
  @Input() ariaLabel = '';

  @Output() itemClick = new EventEmitter<JosanzBreadcrumbNavItem>();
}
