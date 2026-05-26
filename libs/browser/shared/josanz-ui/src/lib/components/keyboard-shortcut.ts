import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'josanz-keyboard-shortcut',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center gap-1"
      [attr.aria-label]="ariaLabel || keys.join(' + ')"
    >
      @for (key of keys; track key; let last = $last) {
        <kbd
          class="rounded-lg border border-solid px-2 py-1 text-[10px] font-black shadow-sm"
          [style.backgroundColor]="'var(--josanz-field-fill)'"
          [style.borderColor]="'var(--josanz-border)'"
          [style.color]="'var(--josanz-text)'"
        >
          {{ key }}
        </kbd>
        @if (!last) {
          <span class="text-xs" [style.color]="'var(--josanz-text-muted)'"
            >+</span
          >
        }
      }
    </span>
  `,
})
export class KeyboardShortcutComponent {
  @Input() keys: string[] = ['Ctrl', 'K'];
  @Input() ariaLabel = '';
}
