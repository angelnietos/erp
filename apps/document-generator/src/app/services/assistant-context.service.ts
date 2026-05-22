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

/** Resultado de análisis de documento (p. ej. pestaña de análisis). */
export interface DocumentAnalysisCheckResult {
  checkId: string;
  status: 'pass' | 'warning' | 'error' | 'pending';
  message: string;
  suggestions: string[];
}

export interface AssistantContext {
  activeTab: string;
  documentContent: string;
  documentType: string | null;
  /** Valores del formulario de creación/edición (claves según el modelo). */
  formData: Record<string, unknown>;
  analysisResults: DocumentAnalysisCheckResult[];
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
/** Clave localStorage para la mascota / opciones del asistente flotante. */
export const ASSISTANT_PET_CONFIG_STORAGE_KEY = 'assistant-pet-config';

/** Mensaje inicial del chat (mismo texto al resetear a bienvenida). */
export const ASSISTANT_DEFAULT_WELCOME =
  '¡Hola! Soy tu asistente. Puedo ayudarte con el documento y con lo que estés haciendo en esta app. ¿Necesitas algo?';

const PET_PERSONALITIES: readonly AssistantPetConfig['personality'][] = [
  'friendly',
  'professional',
  'humorous',
  'minimal',
];

const PET_BUBBLE_SIZES: readonly AssistantPetConfig['bubbleSize'][] = [
  'small',
  'medium',
  'large',
];

function clampNumber(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

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
      id: 'welcome-initial',
      type: 'assistant',
      content: ASSISTANT_DEFAULT_WELCOME,
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
    const previous = this.context().activeTab;
    this.updateContext({ activeTab: tab });
    if (previous !== tab) {
      this.addSystemMessage(`Cambiando a pestaña: ${tab}`);
    }
  }

  setDocumentContent(content: string, type?: string): void {
    this.updateContext({
      documentContent: content,
      documentType: type || this.context().documentType,
    });
  }

  setFormData(data: Record<string, unknown>): void {
    this.updateContext({ formData: data });
  }

  setAnalysisResults(results: DocumentAnalysisCheckResult[]): void {
    this.updateContext({ analysisResults: results });
  }

  toggleAssistant(): void {
    const wasOpen = this.isOpen();
    this.isOpen.update((v) => !v);
    if (!wasOpen && this.isOpen()) {
      this.announcePanelOpened();
    }
  }

  /** Abre el panel del asistente flotante (sin alternar). */
  openAssistant(options?: { announce?: boolean }): void {
    const announce = options?.announce !== false;
    this.isOpen.set(true);
    if (announce) {
      this.announcePanelOpened();
    }
  }

  /** Mensaje para `aria-live` (lectores de pantalla) al abrir el panel. */
  private readonly assistiveStatus = signal('');

  readonly assistiveStatus$ = this.assistiveStatus.asReadonly();

  private announcePanelOpened(): void {
    const name = this.petConfig().name;
    const msg = `${name}: panel de ayuda abierto. Escribe en el campo de texto al final del chat.`;
    this.assistiveStatus.set('');
    setTimeout(() => this.assistiveStatus.set(msg), 80);
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
        typeof parsed.height === 'number' &&
        Number.isFinite(parsed.width) &&
        Number.isFinite(parsed.height)
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
        id: crypto.randomUUID(),
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

  /** Vuelve a dejar solo el mensaje de bienvenida del asistente. */
  resetChatToWelcome(): void {
    this.messages.set([
      {
        id: `welcome-${crypto.randomUUID()}`,
        type: 'assistant',
        content: ASSISTANT_DEFAULT_WELCOME,
        timestamp: new Date(),
      },
    ]);
  }

  updatePetConfig(partial: Partial<AssistantPetConfig>): void {
    this.petConfig.update((current) =>
      this.sanitizePetConfigFromStorage(
        partial as Record<string, unknown>,
        current,
      ),
    );
    try {
      localStorage.setItem(
        ASSISTANT_PET_CONFIG_STORAGE_KEY,
        JSON.stringify(this.petConfig()),
      );
    } catch {
      /* quota / modo privado: la sesión sigue con el estado en memoria */
    }
  }

  loadSavedConfig(): void {
    const saved = localStorage.getItem(ASSISTANT_PET_CONFIG_STORAGE_KEY);
    if (saved) {
      try {
        const parsed: unknown = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          this.petConfig.update((current) =>
            this.sanitizePetConfigFromStorage(
              parsed as Record<string, unknown>,
              current,
            ),
          );
        }
      } catch {
        /* JSON inválido: se mantienen valores por defecto */
      }
    }
    this.loadPanelSize();
  }

  /** Fusiona un parche en la config del pet (localStorage o UI) con validación por campo. */
  private sanitizePetConfigFromStorage(
    raw: Record<string, unknown>,
    base: AssistantPetConfig,
  ): AssistantPetConfig {
    const next: AssistantPetConfig = { ...base };

    const name = raw['name'];
    if (typeof name === 'string') {
      const t = name.trim();
      if (t.length > 0) next.name = t.slice(0, 64);
    }
    const skin = raw['skin'];
    if (typeof skin === 'string' && skin.trim().length > 0) {
      next.skin = skin.trim().slice(0, 48);
    }
    const color = raw['color'];
    if (typeof color === 'string') {
      const c = color.trim();
      if (c.length > 0 && c.length <= 32) next.color = c;
    }
    const personality = raw['personality'];
    if (
      typeof personality === 'string' &&
      PET_PERSONALITIES.includes(
        personality as AssistantPetConfig['personality'],
      )
    ) {
      next.personality = personality as AssistantPetConfig['personality'];
    }
    const animationSpeed = raw['animationSpeed'];
    if (
      typeof animationSpeed === 'number' &&
      Number.isFinite(animationSpeed)
    ) {
      next.animationSpeed = clampNumber(animationSpeed, 0.25, 6);
    }
    const autoOpen = raw['autoOpen'];
    if (typeof autoOpen === 'boolean') next.autoOpen = autoOpen;
    const soundEnabled = raw['soundEnabled'];
    if (typeof soundEnabled === 'boolean') next.soundEnabled = soundEnabled;
    const bubbleSize = raw['bubbleSize'];
    if (
      typeof bubbleSize === 'string' &&
      PET_BUBBLE_SIZES.includes(
        bubbleSize as AssistantPetConfig['bubbleSize'],
      )
    ) {
      next.bubbleSize = bubbleSize as AssistantPetConfig['bubbleSize'];
    }
    const opacity = raw['opacity'];
    if (typeof opacity === 'number' && Number.isFinite(opacity)) {
      next.opacity = Math.round(clampNumber(opacity, 0, 100));
    }

    return next;
  }
}
