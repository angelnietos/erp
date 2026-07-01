import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { JosanzThemeService } from '../services/theme.service';
import { MainTabsComponent } from './main-tabs';
import { BrandSettingsPanelComponent } from './brand-settings-panel';
import { AtmosphereSettingsPanelComponent } from './atmosphere-settings-panel';
import { ListSettingsPanelComponent } from './list-settings-panel';
import { JosanzCatalogThemePanelComponent } from './josanz-catalog-theme-panel/josanz-catalog-theme-panel';

export const JOSANZ_SETTINGS_TABS = [
  'General',
  'Marca',
  'Temas',
  'Listados',
  'Estados',
] as const;

export type JosanzSettingsTab = (typeof JOSANZ_SETTINGS_TABS)[number];

const TAB_QUERY: Record<JosanzSettingsTab, string> = {
  General: 'general',
  Marca: 'marca',
  Temas: 'temas',
  Listados: 'listados',
  Estados: 'estados',
};

const QUERY_TAB: Record<string, JosanzSettingsTab> = {
  general: 'General',
  marca: 'Marca',
  personalizacion: 'Marca',
  temas: 'Temas',
  listados: 'Listados',
  estados: 'Estados',
};

@Component({
  selector: 'josanz-app-settings-page',
  standalone: true,
  imports: [
    RouterLink,
    MainTabsComponent,
    BrandSettingsPanelComponent,
    AtmosphereSettingsPanelComponent,
    ListSettingsPanelComponent,
    JosanzCatalogThemePanelComponent,
  ],
  templateUrl: './app-settings-page.html',
  styleUrl: './app-settings-page.css',
})
export class AppSettingsPageComponent implements OnInit {
  readonly themeService = inject(JosanzThemeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly tabOptions: JosanzSettingsTab[] = [...JOSANZ_SETTINGS_TABS];
  readonly activeTab = signal<JosanzSettingsTab>('Marca');

  ngOnInit(): void {
    const tab = this.route.snapshot.queryParamMap.get('tab')?.toLowerCase() ?? '';
    const resolved = QUERY_TAB[tab];
    if (resolved) {
      this.activeTab.set(resolved);
    }
  }

  onTabChange(tab: string): void {
    if (!JOSANZ_SETTINGS_TABS.includes(tab as JosanzSettingsTab)) {
      return;
    }
    const next = tab as JosanzSettingsTab;
    this.activeTab.set(next);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: TAB_QUERY[next] },
      replaceUrl: true,
    });
  }
}
