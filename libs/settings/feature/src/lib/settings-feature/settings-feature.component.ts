import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-settings-feature',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="settings-container">
      <h1>Configuración</h1>
      <p>Página de configuración en construcción.</p>
    </div>
  `,
  styles: [`
    .settings-container {
      padding: 2rem;
    }
    h1 {
      margin-bottom: 1rem;
      color: #f8fafc;
    }
    p {
      color: #94a3b8;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsFeatureComponent {}
