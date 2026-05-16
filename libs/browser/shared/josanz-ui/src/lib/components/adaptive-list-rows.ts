import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JosanzThemeService } from '../services/theme.service';
import {
  isGridCardsView,
  isListCardsView,
  isTableListView,
} from '../list-view/list-view-preferences';
import { MainTemplateCardComponent, type JosanzStatusPillVariant } from './main-template-card';
import { GridListCardComponent } from './grid-list-card';

export interface JosanzAdaptiveListItem {
  id: string;
  title: string;
  data: string[];
  labels?: string[];
  status?: string;
  statusVariant?: JosanzStatusPillVariant;
}

@Component({
  selector: 'josanz-adaptive-list-rows',
  standalone: true,
  imports: [CommonModule, MainTemplateCardComponent, GridListCardComponent],
  template: `
    @if (isListCards() || isTable()) {
      <div class="josanz-list-rows--table-target flex flex-col gap-4">
        @for (item of items; track item.id) {
          <josanz-main-template-card
            style="cursor: pointer; display: block"
            (click)="onItemClick(item)"
            [title]="item.title"
            [data]="item.data"
            [labels]="item.labels ?? defaultLabels"
            [status]="item.status ?? ''"
            [statusVariant]="item.statusVariant ?? 'borrador'"
          ></josanz-main-template-card>
        }
      </div>
    }

    @if (isGrid()) {
      <div
        class="josanz-list-grid"
        [style.--josanz-list-grid-cols]="gridColumns()"
      >
        @for (item of items; track item.id) {
          <button
            type="button"
            class="josanz-list-grid__cell m-0 cursor-pointer border-0 bg-transparent p-0 text-left"
            (click)="onItemClick(item)"
          >
            <josanz-grid-list-card
              [title]="item.title"
              [previewLines]="gridPreviewLines(item)"
              [fieldLabels]="gridPreviewLabels(item)"
              [status]="item.status ?? ''"
              [statusVariant]="item.statusVariant ?? 'borrador'"
            ></josanz-grid-list-card>
          </button>
        }
      </div>
    }
  `,
})
export class AdaptiveListRowsComponent {
  readonly themeService = inject(JosanzThemeService);

  @Input() items: JosanzAdaptiveListItem[] = [];
  @Input() defaultLabels: string[] = [];

  @Output() itemClick = new EventEmitter<JosanzAdaptiveListItem>();

  isTable(): boolean {
    return isTableListView(this.themeService.listViewSelection());
  }

  isListCards(): boolean {
    return isListCardsView(this.themeService.listViewSelection());
  }

  isGrid(): boolean {
    return isGridCardsView(this.themeService.listViewSelection());
  }

  gridColumns(): number {
    return this.themeService.listGridColumns();
  }

  gridPreviewLines(item: JosanzAdaptiveListItem): string[] {
    return item.data.slice(0, 2);
  }

  gridPreviewLabels(item: JosanzAdaptiveListItem): string[] {
    const labels = item.labels ?? this.defaultLabels;
    return labels.slice(0, 2);
  }

  onItemClick(item: JosanzAdaptiveListItem): void {
    this.itemClick.emit(item);
  }
}
