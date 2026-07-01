import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  JosanzThemeService,
  type JosanzPaginationVariant,
} from '../services/theme.service';
import {
  JOSANZ_LIST_GRID_COLUMN_OPTIONS,
  JOSANZ_LIST_VIEW_MENU_OPTIONS,
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
}
