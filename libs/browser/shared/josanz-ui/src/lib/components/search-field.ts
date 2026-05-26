import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import type { JosanzControlShape } from '../josanz-control-styles';
import { JosanzThemeService } from '../services/theme.service';

@Component({
  selector: 'josanz-search-field',
  standalone: true,
  imports: [CommonModule],
  template: `
    <label class="grid w-full gap-2" role="search">
      @if (label) {
        <span class="sr-only">{{ label }}</span>
      }
      <span
        class="flex h-11 items-center gap-2 border border-solid px-3"
        [ngClass]="cornerClass()"
        [style.backgroundColor]="'var(--josanz-field-fill)'"
        [style.borderColor]="isFocused ? accentColor() : 'var(--josanz-stroke-field)'"
      >
        <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" [style.color]="'var(--josanz-text-muted)'">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          type="search"
          class="min-w-0 flex-1 border-0 bg-transparent text-sm font-bold outline-none"
          [style.color]="'var(--josanz-text)'"
          [placeholder]="placeholder"
          [value]="value"
          [disabled]="disabled"
          [attr.aria-label]="ariaLabel || label || placeholder"
          (focus)="isFocused = true"
          (blur)="isFocused = false"
          (input)="onInput($event)"
        />
        @if (value && clearable) {
          <button type="button" class="border-0 bg-transparent text-xs font-black" [style.color]="'var(--josanz-text-muted)'" (click)="clear()">×</button>
        }
      </span>
    </label>
  `,
})
export class SearchFieldComponent {
  readonly themeService = inject(JosanzThemeService);

  @Input() label = 'Buscar';
  @Input() placeholder = 'Buscar...';
  @Input() value = '';
  @Input() disabled = false;
  @Input() clearable = true;
  @Input() shape?: JosanzControlShape;
  @Input() customColor?: string;
  @Input() ariaLabel = '';

  @Output() valueChange = new EventEmitter<string>();
  @Output() search = new EventEmitter<string>();

  isFocused = false;

  onInput(event: Event): void {
    this.value = (event.target as HTMLInputElement).value;
    this.valueChange.emit(this.value);
    this.search.emit(this.value);
  }

  clear(): void {
    this.value = '';
    this.valueChange.emit('');
    this.search.emit('');
  }

  cornerClass(): string {
    const shape = this.shape ?? this.themeService.currentTheme().defaultShape;
    return shape === 'square' ? 'rounded-none' : shape === 'pill' ? 'rounded-full' : 'rounded-[var(--josanz-radius-control)]';
  }

  accentColor(): string {
    return this.customColor || 'var(--josanz-primary)';
  }
}
