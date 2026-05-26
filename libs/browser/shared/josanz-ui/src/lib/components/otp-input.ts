import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, QueryList, ViewChildren } from '@angular/core';

@Component({
  selector: 'josanz-otp-input',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid w-full gap-2" role="group" [attr.aria-label]="ariaLabel || label || 'Código de verificación'">
      @if (label) {
        <span class="ml-1 text-[11px] font-bold uppercase tracking-[0.1em]" [style.color]="'var(--josanz-label-muted)'">{{ label }}</span>
      }
      <div class="flex flex-wrap gap-2">
        @for (digit of slots; track $index) {
          <input
            #slot
            type="text"
            inputmode="numeric"
            maxlength="1"
            class="h-12 w-11 border border-solid bg-transparent text-center text-lg font-black outline-none rounded-[var(--josanz-radius-control)]"
            [style.borderColor]="error ? 'var(--josanz-danger)' : 'var(--josanz-stroke-field)'"
            [style.backgroundColor]="'var(--josanz-field-fill)'"
            [style.color]="'var(--josanz-text)'"
            [value]="digits[$index] || ''"
            [disabled]="disabled"
            (input)="onDigitInput($index, $event)"
            (keydown)="onKeyDown($index, $event)"
            (paste)="onPaste($event)"
          />
        }
      </div>
      @if (hint || error) {
        <span class="ml-1 text-xs font-semibold" [style.color]="error ? 'var(--josanz-danger)' : 'var(--josanz-text-muted)'">{{ error || hint }}</span>
      }
    </div>
  `,
})
export class OtpInputComponent {
  @ViewChildren('slot') slotInputs!: QueryList<ElementRef<HTMLInputElement>>;

  @Input() label = 'Código de verificación';
  @Input() length = 6;
  @Input() hint = 'Introduce el código enviado por SMS o email.';
  @Input() error = '';
  @Input() disabled = false;
  @Input() ariaLabel = '';

  @Output() valueChange = new EventEmitter<string>();
  @Output() completed = new EventEmitter<string>();

  digits: string[] = [];

  get slots(): number[] {
    return Array.from({ length: Math.max(4, Math.min(8, this.length)) });
  }

  onDigitInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const next = input.value.replace(/\D/g, '').slice(-1);
    this.digits[index] = next;
    input.value = next;
    this.emitValue();
    if (next && index < this.slots.length - 1) {
      this.focusSlot(index + 1);
    }
  }

  onKeyDown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace' && !this.digits[index] && index > 0) {
      this.focusSlot(index - 1);
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pasted = (event.clipboardData?.getData('text') ?? '').replace(/\D/g, '').slice(0, this.slots.length);
    this.digits = pasted.split('');
    this.emitValue();
    const focusIndex = Math.min(pasted.length, this.slots.length - 1);
    this.focusSlot(focusIndex);
  }

  private emitValue(): void {
    const value = this.slots.map((_, index) => this.digits[index] ?? '').join('');
    this.valueChange.emit(value);
    if (value.length === this.slots.length && !value.includes('')) {
      this.completed.emit(value);
    }
  }

  private focusSlot(index: number): void {
    const el = this.slotInputs?.get(index)?.nativeElement;
    el?.focus();
    el?.select();
  }
}
