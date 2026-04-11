import { Injectable, signal } from '@angular/core';

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

  readonly context$ = this.context.asReadonly();
  readonly messages$ = this.messages.asReadonly();
  readonly isOpen$ = this.isOpen.asReadonly();
  readonly position$ = this.position.asReadonly();

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

  setPosition(x: number, y: number): void {
    this.position.set({ x, y });
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
}
