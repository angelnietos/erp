import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { JosanzThemeService } from '../services/theme.service';
import { MainTabsComponent } from './main-tabs';
import { ThemePersonalizationPanelComponent } from './theme-personalization-panel';

import { JosanzCatalogThemePanelComponent } from './josanz-catalog-theme-panel/josanz-catalog-theme-panel';

@Component({
  selector: 'josanz-app-settings-page',
  standalone: true,
  imports: [RouterLink, MainTabsComponent, ThemePersonalizationPanelComponent, JosanzCatalogThemePanelComponent],
  templateUrl: './app-settings-page.html',
  styleUrl: './app-settings-page.css',
})
export class AppSettingsPageComponent implements OnInit {
  readonly themeService = inject(JosanzThemeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly tabOptions: string[] = ['General', 'Personalización', 'Estados'];
  readonly activeTab = signal('Personalización');

  ngOnInit(): void {
    const tab = this.route.snapshot.queryParamMap.get('tab')?.toLowerCase();
    if (tab === 'personalizacion' || tab === 'personalización') {
      this.activeTab.set('Personalización');
    } else if (tab === 'estados') {
      this.activeTab.set('Estados');
    } else if (tab === 'general') {
      this.activeTab.set('General');
    }
  }

  onTabChange(tab: string): void {
    if (tab === 'General' || tab === 'Personalización' || tab === 'Estados') {
      this.activeTab.set(tab);
      const queryTab =
        tab === 'General' ? 'general' : tab === 'Estados' ? 'estados' : 'personalizacion';
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { tab: queryTab },
        replaceUrl: true,
      });
    }
  }
}
