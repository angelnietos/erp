import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'josanz-popover',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block">
      <button type="button" class="rounded-full border border-solid bg-transparent px-3 py-2 text-sm font-black" [style.borderColor]="'var(--josanz-border)'" [style.color]="'var(--josanz-text)'" [attr.aria-expanded]="open" (click)="open = !open">
        <ng-content select="[popover-trigger]"></ng-content>
        @if (!hasTriggerContent) {
          {{ triggerLabel }}
        }
      </button>
      @if (open) {
        <div
          class="absolute z-40 mt-2 min-w-56 rounded-2xl border border-solid p-4 shadow-xl"
          [ngClass]="placementClass()"
          [style.backgroundColor]="'var(--josanz-surface)'"
          [style.borderColor]="'var(--josanz-border)'"
          role="dialog"
        >
          @if (title) {
            <strong class="block text-sm font-black" [style.color]="'var(--josanz-text)'">{{ title }}</strong>
          }
          @if (description) {
            <p class="m-0 mt-1 text-sm leading-relaxed" [style.color]="'var(--josanz-text-muted)'">{{ description }}</p>
          }
          <div class="mt-3">
            <ng-content></ng-content>
          </div>
        </div>
      }
    </div>
  `,
})
export class PopoverComponent {
  @Input() triggerLabel = 'Abrir';
  @Input() title = '';
  @Input() description = '';
  @Input() open = false;
  @Input() placement: 'bottom' | 'top' | 'left' | 'right' = 'bottom';
  @Input() hasTriggerContent = false;

  @Output() openChange = new EventEmitter<boolean>();

  placementClass(): string {
    if (this.placement === 'top') {
      return 'bottom-full left-0 mb-2';
    }
    if (this.placement === 'left') {
      return 'right-full top-0 mr-2';
    }
    if (this.placement === 'right') {
      return 'left-full top-0 ml-2';
    }
    return 'left-0 top-full';
  }
}
