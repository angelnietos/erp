import { Injectable, signal } from '@angular/core';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'warning' | 'success' | 'critical';
  read: boolean;
}

/** Notificaciones en vivo generadas en cliente (p. ej. refresco de KPIs). */
@Injectable({ providedIn: 'root' })
export class NotificationFeedStore {
  readonly liveItems = signal<AppNotification[]>([]);

  pushDashboardKpiSync(isoTime: string): void {
    const id = `dash-${Date.now()}`;
    this.liveItems.update((items) =>
      [
        {
          id,
          title: 'Panel KPI',
          message: `Métricas sincronizadas (${new Date(isoTime).toLocaleString('es-ES')}).`,
          time: new Date().toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          type: 'info' as const,
          read: false,
        },
        ...items,
      ].slice(0, 20),
    );
  }
}
