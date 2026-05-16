import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { JosanzThemeService } from '../services/theme.service';
import { MainTabsComponent } from './main-tabs';
import { ThemePersonalizationPanelComponent } from './theme-personalization-panel';

@Component({
  selector: 'josanz-app-settings-page',
  standalone: true,
  imports: [RouterLink, MainTabsComponent, ThemePersonalizationPanelComponent],
  templateUrl: './app-settings-page.html',
  styleUrl: './app-settings-page.css',
})
export class AppSettingsPageComponent implements OnInit {
  readonly themeService = inject(JosanzThemeService);
  private readonly route = inject(ActivatedRoute);

  readonly tabOptions: string[] = ['General', 'Personalización'];
  readonly activeTab = signal('Personalización');

  ngOnInit(): void {
    const tab = this.route.snapshot.queryParamMap.get('tab')?.toLowerCase();
    if (tab === 'personalizacion' || tab === 'personalización') {
      this.activeTab.set('Personalización');
    } else if (tab === 'general') {
      this.activeTab.set('General');
    }
  }

  onTabChange(tab: string): void {
    if (tab === 'General' || tab === 'Personalización') {
      this.activeTab.set(tab);
    }
  }
}
