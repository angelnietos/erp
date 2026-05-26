import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import type { JosanzControlShape } from '../josanz-control-styles';
import { JosanzThemeService } from '../services/theme.service';

export type JosanzSkeletonVariant =
  | 'text'
  | 'avatar'
  | 'button'
  | 'card'
  | 'media'
  | 'list'
  | 'table';

@Component({
  selector: 'josanz-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="grid w-full gap-3"
      [attr.aria-label]="ariaLabel || 'Cargando contenido'"
      [attr.aria-busy]="true"
      role="status"
    >
      @if (variant === 'table') {
        <div class="grid gap-2 rounded-2xl border border-solid p-3" [style.borderColor]="'var(--josanz-border)'">
          @for (_ of skeletonItems(); track $index) {
            <div class="grid grid-cols-[1.2fr_1fr_0.8fr] gap-3">
              @for (cell of [1, 2, 3]; track cell) {
                <span class="relative h-4 overflow-hidden rounded-lg" [ngStyle]="skeletonStyles($index)">
                  @if (animated) {
                    <span class="absolute inset-0 -translate-x-full animate-[josanzSkeleton_1.6s_ease-in-out_infinite]" [style.background]="shineGradient()"></span>
                  }
                </span>
              }
            </div>
          }
        </div>
      } @else if (variant === 'list') {
        @for (_ of skeletonItems(); track $index) {
          <div class="flex items-center gap-3">
            <span class="relative h-10 w-10 shrink-0 overflow-hidden rounded-full" [ngStyle]="skeletonStyles($index)">
              @if (animated) {
                <span class="absolute inset-0 -translate-x-full animate-[josanzSkeleton_1.6s_ease-in-out_infinite]" [style.background]="shineGradient()"></span>
              }
            </span>
            <span class="grid flex-1 gap-2">
              <span class="relative h-3 overflow-hidden rounded-lg" [ngStyle]="skeletonStyles($index)">
                @if (animated) {
                  <span class="absolute inset-0 -translate-x-full animate-[josanzSkeleton_1.6s_ease-in-out_infinite]" [style.background]="shineGradient()"></span>
                }
              </span>
              <span class="relative h-3 w-2/3 overflow-hidden rounded-lg" [ngStyle]="skeletonStyles($index)">
                @if (animated) {
                  <span class="absolute inset-0 -translate-x-full animate-[josanzSkeleton_1.6s_ease-in-out_infinite]" [style.background]="shineGradient()"></span>
                }
              </span>
            </span>
          </div>
        }
      } @else {
        @for (_ of skeletonItems(); track $index) {
          <div
            class="relative overflow-hidden"
            [ngClass]="skeletonClasses($index)"
            [ngStyle]="skeletonStyles($index)"
          >
            @if (animated) {
              <span
                class="absolute inset-0 -translate-x-full animate-[josanzSkeleton_1.6s_ease-in-out_infinite]"
                [style.background]="shineGradient()"
              ></span>
            }
          </div>
          }
      }
      <span class="sr-only">{{ srText }}</span>
    </div>
  `,
  styles: [
    `
      @keyframes josanzSkeleton {
        100% {
          transform: translateX(100%);
        }
      }
    `,
  ],
})
export class SkeletonComponent {
  readonly themeService = inject(JosanzThemeService);

  @Input() variant: JosanzSkeletonVariant = 'text';
  @Input() lines = 3;
  @Input() shape?: JosanzControlShape;
  @Input() animated = true;
  @Input() width = '';
  @Input() height = '';
  @Input() ariaLabel = '';
  @Input() srText = 'Cargando';

  skeletonItems(): number[] {
    return Array.from({
      length:
        this.variant === 'text' || this.variant === 'list' || this.variant === 'table'
          ? Math.max(1, Math.min(8, this.lines))
          : 1,
    });
  }

  skeletonClasses(index: number): string {
    const shape = this.shape ?? this.themeService.currentTheme().defaultShape;
    const rounded =
      this.variant === 'avatar' || shape === 'pill'
        ? 'rounded-full'
        : shape === 'square'
          ? 'rounded-none'
          : 'rounded-2xl';
    const size =
      this.variant === 'avatar'
        ? 'h-12 w-12'
        : this.variant === 'button'
          ? 'h-10 w-36'
          : this.variant === 'card'
            ? 'h-40 w-full'
            : this.variant === 'media'
              ? 'aspect-video w-full'
              : index === this.skeletonItems().length - 1
                ? 'h-3 w-2/3'
                : 'h-3 w-full';
    return `${rounded} ${size}`;
  }

  skeletonStyles(index: number): Record<string, string> {
    const width =
      this.width && (this.variant !== 'text' || index === 0)
        ? this.width
        : undefined;
    const height =
      this.height && this.variant !== 'text' ? this.height : undefined;
    return {
      backgroundColor:
        'color-mix(in srgb, var(--josanz-text-muted) 14%, var(--josanz-surface))',
      ...(width ? { width } : {}),
      ...(height ? { height } : {}),
    };
  }

  shineGradient(): string {
    return 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--josanz-surface) 65%, white), transparent)';
  }
}
