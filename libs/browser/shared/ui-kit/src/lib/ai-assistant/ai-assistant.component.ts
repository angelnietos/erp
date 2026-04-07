import { Component, Input, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { Router } from '@angular/router';
import { AIBotStore, MasterFilterService } from '@josanz-erp/shared-data-access';
import { UIMascotComponent } from '../mascot/mascot.component';
import { UiButtonComponent } from '../button/button.component';
import { UiCardComponent } from '../card/card.component';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'ui-josanz-ai-assistant',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, UIMascotComponent, UiButtonComponent, UiCardComponent, FormsModule, DragDropModule],
  template: `
    <div class="ai-assistant-wrapper" *ngIf="bot() && bot()!.status === 'active'">
      <!-- Floating Mascot Bubble -->
      <div class="assistant-trigger" [class.open]="isOpen()" (click)="toggleChat()">
        <ui-josanz-mascot 
          [type]="bot()!.mascotType" 
          [color]="bot()!.color" 
          [personality]="bot()!.personality"
          [bodyShape]="bot()!.bodyShape"
          [eyesType]="bot()!.eyesType"
          [mouthType]="bot()!.mouthType"
        ></ui-josanz-mascot>
        <div class="notification-dot animate-pulse"></div>
      </div>

      <!-- Chat Window -->
      <div class="chat-window-container" *ngIf="isOpen()" cdkDrag cdkDragBoundary=".page-container" (click)="$event.stopPropagation()">
        <div class="chat-window animate-slide-up">
          <div class="chat-header" cdkDragHandle [style.border-bottom-color]="bot()!.color">
            <div class="bot-status-info">
              <lucide-icon name="grip-vertical" size="14" class="drag-handle-icon"></lucide-icon>
              <span class="status-indicator" [style.background]="bot()!.color"></span>
              <div>
                <h4>{{ bot()!.name }}</h4>
                <p>Tu asistente de {{ bot()!.feature }}</p>
              </div>
            </div>
            <button class="close-btn" (click)="isOpen.set(false)">
              <lucide-icon name="x" size="18"></lucide-icon>
            </button>
          </div>

          <div class="chat-messages">
            <div class="message bot-msg">
              <p>¡Hola! Soy {{ bot()!.name }}. Estoy analizando tus datos de {{ bot()!.feature }} en tiempo real. ¿En qué puedo ayudarte hoy?</p>
              <div class="bot-skills-badges">
                @for (skill of bot()!.activeSkills; track skill) {
                  <span class="skill-badge" [style.background]="bot()!.color + '22'" [style.color]="bot()!.color">
                    {{ skill }}
                  </span>
                }
              </div>
            </div>

            @for (msg of messages(); track msg.id) {
              <div class="message" [class.user-msg]="msg.role === 'user'" [class.bot-msg]="msg.role === 'bot'">
                <p>{{ msg.text }}</p>
              </div>
            }
          </div>

          <div class="chat-input-area">
            <input 
              type="text" 
              placeholder="Escribe aquí tu consulta..." 
              [(ngModel)]="currentInput"
              (keyup.enter)="sendMessage()"
            />
            <ui-josanz-button variant="filled" size="sm" (click)="sendMessage()">
              <lucide-icon name="send" size="16"></lucide-icon>
            </ui-josanz-button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ai-assistant-wrapper {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 10000; /* Higher than sidebar/header */
    }

    .assistant-trigger {
      width: 80px;
      height: 80px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      position: relative;
    }

    .assistant-trigger:hover {
      transform: scale(1.1) rotate(5deg);
    }

    .assistant-trigger.open {
      transform: scale(0.9) translate(-20px, -20px);
    }

    .notification-dot {
      position: absolute;
      top: 5px;
      right: 5px;
      width: 12px;
      height: 12px;
      background: var(--brand);
      border: 2px solid #000;
      border-radius: 50%;
    }

    .chat-window-container {
      position: absolute;
      bottom: 100px;
      right: 0;
      width: 400px;
      z-index: 10001;
    }

    .chat-window {
      padding: 0;
      display: flex;
      flex-direction: column;
      height: 550px;
      overflow: hidden;
      border-radius: 24px;
      box-shadow: 0 30px 60px rgba(0,0,0,0.8);
      background: rgba(15, 23, 42, 0.85) !important;
      backdrop-filter: blur(25px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .chat-layout-wrapper {
      display: flex;
      flex-direction: column;
      height: 100%;
      margin: -1.1rem; /* Neutralize card body padding */
    }

    .chat-header {
      flex-shrink: 0;
      padding: 1.5rem;
      background: rgba(255,255,255,0.05);
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid transparent;
      cursor: grab;
    }

    .chat-header:active {
      cursor: grabbing;
    }

    .drag-handle-icon {
      color: var(--text-muted);
      margin-right: 0.5rem;
      opacity: 0.5;
    }

    .bot-status-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .status-indicator {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      box-shadow: 0 0 15px currentColor;
    }

    .chat-header h4 { margin: 0; font-size: 1.1rem; color: #fff; font-weight: 800; }
    .chat-header p { margin: 0; font-size: 0.8rem; color: var(--text-muted); font-weight: 600; }

    .close-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 0.5rem;
      transition: color 0.3s;
    }

    .close-btn:hover { color: var(--danger); }

    .chat-messages {
      flex: 1;
      min-height: 0; /* CRITICO PARA QUE EL SCROLL FUNCIONE Y NO EMPUJE EL INPUT */
      overflow-y: auto;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      background: rgba(0,0,0,0.1);
    }

    .message {
      max-width: 88%;
      padding: 0.85rem 1.1rem;
      border-radius: 18px;
      font-size: 0.95rem;
      line-height: 1.5;
    }

    .bot-msg {
      align-self: flex-start;
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.05);
      color: #fafafa;
      border-bottom-left-radius: 4px;
      box-shadow: 2px 2px 10px rgba(0,0,0,0.1);
    }

    .user-msg {
      align-self: flex-end;
      background: var(--brand);
      color: #000;
      font-weight: 600;
      border-bottom-right-radius: 4px;
      box-shadow: 0 4px 15px rgba(var(--brand-rgb), 0.3);
    }

    .bot-skills-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.75rem;
    }

    .skill-badge {
      font-size: 0.75rem;
      padding: 3px 10px;
      border-radius: 100px;
      font-weight: 800;
      border: 1px solid rgba(255,255,255,0.05);
    }

    .chat-input-area {
      flex-shrink: 0;
      padding: 1.5rem;
      border-top: 1px solid var(--border-soft);
      display: flex;
      gap: 1rem;
      background: rgba(0,0,0,0.2);
    }

    .chat-input-area input {
      flex: 1;
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--border-soft);
      border-radius: 14px;
      padding: 0.75rem 1.25rem;
      color: #fff;
      font-size: 1rem;
      outline: none;
      transition: border-color 0.3s, background 0.3s;
    }

    .chat-input-area input:focus {
      outline: none;
      border-color: var(--brand);
      background: rgba(255,255,255,0.08);
      box-shadow: 0 0 15px rgba(255, 255, 255, 0.05);
    }

    /* CDK Drag Classes */
    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 24px;
      box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
                  0 8px 10px 1px rgba(0, 0, 0, 0.14),
                  0 3px 14px 2px rgba(0, 0, 0, 0.12);
    }

    .cdk-drag-placeholder {
      opacity: 0;
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class UIAIChatComponent {
  @Input() feature!: string;
  
  aiBotStore = inject(AIBotStore);
  masterFilterService = inject(MasterFilterService);
  router = inject(Router);
  
  readonly bot = computed(() => this.aiBotStore.getBotByFeature(this.feature));
  readonly isOpen = signal(false);
  readonly messages = signal<{id: string, text: string, role: 'user' | 'bot'}[]>([]);
  currentInput = '';

  toggleChat() {
    this.isOpen.update(v => !v);
  }

  async sendMessage() {
    if (!this.currentInput.trim()) return;

    const userInput = this.currentInput;
    this.messages.update(m => [...m, { id: Date.now().toString(), text: userInput, role: 'user' }]);
    this.currentInput = '';
    this.scrollToBottom();

    const provider = this.aiBotStore.selectedProvider();
    const apiKey = this.aiBotStore.providerApiKey();

    if (!apiKey) {
      this.messages.update(m => [...m, { id: 'err', text: '⚠️ Necesitas configurar primero el API Key en la pantalla Sistema > Asistentes de IA (Configuración).', role: 'bot' }]);
      this.scrollToBottom();
      return;
    }

    const typingId = 'typing-' + Date.now();
    this.messages.update(m => [...m, { id: typingId, text: '⏳ *Analizando el módulo...*', role: 'bot' }]);
    this.scrollToBottom();

    try {
      let responseText = '';
      if (provider === 'gemini') {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: `Eres ${this.bot()!.name}, un asistente experto en ${this.bot()!.feature} para Josanz ERP. Puedes ejecutar acciones en la UI: filtra datos si te lo piden, o navega a la creación de registros si quieren crear algo. Hablas de forma amigable y muy concisa.` }] },
            contents: [{ parts: [{ text: userInput }] }],
            tools: [{
              functionDeclarations: [
                {
                  name: 'search_database',
                  description: 'Filtra y busca información en la tabla o base de datos actual.',
                  parameters: { type: 'OBJECT', properties: { query: { type: 'STRING', description: 'Lo que el usuario desea buscar.' } }, required: ['query'] }
                },
                {
                  name: 'navigate_create',
                  description: 'Navega o abre la interfaz para crear un nuevo registro correspondiente al módulo actual.',
                  parameters: { type: 'OBJECT' }
                }
              ]
            }]
          })
        });

        if (!res.ok) throw new Error('Falló comunicación Gemini');
        const data = await res.json();
        
        const firstPart = data.candidates[0].content.parts[0];
        
        if (firstPart.functionCall) {
          const funcCall = firstPart.functionCall;
          if (funcCall.name === 'search_database') {
            this.masterFilterService.search(funcCall.args.query);
            responseText = `✅ He procedido a buscar: **"${funcCall.args.query}"** en tus registros. Deberías verlo reflejado en la tabla al instante.`;
          } else if (funcCall.name === 'navigate_create') {
            // Usa el enrutador para abrir la ruta de creación estándar para el módulo en curso
            this.router.navigate([`/${this.bot()!.feature}/new`]);
            responseText = `✅ Te redirigí al formulario de alta en ${this.bot()!.feature}.`;
          }
        } else {
          responseText = firstPart.text;
        }
      } else {
        responseText = `La inferencia con ${provider} está en formato stub. Por favor selecciona Google Gemini en la configuración.`;
      }

      this.messages.update(m => m.map(msg => msg.id === typingId ? { id: Date.now().toString(), text: responseText, role: 'bot' } : msg));
    } catch (e: unknown) {
      this.messages.update(m => m.map(msg => msg.id === typingId ? { id: Date.now().toString(), text: '❌ Error de red con Gemini. Revisa que tu API Key sea correcta.', role: 'bot' } : msg));
    }
    this.scrollToBottom();
  }

  private scrollToBottom() {
    setTimeout(() => {
      const el = document.querySelector('.chat-messages');
      if (el) el.scrollTop = el.scrollHeight;
    }, 100);
  }
}
