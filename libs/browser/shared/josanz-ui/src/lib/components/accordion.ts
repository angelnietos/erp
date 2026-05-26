import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import type { JosanzControlShape } from '../josanz-control-styles';
import { JosanzThemeService } from '../services/theme.service';

export interface JosanzAccordionItem {
  id: string;
  title: string;
  content: string;
  eyebrow?: string;
  disabled?: boolean;
}

@Component({
  selector: 'josanz-accordion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section
      class="grid gap-3"
      [attr.aria-label]="ariaLabel || title || 'Acordeón'"
    >
      @if (title) {
        <h2 class="m-0 text-xl font-black" [style.color]="'var(--josanz-text)'">
          {{ title }}
        </h2>
      }
      @for (item of items; track item.id) {
        <article
          class="overflow-hidden border border-solid"
          [ngClass]="cornerClass()"
          [ngStyle]="itemStyles(item)"
        >
          <button
            type="button"
            class="flex w-full items-center justify-between gap-4 border-0 bg-transparent p-4 text-left"
            [disabled]="item.disabled"
            [attr.aria-expanded]="isOpen(item.id)"
            (click)="toggle(item)"
          >
            <span class="min-w-0">
              @if (item.eyebrow) {
                <span
                  class="block text-[10px] font-black uppercase tracking-[0.18em]"
                  [style.color]="'var(--josanz-text-muted)'"
                  >{{ item.eyebrow }}</span
                >
              }
              <span
                class="block text-sm font-black"
                [style.color]="'var(--josanz-text)'"
                >{{ item.title }}</span
              >
            </span>
            <span
              class="shrink-0 text-xl"
              [style.color]="accentColor()"
              aria-hidden="true"
              >{{ isOpen(item.id) ? '-' : '+' }}</span
            >
          </button>
          @if (isOpen(item.id)) {
            <div
              class="border-t border-solid px-4 pb-4 pt-3 text-sm leading-relaxed"
              [style.borderColor]="'var(--josanz-border)'"
              [style.color]="'var(--josanz-text-muted)'"
            >
              {{ item.content }}
            </div>
          }
        </article>
      }
    </section>
  `,
})
export class AccordionComponent {
  readonly themeService = inject(JosanzThemeService);

  @Input() title = '';
  @Input() items: JosanzAccordionItem[] = [];
  @Input() openIds: string[] = [];
  @Input() multiple = false;
  @Input() shape?: JosanzControlShape;
  @Input() customColor?: string;
  @Input() ariaLabel = '';

  @Output() openIdsChange = new EventEmitter<string[]>();
  @Output() itemToggle = new EventEmitter<JosanzAccordionItem>();

  isOpen(id: string): boolean {
    return this.openIds.includes(id);
  }

  toggle(item: JosanzAccordionItem): void {
    if (item.disabled) {
      return;
    }
    this.openIds = this.isOpen(item.id)
      ? this.openIds.filter((id) => id !== item.id)
      : this.multiple
        ? [...this.openIds, item.id]
        : [item.id];
    this.openIdsChange.emit(this.openIds);
    this.itemToggle.emit(item);
  }

  cornerClass(): string {
    const shape = this.shape ?? this.themeService.currentTheme().defaultShape;
    if (shape === 'square') {
      return 'rounded-none';
    }
    if (shape === 'pill') {
      return 'rounded-[28px]';
    }
    return 'rounded-2xl';
  }

  itemStyles(item: JosanzAccordionItem): Record<string, string> {
    const atmosphere = this.themeService.currentTheme().atmosphere;
    return {
      backgroundColor: atmosphere.surface,
      borderColor: this.isOpen(item.id)
        ? this.accentColor()
        : atmosphere.border,
      boxShadow: atmosphere.shadow,
    };
  }

  accentColor(): string {
    return this.customColor || 'var(--josanz-primary)';
  }
}
