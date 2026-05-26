import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import type { JosanzControlShape } from '../josanz-control-styles';
import { JosanzThemeService } from '../services/theme.service';

export interface JosanzGalleryItem {
  id: string;
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  badge?: string;
}

@Component({
  selector: 'josanz-gallery',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="w-full" [attr.aria-label]="ariaLabel || title || 'Galería'">
      @if (title || description) {
        <header class="mb-4">
          @if (title) {
            <h2 class="m-0 text-xl font-black tracking-tight" [style.color]="'var(--josanz-text)'">{{ title }}</h2>
          }
          @if (description) {
            <p class="m-0 mt-1 text-sm" [style.color]="'var(--josanz-text-muted)'">{{ description }}</p>
          }
        </header>
      }

      <div class="grid gap-4" [ngStyle]="gridStyles()">
        @for (item of items; track item.id) {
          <button
            type="button"
            class="group min-w-0 overflow-hidden border border-solid p-0 text-left transition-[filter,transform,border-color] hover:brightness-[0.98] active:scale-[0.99]"
            [ngClass]="cornerClass()"
            [ngStyle]="itemStyles(item)"
            [attr.aria-label]="'Abrir imagen ' + item.alt"
            (click)="selectItem(item)"
          >
            <div class="aspect-[4/3] w-full overflow-hidden" [style.background]="'var(--josanz-bg)'">
              <img class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" [src]="item.src" [alt]="item.alt" />
            </div>
            @if (item.title || item.subtitle || item.badge) {
              <div class="flex min-w-0 items-start justify-between gap-3 p-4">
                <div class="min-w-0">
                  @if (item.title) {
                    <p class="m-0 truncate text-sm font-black" [style.color]="'var(--josanz-text)'">{{ item.title }}</p>
                  }
                  @if (item.subtitle) {
                    <p class="m-0 mt-1 truncate text-xs" [style.color]="'var(--josanz-text-muted)'">{{ item.subtitle }}</p>
                  }
                </div>
                @if (item.badge) {
                  <span class="shrink-0 rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-wider" [ngStyle]="badgeStyles()">
                    {{ item.badge }}
                  </span>
                }
              </div>
            }
          </button>
        }

        @if (items.length === 0) {
          <div class="rounded-3xl border border-dashed p-8 text-center" [style.borderColor]="'var(--josanz-border)'" [style.color]="'var(--josanz-text-muted)'">
            No hay imágenes para mostrar.
          </div>
        }
      </div>
    </section>
  `,
})
export class GalleryComponent {
  readonly themeService = inject(JosanzThemeService);

  @Input() title = '';
  @Input() description = '';
  @Input() items: JosanzGalleryItem[] = [];
  @Input() selectedId = '';
  @Input() columns = 3;
  @Input() shape?: JosanzControlShape;
  @Input() customColor?: string;
  @Input() ariaLabel = '';

  @Output() selectedIdChange = new EventEmitter<string>();
  @Output() itemSelect = new EventEmitter<JosanzGalleryItem>();

  gridStyles(): Record<string, string> {
    return {
      gridTemplateColumns: `repeat(${Math.max(1, Math.min(6, this.columns))}, minmax(0, 1fr))`,
    };
  }

  cornerClass(): string {
    const shape = this.shape ?? this.themeService.currentTheme().defaultShape;
    if (shape === 'square') {
      return 'rounded-none';
    }
    if (shape === 'pill') {
      return 'rounded-[28px]';
    }
    return 'rounded-3xl';
  }

  itemStyles(item: JosanzGalleryItem): Record<string, string> {
    const atmosphere = this.themeService.currentTheme().atmosphere;
    const selected = item.id === this.selectedId;
    return {
      backgroundColor: atmosphere.surface,
      borderColor: selected ? this.accentColor() : atmosphere.border,
      boxShadow: selected ? `0 0 0 2px ${this.accentColor()}` : atmosphere.shadow,
    };
  }

  badgeStyles(): Record<string, string> {
    const color = this.accentColor();
    return {
      backgroundColor: `color-mix(in srgb, ${color} 14%, var(--josanz-surface))`,
      color,
    };
  }

  selectItem(item: JosanzGalleryItem): void {
    this.selectedId = item.id;
    this.selectedIdChange.emit(item.id);
    this.itemSelect.emit(item);
  }

  private accentColor(): string {
    return this.customColor || 'var(--josanz-primary)';
  }
}
