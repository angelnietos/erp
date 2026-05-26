import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export type JosanzTimelineTone =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral';

export interface JosanzTimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp?: string;
  tone?: JosanzTimelineTone;
}

@Component({
  selector: 'josanz-timeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section
      class="grid gap-4"
      [attr.aria-label]="ariaLabel || title || 'Timeline'"
    >
      @if (title) {
        <h2 class="m-0 text-xl font-black" [style.color]="'var(--josanz-text)'">
          {{ title }}
        </h2>
      }
      <ol class="m-0 grid list-none gap-0 p-0">
        @for (item of items; track item.id; let last = $last) {
          <li class="grid grid-cols-[28px_1fr] gap-3">
            <span class="relative flex justify-center">
              <span
                class="mt-1.5 h-3 w-3 rounded-full border-2 border-solid"
                [style.backgroundColor]="toneColor(item.tone)"
                [style.borderColor]="'var(--josanz-surface)'"
              ></span>
              @if (!last) {
                <span
                  class="absolute top-5 h-[calc(100%-0.25rem)] w-px"
                  [style.backgroundColor]="'var(--josanz-border)'"
                ></span>
              }
            </span>
            <article class="pb-5">
              <div class="flex flex-wrap items-baseline justify-between gap-2">
                <h3
                  class="m-0 text-sm font-black"
                  [style.color]="'var(--josanz-text)'"
                >
                  {{ item.title }}
                </h3>
                @if (item.timestamp) {
                  <time
                    class="text-xs font-bold"
                    [style.color]="'var(--josanz-text-muted)'"
                    >{{ item.timestamp }}</time
                  >
                }
              </div>
              @if (item.description) {
                <p
                  class="m-0 mt-1 text-sm leading-relaxed"
                  [style.color]="'var(--josanz-text-muted)'"
                >
                  {{ item.description }}
                </p>
              }
            </article>
          </li>
        }
      </ol>
    </section>
  `,
})
export class TimelineComponent {
  @Input() title = '';
  @Input() items: JosanzTimelineItem[] = [];
  @Input() ariaLabel = '';

  toneColor(tone: JosanzTimelineTone = 'primary'): string {
    if (tone === 'success') {
      return 'var(--josanz-success)';
    }
    if (tone === 'warning') {
      return 'var(--josanz-warning)';
    }
    if (tone === 'danger') {
      return 'var(--josanz-danger)';
    }
    if (tone === 'neutral') {
      return 'var(--josanz-text-muted)';
    }
    return 'var(--josanz-primary)';
  }
}
