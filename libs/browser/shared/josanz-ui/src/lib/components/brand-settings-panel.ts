import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JosanzThemeService } from '../services/theme.service';
import { ColorPickerComponent } from './color-picker';
import { normalizeHexColor } from '../catalog/client-rail-presets';

export const JOSANZ_DEFAULT_BRAND_COLORS = [
  '#080808',
  '#0F1E2F',
  '#222222',
  '#635BFF',
  '#22C55E',
  '#F59E0B',
  '#EF4444',
  '#EC4899',
  '#38BDF8',
  '#8B5CF6',
] as const;

@Component({
  selector: 'josanz-brand-settings-panel',
  standalone: true,
  imports: [CommonModule, ColorPickerComponent],
  templateUrl: './brand-settings-panel.html',
  styleUrl: './theme-personalization-panel.css',
})
export class BrandSettingsPanelComponent {
  readonly themeService = inject(JosanzThemeService);

  readonly brandingColors = [...JOSANZ_DEFAULT_BRAND_COLORS];

  readonly currentPrimaryColor = computed(() => {
    const raw = this.themeService.currentTheme().primaryColor;
    return normalizeHexColor(raw) ?? raw;
  });

  isActivePreset(color: string): boolean {
    const current = normalizeHexColor(this.themeService.currentTheme().primaryColor);
    const preset = normalizeHexColor(color);
    return Boolean(current && preset && current === preset);
  }

  selectPreset(color: string): void {
    this.themeService.setPrimaryColor(color);
  }

  onCustomColor(color: string): void {
    const normalized = normalizeHexColor(color);
    if (normalized) {
      this.themeService.setPrimaryColor(normalized);
    }
  }
}
