import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-josanz-textarea',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiTextareaComponent),
      multi: true,
    },
  ],
  template: `
    <div class="textarea-group">
      @if (label) { <label [for]="id">{{ label }}</label> }
      <textarea 
        [id]="id" 
        [placeholder]="placeholder"
        [value]="value"
        (input)="onInput($event)"
        (blur)="onBlur()"
        [disabled]="disabled"
        [rows]="rows"
        [class.error]="error"
      ></textarea>
      @if (hint) { <span class="hint">{{ hint }}</span> }
    </div>
  `,
  styles: [`
    .textarea-group { display: flex; flex-direction: column; gap: 8px; width: 100%; }
    label { color: #E2E8F0; font-size: 13px; font-weight: 500; }
    textarea {
      width: 100%; padding: 12px 14px; background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;
      color: white; font-size: 14px; resize: vertical; outline: none;
      font-family: inherit;
    }
    textarea:focus { border-color: #4F46E5; }
    textarea.error { border-color: rgba(239,68,68,0.5); }
    .hint { color: #64748B; font-size: 12px; }
  `],
})
export class UiTextareaComponent implements ControlValueAccessor {
  @Input() id = '';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() hint = '';
  @Input() error = false;
  @Input() disabled = false;
  @Input() rows = 4;

  value = '';
  onChange: (value: string) => void = (value: string) => {
    this.value = value;
  };
  onTouched: () => void = () => {
    /* mark as touched */
  };

  writeValue(value: string): void { this.value = value; }
  registerOnChange(fn: (value: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  onInput(event: Event): void {
    const val = (event.target as HTMLTextAreaElement).value;
    this.value = val;
    this.onChange(val);
  }
  onBlur(): void { this.onTouched(); }
}