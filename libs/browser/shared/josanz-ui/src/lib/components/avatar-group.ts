import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface JosanzAvatarGroupItem {
  name: string;
  src?: string;
  color?: string;
}

@Component({
  selector: 'josanz-avatar-group',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="flex items-center"
      [attr.aria-label]="ariaLabel || 'Grupo de usuarios'"
    >
      @for (item of visibleItems(); track item.name; let index = $index) {
        <span
          class="-ml-2 flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 text-xs font-black text-white first:ml-0"
          [style.width.px]="size"
          [style.height.px]="size"
          [style.backgroundColor]="item.color || fallbackColor(index)"
          [style.borderColor]="'var(--josanz-surface)'"
          [attr.title]="item.name"
        >
          @if (item.src) {
            <img
              class="h-full w-full object-cover"
              [src]="item.src"
              [alt]="item.name"
            />
          } @else {
            {{ initials(item.name) }}
          }
        </span>
      }
      @if (extraCount() > 0) {
        <span
          class="-ml-2 flex shrink-0 items-center justify-center rounded-full border-2 text-xs font-black"
          [style.width.px]="size"
          [style.height.px]="size"
          [style.backgroundColor]="'var(--josanz-field-fill)'"
          [style.borderColor]="'var(--josanz-surface)'"
          [style.color]="'var(--josanz-text-muted)'"
        >
          +{{ extraCount() }}
        </span>
      }
    </div>
  `,
})
export class AvatarGroupComponent {
  @Input() items: JosanzAvatarGroupItem[] = [];
  @Input() max = 4;
  @Input() size = 36;
  @Input() ariaLabel = '';

  visibleItems(): JosanzAvatarGroupItem[] {
    return this.items.slice(0, Math.max(1, this.max));
  }

  extraCount(): number {
    return Math.max(0, this.items.length - this.visibleItems().length);
  }

  initials(name: string): string {
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  fallbackColor(index: number): string {
    return ['#635BFF', '#0F766E', '#B45309', '#BE123C', '#475569'][index % 5];
  }
}
