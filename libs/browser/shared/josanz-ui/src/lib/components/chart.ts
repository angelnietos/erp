import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface JosanzChartDatum {
  label: string;
  value: number;
  color?: string;
}

@Component({
  selector: 'josanz-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section
      class="rounded-3xl border border-solid p-5"
      [style.backgroundColor]="'var(--josanz-surface)'"
      [style.borderColor]="'var(--josanz-border)'"
      [attr.aria-label]="ariaLabel || title || 'Gráfica'"
    >
      @if (title || description) {
        <header class="mb-5">
          @if (title) {
            <h2
              class="m-0 text-xl font-black"
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

      @if (variant === 'bar') {
        <div class="grid gap-3">
          @for (item of data; track item.label) {
            <div class="grid gap-1">
              <div class="flex justify-between gap-3 text-xs font-bold">
                <span [style.color]="'var(--josanz-text)'">{{
                  item.label
                }}</span>
                <span [style.color]="'var(--josanz-text-muted)'">{{
                  item.value
                }}</span>
              </div>
              <div
                class="h-3 overflow-hidden rounded-full"
                [style.backgroundColor]="
                  'color-mix(in srgb, var(--josanz-text-muted) 12%, var(--josanz-surface))'
                "
              >
                <div
                  class="h-full rounded-full"
                  [style.width.%]="barWidth(item.value)"
                  [style.backgroundColor]="item.color || accentColor"
                ></div>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="flex items-center gap-6">
          <div
            class="h-36 w-36 rounded-full"
            [style.background]="donutGradient()"
          ></div>
          <div class="grid gap-2">
            @for (item of data; track item.label; let index = $index) {
              <div class="flex items-center gap-2 text-sm">
                <span
                  class="h-3 w-3 rounded-full"
                  [style.backgroundColor]="item.color || paletteColor(index)"
                ></span>
                <span [style.color]="'var(--josanz-text)'">{{
                  item.label
                }}</span>
                <strong [style.color]="'var(--josanz-text-muted)'">{{
                  item.value
                }}</strong>
              </div>
            }
          </div>
        </div>
      }
    </section>
  `,
})
export class ChartComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() data: JosanzChartDatum[] = [];
  @Input() variant: 'bar' | 'donut' = 'bar';
  @Input() customColor?: string;
  @Input() ariaLabel = '';

  get accentColor(): string {
    return this.customColor || 'var(--josanz-primary)';
  }

  barWidth(value: number): number {
    const max = Math.max(...this.data.map((item) => item.value), 1);
    return Math.round((value / max) * 100);
  }

  donutGradient(): string {
    const total = this.data.reduce((sum, item) => sum + item.value, 0) || 1;
    let start = 0;
    const parts = this.data.map((item, index) => {
      const end = start + (item.value / total) * 100;
      const color = item.color || this.paletteColor(index);
      const part = `${color} ${start}% ${end}%`;
      start = end;
      return part;
    });
    return `conic-gradient(${parts.join(', ')})`;
  }

  paletteColor(index: number): string {
    return [
      'var(--josanz-primary)',
      'var(--josanz-success)',
      'var(--josanz-warning)',
      'var(--josanz-danger)',
      'var(--josanz-text-muted)',
    ][index % 5];
  }
}
