import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import type { JosanzControlShape } from '../josanz-control-styles';
import { JosanzThemeService } from '../services/theme.service';

export interface JosanzCarouselItem {
  id: string;
  src: string;
  alt: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  ctaLabel?: string;
}

@Component({
  selector: 'josanz-carousel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section
      class="w-full"
      [attr.aria-label]="ariaLabel || title || 'Carrusel'"
    >
      @if (title || description) {
        <header class="mb-4">
          @if (title) {
            <h2
              class="m-0 text-xl font-black tracking-tight"
              [style.color]="'var(--josanz-text)'"
            >
              {{ title }}
            </h2>
          }
          @if (description) {
            <p
              class="m-0 mt-1 text-sm"
              [style.color]="'var(--josanz-text-muted)'"
            >
              {{ description }}
            </p>
          }
        </header>
      }

      @if (activeItem(); as item) {
        <article
          class="relative overflow-hidden border border-solid"
          [ngClass]="cornerClass()"
          [ngStyle]="shellStyles()"
        >
          <img
            class="aspect-[16/9] w-full object-cover"
            [src]="item.src"
            [alt]="item.alt"
          />
          @if (showOverlay) {
            <div
              class="absolute inset-x-0 bottom-0 p-5"
              style="background: linear-gradient(180deg, transparent, rgba(0,0,0,.72));"
            >
              @if (item.eyebrow) {
                <p
                  class="m-0 text-[10px] font-black uppercase tracking-[0.18em] text-white/75"
                >
                  {{ item.eyebrow }}
                </p>
              }
              @if (item.title) {
                <h3 class="m-0 mt-1 text-2xl font-black text-white">
                  {{ item.title }}
                </h3>
              }
              @if (item.description) {
                <p class="m-0 mt-1 max-w-2xl text-sm text-white/80">
                  {{ item.description }}
                </p>
              }
            </div>
          }

          @if (showControls && items.length > 1) {
            <button
              type="button"
              class="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white"
              aria-label="Imagen anterior"
              (click)="previous()"
            >
              ‹
            </button>
            <button
              type="button"
              class="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white"
              aria-label="Imagen siguiente"
              (click)="next()"
            >
              ›
            </button>
          }
        </article>

        @if (showIndicators && items.length > 1) {
          <div class="mt-4 flex justify-center gap-2">
            @for (slide of items; track slide.id; let index = $index) {
              <button
                type="button"
                class="h-2.5 rounded-full border-0 p-0 transition-all"
                [style.width]="index === activeIndex ? '28px' : '10px'"
                [style.backgroundColor]="
                  index === activeIndex ? accentColor() : 'var(--josanz-border)'
                "
                [attr.aria-label]="'Ir a imagen ' + (index + 1)"
                (click)="goTo(index)"
              ></button>
            }
          </div>
        }
      } @else {
        <div
          class="rounded-3xl border border-dashed p-8 text-center"
          [style.borderColor]="'var(--josanz-border)'"
          [style.color]="'var(--josanz-text-muted)'"
        >
          No hay elementos en el carrusel.
        </div>
      }
    </section>
  `,
})
export class CarouselComponent {
  readonly themeService = inject(JosanzThemeService);

  @Input() title = '';
  @Input() description = '';
  @Input() items: JosanzCarouselItem[] = [];
  @Input() activeIndex = 0;
  @Input() showControls = true;
  @Input() showIndicators = true;
  @Input() showOverlay = true;
  @Input() shape?: JosanzControlShape;
  @Input() customColor?: string;
  @Input() ariaLabel = '';

  @Output() activeIndexChange = new EventEmitter<number>();
  @Output() itemSelect = new EventEmitter<JosanzCarouselItem>();

  activeItem(): JosanzCarouselItem | undefined {
    return this.items[this.normalizedIndex()];
  }

  previous(): void {
    this.goTo(this.normalizedIndex() - 1);
  }

  next(): void {
    this.goTo(this.normalizedIndex() + 1);
  }

  goTo(index: number): void {
    if (this.items.length === 0) {
      return;
    }
    this.activeIndex = (index + this.items.length) % this.items.length;
    this.activeIndexChange.emit(this.activeIndex);
    const item = this.activeItem();
    if (item) {
      this.itemSelect.emit(item);
    }
  }

  cornerClass(): string {
    const shape = this.shape ?? this.themeService.currentTheme().defaultShape;
    if (shape === 'square') {
      return 'rounded-none';
    }
    if (shape === 'pill') {
      return 'rounded-[36px]';
    }
    return 'rounded-3xl';
  }

  shellStyles(): Record<string, string> {
    const atmosphere = this.themeService.currentTheme().atmosphere;
    return {
      backgroundColor: atmosphere.surface,
      borderColor: atmosphere.border,
      boxShadow: atmosphere.shadow,
    };
  }

  accentColor(): string {
    return this.customColor || 'var(--josanz-primary)';
  }

  private normalizedIndex(): number {
    if (this.items.length === 0) {
      return 0;
    }
    return Math.max(0, Math.min(this.items.length - 1, this.activeIndex));
  }
}
