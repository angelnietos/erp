import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  Optional,
  Output,
  Self,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import type { JosanzControlShape } from '../josanz-control-styles';
import { JosanzValueAccessorBase } from '../forms/josanz-value-accessor.base';
import { JosanzThemeService } from '../services/theme.service';
import {
  josanzControlErrorMessage,
  josanzControlHasError,
} from '../validators/josanz-form-validators';

export interface JosanzSelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

@Component({
  selector: 'josanz-select',
  standalone: true,
  imports: [CommonModule],
  template: `
    <label class="grid w-full gap-2">
      @if (label) {
        <span
          class="ml-1 text-[11px] font-bold uppercase tracking-[0.1em]"
          [style.color]="'var(--josanz-label-muted)'"
        >
          {{ label }}
          @if (required) {
            <span class="text-[color:var(--josanz-danger)]" aria-hidden="true"> *</span>
          }
        </span>
      }
      <div class="relative">
        <button
          type="button"
          class="h-11 w-full border border-solid px-4 pr-10 text-left text-sm font-bold outline-none transition-all"
          [ngClass]="cornerClass()"
          [style.backgroundColor]="'var(--josanz-field-fill)'"
          [style.borderColor]="fieldBorderColor"
          [style.boxShadow]="isFocused ? focusRing() : 'none'"
          [style.color]="selectedLabel ? 'var(--josanz-text)' : 'var(--josanz-text-muted)'"
          [disabled]="disabled"
          [attr.aria-label]="ariaLabel || label"
          [attr.aria-invalid]="showFieldError"
          [attr.aria-describedby]="showFieldError ? fieldErrorId : null"
          [attr.aria-expanded]="isOpen"
          aria-haspopup="listbox"
          (click)="toggleOpen($event)"
          (focus)="isFocused = true"
          (keydown)="onButtonKeydown($event)"
        >
          <span class="block truncate">{{ selectedLabel || placeholder || 'Selecciona una opción' }}</span>
        </button>
        <span
          class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs"
          [style.color]="'var(--josanz-text-muted)'"
          aria-hidden="true"
          >⌄</span
        >

        @if (isOpen) {
          <div
            class="absolute left-0 right-0 top-[calc(100%+6px)] z-[80] max-h-64 overflow-auto rounded-[12px] border border-solid bg-white p-1 shadow-[0_14px_40px_rgba(15,30,47,0.14)]"
            [style.borderColor]="'var(--josanz-border)'"
            [style.backgroundColor]="'var(--josanz-surface)'"
            role="listbox"
          >
            @if (placeholder && !required) {
              <button
                type="button"
                class="josanz-select-option"
                [class.josanz-select-option--active]="!value"
                (click)="chooseValue('')"
                role="option"
                [attr.aria-selected]="!value"
              >
                {{ placeholder }}
              </button>
            }
            @for (option of options; track option.value) {
              <button
                type="button"
                class="josanz-select-option"
                [class.josanz-select-option--active]="option.value === value"
                [disabled]="option.disabled"
                (click)="chooseValue(option.value)"
                role="option"
                [attr.aria-selected]="option.value === value"
              >
                {{ option.label }}
              </button>
            }
          </div>
        }
      </div>
      @if (hint || fieldErrorMessage) {
        <span
          class="text-xs font-medium"
          [id]="fieldErrorId"
          [style.color]="showFieldError ? 'var(--josanz-danger)' : 'var(--josanz-text-muted)'"
          [attr.role]="showFieldError ? 'alert' : null"
        >
          {{ showFieldError ? fieldErrorMessage : hint }}
        </span>
      }
    </label>
  `,
  styles: [
    `
      .josanz-select-option {
        width: 100%;
        display: flex;
        align-items: center;
        min-height: 36px;
        border: 0;
        border-radius: 9px;
        background: transparent;
        padding: 0.55rem 0.75rem;
        color: var(--josanz-text);
        font: inherit;
        font-size: 13px;
        font-weight: 650;
        text-align: left;
        cursor: pointer;
      }

      .josanz-select-option:hover:not(:disabled),
      .josanz-select-option--active {
        background: color-mix(in srgb, var(--josanz-interactive) 10%, transparent);
        color: var(--josanz-text);
      }

      .josanz-select-option:disabled {
        cursor: not-allowed;
        opacity: 0.45;
      }
    `,
  ],
})
export class SelectComponent extends JosanzValueAccessorBase<string> {
  readonly themeService = inject(JosanzThemeService);
  private readonly host = inject(ElementRef<HTMLElement>);

  @Input() label = '';
  @Input() placeholder = '';
  @Input() options: JosanzSelectOption[] = [];
  @Input() value = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() required = false;
  @Input() override disabled = false;
  @Input() shape?: JosanzControlShape;
  @Input() customColor?: string;
  @Input() ariaLabel = '';

  @Output() valueChange = new EventEmitter<string>();

  isFocused = false;
  isOpen = false;

  constructor(@Optional() @Self() private readonly ngControl: NgControl | null) {
    super();
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  get fieldErrorId(): string {
    return `${this.label || 'select'}-error`;
  }

  get boundControl() {
    return this.ngControl?.control ?? null;
  }

  get showFieldError(): boolean {
    if (this.error) {
      return true;
    }
    return josanzControlHasError(this.boundControl);
  }

  get fieldErrorMessage(): string {
    if (this.error) {
      return this.error;
    }
    return josanzControlErrorMessage(this.boundControl);
  }

  get fieldBorderColor(): string {
    if (this.showFieldError) {
      return 'var(--josanz-danger)';
    }
    if (this.isFocused || this.customColor) {
      return this.accentColor;
    }
    return 'var(--josanz-stroke-field)';
  }

  override writeValue(value: string | null): void {
    this.value = value ?? '';
  }

  get selectedLabel(): string {
    return this.options.find((option) => option.value === this.value)?.label ?? '';
  }

  get accentColor(): string {
    return this.customColor || 'var(--josanz-interactive)';
  }

  onBlur(): void {
    this.isFocused = false;
    this.isOpen = false;
    this.markTouched();
  }

  toggleOpen(event: Event): void {
    event.preventDefault();
    if (this.disabled) {
      return;
    }
    this.isOpen = !this.isOpen;
    this.isFocused = true;
  }

  chooseValue(value: string): void {
    this.value = value;
    this.emitChange(this.value);
    this.valueChange.emit(this.value);
    this.isOpen = false;
    this.markTouched();
  }

  onButtonKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.isOpen = false;
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.isOpen = !this.isOpen;
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.isOpen = true;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.onBlur();
    }
  }

  cornerClass(): string {
    const shape = this.shape ?? this.themeService.currentTheme().defaultShape;
    if (shape === 'square') {
      return 'rounded-none';
    }
    if (shape === 'pill') {
      return 'rounded-full';
    }
    return 'rounded-[var(--josanz-radius-control)]';
  }

  focusRing(): string {
    const color = this.showFieldError ? 'var(--josanz-danger)' : this.accentColor;
    return `0 0 0 2px color-mix(in srgb, ${color} 35%, transparent)`;
  }
}
