import { Component, Input, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { AIBotStore } from '@josanz-erp/shared-data-access';
import { UIMascotComponent } from '../mascot/mascot.component';
import { UiButtonComponent } from '../button/button.component';
import { UiCardComponent } from '../card/card.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'ui-josanz-ai-assistant',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, UIMascotComponent, UiButtonComponent, UiCardComponent, FormsModule],
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
      <div class="chat-window-container" *ngIf="isOpen()" (click)="$event.stopPropagation()">
        <ui-josanz-card variant="glass" class="chat-window animate-slide-up">
          <div class="chat-header" [style.border-bottom-color]="bot()!.color">
            <div class="bot-status-info">
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
        </ui-josanz-card>
      </div>
    </div>
  `,
  styles: [`
    .ai-assistant-wrapper {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 9999;
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
      width: 380px;
      max-height: 500px;
    }

    .chat-window {
      padding: 0;
      display: flex;
      flex-direction: column;
      height: 500px;
      overflow: hidden;
      border-radius: 24px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    }

    .chat-header {
      padding: 1.25rem;
      background: rgba(255,255,255,0.03);
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid transparent;
    }

    .bot-status-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      box-shadow: 0 0 10px currentColor;
    }

    .chat-header h4 { margin: 0; font-size: 1rem; color: #fff; }
    .chat-header p { margin: 0; font-size: 0.75rem; color: var(--text-muted); }

    .close-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 0.5rem;
      transition: color 0.3s;
    }

    .close-btn:hover { color: #fff; }

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .message {
      max-width: 85%;
      padding: 0.75rem 1rem;
      border-radius: 16px;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .bot-msg {
      align-self: flex-start;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.05);
      color: #dfdfdf;
      border-bottom-left-radius: 4px;
    }

    .user-msg {
      align-self: flex-end;
      background: var(--brand);
      color: #000;
      font-weight: 500;
      border-bottom-right-radius: 4px;
    }

    .bot-skills-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.75rem;
    }

    .skill-badge {
      font-size: 0.7rem;
      padding: 2px 8px;
      border-radius: 100px;
      font-weight: 700;
    }

    .chat-input-area {
      padding: 1.25rem;
      border-top: 1px solid var(--border-soft);
      display: flex;
      gap: 0.75rem;
    }

    .chat-input-area input {
      flex: 1;
      background: rgba(255,255,255,0.03);
      border: 1px solid var(--border-soft);
      border-radius: 12px;
      padding: 0.5rem 1rem;
      color: #fff;
      font-size: 0.9rem;
      outline: none;
    }

    .chat-input-area input:focus {
      border-color: var(--brand);
    }
  `]
})
export class UIAIChatComponent {
  @Input() feature!: string;
  
  private readonly aiBotStore = inject(AIBotStore);
  
  readonly bot = computed(() => this.aiBotStore.getBotByFeature(this.feature));
  readonly isOpen = signal(false);
  readonly currentInput = signal('');
  readonly messages = signal<any[]>([]);

  toggleChat() {
    this.isOpen.update(v => !v);
  }

  sendMessage() {
    const text = this.currentInput();
    if (!text.trim()) return;

    this.messages.update(prev => [...prev, { id: Date.now(), role: 'user', text }]);
    this.currentInput.set('');

    // Simulate bot response
    setTimeout(() => {
      this.messages.update(prev => [...prev, { id: Date.now(), role: 'bot', text: `Entendido. He registrado tu consulta sobre el módulo de ${this.feature}. Como ${this.bot()?.name}, estoy procesando los datos para darte la mejor respuesta técnica.` }]);
    }, 1000);
  }
}
