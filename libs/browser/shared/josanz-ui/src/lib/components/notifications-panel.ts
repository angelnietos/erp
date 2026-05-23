import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface JosanzNotificationItem {
  id: string;
  title: string;
  description?: string;
  time?: string;
  unread?: boolean;
  tone?: 'info' | 'success' | 'warning' | 'danger';
}

@Component({
  selector: 'josanz-notifications-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section
      class="overflow-hidden rounded-3xl border border-solid"
      [style.backgroundColor]="'var(--josanz-surface)'"
      [style.borderColor]="'var(--josanz-border)'"
      [attr.aria-label]="ariaLabel || title"
    >
      <header
        class="flex items-start justify-between gap-4 border-b border-solid p-5"
        [style.borderColor]="'var(--josanz-border)'"
      >
        <div>
          <h2
            class="m-0 text-xl font-black"
            [style.color]="'var(--josanz-text)'"
          >
            {{ title }}
          </h2>
          <p
            class="m-0 mt-1 text-sm"
            [style.color]="'var(--josanz-text-muted)'"
          >
            {{ unreadCount() }} sin leer
          </p>
        </div>
        <button
          type="button"
          class="rounded-full border border-solid bg-transparent px-3 py-1 text-xs font-black"
          [style.borderColor]="'var(--josanz-border)'"
          [style.color]="'var(--josanz-primary)'"
          (click)="markAllRead.emit()"
        >
          Marcar todo
        </button>
      </header>
      <div class="grid max-h-[420px] overflow-auto">
        @for (item of items; track item.id) {
          <button
            type="button"
            class="flex w-full items-start gap-3 border-0 border-b border-solid bg-transparent p-4 text-left hover:bg-black/[0.03]"
            [style.borderColor]="'var(--josanz-border)'"
            (click)="notificationClick.emit(item)"
          >
            <span
              class="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
              [style.backgroundColor]="
                item.unread ? toneColor(item.tone) : 'var(--josanz-border)'
              "
            ></span>
            <span class="min-w-0 flex-1">
              <span class="flex items-center justify-between gap-3">
                <strong
                  class="truncate text-sm font-black"
                  [style.color]="'var(--josanz-text)'"
                  >{{ item.title }}</strong
                >
                @if (item.time) {
                  <span
                    class="shrink-0 text-xs"
                    [style.color]="'var(--josanz-text-muted)'"
                    >{{ item.time }}</span
                  >
                }
              </span>
              @if (item.description) {
                <span
                  class="mt-1 block text-sm leading-relaxed"
                  [style.color]="'var(--josanz-text-muted)'"
                  >{{ item.description }}</span
                >
              }
            </span>
          </button>
        }
      </div>
    </section>
  `,
})
export class NotificationsPanelComponent {
  @Input() title = 'Notificaciones';
  @Input() items: JosanzNotificationItem[] = [];
  @Input() ariaLabel = '';

  @Output() markAllRead = new EventEmitter<void>();
  @Output() notificationClick = new EventEmitter<JosanzNotificationItem>();

  unreadCount(): number {
    return this.items.filter((item) => item.unread).length;
  }

  toneColor(tone: JosanzNotificationItem['tone'] = 'info'): string {
    if (tone === 'success') {
      return 'var(--josanz-success)';
    }
    if (tone === 'warning') {
      return 'var(--josanz-warning)';
    }
    if (tone === 'danger') {
      return 'var(--josanz-danger)';
    }
    return 'var(--josanz-primary)';
  }
}
