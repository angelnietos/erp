import { Injectable, signal } from '@angular/core';

export interface AssistantPetConfig {
  name: string;
  skin: string;
  color: string;
  personality: 'friendly' | 'professional' | 'humorous' | 'minimal';
  animationSpeed: number;
  autoOpen: boolean;
  soundEnabled: boolean;
  bubbleSize: 'small' | 'medium' | 'large';
  opacity: number;
}

export interface AssistantContext {
  activeTab: string;
  documentContent: string;
  documentType: string | null;
  formData: Record<string, any>;
  analysisResults: any[];
  currentView: string;
}

export interface AssistantMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  context?: string;
}

export type MessageType = 'user' | 'assistant' | 'system';

/** Tamaño del panel flotante del chat (persistido). */
export interface AssistantPanelSize {
  width: number;
  height: number;
}

const DEFAULT_PANEL: AssistantPanelSize = { width: 400, height: 580 };
const PANEL_STORAGE_KEY = 'assistant-panel-size';

@Injectable({ providedIn: 'root' })
export class AssistantContextService {
  private readonly context = signal<AssistantContext>({
    activeTab: 'create',
    documentContent: '',
    documentType: null,
    formData: {},
    analysisResults: [],
    currentView: 'create',
  });

  private readonly messages = signal<AssistantMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content:
        '¡Hola! Soy tu asistente inteligente. Estoy observando todo lo que haces en todas las pestañas. ¿Necesitas ayuda?',
      timestamp: new Date(),
    },
  ]);

  private readonly isOpen = signal(false);
  private readonly isDragging = signal(false);
  private readonly position = signal({ x: 20, y: 100 });

  private readonly panelSize = signal<AssistantPanelSize>({ ...DEFAULT_PANEL });

  private readonly petConfig = signal<AssistantPetConfig>({
    name: 'Kilo',
    skin: 'default',
    color: '#667eea',
    personality: 'friendly',
    animationSpeed: 1,
    autoOpen: true,
    soundEnabled: false,
    bubbleSize: 'medium',
    opacity: 100,
  });

  readonly petConfig$ = this.petConfig.asReadonly();

  readonly context$ = this.context.asReadonly();
  readonly messages$ = this.messages.asReadonly();
  readonly isOpen$ = this.isOpen.asReadonly();
  readonly position$ = this.position.asReadonly();
  readonly panelSize$ = this.panelSize.asReadonly();

  updateContext(partial: Partial<AssistantContext>): void {
    this.context.update((current) => ({ ...current, ...partial }));
  }

  setActiveTab(tab: string): void {
    this.updateContext({ activeTab: tab });
    this.addSystemMessage(`Cambiando a pestaña: ${tab}`);
  }

  setDocumentContent(content: string, type?: string): void {
    this.updateContext({
      documentContent: content,
      documentType: type || this.context().documentType,
    });
  }

  setFormData(data: Record<string, any>): void {
    this.updateContext({ formData: data });
  }

  setAnalysisResults(results: any[]): void {
    this.updateContext({ analysisResults: results });
  }

  toggleAssistant(): void {
    this.isOpen.update((v) => !v);
  }

  /** Abre el panel del asistente flotante (sin alternar). */
  openAssistant(): void {
    this.isOpen.set(true);
  }

  setPosition(x: number, y: number): void {
    this.position.set({ x, y });
  }

  /** Límites razonables para el panel (px). */
  clampPanelSize(width: number, height: number): AssistantPanelSize {
    const minW = 320;
    const minH = 360;
    const maxW = Math.max(minW, window.innerWidth - 16);
    const maxH = Math.max(minH, window.innerHeight - 16);
    return {
      width: Math.round(Math.min(maxW, Math.max(minW, width))),
      height: Math.round(Math.min(maxH, Math.max(minH, height))),
    };
  }

  setPanelSize(width: number, height: number): void {
    const next = this.clampPanelSize(width, height);
    this.panelSize.set(next);
    try {
      localStorage.setItem(PANEL_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  /** Ventana grande centrada en el viewport (sin salirse). */
  maximizePanel(): void {
    const margin = 16;
    const w = window.innerWidth - margin * 2;
    const h = window.innerHeight - margin * 2;
    const next = this.clampPanelSize(w, h);
    this.panelSize.set(next);
    this.position.set({ x: margin, y: margin });
    try {
      localStorage.setItem(PANEL_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  resetPanelSize(): void {
    this.setPanelSize(DEFAULT_PANEL.width, DEFAULT_PANEL.height);
  }

  loadPanelSize(): void {
    try {
      const raw = localStorage.getItem(PANEL_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<AssistantPanelSize>;
      if (
        typeof parsed.width === 'number' &&
        typeof parsed.height === 'number'
      ) {
        this.panelSize.set(this.clampPanelSize(parsed.width, parsed.height));
      }
    } catch {
      /* defaults */
    }
  }

  addMessage(content: string, type: MessageType): void {
    this.messages.update((current) => [
      ...current,
      {
        id: Date.now().toString(),
        type,
        content,
        timestamp: new Date(),
        context: this.context().activeTab,
      },
    ]);
  }

  addSystemMessage(content: string): void {
    this.addMessage(content, 'system');
  }

  getFullContext(): string {
    const ctx = this.context();
    return `
Contexto actual:
- Pestaña activa: ${ctx.activeTab}
- Tipo de documento: ${ctx.documentType || 'No seleccionado'}
- Longitud contenido: ${ctx.documentContent.length} caracteres
- Resultados análisis: ${ctx.analysisResults.length} comprobaciones
    `.trim();
  }

  clearMessages(): void {
    this.messages.set([]);
  }

  updatePetConfig(partial: Partial<AssistantPetConfig>): void {
    this.petConfig.update((current) => ({ ...current, ...partial }));
    localStorage.setItem(
      'assistant-pet-config',
      JSON.stringify(this.petConfig()),
    );
  }

  loadSavedConfig(): void {
    const saved = localStorage.getItem('assistant-pet-config');
    if (saved) {
      try {
        this.petConfig.set(JSON.parse(saved));
      } catch {
        // Config por defecto
      }
    }
    this.loadPanelSize();
  }
}
