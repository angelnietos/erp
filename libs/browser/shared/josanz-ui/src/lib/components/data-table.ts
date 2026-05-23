import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface JosanzTableColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

export interface JosanzTableRow {
  id: string;
  [key: string]: string | number | boolean | undefined;
}

@Component({
  selector: 'josanz-data-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section
      class="overflow-hidden rounded-3xl border border-solid"
      [style.backgroundColor]="'var(--josanz-surface)'"
      [style.borderColor]="'var(--josanz-border)'"
      [attr.aria-label]="ariaLabel || title || 'Tabla de datos'"
    >
      @if (title || description) {
        <header
          class="flex flex-wrap items-start justify-between gap-3 border-b border-solid p-5"
          [style.borderColor]="'var(--josanz-border)'"
        >
          <div>
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
          </div>
          @if (rows.length) {
            <span
              class="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider"
              [style.backgroundColor]="
                'color-mix(in srgb, var(--josanz-primary) 12%, var(--josanz-surface))'
              "
              [style.color]="'var(--josanz-primary)'"
            >
              {{ rows.length }} registros
            </span>
          }
        </header>
      }

      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-sm">
          <thead>
            <tr
              [style.backgroundColor]="
                'color-mix(in srgb, var(--josanz-text-muted) 6%, var(--josanz-surface))'
              "
            >
              @if (selectable) {
                <th class="w-10 px-4 py-3" scope="col">
                  <span class="sr-only">Seleccionar</span>
                </th>
              }
              @for (column of columns; track column.key) {
                <th
                  class="px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em]"
                  [class.text-center]="column.align === 'center'"
                  [class.text-right]="column.align === 'right'"
                  [class.cursor-pointer]="column.sortable"
                  [style.color]="'var(--josanz-text-muted)'"
                  (click)="column.sortable && sortBy(column.key)"
                >
                  <span class="inline-flex items-center gap-1">
                    {{ column.label }}
                    @if (column.sortable && sortKey === column.key) {
                      <span aria-hidden="true">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
                    }
                  </span>
                </th>
              }
            </tr>
          </thead>
          <tbody>
            @for (row of rows; track row.id) {
              <tr
                class="cursor-pointer border-t border-solid transition-colors hover:bg-black/[0.02]"
                [class.bg-black/[0.03]]="isSelected(row.id)"
                [style.borderColor]="'var(--josanz-border)'"
                (click)="rowClick.emit(row)"
              >
                @if (selectable) {
                  <td class="px-4 py-3" (click)="$event.stopPropagation()">
                    <input
                      type="checkbox"
                      class="h-4 w-4 accent-[var(--josanz-primary)]"
                      [checked]="isSelected(row.id)"
                      (change)="toggleRow(row.id)"
                    />
                  </td>
                }
                @for (column of columns; track column.key) {
                  <td
                    class="px-4 py-3 font-semibold"
                    [class.text-center]="column.align === 'center'"
                    [class.text-right]="column.align === 'right'"
                    [style.color]="'var(--josanz-text)'"
                  >
                    {{ row[column.key] }}
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>

      @if (rows.length === 0) {
        <div
          class="p-8 text-center text-sm"
          [style.color]="'var(--josanz-text-muted)'"
        >
          {{ emptyLabel }}
        </div>
      }
    </section>
  `,
})
export class DataTableComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() columns: JosanzTableColumn[] = [];
  @Input() rows: JosanzTableRow[] = [];
  @Input() emptyLabel = 'No hay datos para mostrar.';
  @Input() ariaLabel = '';
  @Input() selectable = false;
  @Input() selectedIds: string[] = [];

  @Output() rowClick = new EventEmitter<JosanzTableRow>();
  @Output() selectedIdsChange = new EventEmitter<string[]>();

  sortKey = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  isSelected(id: string): boolean {
    return this.selectedIds.includes(id);
  }

  toggleRow(id: string): void {
    const next = this.isSelected(id)
      ? this.selectedIds.filter((value) => value !== id)
      : [...this.selectedIds, id];
    this.selectedIds = next;
    this.selectedIdsChange.emit(next);
  }

  sortBy(key: string): void {
    if (this.sortKey === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      return;
    }
    this.sortKey = key;
    this.sortDirection = 'asc';
  }
}
