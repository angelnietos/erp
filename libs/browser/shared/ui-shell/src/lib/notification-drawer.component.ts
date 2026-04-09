import { Component, computed, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { UiButtonComponent } from '@josanz-erp/shared-ui-kit';
import {
  AppNotification,
  NotificationFeedStore,
} from '@josanz-erp/shared-data-access';

@Component({
  selector: 'josanz-notification-drawer',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, UiButtonComponent],
  template: `
    <div class="drawer-overlay" (click)="closeDrawer.emit()" (keydown.escape)="closeDrawer.emit()" tabindex="-1" role="presentation"></div>
    <div class="drawer-container ui-glass animate-slide-in">
      <header class="drawer-header">
        <div class="header-info">
          <h2 class="text-uppercase text-brand">Centro de Notificaciones</h2>
          <span class="text-muted text-uppercase font-mono">Terminal v2.0.4.core</span>
        </div>
        <ui-button variant="ghost" size="sm" (clicked)="closeDrawer.emit()" icon="x"></ui-button>
      </header>

      <div class="content-area">
        @if (allNotifications().length === 0) {
          <div class="empty-state">
            <lucide-icon name="bell-off" size="40" class="text-muted opacity-30"></lucide-icon>
            <p class="text-uppercase text-muted">No hay registros pendientes</p>
          </div>
        } @else {
          <div class="notification-list">
            @for (note of allNotifications(); track note.id) {
              <div 
                class="note-card" 
                [class.unread]="!note.read"
                tabindex="0"
                role="article"
              >
                <div class="note-type-indicator" [class]="note.type"></div>
                <div class="note-body">
                  <div class="note-header">
                    <span class="note-title text-uppercase">{{ note.title }}</span>
                    <span class="note-time">{{ note.time }}</span>
                  </div>
                  <p class="note-msg">{{ note.message }}</p>
                  <div class="note-actions">
                    <button class="action-link text-uppercase" (click)="markRead(note)">
                      <lucide-icon name="check-check" size="12" class="mr-1"></lucide-icon>
                      MARCAR LECTURA
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <footer class="drawer-footer">
        <ui-button variant="primary" class="w-full" (clicked)="closeDrawer.emit()">
          OCULTAR TERMINAL
        </ui-button>
      </footer>
    </div>
  `,
  styles: [`
    .drawer-overlay {
      position: fixed; inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(8px);
      z-index: 1000;
      animation: fadeIn 0.3s ease;
    }
    
    .drawer-container {
      position: fixed; top: 0; right: 0; bottom: 0; width: 420px;
      background: rgba(15, 15, 15, 0.9);
      border-left: 1px solid var(--border-soft);
      z-index: 1001;
      display: flex; flex-direction: column;
      box-shadow: -20px 0 50px rgba(0, 0, 0, 0.6);
    }
    
    .drawer-header {
      padding: 32px 24px;
      border-bottom: 1px solid var(--border-soft);
      display: flex; justify-content: space-between; align-items: center;
      background: rgba(255, 255, 255, 0.02);
    }
    
    .header-info h2 { font-size: 1rem; font-weight: 900; margin: 0; letter-spacing: 0.1em; }
    .header-info span { font-size: 0.6rem; font-weight: 800; letter-spacing: 0.15em; font-family: var(--font-mono); color: var(--text-muted); padding-top: 4px; display: block; }
    
    .content-area { flex: 1; overflow-y: auto; padding: 20px; }
    
    .empty-state {
      height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.5rem;
    }
    .empty-state p { font-size: 0.7rem; font-weight: 800; letter-spacing: 0.1em; }
    
    .notification-list { display: flex; flex-direction: column; gap: 16px; }
    
    .note-card {
      background: rgba(255, 255, 255, 0.03);
      border-radius: 8px; overflow: hidden; display: flex;
      border: 1px solid var(--border-soft);
      transition: var(--transition-base);
    }
    .note-card:hover { border-color: var(--brand); background: rgba(255, 255, 255, 0.05); transform: translateX(-4px); }
    .note-card.unread { border-left: 2px solid var(--brand); background: rgba(240, 62, 62, 0.05); }
    
    .note-type-indicator { width: 3px; }
    .note-type-indicator.info { background: var(--info); }
    .note-type-indicator.success { background: var(--success); }
    .note-type-indicator.warning { background: var(--warning); }
    .note-type-indicator.critical { background: var(--danger); }
    
    .note-body { flex: 1; padding: 16px; display: flex; flex-direction: column; gap: 8px; }
    
    .note-header { display: flex; justify-content: space-between; align-items: center; }
    .note-title { font-size: 0.8rem; font-weight: 900; color: #fff; letter-spacing: 0.05em; }
    .note-time { font-size: 0.6rem; color: var(--text-muted); font-weight: 800; font-family: var(--font-mono); }
    
    .note-msg { font-size: 0.75rem; color: var(--text-secondary); line-height: 1.5; margin: 0; }
    
    .note-actions { margin-top: 8px; display: flex; align-items: center; }
    .action-link {
      background: none; border: none; padding: 0;
      color: var(--brand); font-size: 0.65rem; font-weight: 900;
      cursor: pointer; opacity: 0.7; transition: 0.2s; display: flex; align-items: center;
    }
    .action-link:hover { opacity: 1; transform: scale(1.02); }
    .mr-1 { margin-right: 4px; }
    
    .drawer-footer { padding: 32px 24px; border-top: 1px solid var(--border-soft); }
    .w-full { width: 100%; }
    
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .animate-slide-in { animation: slideIn 0.4s cubic-bezier(0, 0, 0.2, 1); }
    @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }

    /* Custom Scrollbar */
    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-thumb { background: var(--border-medium); border-radius: 10px; }
  `]
})
export class NotificationDrawerComponent {
  closeDrawer = output<void>();

  private readonly feed = inject(NotificationFeedStore);

  private readonly seedNotifications: AppNotification[] = [
    { id: '1', title: 'Sistema Fiscal', message: 'Certificaciones VeriFactu emitidas correctamente para el período Q1.', time: '10:45 AM', type: 'success', read: false },
    { id: '2', title: 'Inventario Crítico', message: 'Nivel de stock bajo en cámaras Sony FX6. (2 unidades restantes)', time: '09:20 AM', type: 'warning', read: false },
    { id: '3', title: 'Alquiler Activo', message: 'El expediente #RNT-002 ha sido activado por ADMINISTRADOR.', time: 'Ayer', type: 'info', read: true },
    { id: '4', title: 'Alerta Seguridad', message: 'Intento de acceso desde IP no reconocida bloqueado por el firewall.', time: 'Ayer', type: 'critical', read: true },
  ];

  readonly allNotifications = computed(() => [
    ...this.feed.liveItems(),
    ...this.seedNotifications,
  ]);

  markRead(note: AppNotification) {
    note.read = true;
  }
}
