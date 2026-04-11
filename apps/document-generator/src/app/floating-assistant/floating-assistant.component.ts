import {
  Component,
  inject,
  HostListener,
  ElementRef,
  ViewChild,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AssistantContextService,
  AssistantPetConfig,
} from '../services/assistant-context.service';
import { FormControl, ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-floating-assistant',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styles: [
    `
      .pet-bubble {
        position: fixed;
        width: 70px;
        height: 70px;
        border-radius: 50%;
        cursor: pointer;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        transition:
          transform 0.2s,
          box-shadow 0.2s;
        user-select: none;
        overflow: hidden;
      }

      .pet-bubble:hover {
        transform: scale(1.15);
      }

      .pet-bubble.dragging {
        opacity: 0.7;
        cursor: grabbing;
      }

      .pet-face {
        font-size: 32px;
        line-height: 1;
      }

      .assistant-window {
        position: fixed;
        width: 400px;
        height: 580px;
        background: white;
        border-radius: 20px;
        box-shadow: 0 25px 80px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        transition:
          height 0.2s ease,
          width 0.2s ease;
      }

      .assistant-window.minimized {
        height: 56px;
        width: 280px;
        overflow: hidden;
      }

      .window-header {
        background: linear-gradient(
          135deg,
          var(--pet-color, #667eea) 0%,
          #764ba2 100%
        );
        color: white;
        padding: 14px 18px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .config-panel {
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
        padding: 16px;
        max-height: 220px;
        overflow-y: auto;
      }

      .config-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
      }

      .messages-container {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        background: #f8fafc;
      }

      .message {
        margin-bottom: 12px;
        max-width: 82%;
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

      @keyframes pet-bounce {
        0%,
        100% {
          transform: translateY(0) rotate(0deg);
        }
        25% {
          transform: translateY(-8px) rotate(-3deg);
        }
        75% {
          transform: translateY(-4px) rotate(3deg);
        }
      }

      @keyframes pet-idle {
        0%,
        100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
        }
      }

      .animate-idle {
        animation: pet-idle 3s ease-in-out infinite;
      }

      .animate-bounce {
        animation: pet-bounce 1s ease-in-out infinite;
      }

      .skin-option {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        cursor: pointer;
        border: 2px solid transparent;
        transition: all 0.2s;
      }

      .skin-option:hover {
        border-color: #cbd5e1;
      }

      .skin-option.active {
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
      }

      .color-picker {
        width: 36px;
        height: 36px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        padding: 0;
        overflow: hidden;
      }
    `,
  ],
  template: `
    @if (!assistantService.isOpen$()) {
      <div
        class="pet-bubble animate-idle"
        [style.left.px]="assistantService.position$().x"
        [style.top.px]="assistantService.position$().y"
        [style.background]="
          'linear-gradient(135deg, ' +
          assistantService.petConfig$().color +
          ' 0%, #764ba2 100%)'
        "
        [style.opacity.%]="assistantService.petConfig$().opacity"
        [style.box-shadow]="
          '0 10px 25px ' + assistantService.petConfig$().color + '66'
        "
        (click)="assistantService.toggleAssistant()"
        (mousedown)="startDrag($event)"
        (contextmenu)="toggleConfig($event)"
        [class.dragging]="isDragging"
      >
        <span
          class="pet-face animate-bounce"
          [style.animation-duration.s]="
            2 / assistantService.petConfig$().animationSpeed
          "
        >
          {{ getPetFace() }}
        </span>
      </div>
    }

    @if (assistantService.isOpen$()) {
      <div
        class="assistant-window"
        [class.minimized]="isMinimized"
        [style.left.px]="assistantService.position$().x"
        [style.top.px]="assistantService.position$().y"
        [style.--pet-color]="assistantService.petConfig$().color"
      >
        <div class="window-header" (mousedown)="startDrag($event)">
          <div class="flex items-center space-x-3">
            <span class="text-2xl">{{ getPetFace() }}</span>
            <span class="font-semibold">{{
              assistantService.petConfig$().name
            }}</span>
            <span class="context-badge">{{
              assistantService.context$().activeTab | uppercase
            }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <button
              (click)="isMinimized = !isMinimized"
              class="text-white/80 hover:text-white"
              title="Minimizar"
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
                  d="M20 12H4"
                />
              </svg>
            </button>
            <button
              (click)="showConfig = !showConfig"
              class="text-white/80 hover:text-white"
              title="Configuración"
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
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
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

        @if (!isMinimized) {
          <!-- Config Panel -->
          @if (showConfig) {
            <div class="config-panel">
              <h4 class="font-semibold text-slate-800 mb-3">
                ⚙️ Configuración de {{ assistantService.petConfig$().name }}
              </h4>

              <div class="config-row">
                <label class="text-sm text-slate-600"
                  >Velocidad animación</label
                >
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  [value]="assistantService.petConfig$().animationSpeed"
                  (change)="
                    updateConfig('animationSpeed', +$any($event.target).value)
                  "
                  class="w-28"
                />
              </div>

              <div class="config-row">
                <label class="text-sm text-slate-600">Apariencia</label>
                <div class="flex space-x-2">
                  @for (skin of availableSkins; track skin.id) {
                    <button
                      class="skin-option"
                      [class.active]="
                        assistantService.petConfig$().skin === skin.id
                      "
                      (click)="updateConfig('skin', skin.id)"
                      [style.background]="skin.bg"
                    >
                      {{ skin.emoji }}
                    </button>
                  }
                </div>
              </div>

              <div class="config-row">
                <label class="text-sm text-slate-600">Color</label>
                <input
                  type="color"
                  class="color-picker"
                  [value]="assistantService.petConfig$().color"
                  (change)="updateConfig('color', $any($event.target).value)"
                />
              </div>

              <div class="config-row">
                <label class="text-sm text-slate-600">Personalidad</label>
                <select
                  [value]="assistantService.petConfig$().personality"
                  (change)="
                    updateConfig('personality', $any($event.target).value)
                  "
                  class="px-2 py-1 border border-slate-300 rounded text-sm"
                >
                  <option value="friendly">😊 Amigable</option>
                  <option value="professional">💼 Profesional</option>
                  <option value="humorous">😄 Divertido</option>
                  <option value="minimal">⚪ Minimalista</option>
                </select>
              </div>

              <div class="config-row">
                <label class="text-sm text-slate-600">Opacidad</label>
                <input
                  type="range"
                  min="30"
                  max="100"
                  step="5"
                  [value]="assistantService.petConfig$().opacity"
                  (change)="updateConfig('opacity', +$any($event.target).value)"
                  class="w-28"
                />
              </div>
             </div>
           }
         }

         @if (!isMinimized) {
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
              placeholder="Pregunta cualquier cosa a {{
                assistantService.petConfig$().name
              }}..."
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
          }
   `,
})
export class FloatingAssistantComponent implements OnInit {
  readonly assistantService = inject(AssistantContextService);
  readonly messageInput = new FormControl('');

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  isDragging = false;
  showConfig = false;
  isMinimized = false;
  private dragOffset = { x: 0, y: 0 };

  availableSkins = [
    { id: 'default', emoji: '🤖', bg: '#667eea' },
    { id: 'cat', emoji: '🐱', bg: '#f59e0b' },
    { id: 'dog', emoji: '🐶', bg: '#10b981' },
    { id: 'fox', emoji: '🦊', bg: '#ef4444' },
    { id: 'owl', emoji: '🦉', bg: '#8b5cf6' },
    { id: 'robot', emoji: '🤖', bg: '#64748b' },
    { id: 'alien', emoji: '👽', bg: '#22c55e' },
    { id: 'unicorn', emoji: '🦄', bg: '#ec4899' },
  ];

  quickActions = ['¿Qué veo?', 'Revisar contenido', 'Sugerencias', 'Errores'];

  ngOnInit(): void {
    this.assistantService.loadSavedConfig();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.isDragging) {
      this.assistantService.setPosition(
        Math.max(
          0,
          Math.min(window.innerWidth - 70, event.clientX - this.dragOffset.x),
        ),
        Math.max(
          0,
          Math.min(window.innerHeight - 70, event.clientY - this.dragOffset.y),
        ),
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

  toggleConfig(event: MouseEvent): void {
    event.preventDefault();
    this.showConfig = !this.showConfig;
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

  updateConfig<K extends keyof AssistantPetConfig>(
    key: K,
    value: AssistantPetConfig[K],
  ): void {
    this.assistantService.updatePetConfig({ [key]: value });
  }

  getPetFace(): string {
    const skin = this.availableSkins.find(
      (s) => s.id === this.assistantService.petConfig$().skin,
    );
    return skin?.emoji || '🤖';
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      this.messagesContainer.nativeElement.scrollTop =
        this.messagesContainer.nativeElement.scrollHeight;
    }
  }

  private getResponse(message: string): string {
    const ctx = this.assistantService.context$();
    const personality = this.assistantService.petConfig$().personality;

    const responses: Record<string, Record<string, string>> = {
      friendly: {
        '¿Qué veo?': `¡Hola! Estoy viendo que estás en la pestaña ${ctx.activeTab}. ${ctx.documentType ? `Tienes un documento de tipo "${ctx.documentType}" abierto.` : ''} ¿En qué puedo ayudarte hoy? 😊`,
        'Revisar contenido': `¡Claro! Estoy analizando tu documento. Veo ${ctx.documentContent.length} caracteres de contenido. Te recomiendo revisar: 1) Resumen ejecutivo 2) Precios detallados 3) Llamada a la acción. ¡Tienes muy buena pinta! ✨`,
        Sugerencias: `¡Genial! Basándome en tu contenido actual, te sugiero: ✅ Añade un resumen ejecutivo claro ✅ Destaca tus valores diferenciales ✅ Incluye garantías ✅ Mejora la llamada final a la acción. ¡Lo harás genial! 💪`,
        Errores: `¡No te preocupes! No he detectado errores críticos en tu documento. Solo te recomiendo revisar la ortografía y asegurarte de que todos los campos estén completos. ¡Está casi perfecto! 🌟`,
      },
      professional: {
        '¿Qué veo?': `Contexto actual: Pestaña ${ctx.activeTab}. Tipo documento: ${ctx.documentType || 'No seleccionado'}. Longitud: ${ctx.documentContent.length} caracteres. Listo para asistirte.`,
        'Revisar contenido': `Análisis completo realizado. Se detectan ${ctx.documentContent.length} caracteres. Recomendaciones: 1) Resumen ejecutivo 2) Estructura de precios 3) Llamada a la acción final.`,
        Sugerencias: `Recomendaciones prioritarias: 1. Resumen ejecutivo 2. Valores diferenciales 3. Garantías 4. Llamada a la acción. Implementar estas mejoras incrementará la efectividad un 35%.`,
        Errores: `No se detectan errores críticos. Se recomienda revisión ortográfica y verificación de campos obligatorios. Documento apto para su uso.`,
      },
      humorous: {
        '¿Qué veo?': `¡Hey! Estoy en ${ctx.activeTab} vigilando todo. ${ctx.documentType ? `Tienes un ${ctx.documentType} entre manos, ¡qué chulo!` : ''} ¿Qué trastada tienes hoy? 😎`,
        'Revisar contenido': `¡Muy bien! Leí todo tu texto. ¡Vaya crack! Solo te faltan estas cosillas: 1) Un resumen que mate 2) Precios que no asusten 3) Un final que les deje con la boca abierta. ¡Tú puedes! 🚀`,
        Sugerencias: `¡Aquí van los trucos del maestro! ✅ Mete un resumen que les deje boquiabiertos ✅ Diles por qué tu eres el mejor ✅ Añade alguna garantía para que se queden tranquilos ✅ Termina con un golpe de efecto. ¡A por ellos! 🎯`,
        Errores: `¡Tranquilo/a! Nada grave. Solo un par de erratas por aquí y por allá, nada que no se arregle en dos segundos. ¡Tu documento esta de muerte! 💯`,
      },
      minimal: {
        '¿Qué veo?': `${ctx.activeTab}. ${ctx.documentType || 'Sin tipo'}. ${ctx.documentContent.length} chars.`,
        'Revisar contenido': `Contenido detectado. Revisar: resumen, precios, CTA.`,
        Sugerencias: `Añadir: resumen, diferenciadores, garantías, CTA.`,
        Errores: `Sin errores críticos. Revisar ortografía.`,
      },
    };

    const perResponses = responses[personality] || responses['friendly'];
    return (
      perResponses[message] ||
      `He recibido tu mensaje: "${message}". Procesando contexto de ${ctx.activeTab}.`
    );
  }
}
