import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-users-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Usuarios</h1>
        <p class="subtitle">Gestión de usuarios</p>
      </div>
      <p>Listado de usuarios (placeholder)</p>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; }
    .page-header { margin-bottom: 16px; }
    .subtitle { color: #94A3B8; font-size: 14px; margin: 0; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersListComponent {}

