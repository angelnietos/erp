import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
  selector: 'josanz-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="flex flex-col gap-1 w-full" [formGroup]="parentForm">
      <label class="text-[11px] font-medium text-[#718096] ml-1">{{ label }}</label>
      <input 
        [type]="type"
        [formControlName]="controlName"
        [placeholder]="placeholder"
        autocomplete="off"
        class="w-full h-[35px] bg-[#F5F5F5] rounded-[6px] px-3 text-[13px] text-[#2D3748] focus:outline-none border-none placeholder:text-[#A0AEC0]"
      />
    </div>
  `,
})
export class InputComponent {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() controlName = '';
  @Input() parentForm!: FormGroup;
}
