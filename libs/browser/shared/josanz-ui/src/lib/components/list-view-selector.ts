import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'josanz-list-view-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-flex min-w-0">
      <button
        type="button"
        class="flex items-center gap-2 rounded-full border border-solid px-4 py-2 text-[13px] font-semibold transition-colors hover:brightness-95"
        [style.backgroundColor]="'var(--josanz-surface)'"
        [style.borderColor]="'var(--josanz-border)'"
        [style.color]="'var(--josanz-text)'"
        [attr.aria-expanded]="open()"
        [attr.aria-haspopup]="'listbox'"
        (click)="toggle()"
      >
        <span class="truncate">{{ label }}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="shrink-0 transition-transform"
          [class.rotate-180]="open()"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      @if (open()) {
        <ul
          role="listbox"
          class="absolute bottom-full left-0 z-50 mb-2 min-w-full overflow-hidden rounded-xl border border-solid py-1 shadow-lg"
          [style.backgroundColor]="'var(--josanz-surface)'"
          [style.borderColor]="'var(--josanz-border)'"
        >
          @for (opt of options; track opt) {
            <li role="option" [attr.aria-selected]="opt === selected">
              <button
                type="button"
                class="w-full px-4 py-2 text-left text-[13px] font-medium transition-colors hover:bg-[rgba(0,0,0,0.04)]"
                [style.color]="opt === selected ? 'var(--josanz-primary)' : 'var(--josanz-text)'"
                (click)="pick(opt)"
              >
                {{ opt }}
              </button>
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class ListViewSelectorComponent {
  @Input() label = 'Elección de vista';
  @Input() options: string[] = ['Tabla', 'Tarjetas'];
  @Input() selected = 'Tabla';

  @Output() selectionChange = new EventEmitter<string>();

  readonly open = signal(false);

  toggle(): void {
    this.open.update((v) => !v);
  }

  pick(option: string): void {
    this.selected = option;
    this.open.set(false);
    this.selectionChange.emit(option);
  }
}

