import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface JosanzNavbarItem {
  id: string;
  label: string;
  href?: string;
  active?: boolean;
  disabled?: boolean;
}

@Component({
  selector: 'josanz-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header
      class="flex w-full flex-wrap items-center justify-between gap-4 border border-solid px-5 py-4"
      [ngClass]="compact ? 'rounded-2xl' : 'rounded-3xl'"
      [style.backgroundColor]="'var(--josanz-surface)'"
      [style.borderColor]="'var(--josanz-border)'"
      [attr.aria-label]="ariaLabel || 'Navegación principal'"
    >
      <a
        class="flex min-w-0 items-center gap-3 no-underline"
        [href]="brandHref || '#'"
        (click)="brandClick.emit()"
      >
        @if (logoText) {
          <span
            class="flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-black text-white"
            [style.backgroundColor]="customColor || 'var(--josanz-primary)'"
          >
            {{ logoText }}
          </span>
        }
        <span class="min-w-0">
          <span
            class="block truncate text-sm font-black"
            [style.color]="'var(--josanz-text)'"
            >{{ brand }}</span
          >
          @if (subtitle) {
            <span
              class="block truncate text-xs"
              [style.color]="'var(--josanz-text-muted)'"
              >{{ subtitle }}</span
            >
          }
        </span>
      </a>

      <nav class="flex flex-wrap items-center gap-2">
        @for (item of items; track item.id) {
          <a
            class="rounded-full px-3 py-2 text-sm font-black no-underline transition-colors"
            [href]="item.href || '#'"
            [attr.aria-current]="item.active ? 'page' : null"
            [class.pointer-events-none]="item.disabled"
            [style.backgroundColor]="
              item.active ? activeBackground() : 'transparent'
            "
            [style.color]="
              item.active
                ? customColor || 'var(--josanz-primary)'
                : 'var(--josanz-text-muted)'
            "
            (click)="itemClick.emit(item)"
          >
            {{ item.label }}
          </a>
        }
      </nav>

      <div class="flex items-center gap-2">
        <ng-content></ng-content>
      </div>
    </header>
  `,
})
export class NavbarComponent {
  @Input() brand = 'Josanz ERP';
  @Input() subtitle = '';
  @Input() logoText = 'J';
  @Input() brandHref = '';
  @Input() items: JosanzNavbarItem[] = [];
  @Input() compact = false;
  @Input() customColor?: string;
  @Input() ariaLabel = '';

  @Output() itemClick = new EventEmitter<JosanzNavbarItem>();
  @Output() brandClick = new EventEmitter<void>();

  activeBackground(): string {
    const color = this.customColor || 'var(--josanz-primary)';
    return `color-mix(in srgb, ${color} 12%, var(--josanz-surface))`;
  }
}
