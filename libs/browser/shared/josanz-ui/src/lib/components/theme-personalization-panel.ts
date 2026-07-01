import { Component } from '@angular/core';
import { BrandSettingsPanelComponent } from './brand-settings-panel';
import { AtmosphereSettingsPanelComponent } from './atmosphere-settings-panel';
import { ListSettingsPanelComponent } from './list-settings-panel';

/** Panel legacy que agrupa marca, temas y listados (p. ej. modal deprecado). */
@Component({
  selector: 'josanz-theme-personalization-panel',
  standalone: true,
  imports: [
    BrandSettingsPanelComponent,
    AtmosphereSettingsPanelComponent,
    ListSettingsPanelComponent,
  ],
  templateUrl: './theme-personalization-panel.html',
  styleUrl: './theme-personalization-panel.css',
})
export class ThemePersonalizationPanelComponent {}
