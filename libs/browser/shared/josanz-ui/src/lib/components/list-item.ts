import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'josanz-list-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      class="flex w-full items-center gap-3 border-0 border-b border-solid bg-transparent p-4 text-left transition-colors hover:bg-black/[0.03]"
      [style.borderColor]="'var(--josanz-border)'"
      [class.opacity-60]="disabled"
      [disabled]="disabled"
      (click)="itemClick.emit()"
    >
      @if (avatarName) {
        <span
          class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-black text-white"
          [style.backgroundColor]="avatarColor || 'var(--josanz-primary)'"
        >
          @if (avatarSrc) {
            <img class="h-full w-full object-cover" [src]="avatarSrc" [alt]="avatarName" />
          } @else {
            {{ initials() }}
          }
        </span>
      }
      <span class="min-w-0 flex-1">
        <span class="flex items-center justify-between gap-3">
          <strong class="truncate text-sm font-black" [style.color]="'var(--josanz-text)'">{{ title }}</strong>
          @if (meta) {
            <span class="shrink-0 text-xs" [style.color]="'var(--josanz-text-muted)'">{{ meta }}</span>
          }
        </span>
        @if (description) {
          <span class="mt-1 block truncate text-sm" [style.color]="'var(--josanz-text-muted)'">{{ description }}</span>
        }
      </span>
      @if (trailingLabel) {
        <span class="shrink-0 rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wider" [style.backgroundColor]="'color-mix(in srgb, var(--josanz-primary) 12%, var(--josanz-surface))'" [style.color]="'var(--josanz-primary)'">{{ trailingLabel }}</span>
      }
    </button>
  `,
})
export class ListItemComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() meta = '';
  @Input() trailingLabel = '';
  @Input() avatarName = '';
  @Input() avatarSrc = '';
  @Input() avatarColor = '';
  @Input() disabled = false;

  @Output() itemClick = new EventEmitter<void>();

  initials(): string {
    return this.avatarName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }
}
