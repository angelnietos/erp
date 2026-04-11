import {
  Component,
  inject,
  HostListener,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssistantContextService } from '../services/assistant-context.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-floating-assistant',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styles: [
    `
      .assistant-bubble {
        position: fixed;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
        cursor: pointer;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        transition:
          transform 0.2s,
          box-shadow 0.2s;
        user-select: none;
      }

      .assistant-bubble:hover {
        transform: scale(1.1);
        box-shadow: 0 15px 35px rgba(102, 126, 234, 0.5);
      }

      .assistant-bubble.dragging {
        opacity: 0.8;
        cursor: grabbing;
      }

      .assistant-window {
        position: fixed;
        width: 380px;
        height: 520px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .window-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 12px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .messages-container {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        background: #f8fafc;
      }

      .message {
        margin-bottom: 12px;
        max-width: 80%;
        padding: 10px 14px;
        border-radius: 18px;
        font-size: 14px;
        line-height: 1.4;
      }

      .message.user {
        margin-left: auto;
        background: #2563eb;
        color: white;
        border-bottom-right-radius: 4px;
      }

      .message.assistant {
        margin-right: auto;
        background: white;
        border: 1px solid #e2e8f0;
        border-bottom-left-radius: 4px;
      }

      .message.system {
        margin: 0 auto;
        background: #f1f5f9;
        color: #64748b;
        font-size: 12px;
        text-align: center;
        padding: 6px 12px;
      }

      .input-area {
        padding: 12px;
        border-top: 1px solid #e2e8f0;
        background: white;
      }

      .context-badge {
        font-size: 10px;
        padding: 2px 6px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 4px;
      }

      @keyframes bounce {
        0%,
        100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-5px);
        }
      }

      .animate-bounce {
        animation: bounce 1s ease-in-out infinite;
      }
    `,
  ],
  template: `
    @if (!assistantService.isOpen$()) {
      <div
        class="assistant-bubble"
        [style.left.px]="assistantService.position$().x"
        [style.top.px]="assistantService.position$().y"
        (click)="assistantService.toggleAssistant()"
        (mousedown)="startDrag($event)"
        [class.dragging]="isDragging"
      >
        <svg
          class="w-7 h-7 text-white animate-bounce"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </div>
    }

    @if (assistantService.isOpen$()) {
      <div
        class="assistant-window"
        [style.left.px]="assistantService.position$().x"
        [style.top.px]="assistantService.position$().y"
      >
        <div class="window-header" (mousedown)="startDrag($event)">
          <div class="flex items-center space-x-2">
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span class="font-semibold">Asistente Inteligente</span>
            <span class="context-badge">{{
              assistantService.context$().activeTab | uppercase
            }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <button
              (click)="askContext()"
              class="text-white/80 hover:text-white"
              title="¿Qué sabes?"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
            <button
              (click)="assistantService.toggleAssistant()"
              class="text-white/80 hover:text-white"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div class="messages-container" #messagesContainer>
          @for (msg of assistantService.messages$(); track msg.id) {
            <div class="message" [class]="msg.type">
              @if (msg.context && msg.type !== 'system') {
                <span class="text-xs opacity-60 block mb-1"
                  >[{{ msg.context }}]</span
                >
              }
              {{ msg.content }}
            </div>
          }
        </div>

        <div class="px-4 py-2 bg-slate-50 border-t border-slate-200">
          <div class="flex flex-wrap gap-1">
            @for (action of quickActions; track $index) {
              <button
                (click)="sendQuickAction(action)"
                class="px-2 py-1 text-xs bg-white border border-slate-200 rounded hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
              >
                {{ action }}
              </button>
            }
          </div>
        </div>

        <div class="input-area flex space-x-2">
          <input
            type="text"
            [formControl]="messageInput"
            (keydown.enter)="sendMessage()"
            placeholder="Pregunta cualquier cosa..."
            class="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            (click)="sendMessage()"
            class="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>
    }
  `,
})
export class FloatingAssistantComponent {
  readonly assistantService = inject(AssistantContextService);
  readonly messageInput = new FormControl('');

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  isDragging = false;
  private dragOffset = { x: 0, y: 0 };

  quickActions = ['¿Qué veo?', 'Revisar contenido', 'Sugerencias', 'Errores'];

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.isDragging) {
      this.assistantService.setPosition(
        event.clientX - this.dragOffset.x,
        event.clientY - this.dragOffset.y,
      );
    }
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    this.isDragging = false;
  }

  startDrag(event: MouseEvent): void {
    this.isDragging = true;
    const pos = this.assistantService.position$();
    this.dragOffset = {
      x: event.clientX - pos.x,
      y: event.clientY - pos.y,
    };
    event.preventDefault();
  }

  sendMessage(): void {
    const message = this.messageInput.value?.trim();
    if (!message) return;

    this.assistantService.addMessage(message, 'user');
    this.messageInput.reset();

    setTimeout(() => {
      this.scrollToBottom();
      this.assistantService.addMessage(this.getResponse(message), 'assistant');
      setTimeout(() => this.scrollToBottom(), 100);
    }, 800);
  }

  sendQuickAction(action: string): void {
    this.messageInput.setValue(action);
    this.sendMessage();
  }

  askContext(): void {
    this.assistantService.addSystemMessage('El asistente conoce:');
    this.assistantService.addMessage(
      this.assistantService.getFullContext(),
      'assistant',
    );
    setTimeout(() => this.scrollToBottom(), 100);
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      this.messagesContainer.nativeElement.scrollTop =
        this.messagesContainer.nativeElement.scrollHeight;
    }
  }

  private getResponse(message: string): string {
    const ctx = this.assistantService.context$();

    const responses: Record<string, string> = {
      '¿Qué veo?': `Estoy viendo que estás en la pestaña ${ctx.activeTab}. ${ctx.documentType ? `Tienes un documento de tipo "${ctx.documentType}" abierto.` : ''} Puedo ayudarte con cualquier cosa que necesites.`,
      'Revisar contenido': `Estoy analizando tu documento. Veo ${ctx.documentContent.length} caracteres de contenido. Te recomiendo revisar: 1) Resumen ejecutivo 2) Precios detallados 3) Llamada a la acción.`,
      Sugerencias: `Basándome en tu contenido actual, te sugiero: ✅ Añade un resumen ejecutivo claro ✅ Destaca tus valores diferenciales ✅ Incluye garantías ✅ Mejora la llamada final a la acción.`,
      Errores: `No he detectado errores críticos en tu documento. Solo te recomiendo revisar la ortografía y asegurarte de que todos los campos estén completos.`,
    };

    return (
      responses[message] ||
      `He recibido tu mensaje: "${message}". Estoy procesando el contexto actual de la pestaña ${ctx.activeTab} y te responderé en breve.`
    );
  }
}
