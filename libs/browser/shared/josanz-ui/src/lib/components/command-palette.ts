import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface JosanzCommandItem {
  id: string;
  label: string;
  description?: string;
  group?: string;
  shortcut?: string;
}

@Component({
  selector: 'josanz-command-palette',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (open) {
      <section
        class="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-[12vh]"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="ariaLabel || 'Paleta de comandos'"
      >
        <div
          class="w-full max-w-2xl overflow-hidden rounded-3xl border border-solid shadow-2xl"
          [style.backgroundColor]="'var(--josanz-surface)'"
          [style.borderColor]="'var(--josanz-border)'"
        >
          <div
            class="border-b border-solid p-4"
            [style.borderColor]="'var(--josanz-border)'"
          >
            <input
              class="h-11 w-full border-0 bg-transparent text-lg font-bold outline-none"
              [style.color]="'var(--josanz-text)'"
              [placeholder]="placeholder"
              [value]="query"
              (input)="updateQuery($event)"
            />
          </div>
          <div class="max-h-[420px] overflow-auto p-2">
            @for (command of filteredCommands(); track command.id) {
              <button
                type="button"
                class="flex w-full items-center justify-between gap-4 rounded-2xl border-0 bg-transparent px-4 py-3 text-left hover:bg-black/[0.03]"
                (click)="select(command)"
              >
                <span class="min-w-0">
                  @if (command.group) {
                    <span
                      class="block text-[10px] font-black uppercase tracking-[0.18em]"
                      [style.color]="'var(--josanz-text-muted)'"
                      >{{ command.group }}</span
                    >
                  }
                  <span
                    class="block text-sm font-black"
                    [style.color]="'var(--josanz-text)'"
                    >{{ command.label }}</span
                  >
                  @if (command.description) {
                    <span
                      class="mt-0.5 block text-xs"
                      [style.color]="'var(--josanz-text-muted)'"
                      >{{ command.description }}</span
                    >
                  }
                </span>
                @if (command.shortcut) {
                  <kbd
                    class="rounded-lg border border-solid px-2 py-1 text-[10px] font-black"
                    [style.borderColor]="'var(--josanz-border)'"
                    [style.color]="'var(--josanz-text-muted)'"
                    >{{ command.shortcut }}</kbd
                  >
                }
              </button>
            }
          </div>
        </div>
      </section>
    }
  `,
})
export class CommandPaletteComponent {
  @Input() open = false;
  @Input() query = '';
  @Input() placeholder = 'Buscar comando o acción...';
  @Input() commands: JosanzCommandItem[] = [];
  @Input() ariaLabel = '';

  @Output() queryChange = new EventEmitter<string>();
  @Output() commandSelect = new EventEmitter<JosanzCommandItem>();

  updateQuery(event: Event): void {
    this.query = (event.target as HTMLInputElement).value;
    this.queryChange.emit(this.query);
  }

  filteredCommands(): JosanzCommandItem[] {
    const value = this.query.trim().toLowerCase();
    if (!value) {
      return this.commands;
    }
    return this.commands.filter((command) =>
      `${command.group ?? ''} ${command.label} ${command.description ?? ''}`
        .toLowerCase()
        .includes(value),
    );
  }

  select(command: JosanzCommandItem): void {
    this.commandSelect.emit(command);
  }
}
