import { Component } from '@angular/core';
import { AppSettingsPageComponent } from '@josanz-erp/josanz-ui';

@Component({
  standalone: true,
  imports: [AppSettingsPageComponent],
  template: `<josanz-app-settings-page />`,
})
export class JosanzSettingsPlaceholderComponent {}
