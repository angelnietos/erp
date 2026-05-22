import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  JOSANZ_LIST_VIEW_MENU_OPTIONS,
  listViewSelectionLabel,
  type JosanzListViewSelection,
} from '../list-view/list-view-preferences';

@Component({
  selector: 'josanz-list-view-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-flex min-w-0">
      <button
        type="button"
        class="flex max-w-[min(100%,280px)] items-center gap-2 rounded-full border border-solid px-4 py-2 text-[13px] font-semibold transition-colors hover:brightness-95"
        [style.backgroundColor]="'var(--josanz-surface)'"
        [style.borderColor]="'var(--josanz-border)'"
        [style.color]="'var(--josanz-text)'"
        [attr.aria-expanded]="open()"
        [attr.aria-haspopup]="'listbox'"
        (click)="toggle($event)"
      >
        <span class="truncate">{{ label }}</span>
        <span class="truncate text-[12px] font-bold opacity-70">· {{ summaryLabel }}</span>
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
          class="absolute bottom-full left-0 z-50 mb-2 min-w-[12rem] overflow-hidden rounded-xl border border-solid py-1 shadow-lg"
          [style.backgroundColor]="'var(--josanz-surface)'"
          [style.borderColor]="'var(--josanz-border)'"
        >
          @for (opt of tableOptions; track opt.id) {
            <li role="option" [attr.aria-selected]="opt.id === selected">
              <button
                type="button"
                class="w-full px-4 py-2 text-left text-[13px] font-medium transition-colors hover:bg-[rgba(0,0,0,0.04)]"
                [style.color]="opt.id === selected ? 'var(--josanz-primary)' : 'var(--josanz-text)'"
                (click)="pick(opt.id, $event)"
              >
                {{ opt.label }}
              </button>
            </li>
          }
          <li class="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]" [style.color]="'var(--josanz-text-muted)'">
            Tarjetas
          </li>
          @for (opt of cardOptions; track opt.id) {
            <li role="option" [attr.aria-selected]="opt.id === selected">
              <button
                type="button"
                class="w-full py-2 pl-6 pr-4 text-left text-[13px] font-medium transition-colors hover:bg-[rgba(0,0,0,0.04)]"
                [style.color]="opt.id === selected ? 'var(--josanz-primary)' : 'var(--josanz-text)'"
                (click)="pick(opt.id, $event)"
              >
                {{ opt.label }}
              </button>
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class ListViewSelectorComponent {
  private readonly host = inject(ElementRef<HTMLElement>);

  @Input() label = 'Elección de vista';
  @Input() selected: JosanzListViewSelection = 'tarjetas-lista';

  @Output() selectionChange = new EventEmitter<JosanzListViewSelection>();

  readonly open = signal(false);

  readonly tableOptions = JOSANZ_LIST_VIEW_MENU_OPTIONS.filter((o) => !o.group);
  readonly cardOptions = JOSANZ_LIST_VIEW_MENU_OPTIONS.filter((o) => o.group === 'tarjetas');

  get summaryLabel(): string {
    return listViewSelectionLabel(this.selected);
  }

  toggle(event: Event): void {
    event.stopPropagation();
    this.open.update((v) => !v);
  }

  pick(option: JosanzListViewSelection, event: Event): void {
    event.stopPropagation();
    this.open.set(false);
    this.selectionChange.emit(option);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.open()) {
      return;
    }
    const target = event.target as Node;
    if (!this.host.nativeElement.contains(target)) {
      this.open.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.open.set(false);
  }
}
