import { Route } from '@angular/router';
import { SettingsFeatureComponent } from '../../../feature/src/lib/settings-feature/settings-feature.component';

export const settingsRoutes: Route[] = [
  {
    path: '',
    component: SettingsFeatureComponent,
  },
];
