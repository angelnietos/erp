import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

type HtmlInputType = 'text' | 'email' | 'password' | 'number';

@Component({
  selector: 'josanz-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="flex flex-col gap-1 w-full" [formGroup]="parentForm">
      <label class="text-[11px] font-medium text-[#718096] ml-1">{{ label }}</label>
      <ng-container [ngSwitch]="resolvedType">
        <input
          *ngSwitchCase="'text'"
          type="text"
          [formControlName]="controlName"
          [placeholder]="placeholder"
          autocomplete="off"
          spellcheck="true"
          class="w-full h-[35px] rounded-[6px] px-3 text-[13px] text-[#2D3748] placeholder:text-[#A0AEC0] transition shadow-sm bg-[#F5F5F5] border border-transparent focus:outline-none focus:border-slate-300"
        />
        <input
          *ngSwitchCase="'email'"
          type="email"
          [formControlName]="controlName"
          [placeholder]="placeholder"
          autocomplete="email"
          spellcheck="false"
          inputmode="email"
          class="w-full h-[35px] rounded-[6px] px-3 text-[13px] text-[#2D3748] placeholder:text-[#A0AEC0] transition shadow-sm bg-white border border-slate-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
        <input
          *ngSwitchCase="'password'"
          type="password"
          [formControlName]="controlName"
          [placeholder]="placeholder"
          autocomplete="current-password"
          spellcheck="false"
          class="w-full h-[35px] rounded-[6px] px-3 text-[13px] text-[#2D3748] placeholder:text-[#A0AEC0] transition shadow-sm bg-[#FFFBF5] border border-amber-100 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
        />
        <input
          *ngSwitchCase="'number'"
          type="number"
          [formControlName]="controlName"
          [placeholder]="placeholder"
          autocomplete="off"
          inputmode="decimal"
          class="w-full h-[35px] rounded-[6px] px-3 text-[13px] text-[#2D3748] placeholder:text-[#A0AEC0] transition shadow-sm bg-[#F8FAFC] border border-slate-200 text-right tabular-nums tracking-tight focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
        <input
          *ngSwitchDefault
          type="text"
          [formControlName]="controlName"
          [placeholder]="placeholder"
          autocomplete="off"
          class="w-full h-[35px] rounded-[6px] px-3 text-[13px] text-[#2D3748] placeholder:text-[#A0AEC0] transition shadow-sm bg-[#F5F5F5] border border-transparent focus:outline-none focus:border-slate-300"
        />
      </ng-container>
    </div>
  `,
})
export class InputComponent {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() controlName = '';
  @Input() parentForm!: FormGroup;

  get resolvedType(): HtmlInputType {
    const raw = (this.type ?? 'text').toString().toLowerCase().trim();
    if (raw === 'email' || raw === 'password' || raw === 'number' || raw === 'text') {
      return raw;
    }
    return 'text';
  }
}
