import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { JosanzThemeService } from '../services/theme.service';
import { JosanzControlShape } from '../josanz-control-styles';

@Component({
  selector: 'josanz-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="flex flex-col gap-2 w-full mb-4" [formGroup]="parentForm">
      <label class="text-[11px] font-bold text-[#989898] uppercase tracking-[0.1em] ml-1">
        {{ label }}
      </label>
      <div class="relative flex items-center group">
        <input
          [formControlName]="controlName"
          [type]="type"
          [placeholder]="placeholder"
          [class]="inputClasses"
          [style.boxShadow]="isFocused ? '0 0 0 2px ' + getAccentColor() : 'none'"
          (focus)="isFocused = true"
          (blur)="isFocused = false"
        />
        @if (parentForm.get(controlName)?.invalid && parentForm.get(controlName)?.touched) {
          <span class="absolute right-3 text-red-500 text-[10px] font-bold uppercase tracking-wider">Requerido</span>
        }
      </div>
    </div>
  `,
})
export class InputComponent {
  private themeService = inject(JosanzThemeService);

  @Input() label = '';
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() controlName = '';
  @Input() parentForm!: FormGroup;
  @Input() shape?: JosanzControlShape;
  @Input() customColor?: string;

  isFocused = false;

  get inputClasses() {
    const base = 'w-full h-[44px] px-4 bg-[#F5F5F5] border-none text-[14px] text-[#222222] font-medium transition-all outline-none placeholder:text-slate-400';
    
    const activeShape = this.shape || this.themeService.currentTheme().defaultShape;
    const shapes = {
      rounded: 'rounded-[10px]',
      pill: 'rounded-full',
      square: 'rounded-none',
      field: 'rounded-[10px]',
      inner: 'rounded-[6px]',
      modal: 'rounded-[24px]',
      avatar: 'rounded-[10px]'
    };

    return [
      base,
      shapes[activeShape as keyof typeof shapes] || shapes.rounded,
      this.isFocused ? 'bg-white' : 'hover:bg-[#F0F0F0]'
    ].join(' ');
  }

  getAccentColor() {
    return this.customColor || this.themeService.currentTheme().atmosphere.primary + '33'; // Color + 20% alpha
  }
}
