import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { UiButtonComponent, UiCardComponent } from '@josanz-erp/shared-ui-kit';

@Component({
  selector: 'lib-users-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, UiButtonComponent, UiCardComponent],
  template: `
    <div class="page-container animate-slide-up">
      <header class="page-header">
        <div class="header-main">
          <h1 class="page-title text-uppercase">Directorio de Usuarios</h1>
          <div class="breadcrumb">
            <span class="active">GESTIÓN DE ACCESOS</span>
            <span class="separator">/</span>
            <span>IDENTIDAD Y ROLES</span>
          </div>
        </div>
        <ui-josanz-button variant="primary" size="md" icon="user-plus">
          NUEVO USUARIO
        </ui-josanz-button>
      </header>

      <ui-josanz-card variant="glass" class="empty-state-card">
        <div class="empty-state">
          <lucide-icon name="users" size="48" class="text-muted"></lucide-icon>
          <h2 class="text-uppercase text-brand">Próximamente</h2>
          <p class="text-secondary text-center max-w-lg">
            El módulo de identidad avanzada y control de acceso (ACL) basado en roles estará disponible en la próxima actualización del sistema core.
          </p>
          <ui-josanz-button variant="ghost" icon="shield" class="mt-4">
            VER POLÍTICAS DE SEGURIDAD
          </ui-josanz-button>
        </div>
      </ui-josanz-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 2.5rem; max-width: 1600px; margin: 0 auto; }
    
    .page-header {
      display: flex; 
      justify-content: space-between; 
      align-items: flex-end;
      margin-bottom: 3rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-soft);
    }
    
    .page-title { 
      font-size: 2.25rem; 
      font-weight: 900; 
      color: #fff; 
      margin: 0 0 0.5rem 0; 
      letter-spacing: -0.02em;
      font-family: var(--font-display);
    }
    
    .breadcrumb {
      display: flex;
      gap: 8px;
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: 0.15em;
      color: var(--text-muted);
    }
    .breadcrumb .active { color: var(--brand); }
    .breadcrumb .separator { opacity: 0.3; }

    .empty-state-card { min-height: 400px; display: flex; align-items: center; justify-content: center; }
    
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
      padding: 3rem;
    }
    
    .empty-state h2 { font-size: 1.25rem; font-weight: 900; margin: 0; letter-spacing: 0.1em; }
    .max-w-lg { max-width: 500px; line-height: 1.6; }
    .mt-4 { margin-top: 1rem; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersListComponent {}
