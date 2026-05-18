import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  JosanzThemeService,
  type JosanzAtmosphereName,
  type JosanzPaginationVariant,
} from '../services/theme.service';
import { JOSANZ_LIST_GRID_COLUMN_OPTIONS } from '../list-view/list-view-preferences';
import {
  JOSANZ_ATMOSPHERE_CATALOG,
  JOSANZ_ATMOSPHERE_REGISTRY,
  type JosanzAtmosphereConfig,
} from '../theme/josanz-theme-tokens';

@Component({
  selector: 'josanz-theme-personalization-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './theme-personalization-panel.html',
  styleUrl: './theme-personalization-panel.css',
})
export class ThemePersonalizationPanelComponent {
  readonly themeService = inject(JosanzThemeService);

  readonly brandingColors = [
    '#635BFF',
    '#22C55E',
    '#F59E0B',
    '#EF4444',
    '#EC4899',
    '#222222',
    '#38BDF8',
    '#8B5CF6',
  ];

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

  readonly allAtmospheres = JOSANZ_ATMOSPHERE_CATALOG;

  atmosphereConfig(name: JosanzAtmosphereName): JosanzAtmosphereConfig {
    return JOSANZ_ATMOSPHERE_REGISTRY[name];
  }
}
