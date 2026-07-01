import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  JosanzThemeService,
  type JosanzPaginationVariant,
} from '../services/theme.service';
import {
  JOSANZ_LIST_GRID_COLUMN_OPTIONS,
  JOSANZ_LIST_GRID_COLUMNS_MAX,
  JOSANZ_LIST_GRID_COLUMNS_MIN,
  JOSANZ_LIST_PAGE_SIZE_MAX,
  JOSANZ_LIST_PAGE_SIZE_MIN,
  JOSANZ_LIST_PAGE_SIZE_OPTIONS,
  JOSANZ_LIST_VIEW_MENU_OPTIONS,
  isPresetListGridColumns,
  isPresetListPageSize,
  normalizeListGridColumns,
  normalizeListPageSize,
} from '../list-view/list-view-preferences';

@Component({
  selector: 'josanz-list-settings-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-settings-panel.html',
  styleUrl: './theme-personalization-panel.css',
})
export class ListSettingsPanelComponent {
  readonly themeService = inject(JosanzThemeService);

  readonly listViewOptions = JOSANZ_LIST_VIEW_MENU_OPTIONS;
  readonly gridColumnOptions = JOSANZ_LIST_GRID_COLUMN_OPTIONS;
  readonly pageSizeOptions = JOSANZ_LIST_PAGE_SIZE_OPTIONS;

  readonly gridColumnsMin = JOSANZ_LIST_GRID_COLUMNS_MIN;
  readonly gridColumnsMax = JOSANZ_LIST_GRID_COLUMNS_MAX;
  readonly pageSizeMin = JOSANZ_LIST_PAGE_SIZE_MIN;
  readonly pageSizeMax = JOSANZ_LIST_PAGE_SIZE_MAX;

  readonly paginationOptions: {
    variant: JosanzPaginationVariant;
    label: string;
    description: string;
  }[] = [
    {
      variant: 'figma',
      label: 'Compacta',
      description: 'Anterior / actual · total / siguiente con selector desplegable.',
    },
    {
      variant: 'numbered',
      label: 'Numerada',
      description: 'Páginas visibles con elipsis y botones anterior / siguiente.',
    },
  ];

  isGridPreset(value: number): boolean {
    return isPresetListGridColumns(value);
  }

  isPageSizePreset(value: number): boolean {
    return isPresetListPageSize(value);
  }

  isCustomGridColumns(): boolean {
    return !this.isGridPreset(this.themeService.listGridColumns());
  }

  isCustomPageSize(): boolean {
    return !this.isPageSizePreset(this.themeService.listPageSize());
  }

  onCustomGridColumnsInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const parsed = Number.parseInt(input.value, 10);
    if (!Number.isFinite(parsed)) {
      input.value = String(this.themeService.listGridColumns());
      return;
    }
    const normalized = normalizeListGridColumns(parsed);
    this.themeService.setListGridColumns(normalized);
    input.value = String(normalized);
  }

  onCustomPageSizeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const parsed = Number.parseInt(input.value, 10);
    if (!Number.isFinite(parsed)) {
      input.value = String(this.themeService.listPageSize());
      return;
    }
    const normalized = normalizeListPageSize(parsed);
    this.themeService.setListPageSize(normalized);
    input.value = String(normalized);
  }
}
