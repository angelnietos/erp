import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import type { JosanzControlShape } from '../josanz-control-styles';
import { JosanzThemeService } from '../services/theme.service';

@Component({
  selector: 'josanz-password-input',
  standalone: true,
  imports: [CommonModule],
  template: `
    <label class="grid w-full gap-2">
      @if (label) {
        <span class="ml-1 text-[11px] font-bold uppercase tracking-[0.1em]" [style.color]="'var(--josanz-label-muted)'">{{ label }}</span>
      }
      <span class="relative flex items-center">
        <input
          class="h-11 w-full border border-solid px-4 pr-24 text-sm font-bold outline-none transition-all"
          [ngClass]="cornerClass()"
          [type]="visible ? 'text' : 'password'"
          [style.backgroundColor]="'var(--josanz-field-fill)'"
          [style.borderColor]="error ? 'var(--josanz-danger)' : 'var(--josanz-stroke-field)'"
          [style.color]="'var(--josanz-text)'"
          [placeholder]="placeholder"
          [value]="value"
          [disabled]="disabled"
          [attr.autocomplete]="autocomplete"
          (input)="updateValue($event)"
        />
        <button
          type="button"
          class="absolute right-2 rounded-full border border-solid bg-transparent px-3 py-1 text-[10px] font-black uppercase tracking-wider"
          [style.borderColor]="'var(--josanz-border)'"
          [style.color]="'var(--josanz-text-muted)'"
          (click)="visible = !visible"
        >
          {{ visible ? 'Ocultar' : 'Mostrar' }}
        </button>
      </span>
      @if (hint || error) {
        <span class="ml-1 text-xs font-semibold" [style.color]="error ? 'var(--josanz-danger)' : 'var(--josanz-text-muted)'">{{ error || hint }}</span>
      }
    </label>
  `,
})
export class PasswordInputComponent {
  readonly themeService = inject(JosanzThemeService);

  @Input() label = 'Contraseña';
  @Input() placeholder = '••••••••';
  @Input() hint = '';
  @Input() error = '';
  @Input() value = '';
  @Input() disabled = false;
  @Input() autocomplete = 'current-password';
  @Input() shape?: JosanzControlShape;
  @Input() customColor?: string;

  @Output() valueChange = new EventEmitter<string>();

  visible = false;

  updateValue(event: Event): void {
    this.value = (event.target as HTMLInputElement).value;
    this.valueChange.emit(this.value);
  }

  cornerClass(): string {
    const shape = this.shape ?? this.themeService.currentTheme().defaultShape;
    return shape === 'square' ? 'rounded-none' : shape === 'pill' ? 'rounded-full' : 'rounded-[var(--josanz-radius-control)]';
  }
}
