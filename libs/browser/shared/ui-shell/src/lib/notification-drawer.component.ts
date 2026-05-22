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
    <div
      class="drawer-container animate-slide-in"
      role="dialog"
      aria-modal="true"
      [attr.aria-labelledby]="drawerTitleId"
    >
      <header class="drawer-header">
        <div class="header-info">
          <h2 class="drawer-title" [id]="drawerTitleId">Notificaciones</h2>
          <span class="drawer-subtitle">Actividad reciente del sistema</span>
        </div>
        <ui-button
          variant="ghost"
          size="sm"
          class="drawer-close"
          icon="x"
          aria-label="Cerrar panel de notificaciones"
          (clicked)="closeDrawer.emit()"
        ></ui-button>
      </header>

      <div class="content-area">
        @if (allNotifications().length === 0) {
          <div class="empty-state">
            <lucide-icon name="bell-off" size="40" class="empty-icon" aria-hidden="true"></lucide-icon>
            <p class="empty-label">No hay notificaciones pendientes</p>
            <p class="empty-hint">Cuando haya alertas o avisos, aparecerán aquí.</p>
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
                    <span class="note-title">{{ note.title }}</span>
                    <span class="note-time">{{ note.time }}</span>
                  </div>
                  <p class="note-msg">{{ note.message }}</p>
                  <div class="note-actions">
                    <button type="button" class="action-link" (click)="markRead(note)">
                      <lucide-icon name="check-check" size="12" class="mr-1" aria-hidden="true"></lucide-icon>
                      Marcar como leída
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
          Cerrar panel
        </ui-button>
      </footer>
    </div>
  `,
  styles: [`
    :host {
      /* Panel oscuro: tokens propios (no usar --text-* del tema claro aquí). */
      --nd-border: rgba(255, 255, 255, 0.1);
      --nd-muted: rgba(255, 255, 255, 0.66);
      --nd-body: rgba(255, 255, 255, 0.82);
      --nd-surface-card: rgba(255, 255, 255, 0.06);
    }

    .drawer-overlay {
      position: fixed; inset: 0;
      background: rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(6px);
      z-index: 1000;
      animation: fadeIn 0.3s ease;
    }

    .drawer-container {
      position: fixed; top: 0; right: 0; bottom: 0; width: min(420px, 100vw);
      background: linear-gradient(180deg, #141418 0%, #0e0e12 100%);
      border-left: 1px solid var(--nd-border);
      z-index: 1001;
      display: flex; flex-direction: column;
      box-shadow: -12px 0 40px rgba(0, 0, 0, 0.35);
      border-radius: 16px 0 0 16px;
    }

    .drawer-header {
      padding: 1.25rem 1.25rem 1rem;
      border-bottom: 1px solid var(--nd-border);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 0.75rem;
      background: rgba(255, 255, 255, 0.03);
    }

    .drawer-title {
      font-size: 1.05rem;
      font-weight: 700;
      margin: 0;
      letter-spacing: -0.02em;
      color: #f8fafc;
    }

    .drawer-subtitle {
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--nd-muted);
      padding-top: 0.25rem;
      display: block;
      line-height: 1.35;
    }

    .drawer-close ::ng-deep .btn {
      color: var(--nd-muted) !important;
    }

    .drawer-close ::ng-deep .btn:hover {
      color: #f8fafc !important;
      background: rgba(255, 255, 255, 0.08) !important;
    }

    .content-area {
      flex: 1;
      overflow-y: auto;
      padding: 1rem 1.25rem 1.25rem;
    }

    .empty-state {
      height: 100%;
      min-height: 200px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
    }

    .empty-icon {
      color: var(--nd-muted);
      opacity: 0.45;
    }

    .empty-label {
      font-size: 0.9rem;
      font-weight: 600;
      color: #f8fafc;
      margin: 0;
      text-align: center;
    }

    .empty-hint {
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--nd-muted);
      margin: 0;
      text-align: center;
      line-height: 1.45;
      max-width: 22rem;
    }

    .notification-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .note-card {
      background: var(--nd-surface-card);
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      border: 1px solid var(--nd-border);
      transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
    }

    .note-card:hover {
      border-color: color-mix(in srgb, var(--brand) 55%, var(--nd-border));
      background: rgba(255, 255, 255, 0.09);
      transform: translateX(-2px);
    }

    .note-card:focus-visible {
      outline: none;
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--brand) 45%, transparent);
      border-color: color-mix(in srgb, var(--brand) 55%, var(--nd-border));
    }

    .note-card.unread {
      border-color: color-mix(in srgb, var(--brand) 35%, var(--nd-border));
      background: color-mix(in srgb, var(--brand) 12%, var(--nd-surface-card));
    }

    .note-type-indicator { width: 4px; flex-shrink: 0; }
    .note-type-indicator.info { background: var(--info, #38bdf8); }
    .note-type-indicator.success { background: var(--success, #34d399); }
    .note-type-indicator.warning { background: var(--warning, #fbbf24); }
    .note-type-indicator.critical { background: var(--danger, #f87171); }

    .note-body {
      flex: 1;
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 0;
    }

    .note-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .note-title {
      font-size: 0.8125rem;
      font-weight: 700;
      color: #f8fafc;
      letter-spacing: 0.02em;
      text-transform: none;
    }

    .note-time {
      font-size: 0.6875rem;
      color: var(--nd-muted);
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      flex-shrink: 0;
    }

    .note-msg {
      font-size: 0.8125rem;
      color: var(--nd-body);
      line-height: 1.55;
      margin: 0;
    }

    .note-actions {
      margin-top: 4px;
      display: flex;
      align-items: center;
    }

    .action-link {
      background: none;
      border: none;
      padding: 0;
      color: color-mix(in srgb, var(--brand, #60a5fa) 92%, #fff);
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      opacity: 0.9;
      transition: opacity 0.2s ease;
      display: inline-flex;
      align-items: center;
    }

    .action-link:hover {
      opacity: 1;
      text-decoration: underline;
      text-underline-offset: 3px;
    }

    .action-link:focus-visible {
      outline: none;
      border-radius: 4px;
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--brand, #60a5fa) 45%, transparent);
    }

    .mr-1 { margin-right: 6px; }

    .drawer-footer {
      padding: 1rem 1.25rem 1.25rem;
      border-top: 1px solid var(--nd-border);
      background: rgba(0, 0, 0, 0.2);
    }

    .w-full { width: 100%; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .animate-slide-in { animation: slideIn 0.4s cubic-bezier(0, 0, 0.2, 1); }
    @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }

    .content-area::-webkit-scrollbar { width: 6px; }
    .content-area::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.15);
      border-radius: 10px;
    }

    @media (prefers-reduced-motion: reduce) {
      .drawer-overlay {
        animation: none;
      }
      .animate-slide-in {
        animation: none;
      }
      .note-card:hover {
        transform: none;
      }
    }
  `]
})
export class NotificationDrawerComponent {
  private static titleSeq = 0;
  /** Stable id for `aria-labelledby` on the dialog panel. */
  readonly drawerTitleId = `josanz-nd-title-${++NotificationDrawerComponent.titleSeq}`;

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
