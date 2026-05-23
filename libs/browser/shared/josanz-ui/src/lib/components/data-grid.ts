import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { JosanzTableColumn, JosanzTableRow } from './data-table';

@Component({
  selector: 'josanz-data-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section
      class="overflow-hidden border border-solid"
      [ngClass]="cornerClass()"
      [style.backgroundColor]="'var(--josanz-surface)'"
      [style.borderColor]="'var(--josanz-border)'"
      [attr.aria-label]="ariaLabel || title || 'Cuadrícula de datos'"
      [attr.aria-busy]="loading"
    >
      <header
        class="flex flex-wrap items-center justify-between gap-3 border-b border-solid p-5"
        [style.borderColor]="'var(--josanz-border)'"
      >
        <div class="min-w-0">
          @if (title) {
            <h2 class="m-0 text-xl font-black" [style.color]="'var(--josanz-text)'">{{ title }}</h2>
          }
          @if (description) {
            <p class="m-0 mt-1 text-sm" [style.color]="'var(--josanz-text-muted)'">{{ description }}</p>
          }
        </div>
        <div class="flex flex-wrap items-center gap-2">
          @if (searchable) {
            <input
              type="search"
              class="h-10 min-w-[200px] rounded-full border border-solid px-4 text-sm font-bold outline-none"
              [style.backgroundColor]="'var(--josanz-field-fill)'"
              [style.borderColor]="'var(--josanz-stroke-field)'"
              [style.color]="'var(--josanz-text)'"
              [placeholder]="searchPlaceholder"
              [value]="searchQuery"
              (input)="updateSearch($event)"
            />
          }
          @if (displayedRows().length && !loading) {
            <span
              class="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider"
              [style.backgroundColor]="'color-mix(in srgb, var(--josanz-primary) 12%, var(--josanz-surface))'"
              [style.color]="'var(--josanz-primary)'"
            >
              {{ displayedRows().length }} / {{ rows.length }}
            </span>
          }
        </div>
      </header>

      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-sm">
          <thead>
            <tr [style.backgroundColor]="'color-mix(in srgb, var(--josanz-text-muted) 6%, var(--josanz-surface))'">
              @if (selectable) {
                <th class="w-10 px-4 py-3" scope="col">
                  <input
                    type="checkbox"
                    class="h-4 w-4 accent-[var(--josanz-primary)]"
                    [checked]="allSelected()"
                    [indeterminate]="someSelected()"
                    (change)="toggleAll()"
                  />
                </th>
              }
              @for (column of columns; track column.key) {
                <th
                  scope="col"
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
            @if (loading) {
              @for (row of skeletonRows; track row) {
                <tr class="border-t border-solid" [style.borderColor]="'var(--josanz-border)'">
                  @if (selectable) {
                    <td class="px-4 py-3"><span class="block h-4 w-4 rounded bg-black/10"></span></td>
                  }
                  @for (column of columns; track column.key) {
                    <td class="px-4 py-3"><span class="block h-3.5 w-4/5 max-w-[180px] rounded bg-black/10"></span></td>
                  }
                </tr>
              }
            } @else {
              @for (row of displayedRows(); track row.id) {
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
                      class="font-semibold"
                      [ngClass]="cellPaddingClass()"
                      [class.text-center]="column.align === 'center'"
                      [class.text-right]="column.align === 'right'"
                      [style.color]="'var(--josanz-text)'"
                    >
                      {{ row[column.key] }}
                    </td>
                  }
                </tr>
              }
            }
          </tbody>
        </table>
      </div>

      @if (!loading && displayedRows().length === 0) {
        <div class="p-8 text-center text-sm" [style.color]="'var(--josanz-text-muted)'">
          {{ emptyLabel }}
        </div>
      }
    </section>
  `,
})
export class DataGridComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() columns: JosanzTableColumn[] = [];
  @Input() rows: JosanzTableRow[] = [];
  @Input() emptyLabel = 'No hay datos para mostrar.';
  @Input() ariaLabel = '';
  @Input() selectable = false;
  @Input() selectedIds: string[] = [];
  @Input() searchable = false;
  @Input() searchPlaceholder = 'Buscar...';
  @Input() loading = false;
  @Input() density: 'comfortable' | 'compact' = 'comfortable';

  @Output() rowClick = new EventEmitter<JosanzTableRow>();
  @Output() selectedIdsChange = new EventEmitter<string[]>();
  @Output() sortChange = new EventEmitter<{ key: string; direction: 'asc' | 'desc' }>();

  searchQuery = '';
  sortKey = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  skeletonRows = [1, 2, 3, 4];

  cornerClass(): string {
    return 'rounded-3xl';
  }

  cellPaddingClass(): string {
    return this.density === 'compact' ? 'px-3 py-2' : 'px-4 py-3';
  }

  updateSearch(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value.trim().toLowerCase();
  }

  displayedRows(): JosanzTableRow[] {
    let next = [...this.rows];
    if (this.searchQuery) {
      next = next.filter((row) =>
        this.columns.some((column) =>
          String(row[column.key] ?? '')
            .toLowerCase()
            .includes(this.searchQuery),
        ),
      );
    }
    if (this.sortKey) {
      const direction = this.sortDirection === 'asc' ? 1 : -1;
      next.sort((a, b) => {
        const left = String(a[this.sortKey] ?? '');
        const right = String(b[this.sortKey] ?? '');
        return left.localeCompare(right, 'es', { numeric: true }) * direction;
      });
    }
    return next;
  }

  isSelected(id: string): boolean {
    return this.selectedIds.includes(id);
  }

  allSelected(): boolean {
    const visible = this.displayedRows();
    return visible.length > 0 && visible.every((row) => this.isSelected(row.id));
  }

  someSelected(): boolean {
    const visible = this.displayedRows();
    const count = visible.filter((row) => this.isSelected(row.id)).length;
    return count > 0 && count < visible.length;
  }

  toggleAll(): void {
    const visibleIds = this.displayedRows().map((row) => row.id);
    if (this.allSelected()) {
      this.selectedIds = this.selectedIds.filter((id) => !visibleIds.includes(id));
    } else {
      this.selectedIds = [...new Set([...this.selectedIds, ...visibleIds])];
    }
    this.selectedIdsChange.emit(this.selectedIds);
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
    } else {
      this.sortKey = key;
      this.sortDirection = 'asc';
    }
    this.sortChange.emit({ key: this.sortKey, direction: this.sortDirection });
  }
}
