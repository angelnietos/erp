import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JosanzThemeService } from '../services/theme.service';
import {
  JOSANZ_ATMOSPHERE_CATALOG,
  JOSANZ_ATMOSPHERE_REGISTRY,
  type JosanzAtmosphereConfig,
  type JosanzAtmosphereName,
} from '../theme/josanz-theme-tokens';

@Component({
  selector: 'josanz-atmosphere-settings-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './atmosphere-settings-panel.html',
  styleUrl: './theme-personalization-panel.css',
})
export class AtmosphereSettingsPanelComponent {
  readonly themeService = inject(JosanzThemeService);
  readonly allAtmospheres = JOSANZ_ATMOSPHERE_CATALOG;

  atmosphereConfig(name: JosanzAtmosphereName): JosanzAtmosphereConfig {
    return JOSANZ_ATMOSPHERE_REGISTRY[name];
  }
}
