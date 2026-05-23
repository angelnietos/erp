import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, Output, inject } from '@angular/core';

export type JosanzMenuItemTone = 'default' | 'danger';

export interface JosanzContextMenuItem {
  id: string;
  label: string;
  shortcut?: string;
  disabled?: boolean;
  dividerBefore?: boolean;
  tone?: JosanzMenuItemTone;
}

@Component({
  selector: 'josanz-context-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block">
      <button
        type="button"
        class="rounded-full border border-solid bg-transparent px-3 py-2 text-sm font-black"
        [style.borderColor]="'var(--josanz-border)'"
        [style.color]="'var(--josanz-text)'"
        [attr.aria-expanded]="open"
        [attr.aria-label]="buttonLabel"
        (click)="toggle($event)"
      >
        {{ buttonText }}
      </button>
      @if (open) {
        <div
          class="absolute right-0 z-40 mt-2 min-w-56 rounded-2xl border border-solid p-2 shadow-xl"
          [style.backgroundColor]="'var(--josanz-surface)'"
          [style.borderColor]="'var(--josanz-border)'"
          role="menu"
        >
          @for (item of items; track item.id) {
            @if (item.dividerBefore) {
              <div
                class="my-1 h-px"
                [style.backgroundColor]="'var(--josanz-border)'"
              ></div>
            }
            <button
              type="button"
              class="flex w-full items-center justify-between gap-4 rounded-xl border-0 bg-transparent px-3 py-2 text-left text-sm font-bold hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-50"
              [disabled]="item.disabled"
              [style.color]="
                item.tone === 'danger'
                  ? 'var(--josanz-danger)'
                  : 'var(--josanz-text)'
              "
              role="menuitem"
              (click)="select(item)"
            >
              <span>{{ item.label }}</span>
              @if (item.shortcut) {
                <kbd
                  class="rounded-md border border-solid px-1.5 py-0.5 text-[10px]"
                  [style.borderColor]="'var(--josanz-border)'"
                  [style.color]="'var(--josanz-text-muted)'"
                  >{{ item.shortcut }}</kbd
                >
              }
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class ContextMenuComponent {
  private readonly host = inject(ElementRef<HTMLElement>);

  @Input() buttonText = 'Acciones';
  @Input() buttonLabel = 'Abrir menú contextual';
  @Input() items: JosanzContextMenuItem[] = [];
  @Input() open = false;
  @Input() closeOnOutsideClick = true;

  @Output() itemSelect = new EventEmitter<JosanzContextMenuItem>();
  @Output() openChange = new EventEmitter<boolean>();

  toggle(event: MouseEvent): void {
    event.stopPropagation();
    this.open = !this.open;
    this.openChange.emit(this.open);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.open || !this.closeOnOutsideClick) {
      return;
    }
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.open = false;
      this.openChange.emit(false);
    }
  }

  select(item: JosanzContextMenuItem): void {
    if (item.disabled) {
      return;
    }
    this.open = false;
    this.openChange.emit(false);
    this.itemSelect.emit(item);
  }
}
