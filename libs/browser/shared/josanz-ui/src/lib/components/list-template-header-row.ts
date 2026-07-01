import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { josanzListFieldWidthClass } from '../list-view/list-template-row-layout';
import type {
  JosanzCatalogSortColumn,
  JosanzCatalogSortDirection,
} from '../list-view/catalog-list-sort';

/**
 * Cabecera de listado alineada con `josanz-main-template-card`:
 * mismo padding, marcador de avatar, bullet de campo y pastilla de estado.
 */
@Component({
  selector: 'josanz-list-template-header-row',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="josanz-list-thead" [class.josanz-list-thead--compact]="compact">
      <div
        class="josanz-list-template-row-wrap w-full min-w-0 px-[var(--josanz-list-card-pad-x)] py-0 md:px-[var(--josanz-list-card-pad-x-md)] md:py-0"
      >
        <div
          class="josanz-list-template-row__title flex items-center md:block shrink-0"
        >
          <div class="flex min-w-0 items-center gap-2.5">
            @if (withLeadingMark) {
              <span
                class="josanz-list-thead__leading-spacer"
                aria-hidden="true"
              ></span>
            }
            @if (sortable) {
              <button
                type="button"
                class="josanz-list-thead__sort-btn"
                [class.josanz-list-thead__sort-btn--active]="sortColumn === 'title'"
                [attr.aria-sort]="ariaSortFor('title')"
                (click)="onSort('title')"
              >
                <span class="josanz-list-thead__label min-w-0 truncate">{{
                  titleLabel
                }}</span>
                @if (sortColumn === 'title') {
                  <span class="josanz-list-thead__sort-icon" aria-hidden="true">{{
                    sortArrow
                  }}</span>
                }
              </button>
            } @else {
              <span class="josanz-list-thead__label min-w-0 truncate">{{
                titleLabel
              }}</span>
            }
          </div>
        </div>

        <div class="josanz-list-template-row__fields">
          @for (label of fieldLabels; track label; let i = $index) {
            <div
              class="josanz-list-template-row__field"
              [ngClass]="fieldWidthClass(i)"
            >
              <span
                class="josanz-list-thead__field-bullet"
                aria-hidden="true"
              ></span>
              @if (sortable) {
                <button
                  type="button"
                  class="josanz-list-thead__sort-btn"
                  [class.josanz-list-thead__sort-btn--active]="sortColumn === fieldKey(i)"
                  [attr.aria-sort]="ariaSortFor(fieldKey(i))"
                  (click)="onSort(fieldKey(i))"
                >
                  <span class="josanz-list-thead__label min-w-0 truncate">{{
                    label
                  }}</span>
                  @if (sortColumn === fieldKey(i)) {
                    <span class="josanz-list-thead__sort-icon" aria-hidden="true">{{
                      sortArrow
                    }}</span>
                  }
                </button>
              } @else {
                <span class="josanz-list-thead__label min-w-0 truncate">{{
                  label
                }}</span>
              }
            </div>
          }
        </div>

        <div
          class="josanz-list-template-row__status hidden md:flex shrink-0 justify-start"
        >
          @if (sortable) {
            <button
              type="button"
              class="josanz-list-thead__sort-btn josanz-list-thead__sort-btn--status"
              [class.josanz-list-thead__sort-btn--active]="sortColumn === 'status'"
              [attr.aria-sort]="ariaSortFor('status')"
              (click)="onSort('status')"
            >
              <span
                class="josanz-list-thead__status-label px-4 py-1.5 text-[10px] font-black uppercase tracking-widest"
              >
                {{ statusLabel }}
              </span>
              @if (sortColumn === 'status') {
                <span class="josanz-list-thead__sort-icon" aria-hidden="true">{{
                  sortArrow
                }}</span>
              }
            </button>
          } @else {
            <span
              class="josanz-list-thead__status-label px-4 py-1.5 text-[10px] font-black uppercase tracking-widest"
            >
              {{ statusLabel }}
            </span>
          }
        </div>
      </div>
    </div>
  `,
})
export class ListTemplateHeaderRowComponent {
  @Input({ required: true }) titleLabel!: string;
  @Input({ required: true }) fieldLabels: string[] = [];
  @Input({ required: true }) statusLabel!: string;
  @Input() withLeadingMark = false;
  @Input() compact = false;
  @Input() sortable = false;
  @Input() sortColumn: JosanzCatalogSortColumn | null = null;
  @Input() sortDirection: JosanzCatalogSortDirection = 'asc';

  @Output() sortChange = new EventEmitter<JosanzCatalogSortColumn>();

  fieldWidthClass(index: number): string {
    return josanzListFieldWidthClass(index, this.fieldLabels.length);
  }

  fieldKey(index: number): JosanzCatalogSortColumn {
    return `field-${index}`;
  }

  get sortArrow(): string {
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  ariaSortFor(column: JosanzCatalogSortColumn): 'none' | 'ascending' | 'descending' {
    if (this.sortColumn !== column) {
      return 'none';
    }
    return this.sortDirection === 'asc' ? 'ascending' : 'descending';
  }

  onSort(column: JosanzCatalogSortColumn): void {
    this.sortChange.emit(column);
  }
}
