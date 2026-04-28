import { Component, Input, Output, EventEmitter, forwardRef, HostListener, ElementRef, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export type SelectVariant = 'default' | 'filled' | 'outlined' | 'ghost' | 'dark' | 'light' | 'error' | 'success' | 'warning' | 'info' | 'theme' | 'primary' | 'secondary' | 'transparent' | 'minimal' | 'rounded' | 'glass' | 'soft';

@Component({
  selector: 'ui-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiSelectComponent),
      multi: true,
    },
  ],
  template: `
    <div class="form-group" [class.disabled]="disabled">
      @if (label) { <label [for]="id">{{ label }}</label> }
      <div 
        class="select-wrapper" 
        [class.is-open]="isOpen" 
        [class.select-sm]="size === 'sm'"
        (click)="toggleDropdown()"
      >
        <div class="select-trigger" [class.invalid]="error" [class.has-value]="!!value">
          <span class="placeholder-text" [class.hidden]="!!selectedLabel">{{ placeholder }}</span>
          <span class="selected-text">{{ selectedLabel }}</span>
        </div>
        <div class="chevron"></div>

        @if (isOpen) {
          <div class="options-list animate-pop-in">
            @for (option of options; track option.value) {
              <div 
                class="option-item" 
                [class.selected]="value === option.value"
                (click)="selectOption(option, $event)"
              >
                {{ option.label }}
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styleUrls: ['../styles/form-field-visual.scss'],
  styles: [`
    .form-group { display: flex; flex-direction: column; gap: 0.5rem; width: 100%; position: relative; }
    label { 
      font-size: 0.7rem; 
      font-weight: 700; 
      text-transform: uppercase; 
      letter-spacing: 0.1em; 
      color: var(--text-muted); 
      margin-left: 0.25rem;
      font-family: var(--font-main);
    }
    .select-wrapper {
      position: relative;
      display: flex;
      align-items: stretch;
      border-radius: var(--radius-md, 10px);
      cursor: pointer;
      user-select: none;
      z-index: 1;
      transition: z-index 0s;
    }

    .select-wrapper.is-open {
      z-index: 1001;
    }
 
    .select-trigger {
      width: 100%;
      padding: 0.75rem 3rem 0.75rem 1rem;
      background: var(--surface-vibrant, rgba(255, 255, 255, 0.05));
      border: 1px solid var(--border-soft, rgba(255, 255, 255, 0.1));
      border-radius: var(--radius-md, 10px);
      color: var(--text-primary);
      font-size: 0.9rem;
      font-weight: 500;
      line-height: 1.5;
      transition: all 0.2s ease;
      font-family: var(--font-main);
      box-shadow: var(--shadow-sm);
      min-height: 2.75rem;
      display: flex;
      align-items: center;
    }

    .placeholder-text {
      color: var(--text-muted);
      opacity: 0.5;
    }
    .placeholder-text.hidden { display: none; }
 
    .select-wrapper:not(.disabled):hover .select-trigger {
      border-color: var(--brand);
      background: var(--surface-rich, rgba(255, 255, 255, 0.08));
      transform: translateY(-1px);
    }
 
    .select-wrapper.select-sm .select-trigger {
      padding: 0.45rem 2.5rem 0.45rem 0.85rem;
      font-size: 0.8rem;
      min-height: auto;
    }
 
    .is-open .select-trigger {
      background: var(--surface-rich);
      border-color: var(--brand);
      box-shadow: 0 0 0 3px var(--brand-glow), var(--shadow-md);
    }
 
    .select-trigger.invalid {
      border-color: var(--danger) !important;
    }
    
    .disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
 
    .chevron {
      position: absolute;
      right: 1rem;
      top: 50%;
      width: 0.4rem;
      height: 0.4rem;
      border-right: 2.5px solid var(--text-muted);
      border-bottom: 2.5px solid var(--text-muted);
      transform: translateY(-60%) rotate(45deg);
      pointer-events: none;
      transition: transform 0.2s ease, border-color 0.2s ease;
      opacity: 0.7;
    }
 
    .select-wrapper:hover .chevron {
      border-color: var(--brand);
      opacity: 1;
    }

    .is-open .chevron {
      transform: translateY(-20%) rotate(225deg);
      border-color: var(--brand);
      opacity: 1;
    }

    /* CUSTOM OPTIONS LIST */
    .options-list {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      width: 100%;
      max-height: 250px;
      overflow-y: auto;
      background: var(--surface-rich, #1a1a1a);
      backdrop-filter: blur(20px);
      border: 1px solid var(--border-soft, rgba(255, 255, 255, 0.1));
      border-radius: 12px;
      z-index: 1000;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);
      padding: 6px;
    }

    .option-item {
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--text-primary);
      transition: all 0.15s ease;
      cursor: pointer;
      margin-bottom: 2px;
    }

    .option-item:last-child { margin-bottom: 0; }

    /* THEME AWARE HOVER - No more default blue! */
    .option-item:hover {
      background: color-mix(in srgb, var(--brand) 15%, transparent);
      color: var(--text-primary);
      padding-left: 1.25rem;
    }

    .option-item.selected {
      background: var(--brand);
      color: var(--text-on-brand, #ffffff);
      font-weight: 700;
    }

    .option-item.selected:hover {
      background: color-mix(in srgb, var(--brand) 85%, #000);
    }

    @keyframes popIn {
      from { opacity: 0; transform: translateY(-10px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .animate-pop-in {
      animation: popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    /* Scrollbar Styling */
    .options-list::-webkit-scrollbar { width: 4px; }
    .options-list::-webkit-scrollbar-thumb {
      background: var(--border-soft);
      border-radius: 10px;
    }
 
    /* Babooni Tenant Enhancements */
    :host-context(html[data-erp-tenant='babooni']) .select-trigger {
      border-radius: 12px;
      font-weight: 600;
      border-color: color-mix(in srgb, var(--border-soft) 60%, transparent);
      box-shadow: 
        var(--shadow-sm),
        inset 0 1px 0 var(--surface-glow, transparent);
      backdrop-filter: blur(10px);
    }

    :host-context(html[data-erp-tenant='babooni']) .select-wrapper:hover .select-trigger {
      box-shadow: 
        var(--shadow-md),
        inset 0 1px 0 var(--surface-glow, transparent);
      border-color: var(--brand);
    }
 
    :host-context(html[data-erp-tenant='babooni']) label {
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      color: var(--brand);
    }
  `],
})
export class UiSelectComponent implements ControlValueAccessor {
  @Input() id = '';
  @Input() label = '';
  @Input() placeholder = 'Seleccionar...';
  @Input() options: { label: string, value: unknown }[] = [];
  @Input() error = false;
  @Input() size: 'sm' | 'md' = 'md';
  @Input() variant: SelectVariant = 'default';

  @Output() change = new EventEmitter<string>();
  @Output() valueChange = new EventEmitter<string>();

  value: unknown = '';
  disabled = false;
  isOpen = false;

  private elementRef = inject(ElementRef);

  get selectedLabel(): string {
    const found = this.options.find(o => o.value === this.value);
    return found ? found.label : '';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  toggleDropdown(): void {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
  }

  selectOption(option: { label: string, value: unknown }, event: MouseEvent): void {
    event.stopPropagation();
    this.value = option.value;
    this.onChange(option.value);
    this.change.emit(String(option.value));
    this.valueChange.emit(String(option.value));
    this.isOpen = false;
    this.onTouched();
  }

  onChange: (value: unknown) => void = () => {
    /* CVA stub; registerOnChange replaces this */
  };
  onTouched = () => {
    // Standard Angular ControlValueAccessor placeholder
  };

  writeValue(value: unknown): void { this.value = value; }
  registerOnChange(fn: (v: unknown) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  onBlur(): void { this.onTouched(); }
}
