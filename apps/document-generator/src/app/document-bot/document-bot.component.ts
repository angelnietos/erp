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
import { LucideAngularModule } from 'lucide-angular';

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
    <div
      class="flex flex-col h-full max-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
    >
      <!-- Header -->
      <div
        class="bg-surface/80 backdrop-blur-lg shadow-lg border-b border-soft/50 px-6 py-5 sticky top-0 z-10"
      >
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 bg-gradient-to-r from-brand to-brand rounded-2xl flex items-center justify-center shadow-lg"
          >
            <lucide-icon name="bot" size="28" class="text-white"></lucide-icon>
          </div>
          <div>
            <h1
              class="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent"
            >
              Asistente IA de Documentos
            </h1>
            <p class="text-sm text-secondary font-medium">
              Tu compañero inteligente para crear documentos profesionales
            </p>
          </div>
        </div>
      </div>

      <!-- Messages Container -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6" #messagesContainer>
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
              name="bot"
              size="16"
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
                  : 'doc-chat-bubble-bot rounded-2xl rounded-bl-md'
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
                  class="block w-full text-left px-3 py-2 text-xs bg-tertiary hover:bg-gray-100 rounded-lg border border-soft transition-colors"
                  [class]="
                    message.sender === 'user'
                      ? 'text-blue-600'
                      : 'text-doc-muted-on-light'
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
              name="user"
              size="16"
              class="w-4 h-4 text-secondary"
            ></lucide-icon>
          </div>
        </div>

        <!-- Typing Indicator -->
        <div *ngIf="isTyping()" class="flex gap-3 justify-start">
          <div
            class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center"
          >
            <lucide-icon
              name="bot"
              size="16"
              class="w-4 h-4 text-white"
            ></lucide-icon>
          </div>
          <div
            class="doc-chat-bubble-bot rounded-2xl rounded-bl-md px-4 py-3 shadow-sm"
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
      <div
        class="bg-surface/80 backdrop-blur-lg border-t border-soft/50 p-6"
      >
        <!-- Quick Suggestions -->
        <div class="mb-4 flex flex-wrap gap-3">
          <button
            *ngFor="let suggestion of quickSuggestions"
            (click)="sendQuickMessage(suggestion)"
            class="px-4 py-2 text-sm bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 border border-blue-200 rounded-xl transition-all duration-200 hover:shadow-md font-medium"
          >
            {{ suggestion }}
          </button>
        </div>

        <div class="flex gap-3">
          <div class="flex-1 relative">
            <input
              type="text"
              [(ngModel)]="newMessage"
              (keyup.enter)="sendMessage()"
              placeholder="Pregúntame sobre documentos, plantillas, diagramas..."
              class="w-full px-6 py-4 pr-12 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-surface shadow-sm"
              [disabled]="isTyping()"
            />
            <div
              class="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400"
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.963 8.963 0 01-5.586-2.068A8.963 8.963 0 015 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"
                />
              </svg>
            </div>
          </div>

          <button
            (click)="sendMessage()"
            [disabled]="!newMessage.trim() || isTyping()"
            class="px-6 py-4 bg-gradient-to-r from-brand to-brand hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none flex items-center space-x-2 font-medium"
          >
            <span>{{ isTyping() ? 'Pensando...' : 'Enviar' }}</span>
            <lucide-icon name="send" size="20" class="w-5 h-5"></lucide-icon>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class DocumentBotComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  messages = signal<Message[]>([]);
  isTyping = signal(false);
  newMessage = '';

  quickSuggestions = [
    '¿Qué tipos de documentos puedo crear?',
    'Ayúdame con un presupuesto',
    'Crear una propuesta comercial',
    'Documentación arquitectónica',
    'Diagramas Mermaid',
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
      message.includes('propuesta') ||
      message.includes('comercial') ||
      message.includes('proposal')
    ) {
      return {
        content:
          '¡Excelente! Una propuesta comercial efectiva incluye:\n\n• Resumen ejecutivo atractivo\n• Objetivos claros\n• Alcance detallado del proyecto\n• Cronograma y entregables\n• Información de precios\n• Términos y condiciones\n\n¿Quieres que te guíe para crear una?',
        actions: [
          {
            label: 'Crear propuesta ahora',
            action: () => this.navigateToCreate('proposal'),
          },
          {
            label: 'Ver estructura recomendada',
            action: () => this.showProposalStructure(),
          },
        ],
      };
    }

    if (
      message.includes('arquitectura') ||
      message.includes('mermaid') ||
      message.includes('diagrama') ||
      message.includes('diagram')
    ) {
      return {
        content:
          '¡Genial! La documentación arquitectónica es fundamental. Puedo ayudarte con:\n\n• Diagramas de arquitectura (Mermaid)\n• Flujos de datos\n• Documentación de APIs\n• Especificaciones técnicas\n• Estrategias de despliegue\n\nLos diagramas Mermaid se renderizan automáticamente en la vista previa.',
        actions: [
          {
            label: 'Crear documentación arquitectónica',
            action: () => this.navigateToCreate('architecture'),
          },
          {
            label: 'Ver ejemplos de diagramas',
            action: () => this.showMermaidExamples(),
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
          'Puedes crear diferentes tipos de documentos:\n\n💰 **Presupuestos**: Cotizaciones profesionales para proyectos\n📋 **Propuestas Comerciales**: Documentos detallados para clientes\n📚 **Documentación Técnica**: Manuales y guías\n🏗️ **Documentación Arquitectónica**: Diagramas Mermaid y especificaciones técnicas\n\n¿Cuál te interesa?',
        actions: [
          {
            label: 'Presupuestos',
            action: () => this.suggestQuoteCreation(),
          },
          {
            label: 'Propuestas',
            action: () => this.suggestProposalCreation(),
          },
          {
            label: 'Documentación Técnica',
            action: () => this.suggestDocumentationCreation(),
          },
          {
            label: 'Arquitectura',
            action: () => this.suggestArchitectureCreation(),
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
        '📑 **Tipos de Documentos Disponibles:**\n\n• **Presupuestos**: Cotizaciones profesionales\n• **Propuestas Comerciales**: Documentos detallados para clientes\n• **Documentación Técnica**: Manuales y guías\n• **Documentación Arquitectónica**: Diagramas Mermaid y especificaciones\n\nCada tipo tiene su propia plantilla optimizada.',
      sender: 'bot',
      timestamp: new Date(),
      actions: [
        {
          label: 'Presupuestos',
          action: () => this.suggestQuoteCreation(),
        },
        {
          label: 'Propuestas',
          action: () => this.suggestProposalCreation(),
        },
        {
          label: 'Documentación Técnica',
          action: () => this.suggestDocumentationCreation(),
        },
        {
          label: 'Arquitectura',
          action: () => this.suggestArchitectureCreation(),
        },
      ],
    };
    this.messages.update((msgs) => [...msgs, message]);
  }

  private suggestProposalCreation() {
    const message: Message = {
      id: Date.now().toString(),
      content:
        '¡Vamos a crear una propuesta comercial impactante!\n\nTe recomiendo incluir:\n• Resumen ejecutivo convincente\n• Objetivos y alcance claros\n• Cronograma realista\n• Precios competitivos\n• Términos claros\n\n¿Comenzamos?',
      sender: 'bot',
      timestamp: new Date(),
      actions: [
        {
          label: 'Crear propuesta ahora',
          action: () => this.navigateToCreate('proposal'),
        },
      ],
    };
    this.messages.update((msgs) => [...msgs, message]);
  }

  private suggestArchitectureCreation() {
    const message: Message = {
      id: Date.now().toString(),
      content:
        '¡Perfecto para documentación arquitectónica!\n\nIncluye:\n• Resumen del sistema\n• Diagramas de arquitectura (Mermaid)\n• Flujo de datos\n• APIs y endpoints\n• Tecnologías utilizadas\n• Estrategia de despliegue\n\nLos diagramas se renderizan automáticamente.',
      sender: 'bot',
      timestamp: new Date(),
      actions: [
        {
          label: 'Crear documentación arquitectónica',
          action: () => this.navigateToCreate('architecture'),
        },
      ],
    };
    this.messages.update((msgs) => [...msgs, message]);
  }

  private showProposalStructure() {
    const message: Message = {
      id: Date.now().toString(),
      content:
        '📋 **Estructura Recomendada para Propuestas:**\n\n1. **Portada**\n   - Título, cliente, fecha\n\n2. **Resumen Ejecutivo**\n   - Beneficios clave, ROI\n\n3. **Objetivos**\n   - Metas del proyecto\n\n4. **Alcance**\n   - Qué incluye/no incluye\n\n5. **Entregables**\n   - Resultados concretos\n\n6. **Cronograma**\n   - Hitos y fechas\n\n7. **Precios**\n   - Costos detallados\n\n8. **Términos**\n   - Condiciones legales\n\n¿Te ayudo a crear una?',
      sender: 'bot',
      timestamp: new Date(),
      actions: [
        {
          label: 'Crear con esta estructura',
          action: () => this.navigateToCreate('proposal'),
        },
      ],
    };
    this.messages.update((msgs) => [...msgs, message]);
  }

  private showMermaidExamples() {
    const message: Message = {
      id: Date.now().toString(),
      content:
        '🎨 **Ejemplos de Diagramas Mermaid:**\n\n**Diagrama de Arquitectura:**\n```\ngraph TD\n    A[Cliente Web] --> B[API Gateway]\n    B --> C[Servicio de Autenticación]\n    B --> D[Servicio de Documentos]\n    C --> E[Base de Datos PostgreSQL]\n    D --> E\n```\n\n**Flujo de Datos:**\n```\nsequenceDiagram\n    participant Usuario\n    participant API\n    participant DB\n    Usuario->>API: Solicitud\n    API->>DB: Consulta\n    DB-->>API: Resultados\n    API-->>Usuario: Respuesta\n```\n\n¿Quieres crear documentación con estos diagramas?',
      sender: 'bot',
      timestamp: new Date(),
      actions: [
        {
          label: 'Crear documentación ahora',
          action: () => this.navigateToCreate('architecture'),
        },
      ],
    };
    this.messages.update((msgs) => [...msgs, message]);
  }

  private navigateToCreate(type?: string) {
    void this.router.navigate(
      ['/documents/create'],
      type ? { queryParams: { type } } : {},
    );
  }

  private scrollToBottom() {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }
}
