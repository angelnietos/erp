import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ValidationMessageComponent, type JosanzValidationTone } from './validation-message';

@Component({
  selector: 'josanz-form-field',
  standalone: true,
  imports: [CommonModule, ValidationMessageComponent],
  template: `
    <div class="grid w-full gap-2" [attr.data-field-id]="fieldId">
      @if (label) {
        <label
          class="ml-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.1em]"
          [attr.for]="fieldId || null"
          [style.color]="'var(--josanz-label-muted)'"
        >
          <span>{{ label }}</span>
          @if (required) {
            <span aria-hidden="true" [style.color]="'var(--josanz-danger)'">*</span>
          }
        </label>
      }
      <div
        class="min-w-0"
        [class.opacity-60]="disabled"
        [attr.aria-invalid]="!!error"
        [attr.aria-describedby]="describedBy()"
      >
        <ng-content></ng-content>
      </div>
      @if (hint && !error) {
        <p class="m-0 ml-1 text-xs font-semibold" [id]="hintId" [style.color]="'var(--josanz-text-muted)'">
          {{ hint }}
        </p>
      }
      @if (error) {
        <josanz-validation-message [message]="error" [tone]="errorTone"></josanz-validation-message>
      }
    </div>
  `,
})
export class FormFieldComponent {
  private static nextId = 0;

  @Input() label = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() errorTone: JosanzValidationTone = 'error';
  @Input() required = false;
  @Input() disabled = false;
  @Input() fieldId = `josanz-field-${FormFieldComponent.nextId++}`;

  get hintId(): string {
    return `${this.fieldId}-hint`;
  }

  describedBy(): string | null {
    if (this.error) {
      return `${this.fieldId}-error`;
    }
    if (this.hint) {
      return this.hintId;
    }
    return null;
  }
}
