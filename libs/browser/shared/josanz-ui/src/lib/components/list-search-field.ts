import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'josanz-list-search-field',
  standalone: true,
  template: `
    <div class="josanz-list-search" role="search">
      <svg
        class="josanz-list-search__icon"
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
        type="text"
        role="searchbox"
        class="josanz-list-search__input"
        [attr.aria-label]="ariaLabel"
        [placeholder]="placeholder"
        [value]="value"
        autocomplete="off"
        spellcheck="false"
        (input)="onInput($event)"
      />
    </div>
  `,
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
