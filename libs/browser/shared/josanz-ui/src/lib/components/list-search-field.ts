import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { josanzCornerField, type JosanzControlShape } from '../josanz-control-styles';
import { JosanzThemeService } from '../services/theme.service';

@Component({
  selector: 'josanz-list-search-field',
  standalone: true,
  imports: [NgClass],
  template: `
    <div
      class="josanz-list-search"
      [ngClass]="cornerClass()"
      role="search"
      [style.borderColor]="wrapperBorderColor()"
      [style.boxShadow]="wrapperFocusRing()"
    >
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
        (focus)="isFocused = true"
        (blur)="isFocused = false"
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

  @Input() customColor?: string;

  @Output() valueChange = new EventEmitter<string>();

  isFocused = false;

  cornerClass(): string {
    return josanzCornerField(this.shape ?? this.themeService.currentTheme().defaultShape);
  }

  getAccentColor(): string {
    if (this.customColor) {
      return this.customColor;
    }
    if (typeof document !== 'undefined') {
      const token = getComputedStyle(document.documentElement)
        .getPropertyValue('--josanz-interactive')
        .trim();
      if (token) {
        return token;
      }
    }
    return this.themeService.currentTheme().primaryColor;
  }

  wrapperBorderColor(): string | undefined {
    if (this.isFocused || this.customColor) {
      return this.getAccentColor();
    }
    return undefined;
  }

  wrapperFocusRing(): string | undefined {
    if (!this.isFocused) {
      return undefined;
    }
    return `0 0 0 2px color-mix(in srgb, ${this.getAccentColor()} 28%, transparent)`;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.valueChange.emit(target.value);
  }
}
