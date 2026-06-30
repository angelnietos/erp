import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { josanzListFieldWidthClass } from '../list-view/list-template-row-layout';

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
            <span class="josanz-list-thead__label min-w-0 truncate">{{
              titleLabel
            }}</span>
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
              <span class="josanz-list-thead__label min-w-0 truncate">{{
                label
              }}</span>
            </div>
          }
        </div>

        <div
          class="josanz-list-template-row__status hidden md:flex shrink-0 justify-start"
        >
          <span
            class="josanz-list-thead__status-label px-4 py-1.5 text-[10px] font-black uppercase tracking-widest"
          >
            {{ statusLabel }}
          </span>
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

  fieldWidthClass(index: number): string {
    return josanzListFieldWidthClass(index, this.fieldLabels.length);
  }
}
