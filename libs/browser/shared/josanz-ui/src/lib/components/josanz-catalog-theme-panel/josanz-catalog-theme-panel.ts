import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogThemeFacade } from '../../services/catalog-theme.facade';
import {
  isDefaultClientTariff,
  listClientTariffLabels,
  listEventStatusRows,
} from '../../catalog/catalog-theme';
import { normalizeHexColor } from '../../catalog/client-rail-presets';
import { defaultClientTariffPillColor } from '../../catalog/status-pill-presets';

@Component({
  selector: 'josanz-catalog-theme-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './josanz-catalog-theme-panel.html',
  styleUrl: './josanz-catalog-theme-panel.css',
})
export class JosanzCatalogThemePanelComponent implements OnInit {
  readonly catalogTheme = inject(CatalogThemeFacade);

  readonly newClientTypeLabel = signal('');
  readonly newEventStatusLabel = signal('');
  readonly formError = signal('');

  readonly clientTariffLabels = computed(() =>
    listClientTariffLabels(this.catalogTheme.mergedTheme()),
  );

  readonly eventStatusRows = computed(() =>
    listEventStatusRows(this.catalogTheme.mergedTheme()),
  );

  ngOnInit(): void {
    this.catalogTheme.loadCatalogTheme();
  }

  clientTariffColor(tariff: string): string {
    return this.catalogTheme.mergedTheme().clientTariffColors[tariff] ?? '#64748B';
  }

  isDefaultClientTariff(label: string): boolean {
    return isDefaultClientTariff(label);
  }

  onEventColorPick(key: string, event: Event): void {
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

  addClientType(): void {
    this.formError.set('');
    const label = this.newClientTypeLabel().trim();
    if (!label) {
      this.formError.set('Escribe un nombre para el tipo de cliente.');
      return;
    }
    const color = defaultClientTariffPillColor(label);
    const ok = this.catalogTheme.addCustomClientTariff(label, color);
    if (!ok) {
      this.formError.set('Ese tipo de cliente ya existe.');
      return;
    }
    this.newClientTypeLabel.set('');
  }

  removeClientType(label: string): void {
    this.catalogTheme.removeCustomClientTariff(label);
  }

  addEventStatus(): void {
    this.formError.set('');
    const label = this.newEventStatusLabel().trim();
    if (!label) {
      this.formError.set('Escribe un nombre para el estado del evento.');
      return;
    }
    const ok = this.catalogTheme.addCustomEventStatus(label);
    if (!ok) {
      this.formError.set('Ese estado de evento ya existe.');
      return;
    }
    this.newEventStatusLabel.set('');
  }

  removeEventStatus(value: string | undefined): void {
    if (!value) {
      return;
    }
    this.catalogTheme.removeCustomEventStatus(value);
  }
}
