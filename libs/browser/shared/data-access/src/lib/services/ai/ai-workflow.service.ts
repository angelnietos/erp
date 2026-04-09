import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService, Theme } from '../theme.service';
import { MasterFilterService } from '../master-filter.service';
import { AIFormBridgeService } from '../ai-form-bridge.service';
import { TechnicianApiService } from '../technician-api.service';

@Injectable({ providedIn: 'root' })
export class AIWorkflowService {
  private router = inject(Router);
  private themeService = inject(ThemeService);
  private masterFilterService = inject(MasterFilterService);
  private aiFormBridge = inject(AIFormBridgeService);
  private technicianApiService = inject(TechnicianApiService);

  async executeAction(actionStr: string): Promise<void> {
    try {
      const parsed = JSON.parse(actionStr);
      const actions = Array.isArray(parsed) ? parsed : [parsed];

      for (const action of actions) {
        console.log('🤖 Bot executing workflow step:', action);

        switch (action.type) {
          case 'navigate':
            if (action.payload?.url) this.router.navigateByUrl(action.payload.url);
            break;
          case 'toggleTheme': {
            const current = this.themeService.currentTheme();
            this.themeService.setTheme(current === 'dark' ? 'light' : 'dark');
            break;
          }
          case 'setTheme':
            if (action.payload?.theme) this.themeService.setTheme(action.payload.theme as Theme);
            break;
          case 'applyFilter':
            if (action.payload?.query) this.masterFilterService.search(action.payload.query);
            break;
          case 'goBack':
            window.history.back();
            break;
          case 'wait': {
            const ms = action.payload?.ms || 1000;
            await new Promise((resolve) => setTimeout(resolve, ms));
            break;
          }
          case 'fillForm':
            if (action.payload?.data) this.aiFormBridge.fillActiveForm(action.payload.data);
            break;
          case 'setAvailability': {
            if (action.payload?.techId && action.payload?.status) {
              const { techId, status, date, startDate, endDate } = action.payload;
              if (date) {
                this.technicianApiService.setFullDayAvailability(techId, date, status).subscribe();
              } else if (startDate && endDate) {
                this.technicianApiService.setFullDayAvailability(techId, startDate, status).subscribe();
              }
            }
            break;
          }
          default:
            console.warn('Unknown bot action:', action.type);
        }
      }
    } catch (e) {
      console.error('Failed to parse/execute bot workflow:', actionStr, e);
    }
  }

  getActionSystemPrompt(): string {
    return `
[WORKFLOWS Y ACCIONES AUTÓNOMAS]
Como agente de Josanz ERP, puedes ejecutar FLUJOS DE TRABAJO (secuencias de acciones).
Tu respuesta debe terminar con: [ACTION] <JSON_ARRAY_O_OBJECT>

ACCIONES MOTOR:
1. 'navigate': {url: string} -> Cambia de sección.
2. 'applyFilter': {query: string} -> Filtra datos en tiempo real.
3. 'wait': {ms: number} -> Pausa entre pasos del workflow.
4. 'delegate': {target: string, action: object} -> DELEGA una acción a otro bot.
5. 'fillForm': {data: object} -> RELLENA el formulario activo en pantalla.
6. 'setAvailability': {techId: string, status: string, date?: string, startDate?: string, endDate?: string} -> Gestiona calendarios.

REGLAS CRÍTICAS:
- Tu respuesta DEBE incluir obligatoriamente el tag [ACTION] seguido del JSON si necesitas que el sistema ejecute algo. No te limites a decir qué vas a hacer, ¡hazlo!
- Usa un workflow (array de acciones) para tareas complejas.
- El JSON debe ser impecable y estar al final de tu respuesta tras el tag [ACTION].
`;
  }
}
