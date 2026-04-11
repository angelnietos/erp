import {
  Component,
  inject,
  signal,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, Send, Bot, User, Sparkles } from 'lucide-angular';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'suggestion' | 'template' | 'question';
  actions?: MessageAction[];
}

interface MessageAction {
  label: string;
  action: () => void;
}

@Component({
  selector: 'app-document-bot',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="flex flex-col h-full max-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-white border-b border-gray-200 px-6 py-4">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center"
          >
            <lucide-icon
              [img]="BotIcon"
              class="w-6 h-6 text-white"
            ></lucide-icon>
          </div>
          <div>
            <h1 class="text-lg font-semibold text-gray-900">
              Asistente de Documentos
            </h1>
            <p class="text-sm text-gray-500">
              Tu ayudante para crear documentos profesionales
            </p>
          </div>
        </div>
      </div>

      <!-- Messages Container -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4" #messagesContainer>
        <div
          *ngFor="let message of messages()"
          class="flex gap-3"
          [class]="message.sender === 'user' ? 'justify-end' : 'justify-start'"
        >
          <!-- Bot Avatar -->
          <div
            *ngIf="message.sender === 'bot'"
            class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0"
          >
            <lucide-icon
              [img]="BotIcon"
              class="w-4 h-4 text-white"
            ></lucide-icon>
          </div>

          <!-- Message Content -->
          <div class="max-w-[70%]">
            <div
              class="rounded-2xl px-4 py-3 shadow-sm"
              [class]="
                message.sender === 'user'
                  ? 'bg-blue-500 text-white rounded-br-md'
                  : 'bg-white text-gray-900 rounded-bl-md border border-gray-200'
              "
            >
              <!-- Message Text -->
              <p class="text-sm leading-relaxed whitespace-pre-wrap">
                {{ message.content }}
              </p>

              <!-- Actions -->
              <div
                *ngIf="message.actions && message.actions.length > 0"
                class="mt-3 space-y-2"
              >
                <button
                  *ngFor="let action of message.actions"
                  (click)="action.action()"
                  class="block w-full text-left px-3 py-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                  [class]="
                    message.sender === 'user'
                      ? 'text-blue-600'
                      : 'text-gray-700'
                  "
                >
                  {{ action.label }}
                </button>
              </div>
            </div>

            <!-- Timestamp -->
            <p class="text-xs text-gray-400 mt-1 px-2">
              {{ message.timestamp | date: 'shortTime' }}
            </p>
          </div>

          <!-- User Avatar -->
          <div
            *ngIf="message.sender === 'user'"
            class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0"
          >
            <lucide-icon
              [img]="UserIcon"
              class="w-4 h-4 text-gray-600"
            ></lucide-icon>
          </div>
        </div>

        <!-- Typing Indicator -->
        <div *ngIf="isTyping()" class="flex gap-3 justify-start">
          <div
            class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center"
          >
            <lucide-icon
              [img]="BotIcon"
              class="w-4 h-4 text-white"
            ></lucide-icon>
          </div>
          <div
            class="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-200"
          >
            <div class="flex space-x-1">
              <div
                class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              ></div>
              <div
                class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style="animation-delay: 0.1s"
              ></div>
              <div
                class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style="animation-delay: 0.2s"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="bg-white border-t border-gray-200 p-4">
        <div class="flex gap-3">
          <input
            type="text"
            [(ngModel)]="newMessage"
            (keyup.enter)="sendMessage()"
            placeholder="Pregúntame sobre documentos, plantillas, o contenido..."
            class="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            [disabled]="isTyping()"
          />

          <button
            (click)="sendMessage()"
            [disabled]="!newMessage.trim() || isTyping()"
            class="w-12 h-12 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
          >
            <lucide-icon
              [img]="SendIcon"
              class="w-5 h-5 text-white"
            ></lucide-icon>
          </button>
        </div>

        <!-- Quick Suggestions -->
        <div class="mt-3 flex flex-wrap gap-2">
          <button
            *ngFor="let suggestion of quickSuggestions"
            (click)="sendQuickMessage(suggestion)"
            class="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class DocumentBotComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  protected readonly BotIcon = Bot;
  protected readonly UserIcon = User;
  protected readonly SendIcon = Send;

  messages = signal<Message[]>([]);
  isTyping = signal(false);
  newMessage = '';

  quickSuggestions = [
    '¿Qué tipos de documentos puedo crear?',
    'Ayúdame con un presupuesto',
    'Necesito una plantilla de documentación',
    '¿Cómo estructurar un documento profesional?',
  ];

  private router = inject(Router);

  constructor() {
    this.initializeBot();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private initializeBot() {
    const welcomeMessage: Message = {
      id: 'welcome',
      content:
        '¡Hola! Soy tu asistente para la creación de documentos. Puedo ayudarte con:\n\n• Crear presupuestos profesionales\n• Generar documentación técnica\n• Sugerir contenido y plantillas\n• Responder preguntas sobre formatos\n\n¿Qué tipo de documento necesitas crear hoy?',
      sender: 'bot',
      timestamp: new Date(),
      actions: [
        {
          label: 'Crear un presupuesto',
          action: () => this.suggestQuoteCreation(),
        },
        {
          label: 'Crear documentación',
          action: () => this.suggestDocumentationCreation(),
        },
      ],
    };

    this.messages.set([welcomeMessage]);
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: this.newMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    this.messages.update((msgs) => [...msgs, userMessage]);
    this.newMessage = '';

    this.processUserMessage(userMessage.content);
  }

  sendQuickMessage(message: string) {
    this.newMessage = message;
    this.sendMessage();
  }

  private async processUserMessage(content: string) {
    this.isTyping.set(true);

    // Simulate processing time
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 2000),
    );

    const response = this.generateBotResponse(content);
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: response.content,
      sender: 'bot',
      timestamp: new Date(),
      actions: response.actions,
    };

    this.messages.update((msgs) => [...msgs, botMessage]);
    this.isTyping.set(false);
  }

  private generateBotResponse(userMessage: string): {
    content: string;
    actions?: MessageAction[];
  } {
    const message = userMessage.toLowerCase();

    if (
      message.includes('presupuesto') ||
      message.includes('quote') ||
      message.includes('cotización')
    ) {
      return {
        content:
          '¡Perfecto! Para crear un presupuesto profesional, necesitas:\n\n1. Información del cliente\n2. Detalles del proyecto\n3. Monto total\n4. Descripción detallada\n\n¿Te ayudo a completar el formulario?',
        actions: [
          {
            label: 'Sí, vamos al formulario',
            action: () => this.navigateToCreate('quote'),
          },
          {
            label: 'Necesito consejos primero',
            action: () => this.showQuoteTips(),
          },
        ],
      };
    }

    if (
      message.includes('documentación') ||
      message.includes('document') ||
      message.includes('manual')
    ) {
      return {
        content:
          'Para documentación técnica, es importante incluir:\n\n• Título claro y descriptivo\n• Introducción del propósito\n• Contenido estructurado\n• Conclusiones\n\n¿Quieres que te ayude a crear uno?',
        actions: [
          {
            label: 'Crear documentación',
            action: () => this.navigateToCreate('documentation'),
          },
          {
            label: 'Ver ejemplos',
            action: () => this.showDocumentationExamples(),
          },
        ],
      };
    }

    if (
      message.includes('tipo') ||
      message.includes('tipos') ||
      message.includes('qué puedo')
    ) {
      return {
        content:
          'Puedes crear diferentes tipos de documentos:\n\n📄 **Presupuestos**: Para cotizaciones de proyectos\n📋 **Documentación**: Manuales técnicos, guías de usuario\n📊 **Informes**: Análisis y reportes\n\n¿Cuál te interesa?',
        actions: [
          {
            label: 'Presupuestos',
            action: () => this.suggestQuoteCreation(),
          },
          {
            label: 'Documentación',
            action: () => this.suggestDocumentationCreation(),
          },
        ],
      };
    }

    if (
      message.includes('plantilla') ||
      message.includes('template') ||
      message.includes('ejemplo')
    ) {
      return {
        content:
          'Tengo plantillas predefinidas para diferentes tipos de documentos. Puedo sugerirte contenido basado en tu proyecto.\n\n¿Para qué tipo de documento necesitas una plantilla?',
        actions: [
          {
            label: 'Plantilla de presupuesto',
            action: () => this.showQuoteTemplate(),
          },
          {
            label: 'Plantilla de documentación',
            action: () => this.showDocumentationTemplate(),
          },
        ],
      };
    }

    // Default response
    return {
      content:
        'Entiendo que necesitas ayuda con documentos. Puedo asistirte con:\n\n• Creación de presupuestos\n• Redacción de documentación\n• Consejos de formato profesional\n• Sugerencias de contenido\n\n¿En qué específicamente te puedo ayudar?',
      actions: [
        {
          label: 'Ver tipos de documentos',
          action: () => this.showDocumentTypes(),
        },
        {
          label: 'Ir al creador',
          action: () => this.navigateToCreate(),
        },
      ],
    };
  }

  private suggestQuoteCreation() {
    const message: Message = {
      id: Date.now().toString(),
      content:
        '¡Vamos a crear un presupuesto!\n\nTe recomiendo incluir:\n• Datos del cliente\n• Descripción detallada del proyecto\n• Monto total claro\n• Condiciones de pago\n\n¿Comenzamos?',
      sender: 'bot',
      timestamp: new Date(),
      actions: [
        {
          label: 'Crear presupuesto ahora',
          action: () => this.navigateToCreate('quote'),
        },
      ],
    };
    this.messages.update((msgs) => [...msgs, message]);
  }

  private suggestDocumentationCreation() {
    const message: Message = {
      id: Date.now().toString(),
      content:
        '¡Excelente para documentación!\n\nEstructura recomendada:\n• Título y propósito\n• Índice de contenidos\n• Secciones claras\n• Conclusiones\n\n¿Empezamos a crear?',
      sender: 'bot',
      timestamp: new Date(),
      actions: [
        {
          label: 'Crear documentación ahora',
          action: () => this.navigateToCreate('documentation'),
        },
      ],
    };
    this.messages.update((msgs) => [...msgs, message]);
  }

  private showQuoteTips() {
    const message: Message = {
      id: Date.now().toString(),
      content:
        '💡 **Consejos para presupuestos efectivos:**\n\n• Sé específico en la descripción\n• Incluye todos los costos\n• Define claramente los plazos\n• Agrega términos y condiciones\n• Usa un tono profesional\n\n¿Listo para crear uno?',
      sender: 'bot',
      timestamp: new Date(),
      actions: [
        {
          label: 'Crear presupuesto',
          action: () => this.navigateToCreate('quote'),
        },
      ],
    };
    this.messages.update((msgs) => [...msgs, message]);
  }

  private showDocumentationExamples() {
    const message: Message = {
      id: Date.now().toString(),
      content:
        '📚 **Ejemplos de documentación:**\n\n• Manuales de usuario\n• Guías técnicas\n• Especificaciones de proyecto\n• Documentos de proceso\n• Reportes de análisis\n\n¿Qué tipo necesitas?',
      sender: 'bot',
      timestamp: new Date(),
      actions: [
        {
          label: 'Crear uno ahora',
          action: () => this.navigateToCreate('documentation'),
        },
      ],
    };
    this.messages.update((msgs) => [...msgs, message]);
  }

  private showQuoteTemplate() {
    const message: Message = {
      id: Date.now().toString(),
      content:
        '📋 **Plantilla de Presupuesto:**\n\n**Cliente:** [Nombre del cliente]\n**Proyecto:** [Descripción del proyecto]\n**Alcance:** [Qué incluye]\n**Monto Total:** [Cantidad]\n**Plazo:** [Tiempo estimado]\n**Condiciones:** [Términos de pago]\n\n¿Quieres usar esta plantilla?',
      sender: 'bot',
      timestamp: new Date(),
      actions: [
        {
          label: 'Usar esta plantilla',
          action: () => this.navigateToCreate('quote'),
        },
      ],
    };
    this.messages.update((msgs) => [...msgs, message]);
  }

  private showDocumentationTemplate() {
    const message: Message = {
      id: Date.now().toString(),
      content:
        '📄 **Estructura de Documentación:**\n\n1. **Portada**\n   - Título\n   - Autor\n   - Fecha\n   - Versión\n\n2. **Índice**\n\n3. **Introducción**\n   - Propósito\n   - Alcance\n\n4. **Contenido Principal**\n   - Secciones detalladas\n\n5. **Conclusiones**\n\n¿Te ayudo a crear uno?',
      sender: 'bot',
      timestamp: new Date(),
      actions: [
        {
          label: 'Crear con esta estructura',
          action: () => this.navigateToCreate('documentation'),
        },
      ],
    };
    this.messages.update((msgs) => [...msgs, message]);
  }

  private showDocumentTypes() {
    const message: Message = {
      id: Date.now().toString(),
      content:
        '📑 **Tipos de Documentos Disponibles:**\n\n• **Presupuestos**: Cotizaciones profesionales\n• **Documentación**: Manuales y guías\n• **Informes**: Análisis y reportes\n\nCada tipo tiene su propia plantilla optimizada.',
      sender: 'bot',
      timestamp: new Date(),
      actions: [
        {
          label: 'Presupuestos',
          action: () => this.suggestQuoteCreation(),
        },
        {
          label: 'Documentación',
          action: () => this.suggestDocumentationCreation(),
        },
      ],
    };
    this.messages.update((msgs) => [...msgs, message]);
  }

  private navigateToCreate(type?: string) {
    this.router.navigate(['/documents/create']);
  }

  private scrollToBottom() {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }
}
