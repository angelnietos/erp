import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import type { JosanzControlShape } from '../josanz-control-styles';

type HtmlInputType = 'text' | 'email' | 'password' | 'number';

@Component({
  selector: 'josanz-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styleUrl: './input.css',
  template: `
    <div
      class="josanz-input-host w-full"
      [ngClass]="'josanz-input-host--' + resolvedShape"
      [style.--josanz-field-accent]="customColor || null"
      [formGroup]="parentForm"
    >
      <label class="text-[11px] font-medium text-[#718096] ml-1">{{ label }}</label>
      <ng-container [ngSwitch]="resolvedType">
        <input
          *ngSwitchCase="'text'"
          type="text"
          class="josanz-field w-full h-[40px] px-4 text-[14px] text-[#222222] placeholder:text-[#A0AEC0] transition bg-[#F5F5F5] border-none outline-none rounded-[8px] focus:ring-2 focus:ring-slate-300"
          [formControlName]="controlName"
          [placeholder]="placeholder"
          autocomplete="off"
          spellcheck="true"
        />
        <input
          *ngSwitchCase="'email'"
          type="email"
          class="josanz-field w-full h-[40px] px-4 text-[14px] text-[#222222] placeholder:text-[#A0AEC0] transition bg-[#F5F5F5] border-none outline-none rounded-[8px] focus:ring-2 focus:ring-slate-300"
          [formControlName]="controlName"
          [placeholder]="placeholder"
          autocomplete="email"
          spellcheck="false"
          inputmode="email"
        />
        <input
          *ngSwitchCase="'password'"
          type="password"
          class="josanz-field w-full h-[40px] px-4 text-[14px] text-[#222222] placeholder:text-[#A0AEC0] transition bg-[#F5F5F5] border-none outline-none rounded-[8px] focus:ring-2 focus:ring-slate-300"
          [formControlName]="controlName"
          [placeholder]="placeholder"
          autocomplete="current-password"
          spellcheck="false"
        />
        <input
          *ngSwitchCase="'number'"
          type="number"
          class="josanz-field w-full h-[40px] px-4 text-[14px] text-[#222222] placeholder:text-[#A0AEC0] transition bg-[#F5F5F5] border-none outline-none rounded-[8px] focus:ring-2 focus:ring-slate-300 tabular-nums tracking-tight"
          [formControlName]="controlName"
          [placeholder]="placeholder"
          autocomplete="off"
          inputmode="decimal"
        />
        <input
          *ngSwitchDefault
          type="text"
          class="josanz-field w-full h-[40px] px-4 text-[14px] text-[#222222] placeholder:text-[#A0AEC0] transition bg-[#F5F5F5] border-none outline-none rounded-[8px] focus:ring-2 focus:ring-slate-300"
          [formControlName]="controlName"
          [placeholder]="placeholder"
          autocomplete="off"
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

  /** Igual que en `josanz-button`: esquinas del campo. */
  @Input() shape: JosanzControlShape = 'rounded';
  /** Acento de foco / borde (hex u otro color CSS). */
  @Input() customColor?: string;

  get resolvedType(): HtmlInputType {
    const raw = (this.type ?? 'text').toString().toLowerCase().trim();
    if (raw === 'email' || raw === 'password' || raw === 'number' || raw === 'text') {
      return raw;
    }
    return 'text';
  }

  get resolvedShape(): JosanzControlShape {
    const s = (this.shape ?? 'rounded').toString() as JosanzControlShape;
    if (s === 'pill' || s === 'square' || s === 'rounded') {
      return s;
    }
    return 'rounded';
  }
}
