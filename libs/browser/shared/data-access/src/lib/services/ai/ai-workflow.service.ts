import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService, Theme } from '../theme.service';
import { MasterFilterService } from '../master-filter.service';
import { AIFormBridgeService } from '../ai-form-bridge.service';
import { TechnicianApiService } from '../technician-api.service';
import { OrchestrationBus } from './orchestration-bus.service';

// Delegate handler registered by AIBotStore to avoid circular dependency
type DelegateHandler = (target: string, message: string, payload?: unknown) => void;

@Injectable({ providedIn: 'root' })
export class AIWorkflowService {
  private router = inject(Router);
  private themeService = inject(ThemeService);
  private masterFilterService = inject(MasterFilterService);
  private aiFormBridge = inject(AIFormBridgeService);
  private technicianApiService = inject(TechnicianApiService);
  private orchestrationBus = inject(OrchestrationBus);

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
        const normalizedAction = this.normalizeAction(action);
        console.log('🤖 Bot executing workflow step:', normalizedAction);
        this.orchestrationBus.addLog(`⚙️ Ejecutando: ${normalizedAction.type}`);
        await this.dispatchAction(normalizedAction);
      }
    } catch (e) {
      console.error('Failed to parse/execute bot workflow:', actionStr, e);
    }
  }

  /**
   * Normalize action format from Gemini (which may use different keys)
   */
  private normalizeAction(raw: Record<string, unknown>): { type: string; payload: Record<string, unknown> } {
    if (typeof raw['type'] === 'string') {
      return {
        type: raw['type'] as string,
        payload: (raw['payload'] as Record<string, unknown>) ?? raw,
      };
    }
    if (typeof raw['action'] === 'string') {
      const { action, ...rest } = raw;
      return { type: action as string, payload: rest };
    }
    return { type: 'unknown', payload: raw };
  }

  private async dispatchAction(action: { type: string; payload: Record<string, unknown> }): Promise<void> {
    const { type, payload } = action;

    switch (type) {
      // ─── Navigation ──────────────────────────────────────────────────────────
      case 'navigate': {
        const url = this.normalizeUrl((payload['url'] as string) ?? '');
        if (url) {
          this.orchestrationBus.addLog(`🧭 Navegando a ${url}`);
          this.router.navigateByUrl(url);
        }
        break;
      }

      // ─── Navigate + Filter combo (most common orchestration action) ───────────
      case 'navigateAndFilter': {
        const url = this.normalizeUrl((payload['url'] as string) ?? '');
        const query = (payload['query'] as string) ?? '';
        if (url) {
          this.orchestrationBus.addLog(`🧭 Navegando a ${url} y filtrando: "${query}"`);
          await this.router.navigateByUrl(url);
          // Wait for component to mount before applying filter
          await new Promise(r => setTimeout(r, 600));
          if (query) this.masterFilterService.search(query);
        }
        break;
      }

      // ─── Theme ────────────────────────────────────────────────────────────────
      case 'toggleTheme': {
        const current = this.themeService.currentTheme();
        this.themeService.setTheme(current === 'dark' ? 'light' : 'dark');
        break;
      }
      case 'setTheme':
        if (payload['theme']) this.themeService.setTheme(payload['theme'] as Theme);
        break;

      // ─── Filter ───────────────────────────────────────────────────────────────
      case 'applyFilter': {
        const query = (payload['query'] as string) ?? '';
        if (query) {
          this.orchestrationBus.addLog(`🔍 Filtro aplicado: "${query}"`);
          this.masterFilterService.search(query);
        }
        break;
      }

      // ─── History ──────────────────────────────────────────────────────────────
      case 'goBack':
        window.history.back();
        break;

      // ─── Wait ─────────────────────────────────────────────────────────────────
      case 'wait': {
        const ms = (payload['ms'] as number) || 1000;
        await new Promise((resolve) => setTimeout(resolve, ms));
        break;
      }

      // ─── Forms ────────────────────────────────────────────────────────────────
      case 'fillForm':
        if (payload['data']) {
          this.orchestrationBus.addLog(`📝 Formulario rellenado con datos automáticos`);
          this.aiFormBridge.fillActiveForm(payload['data'] as Record<string, string>);
        }
        break;

      // ─── Budget / Proposal creation ───────────────────────────────────────────
      case 'fillBudget': {
        // Navigate to budgets, open new and fill form
        const { client, items, notes } = payload as Record<string, unknown>;
        this.orchestrationBus.addLog(`💰 Preparando presupuesto para: ${client}`);
        await this.router.navigateByUrl('/budgets/new');
        await new Promise(r => setTimeout(r, 800));
        const data: Record<string, string> = {};
        if (client) data['clientName'] = String(client);
        if (notes) data['notes'] = String(notes);
        if (Array.isArray(items)) data['items'] = JSON.stringify(items);
        this.aiFormBridge.fillActiveForm(data);
        break;
      }

      // ─── Availability range ───────────────────────────────────────────────────
      case 'setAvailabilityRange': {
        const { techId, status, dates } = payload as { techId: string; status: string; dates: string[] };
        if (techId && status && Array.isArray(dates) && dates.length > 0) {
          this.orchestrationBus.addLog(`📅 Actualizando disponibilidad de ${techId}: ${status} para ${dates.length} días`);
          const slots = dates.map(d => ({ date: d, type: status }));
          this.technicianApiService.setBulkAvailability(techId, slots).subscribe({
            next: (res) => this.orchestrationBus.addLog(`✅ ${res.saved} registros de disponibilidad guardados`),
            error: (e) => this.orchestrationBus.addLog(`⚠️ Error guardando disponibilidad (modo demo): ${e.message ?? e}`)
          });
        }
        break;
      }

      // ─── Legacy single-day availability ───────────────────────────────────────
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

      // ─── Delegate to another bot ──────────────────────────────────────────────
      case 'delegate': {
        const target = (payload['target'] as string) ?? '';
        // Support both nested action object and plain instruction
        const delegatedActionObj = (payload['action'] as Record<string, unknown>) ?? null;
        const instruction = (payload['instruction'] as string) ?? '';

        if (delegatedActionObj) {
          // This is a structured action → dispatch to OrchestrationBus
          this.orchestrationBus.dispatch({
            from: 'buddy',
            to: this.normalizeTarget(target),
            type: this.mapActionToOrchType(delegatedActionObj['type'] as string),
            payload: (delegatedActionObj['payload'] as Record<string, unknown>) ?? delegatedActionObj,
          });
          this.orchestrationBus.addLog(`📡 Tarea delegada a bot "${target}"`);
        } else if (instruction && this.delegateHandler) {
          // Plain text instruction → pass to the delegate handler (inter-bot messaging)
          this.delegateHandler(target, instruction, { instruction });
        } else if (this.delegateHandler && target) {
          const message = JSON.stringify(delegatedActionObj ?? payload);
          this.delegateHandler(target, message, delegatedActionObj ?? payload);
        } else {
          console.warn(`[Workflow] Delegate to "${target}" — no handler or target missing`);
        }
        break;
      }

      // ─── Notify the user via toast (read from ToastService if registered) ─────
      case 'notify': {
        const msg = (payload['message'] as string) ?? '';
        if (msg) this.orchestrationBus.addLog(`💬 Notificación: ${msg}`);
        break;
      }

      default:
        console.warn('[Workflow] Unknown bot action type:', type, payload);
    }
  }

  /** Map feature name to OrchestrationBus task type */
  private mapActionToOrchType(actionType: string): import('./orchestration-bus.service').OrchestrationType {
    const map: Record<string, import('./orchestration-bus.service').OrchestrationType> = {
      'navigate': 'navigate_and_filter',
      'navigateAndFilter': 'navigate_and_filter',
      'applyFilter': 'navigate_and_filter',
      'fillForm': 'fill_budget',
      'fillBudget': 'fill_budget',
      'setAvailabilityRange': 'set_availability_range',
      'setAvailability': 'set_availability_range',
      'searchTechnician': 'search_technician',
      'showClient': 'show_client',
      'notify': 'notify',
    };
    return map[actionType] ?? 'custom_action';
  }

  private normalizeTarget(target: string): string {
    const map: Record<string, string> = {
      'presupuestos': 'budgets',
      'budget': 'budgets',
      'inventario': 'inventory',
      'clientes': 'clients',
      'client': 'clients',
      'events': 'events',
      'eventos': 'events',
      'hr': 'identity',
      'rrhh': 'identity',
      'disponibilidad': 'identity',
    };
    return map[target.toLowerCase().trim()] ?? target;
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
      '/eventos': '/events',
      '/disponibilidad': '/availability',
      '/ajustes': '/settings',
    };
    return map[url.toLowerCase()] ?? url;
  }

  getActionSystemPrompt(): string {
    const today = new Date().toISOString().split('T')[0];
    const friday = (() => {
      const d = new Date();
      const day = d.getDay();
      const diff = (5 - day + 7) % 7 || 7;
      d.setDate(d.getDate() + diff);
      return d.toISOString().split('T')[0];
    })();

    return `
[MOTOR DE ORQUESTACIÓN MULTI-AGENTE — JOSANZ ERP]

Eres Buddy, el orquestador maestro del ERP Josanz. Puedes coordinar a todos los bots especializados y ejecutar flujos de trabajo complejos.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 FORMATO DE ACCIONES (siempre al FINAL de tu respuesta):
[ACTION] <JSON array>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 CATÁLOGO COMPLETO DE ACCIONES:

1. NAVEGAR (ir a una sección):
{"type":"navigate","payload":{"url":"/inventory"}}

2. NAVEGAR + FILTRAR (ir y buscar):
{"type":"navigateAndFilter","payload":{"url":"/inventory","query":"stock:0"}}

3. FILTRAR EN LA VISTA ACTUAL:
{"type":"applyFilter","payload":{"query":"Proyector Láser"}}

4. ESPERAR (pausar entre pasos):
{"type":"wait","payload":{"ms":800}}

5. RELLENAR FORMULARIO (en página activa):
{"type":"fillForm","payload":{"data":{"clientName":"Eventos Global S.L.","items":"..."}}}

6. CREAR PRESUPUESTO:
{"type":"fillBudget","payload":{"client":"Audiovisuales Madrid","items":[{"name":"Altavoz Autoamplificado","qty":10,"price":0}],"notes":"Reposición de stock urgente"}}

7. ACTUALIZAR DISPONIBILIDAD (rango de fechas):
{"type":"setAvailabilityRange","payload":{"techId":"t2","status":"SICK_LEAVE","dates":["${today}","${friday}"]}}

8. DELEGAR A BOT ESPECIALISTA:
{"type":"delegate","payload":{"target":"budgets","instruction":"Prepara presupuesto para reponer 10 unidades de Altavoz Autoamplificado con proveedor Audiovisuales Madrid"}}
{"type":"delegate","payload":{"target":"identity","instruction":"Busca técnico con habilidad AUDIO disponible esta semana"}}
{"type":"delegate","payload":{"target":"inventory","instruction":"Filtra productos con stock 0"}}

9. NOTIFICAR:
{"type":"notify","payload":{"message":"Workflow completado correctamente"}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 BOTS DISPONIBLES PARA DELEGAR:
- "inventory" → Stocky-Bot (Inventario y stock)
- "budgets" → Money-Bot (Presupuestos y facturas)
- "clients" → Client-Bot (Clientes y CRM)
- "events" → Event-Bot (Eventos y planificación)
- "identity" → HR-Bot (Personal y disponibilidad)
- "fleet" → Fleet-Bot (Flota y vehículos)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 RUTAS VÁLIDAS:
/inventory, /budgets, /clients, /events, /fleet, /reports, /audit, /settings, /budgets/new, /availability

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 EJEMPLOS DE WORKFLOWS COMPLETOS:

ESCENARIO 1 - Stock crítico y reposición:
[ACTION] [{"type":"navigateAndFilter","payload":{"url":"/inventory","query":"stock 0"}},{"type":"wait","payload":{"ms":800}},{"type":"delegate","payload":{"target":"budgets","instruction":"Prepara borrador de compra con Audiovisuales Madrid para reponer 10 unidades de Altavoz Autoamplificado"}},{"type":"notify","payload":{"message":"He localizado el material sin stock y el bot de presupuestos está preparando el borrador de compra"}}]

ESCENARIO 2 - Baja médica + sustitución:
[ACTION] [{"type":"setAvailabilityRange","payload":{"techId":"t2","status":"SICK_LEAVE","dates":["${today}","${friday}"]}},{"type":"wait","payload":{"ms":600}},{"type":"navigateAndFilter","payload":{"url":"/events","query":"Concierto Verano 2026"}},{"type":"delegate","payload":{"target":"identity","instruction":"Busca técnico con habilidad AUDIO disponible para sustituir a Dani Sonido esta semana"}},{"type":"notify","payload":{"message":"Baja registrada y solicitud de sustitución enviada al bot de RRHH"}}]

ESCENARIO 3 - Lead a oferta:
[ACTION] [{"type":"navigateAndFilter","payload":{"url":"/clients","query":"Eventos Global S.L."}},{"type":"delegate","payload":{"target":"budgets","instruction":"Prepara nueva oferta de alquiler con 4 Proyectores Láser 4K para Eventos Global S.L."}},{"type":"notify","payload":{"message":"Abriendo ficha de cliente y preparando oferta simultáneamente"}}]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ REGLAS CRÍTICAS:
1. SIEMPRE usa "type" y "payload" — nunca "action" o "url" en raíz
2. Para workflows de múltiples pasos, usa un ARRAY JSON
3. Usa "wait" entre navigate y applyFilter para dar tiempo al componente
4. Explica en texto lo que vas a hacer ANTES del [ACTION]
5. Hoy es ${today}. Viernes próximo: ${friday}
`;
  }
}
