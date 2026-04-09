import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService, Theme } from '../theme.service';
import { MasterFilterService } from '../master-filter.service';
import { AIFormBridgeService } from '../ai-form-bridge.service';
import { TechnicianApiService } from '../technician-api.service';

// Delegate handler registered by AIBotStore to avoid circular dependency
type DelegateHandler = (target: string, message: string, payload?: unknown) => void;

@Injectable({ providedIn: 'root' })
export class AIWorkflowService {
  private router = inject(Router);
  private themeService = inject(ThemeService);
  private masterFilterService = inject(MasterFilterService);
  private aiFormBridge = inject(AIFormBridgeService);
  private technicianApiService = inject(TechnicianApiService);

  // Registered by AIBotStore to handle delegate without circular dep
  private delegateHandler: DelegateHandler | null = null;

  registerDelegateHandler(handler: DelegateHandler) {
    this.delegateHandler = handler;
  }

  async executeAction(actionStr: string): Promise<void> {
    try {
      const parsed = JSON.parse(actionStr);
      const actions = Array.isArray(parsed) ? parsed : [parsed];

      for (const action of actions) {
        // Normalize: Gemini sometimes uses "action" instead of "type"
        const normalizedAction = this.normalizeAction(action);
        console.log('🤖 Bot executing workflow step:', normalizedAction);
        await this.dispatchAction(normalizedAction);
      }
    } catch (e) {
      console.error('Failed to parse/execute bot workflow:', actionStr, e);
    }
  }

  /**
   * Normalize action format from Gemini (which may use different keys)
   * Gemini may generate: { "action": "navigate", "url": "/inventario" }
   * We expect:           { "type": "navigate", "payload": { "url": "/inventory" } }
   */
  private normalizeAction(raw: Record<string, unknown>): { type: string; payload: Record<string, unknown> } {
    // Already in correct format
    if (typeof raw['type'] === 'string') {
      return {
        type: raw['type'] as string,
        payload: (raw['payload'] as Record<string, unknown>) ?? raw,
      };
    }

    // Gemini used "action" key instead of "type"
    if (typeof raw['action'] === 'string') {
      // Build payload from remaining keys (excluding "action")
      const { action, ...rest } = raw;
      return { type: action as string, payload: rest };
    }

    return { type: 'unknown', payload: raw };
  }

  private async dispatchAction(action: { type: string; payload: Record<string, unknown> }): Promise<void> {
    const { type, payload } = action;

    switch (type) {
      case 'navigate': {
        // Accept both /inventory and /inventario, /budgets and /presupuestos
        const url = this.normalizeUrl((payload['url'] as string) ?? '');
        if (url) this.router.navigateByUrl(url);
        break;
      }
      case 'toggleTheme': {
        const current = this.themeService.currentTheme();
        this.themeService.setTheme(current === 'dark' ? 'light' : 'dark');
        break;
      }
      case 'setTheme':
        if (payload['theme']) this.themeService.setTheme(payload['theme'] as Theme);
        break;

      case 'applyFilter': {
        const query = (payload['query'] as string) ?? '';
        if (query) this.masterFilterService.search(query);
        break;
      }
      case 'goBack':
        window.history.back();
        break;

      case 'wait': {
        const ms = (payload['ms'] as number) || 1000;
        await new Promise((resolve) => setTimeout(resolve, ms));
        break;
      }
      case 'fillForm':
        if (payload['data']) this.aiFormBridge.fillActiveForm(payload['data'] as Record<string, string>);
        break;

      case 'delegate': {
        // Delegate a task to another bot via the registered handler
        const target = (payload['target'] as string) ?? '';
        // The nested action/payload for the delegate
        const delegatedActionObj = (payload['action'] as Record<string, unknown>) ?? payload;
        const message = JSON.stringify(delegatedActionObj);
        if (this.delegateHandler && target) {
          this.delegateHandler(target, message, delegatedActionObj);
        } else {
          console.warn(`[Workflow] Delegate to "${target}" — no handler registered or target missing`);
        }
        break;
      }
      case 'setAvailability': {
        if (payload['techId'] && payload['status']) {
          const { techId, status, date, startDate } = payload as Record<string, string>;
          const dateToUse = date ?? startDate;
          if (dateToUse) {
            this.technicianApiService.setFullDayAvailability(techId, dateToUse, status).subscribe();
          }
        }
        break;
      }
      default:
        console.warn('[Workflow] Unknown bot action type:', type, payload);
    }
  }

  /** Normalize Spanish/English route names to Angular router paths */
  private normalizeUrl(url: string): string {
    const map: Record<string, string> = {
      '/inventario': '/inventory',
      '/presupuestos': '/budgets',
      '/clientes': '/clients',
      '/proyectos': '/projects',
      '/flota': '/fleet',
      '/albaranes': '/albaranes',
      '/reportes': '/reports',
      '/auditoria': '/audit',
      '/configuracion': '/settings',
    };
    return map[url.toLowerCase()] ?? url;
  }

  getActionSystemPrompt(): string {
    return `
[WORKFLOWS Y ACCIONES AUTÓNOMAS]
Eres un agente del ERP Josanz. Para ejecutar acciones en el sistema usa EXACTAMENTE este formato al final de tu respuesta:

[ACTION] <JSON>

FORMATO OBLIGATORIO de cada acción:
{
  "type": "navigate",   <-- SIEMPRE usar "type", nunca "action"
  "payload": { "url": "/inventory" }  <-- SIEMPRE usar "payload"
}

ACCIONES DISPONIBLES (array para workflows multi-paso):
- navigate:       { "type": "navigate",       "payload": { "url": "/inventory" } }
- applyFilter:    { "type": "applyFilter",    "payload": { "query": "stock:0" } }
- delegate:       { "type": "delegate",       "payload": { "target": "budgets", "action": { "type": "fillForm", "payload": { "data": { "client": "Audiovisuales Madrid", "quantity": 10 } } } } }
- fillForm:       { "type": "fillForm",       "payload": { "data": { "campo": "valor" } } }
- wait:           { "type": "wait",           "payload": { "ms": 1500 } }
- setTheme:       { "type": "setTheme",       "payload": { "theme": "dark" } }

RUTAS VÁLIDAS: /inventory, /budgets, /clients, /projects, /fleet, /events, /reports, /settings

REGLA DE ORO: SIEMPRE usa "type" y "payload". NUNCA uses "action" o "url" en el nivel raíz.

EJEMPLO DE WORKFLOW COMPLEJO:
[ACTION] [{"type":"navigate","payload":{"url":"/inventory"}},{"type":"applyFilter","payload":{"query":"stock:0"}},{"type":"wait","payload":{"ms":2000}},{"type":"delegate","payload":{"target":"budgets","action":{"type":"fillForm","payload":{"data":{"client":"Audiovisuales Madrid","quantity":10}}}}}]
`;
  }
}
