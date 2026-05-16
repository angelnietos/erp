import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'josanz-list-search-field',
  standalone: true,
  template: `
    <label class="josanz-list-search relative flex min-w-[140px] max-w-[220px] flex-1 items-center md:flex-none">
      <span class="sr-only">{{ ariaLabel }}</span>
      <svg
        class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <input
        type="search"
        class="w-full rounded-full border border-solid py-2 pl-9 pr-3 text-[13px] font-medium outline-none transition-shadow focus:ring-2"
        [style.backgroundColor]="'var(--josanz-surface)'"
        [style.borderColor]="'var(--josanz-border)'"
        [style.color]="'var(--josanz-text)'"
        [style.--tw-ring-color]="'var(--josanz-primary)'"
        [placeholder]="placeholder"
        [value]="value"
        (input)="onInput($event)"
      />
    </label>
  `,
  styles: [
    `
      .josanz-list-search input::placeholder {
        color: var(--josanz-text-muted);
        opacity: 0.85;
      }
    `,
  ],
})
export class ListSearchFieldComponent {
  @Input() placeholder = 'Buscar…';
  @Input() value = '';
  @Input() ariaLabel = 'Buscar en el listado';

  @Output() valueChange = new EventEmitter<string>();

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.valueChange.emit(target.value);
  }
}
