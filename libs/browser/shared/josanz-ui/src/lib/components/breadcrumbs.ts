import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface JosanzBreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
  disabled?: boolean;
}

@Component({
  selector: 'josanz-breadcrumbs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav [attr.aria-label]="ariaLabel || 'Migas de pan'">
      <ol class="m-0 flex list-none flex-wrap items-center gap-2 p-0 text-sm">
        @for (item of items; track item.label; let last = $last) {
          <li class="flex min-w-0 items-center gap-2">
            @if (item.href && !item.current && !item.disabled) {
              <a
                class="max-w-[180px] truncate font-bold no-underline transition-colors hover:underline"
                [href]="item.href"
                [style.color]="'var(--josanz-primary)'"
                (click)="itemClick.emit(item)"
              >
                {{ item.label }}
              </a>
            } @else {
              <span
                class="max-w-[180px] truncate font-bold"
                [style.color]="
                  item.current || last
                    ? 'var(--josanz-text)'
                    : 'var(--josanz-text-muted)'
                "
                [attr.aria-current]="item.current || last ? 'page' : null"
              >
                {{ item.label }}
              </span>
            }
            @if (!last) {
              <span
                class="select-none text-xs"
                [style.color]="'var(--josanz-text-muted)'"
                aria-hidden="true"
                >{{ separator }}</span
              >
            }
          </li>
        }
      </ol>
    </nav>
  `,
})
export class BreadcrumbsComponent {
  @Input() items: JosanzBreadcrumbItem[] = [];
  @Input() separator = '/';
  @Input() ariaLabel = '';

  @Output() itemClick = new EventEmitter<JosanzBreadcrumbItem>();
}
