import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogThemeFacade } from '../../services/catalog-theme.facade';
import {
  TENANT_CLIENT_TARIFF_OPTIONS,
  TENANT_EVENT_STATUS_OPTIONS,
} from '../../catalog/catalog-theme';
import type { JosanzStatusPillKey } from '../../theme/josanz-figma-tokens';
import { normalizeHexColor } from '../../catalog/client-rail-presets';

@Component({
  selector: 'josanz-catalog-theme-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './josanz-catalog-theme-panel.html',
  styleUrl: './josanz-catalog-theme-panel.css',
})
export class JosanzCatalogThemePanelComponent implements OnInit {
  readonly catalogTheme = inject(CatalogThemeFacade);

  readonly eventStatusOptions = TENANT_EVENT_STATUS_OPTIONS;
  readonly clientTariffOptions = TENANT_CLIENT_TARIFF_OPTIONS;

  ngOnInit(): void {
    this.catalogTheme.loadCatalogTheme();
  }

  eventColor(key: JosanzStatusPillKey): string {
    return this.catalogTheme.mergedTheme().eventStatusColors[key] ?? '#64748B';
  }

  clientTariffColor(tariff: string): string {
    return this.catalogTheme.mergedTheme().clientTariffColors[tariff] ?? '#64748B';
  }

  onEventColorPick(key: JosanzStatusPillKey, event: Event): void {
    const color = (event.target as HTMLInputElement).value;
    const normalized = normalizeHexColor(color);
    if (normalized) {
      this.catalogTheme.patchEventStatusColor(key, normalized);
    }
  }

  onClientTariffColorPick(tariff: string, event: Event): void {
    const color = (event.target as HTMLInputElement).value;
    const normalized = normalizeHexColor(color);
    if (normalized) {
      this.catalogTheme.patchClientTariffColor(tariff, normalized);
    }
  }
}
