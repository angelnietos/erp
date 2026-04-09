import { Injectable, signal } from '@angular/core';

export type OrchestrationType =
  | 'navigate_and_filter'
  | 'fill_budget'
  | 'set_availability_range'
  | 'search_technician'
  | 'show_client'
  | 'notify'
  | 'custom_action';

export interface OrchestrationTask {
  id: string;
  from: string; // Bot que lo emite (e.g. 'buddy')
  to: string;   // Bot destinatario (e.g. 'inventory', 'budgets', 'identity')
  type: OrchestrationType;
  payload: Record<string, unknown>;
  createdAt: number;
  status: 'pending' | 'running' | 'done' | 'error';
  result?: string;
}

/**
 * OrchestrationBus — canal de comunicación entre bots para orquestar
 * workflows multi-paso. Es un singleton (providedIn: root).
 *
 * Buddy escribe tareas → cada bot sub-agente las lee al iniciar.
 * Los componentes ERP también pueden leer el bus para reaccionar.
 */
@Injectable({ providedIn: 'root' })
export class OrchestrationBus {
  private readonly _tasks = signal<OrchestrationTask[]>([]);
  private readonly _log = signal<string[]>([]);

  readonly tasks = this._tasks.asReadonly();
  readonly log = this._log.asReadonly();

  /** Buddy u otro bot orquestador publica una tarea */
  dispatch(task: Omit<OrchestrationTask, 'id' | 'createdAt' | 'status'>): string {
    const id = `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const full: OrchestrationTask = { ...task, id, createdAt: Date.now(), status: 'pending' };
    this._tasks.update(t => [...t, full]);
    this._addLog(`📤 [${task.from}→${task.to}] ${task.type}: ${JSON.stringify(task.payload)}`);
    return id;
  }

  /** Un bot sub-agente reclama la tarea y la procesa */
  claimTask(id: string): OrchestrationTask | undefined {
    const task = this._tasks().find(t => t.id === id && t.status === 'pending');
    if (task) {
      this._tasks.update(all => all.map(t => t.id === id ? { ...t, status: 'running' } : t));
    }
    return task;
  }

  /** Obtener todas las tareas pendientes para un bot */
  getPendingFor(botFeature: string): OrchestrationTask[] {
    return this._tasks().filter(t => t.to === botFeature && t.status === 'pending');
  }

  /** Marcar tarea como completada con resultado */
  complete(id: string, result: string) {
    this._tasks.update(all => all.map(t =>
      t.id === id ? { ...t, status: 'done', result } : t
    ));
    this._addLog(`✅ Tarea ${id} completada: ${result}`);
  }

  /** Marcar tarea como fallida */
  fail(id: string, error: string) {
    this._tasks.update(all => all.map(t =>
      t.id === id ? { ...t, status: 'error', result: error } : t
    ));
    this._addLog(`❌ Tarea ${id} fallida: ${error}`);
  }

  /** Publicar en el log de orquestación */
  private _addLog(msg: string) {
    this._log.update(l => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...l].slice(0, 50));
    console.log(`🎭 [OrchestrationBus] ${msg}`);
  }

  addLog(msg: string) {
    this._addLog(msg);
  }

  /** Limpiar tareas completadas */
  clearDone() {
    this._tasks.update(all => all.filter(t => t.status === 'pending' || t.status === 'running'));
  }
}
