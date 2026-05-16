import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { josanzCornerField, type JosanzControlShape } from '../josanz-control-styles';
import { JosanzThemeService } from '../services/theme.service';

@Component({
  selector: 'josanz-list-search-field',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="josanz-list-search" [ngClass]="cornerClass()" role="search">
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
  readonly themeService = inject(JosanzThemeService);

  @Input() placeholder = 'Buscar…';
  @Input() value = '';
  @Input() ariaLabel = 'Buscar en el listado';
  /** Override del shape; si no se pasa, usa el del tema activo. */
  @Input() shape?: JosanzControlShape;

  @Output() valueChange = new EventEmitter<string>();

  cornerClass(): string {
    return josanzCornerField(this.shape ?? this.themeService.currentTheme().defaultShape);
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.valueChange.emit(target.value);
  }
}
