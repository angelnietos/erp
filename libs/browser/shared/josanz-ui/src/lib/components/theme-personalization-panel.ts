import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  JosanzThemeService,
  JosanzAtmosphereName,
  type JosanzPaginationVariant,
} from '../services/theme.service';
import { JOSANZ_LIST_GRID_COLUMN_OPTIONS } from '../list-view/list-view-preferences';

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

  readonly allAtmospheres: { name: JosanzAtmosphereName; label: string }[] = [
    { name: 'neutral', label: 'Neutral White' },
    { name: 'ubisoft', label: 'Ubisoft Blue' },
    { name: 'nintendo', label: 'Nintendo Red' },
    { name: 'rayman', label: 'Rayman Magic' },
    { name: 'rockstar', label: 'Rockstar Gold' },
    { name: 'easports', label: 'EA Sports Grid' },
    { name: 'cyberpunk', label: 'Cyber Neon' },
    { name: 'midnight', label: 'Midnight Deep' },
    { name: 'ocean', label: 'Ocean Pacific' },
    { name: 'forest', label: 'Forest Green' },
    { name: 'sunset', label: 'Sunset Orange' },
    { name: 'industrial', label: 'Industrial Steel' },
  ];
}
