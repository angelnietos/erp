import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import type { JosanzTableColumn, JosanzTableRow } from './data-table';
import { PaginationComponent } from './pagination';
import { SkeletonComponent } from './skeleton';

@Component({
  selector: 'josanz-data-grid',
  standalone: true,
  imports: [CommonModule, PaginationComponent, SkeletonComponent],
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
              {{ rowCountLabel() }}
            </span>
          }
          @if (exportable && !loading) {
            <button
              type="button"
              class="rounded-full border border-solid bg-transparent px-3 py-2 text-xs font-black"
              [style.borderColor]="'var(--josanz-border)'"
              [style.color]="'var(--josanz-text)'"
              (click)="downloadCsv()"
            >
              Exportar CSV
            </button>
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
                  class="relative px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em]"
                  [class.text-center]="column.align === 'center'"
                  [class.text-right]="column.align === 'right'"
                  [class.cursor-pointer]="column.sortable"
                  [style.color]="'var(--josanz-text-muted)'"
                  [style.width.px]="columnWidth(column.key)"
                  (click)="column.sortable && sortBy(column.key)"
                >
                  <span class="inline-flex items-center gap-1">
                    {{ column.label }}
                    @if (column.sortable && sortKey === column.key) {
                      <span aria-hidden="true">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
                    }
                  </span>
                  @if (resizable) {
                    <button
                      type="button"
                      class="absolute bottom-2 right-0 top-2 w-2 cursor-col-resize border-0 border-r border-solid bg-transparent p-0"
                      [style.borderColor]="'color-mix(in srgb, var(--josanz-border) 70%, transparent)'"
                      [attr.aria-label]="'Redimensionar ' + column.label"
                      (click)="$event.stopPropagation()"
                      (mousedown)="startColumnResize(column.key, $event)"
                    ></button>
                  }
                </th>
              }
            </tr>
          </thead>
          <tbody>
            @if (loading) {
              @if (loadingSkeleton) {
                <tr>
                  <td class="p-4" [attr.colspan]="tableColSpan()">
                    <josanz-skeleton variant="table" [lines]="skeletonRowCount"></josanz-skeleton>
                  </td>
                </tr>
              } @else {
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

      @if (paginated && totalPages() > 0) {
        <footer class="flex justify-center border-t border-solid p-4" [style.borderColor]="'var(--josanz-border)'">
          <josanz-pagination
            [current]="page"
            [total]="totalPages()"
            variant="numbered"
            (pageChange)="onPageChange($event)"
          ></josanz-pagination>
        </footer>
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
  @Input() loadingSkeleton = false;
  @Input() skeletonRowCount = 4;
  @Input() density: 'comfortable' | 'compact' = 'comfortable';
  @Input() exportable = false;
  @Input() paginated = false;
  @Input() serverSide = false;
  @Input() totalRows = 0;
  @Input() page = 1;
  @Input() pageSize = 10;
  @Input() resizable = false;
  @Input() columnWidths: Record<string, number> = {};

  @Output() rowClick = new EventEmitter<JosanzTableRow>();
  @Output() selectedIdsChange = new EventEmitter<string[]>();
  @Output() sortChange = new EventEmitter<{ key: string; direction: 'asc' | 'desc' }>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() exportCsv = new EventEmitter<string>();
  @Output() columnWidthsChange = new EventEmitter<Record<string, number>>();

  searchQuery = '';
  sortKey = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  skeletonRows = [1, 2, 3, 4];
  private resizingColumnKey = '';
  private resizeStartX = 0;
  private resizeStartWidth = 0;

  tableColSpan(): number {
    return this.columns.length + (this.selectable ? 1 : 0);
  }

  cornerClass(): string {
    return 'rounded-3xl';
  }

  cellPaddingClass(): string {
    return this.density === 'compact' ? 'px-3 py-2' : 'px-4 py-3';
  }

  updateSearch(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value.trim().toLowerCase();
    if (this.paginated && !this.serverSide) {
      this.page = 1;
    }
  }

  rowCountLabel(): string {
    if (this.serverSide) {
      return `${this.displayedRows().length} en página · ${this.totalRows} total`;
    }
    return `${this.displayedRows().length} / ${this.rows.length}`;
  }

  totalPages(): number {
    const total = this.serverSide ? this.totalRows : this.rows.length;
    return Math.max(1, Math.ceil(total / Math.max(1, this.pageSize)));
  }

  onPageChange(page: number): void {
    this.page = page;
    this.pageChange.emit(page);
  }

  columnWidth(key: string): number | null {
    return this.columnWidths[key] ?? null;
  }

  startColumnResize(key: string, event: MouseEvent): void {
    if (!this.resizable) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const header = (event.currentTarget as HTMLElement).parentElement;
    this.resizingColumnKey = key;
    this.resizeStartX = event.clientX;
    this.resizeStartWidth = header?.getBoundingClientRect().width ?? this.columnWidths[key] ?? 160;
  }

  @HostListener('document:mousemove', ['$event'])
  onDocumentMouseMove(event: MouseEvent): void {
    if (!this.resizingColumnKey) {
      return;
    }
    const delta = event.clientX - this.resizeStartX;
    const width = Math.max(96, Math.round(this.resizeStartWidth + delta));
    this.columnWidths = {
      ...this.columnWidths,
      [this.resizingColumnKey]: width,
    };
    this.columnWidthsChange.emit(this.columnWidths);
  }

  @HostListener('document:mouseup')
  onDocumentMouseUp(): void {
    this.resizingColumnKey = '';
  }

  downloadCsv(): void {
    const header = this.columns.map((column) => column.label).join(';');
    const lines = this.displayedRows().map((row) =>
      this.columns
        .map((column) => `"${String(row[column.key] ?? '').replace(/"/g, '""')}"`)
        .join(';'),
    );
    const csv = [header, ...lines].join('\n');
    if (typeof document !== 'undefined') {
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${(this.title || 'datos').replace(/\s+/g, '-').toLowerCase()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    }
    this.exportCsv.emit(csv);
  }

  displayedRows(): JosanzTableRow[] {
    if (this.serverSide) {
      return this.rows;
    }
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
    if (this.paginated) {
      const start = (Math.max(1, this.page) - 1) * Math.max(1, this.pageSize);
      return next.slice(start, start + Math.max(1, this.pageSize));
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
