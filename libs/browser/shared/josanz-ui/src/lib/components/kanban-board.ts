import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BadgeComponent } from './badge';

export interface JosanzKanbanCard {
  id: string;
  title: string;
  description?: string;
  badge?: string;
  assignee?: string;
}

export interface JosanzKanbanColumn {
  id: string;
  title: string;
  cards: JosanzKanbanCard[];
}

@Component({
  selector: 'josanz-kanban-board',
  standalone: true,
  imports: [CommonModule, BadgeComponent],
  template: `
    <section
      class="grid gap-4"
      [attr.aria-label]="ariaLabel || title || 'Kanban'"
    >
      @if (title) {
        <h2 class="m-0 text-xl font-black" [style.color]="'var(--josanz-text)'">
          {{ title }}
        </h2>
      }
      <div
        class="grid gap-4 overflow-x-auto"
        [style.gridTemplateColumns]="
          'repeat(' + columns.length + ', minmax(280px, 1fr))'
        "
      >
        @for (column of columns; track column.id) {
          <article
            class="rounded-3xl border border-solid p-4"
            [style.backgroundColor]="
              'color-mix(in srgb, var(--josanz-text-muted) 4%, var(--josanz-surface))'
            "
            [style.borderColor]="'var(--josanz-border)'"
          >
            <header class="mb-4 flex items-center justify-between gap-3">
              <h3
                class="m-0 text-sm font-black"
                [style.color]="'var(--josanz-text)'"
              >
                {{ column.title }}
              </h3>
              <josanz-badge
                [label]="column.cards.length + ''"
                tone="neutral"
              ></josanz-badge>
            </header>
            <div class="grid gap-3">
              @for (card of column.cards; track card.id) {
                <button
                  type="button"
                  class="rounded-2xl border border-solid p-4 text-left shadow-sm transition-transform hover:-translate-y-0.5"
                  [style.backgroundColor]="'var(--josanz-surface)'"
                  [style.borderColor]="'var(--josanz-border)'"
                  (click)="cardClick.emit(card)"
                >
                  @if (card.badge) {
                    <josanz-badge
                      [label]="card.badge"
                      tone="primary"
                    ></josanz-badge>
                  }
                  <strong
                    class="mt-3 block text-sm font-black"
                    [style.color]="'var(--josanz-text)'"
                    >{{ card.title }}</strong
                  >
                  @if (card.description) {
                    <span
                      class="mt-1 block text-xs leading-relaxed"
                      [style.color]="'var(--josanz-text-muted)'"
                      >{{ card.description }}</span
                    >
                  }
                  @if (card.assignee) {
                    <span
                      class="mt-3 block text-xs font-bold"
                      [style.color]="'var(--josanz-primary)'"
                      >{{ card.assignee }}</span
                    >
                  }
                </button>
              }
            </div>
          </article>
        }
      </div>
    </section>
  `,
})
export class KanbanBoardComponent {
  @Input() title = '';
  @Input() columns: JosanzKanbanColumn[] = [];
  @Input() ariaLabel = '';

  @Output() cardClick = new EventEmitter<JosanzKanbanCard>();
}
