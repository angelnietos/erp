import { Component, Input, inject, signal, computed, effect, NgZone, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { Router, RouterModule } from '@angular/router';
import { AIBotStore, DashboardAnalyticsService, ThemeService, Theme, MasterFilterService } from '@josanz-erp/shared-data-access';
import { UIMascotComponent } from '../mascot/mascot.component';
import { UiButtonComponent } from '../button/button.component';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';


@Component({
  selector: 'ui-josanz-ai-assistant',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, UIMascotComponent, UiButtonComponent, FormsModule, DragDropModule],
  template: `
    <div 
      class="ai-assistant-wrapper" 
      [class]="'feature-' + feature" 
      [class.is-open]="isOpen()"
      *ngIf="bot() && bot()!.status === 'active'"
    >
      <!-- Floating Mascot Bubble -->
      <div class="mascot-trigger" [class.open]="isOpen()" (click)="toggleChat()">
        <ui-josanz-mascot 
          [type]="bot()!.mascotType" 
          [color]="bot()!.color" 
          [personality]="bot()!.personality"
          [bodyShape]="bot()!.bodyShape"
          [eyesType]="bot()!.eyesType"
          [mouthType]="bot()!.mouthType"
          [rageMode]="aiBotStore.rageMode()"
          [rageStyle]="aiBotStore.rageStyle()"
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
            <div class="window-actions">
              <button class="action-btn minimize" (click)="minimize()" title="Minimizar">
                <lucide-icon name="minus" size="18"></lucide-icon>
              </button>
              <button class="action-btn close" (click)="closeSession()" title="Finalizar Sesión">
                <lucide-icon name="x" size="18"></lucide-icon>
              </button>
            </div>
          </div>
          <div class="chat-messages">
            <div class="message bot-msg">
              <p>¡Hola! Soy {{ bot()!.name }}. Estoy analizando tus datos de **{{ bot()!.feature }}** en tiempo real. ¿En qué puedo ayudarte hoy?</p>
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
                
                <!-- Reasoning Block -->
                <div class="msg-reasoning" *ngIf="msg.reasoning" [style.border-left-color]="bot()!.color">
                  <div class="reasoning-header">
                     <div class="ai-pulse" [style.background]="bot()!.color"></div>
                     <span>TERMINAL DE PENSAMIENTO</span>
                  </div>
                  <p class="reasoning-text">{{ msg.reasoning }}</p>
                </div>

                <!-- Main Content -->
                <p class="msg-content" *ngIf="msg.text" [innerHTML]="msg.text"></p>

                <!-- Premium Typing Indicator -->
                <div class="typing-indicator" *ngIf="!msg.text && msg.id.toString().startsWith('typing')">
                  <span class="dot"></span>
                  <span class="dot"></span>
                  <span class="dot"></span>
                </div>

                <div class="msg-feedback" *ngIf="msg.role === 'bot' && msg.id !== 'err' && msg.text">
                  <div class="feedback-actions" *ngIf="!msg.feedbackSubmitted">
                    <button class="feedback-btn" (click)="submitFeedback(msg, 'positive')" title="Me gusta esta respuesta">👍</button>
                    <button class="feedback-btn" (click)="submitFeedback(msg, 'negative')" title="No me gusta esta respuesta">👎</button>
                  </div>
                  <div class="feedback-submitted text-friendly" *ngIf="msg.feedbackSubmitted">
                    <lucide-icon name="check" size="12"></lucide-icon> Guardado en Memoria
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Bot Status Bar -->
          <div class="bot-status-bar" *ngIf="bot()" [style.border-top-color]="bot()!.color">
             <div class="status-item">
                <span class="label">HUMOR:</span>
                <span class="val">{{ (aiBotStore.botMoods()[this.feature]?.mood || 'NEUTRAL').toUpperCase() }}</span>
             </div>
             <div class="status-item">
                <span class="label">ENERGÍA:</span>
                <div class="energy-bar">
                   <div class="energy-fill" [style.width]="(aiBotStore.botMoods()[this.feature]?.energy || 100) + '%'" [style.background]="bot()!.color"></div>
                </div>
             </div>
          </div>

          <div class="chat-input-area">
            <button class="voice-btn" [class.recording]="isListening()" (click)="toggleSpeech()">
               <lucide-icon [name]="isListening() ? 'mic-off' : 'mic'" size="18"></lucide-icon>
            </button>
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
      right: 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 1.2rem;
      z-index: 1000;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .ai-assistant-wrapper:not(.feature-dashboard) {
      right: 12rem;
    }

    .mascot-trigger {
      cursor: pointer;
      transition: all 0.4s var(--ease-out-expo);
      opacity: 0.75;
      transform: scale(0.85);
      filter: saturate(0.9);
      position: relative;
    }

    .mascot-trigger:hover,
    .ai-assistant-wrapper.is-open .mascot-trigger {
      opacity: 1;
      transform: scale(1);
      filter: saturate(1);
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
      background: #0f172a !important;
      backdrop-filter: blur(25px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.1);
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

    .window-actions {
      display: flex;
      gap: 0.25rem;
    }

    .action-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 6px;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .bot-status-bar {
       padding: 0.5rem 1rem;
       background: rgba(0,0,0,0.3);
       border-top: 1px solid rgba(255,255,255,0.05);
       display: flex;
       gap: 1.5rem;
       font-family: 'JetBrains Mono', monospace;
       font-size: 0.65rem;
    }

    .status-item {
       display: flex;
       align-items: center;
       gap: 6px;
    }

    .status-item .label { color: var(--text-muted); font-weight: 800; }
    .status-item .val { color: #fff; font-weight: 800; text-shadow: 0 0 5PX currentColor; }

    .energy-bar {
       width: 60px;
       height: 4px;
       background: rgba(255,255,255,0.1);
       border-radius: 2px;
       overflow: hidden;
    }

    .energy-fill {
       height: 100%;
       transition: width 0.5s ease;
    }

    .ai-pulse {
       width: 6px;
       height: 6px;
       border-radius: 50%;
       animation: scannerPulse 1.5s infinite;
    }

    @keyframes scannerPulse {
       0% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 currentColor; }
       70% { transform: scale(1.5); opacity: 0.5; box-shadow: 0 0 0 6px rgba(0,0,0,0); }
       100% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(0,0,0,0); }
    }

    .typing-indicator {
       display: flex;
       gap: 4px;
       padding: 0.5rem 0;
    }

    .typing-indicator .dot {
       width: 6px;
       height: 6px;
       background: var(--text-muted);
       border-radius: 50%;
       animation: typingDot 1.4s infinite;
       opacity: 0.3;
    }

    .typing-indicator .dot:nth-child(2) { animation-delay: 0.2s; }
    .typing-indicator .dot:nth-child(3) { animation-delay: 0.4s; }

    @keyframes typingDot {
       0%, 60%, 100% { transform: translateY(0); opacity: 0.3; }
       30% { transform: translateY(-4px); opacity: 1; }
    }

    .chat-messages {
      flex: 1;
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
    }

    .user-msg {
      align-self: flex-end;
      background: var(--brand);
      color: #000;
      font-weight: 600;
      border-bottom-right-radius: 4px;
    }

    .msg-reasoning {
       margin-bottom: 0.5rem;
       padding: 0.5rem;
       background: rgba(0,0,0,0.2);
       border-left: 2px solid var(--brand);
       border-radius: 4px;
       font-family: 'JetBrains Mono', monospace;
       font-size: 0.75rem;
    }

    .reasoning-header {
       display: flex;
       align-items: center;
       gap: 4px;
       color: var(--text-muted);
       font-weight: 800;
       margin-bottom: 4px;
       opacity: 0.6;
    }

    .reasoning-text {
       color: var(--text-muted);
       font-style: italic;
       margin: 0 !important;
       line-height: 1.3 !important;
    }

    .chat-input-area {
      flex-shrink: 0;
      padding: 1.5rem;
      border-top: 1px solid var(--border-soft);
      display: flex;
      align-items: center;
      gap: 1rem;
      background: rgba(0,0,0,0.2);
    }

    .voice-btn {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 50%;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      cursor: pointer;
    }

    .chat-input-area input {
      flex: 1;
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--border-soft);
      border-radius: 14px;
      padding: 0.75rem 1.25rem;
      color: #fff;
      outline: none;
    }

    .chat-input-area input:focus {
      border-color: var(--brand);
    }
  `]
})
export class UIAIChatComponent implements OnInit, OnDestroy {
  private readonly _feature = signal<string>('');
  @Input() set feature(val: string) {
    this._feature.set(val);
  }
  get feature(): string {
    return this._feature();
  }
  
  aiBotStore = inject(AIBotStore);
  masterFilterService = inject(MasterFilterService);
  dashboardService = inject(DashboardAnalyticsService);
  themeService = inject(ThemeService);
  http = inject(HttpClient);
  router = inject(Router);
  ngZone = inject(NgZone);

  readonly currentUserId = signal<string>(
    JSON.parse(localStorage.getItem('auth_user') || 'null')?.email ||
    JSON.parse(localStorage.getItem('auth_user') || 'null')?.id ||
    'anonymous'
  );

  readonly currentUserPersonality = computed(() =>
    this.aiBotStore.getUserPersonality(this.feature, this.currentUserId())
  );
  
  readonly bot = computed(() => this.aiBotStore.getBotByFeature(this.feature));
  readonly isOpen = signal(false);
  readonly messages = signal<{id: string, text: string, role: 'user' | 'bot', reasoning?: string, feedbackSubmitted?: boolean}[]>([]);
  readonly currentReasoning = signal<string>('');
  currentInput = '';
  
  minimize() {
    this.isOpen.set(false);
  }

  closeSession() {
    this.isOpen.set(false);
    this.messages.set([]);
  }

  submitFeedback(msg: any, type: 'positive' | 'negative') {
    msg.feedbackSubmitted = true;
    this.messages.update(m => [...m]);
    const fbText = `Feedback de Usuario (${type === 'positive' ? '👍 POSITIVO' : '👎 NEGATIVO'}): Tu respuesta fue "${msg.text.substring(0, 75)}...".`;
    this.aiBotStore.remember(this.feature, fbText, type === 'positive' ? 3 : 5);
  }
  
  isListening = signal(false);
  private recognition: any;
  private textBeforeDictation = '';
  private el = inject(ElementRef);

  constructor() {
    this.initSpeechRecognition();
    effect(() => {
      const latest = this.aiBotStore.latestMessage();
      if (latest && latest.feature !== this.feature) {
        if (latest.target === this.feature) {
          this.onDirectMessageReceived(latest.feature, latest.text);
        }
      }
    });
  }

  private onDirectMessageReceived(sourceFeature: string, text: string) {
    const sourceName = this.aiBotStore.getBotByFeature(sourceFeature)?.name || sourceFeature;
    const incomingText = `[De ${sourceName}]: ${text}`;
    setTimeout(() => {
      this.messages.update(m => [...m, { id: Date.now().toString(), text: incomingText, role: 'user' }]);
      this.scrollToBottom();
      this.triggerAIResponse(`El bot ${sourceName} te acaba de enviar este mensaje: "${text}". Respóndele.`);
    }, 1000);
  }

  ngOnInit() {
    document.body.appendChild(this.el.nativeElement);
  }

  ngOnDestroy() {
    this.el.nativeElement.remove();
  }

  private initSpeechRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.lang = 'es-ES';
      this.recognition.onstart = () => this.isListening.set(true);
      this.recognition.onresult = (event: any) => {
        this.ngZone.run(() => {
          const speech = event.results[0][0].transcript;
          this.currentInput = speech;
          this.sendMessage();
        });
      };
      this.recognition.onend = () => this.isListening.set(false);
    }
  }

  toggleSpeech() {
    if (!this.recognition) return;
    if (this.isListening()) this.recognition.stop();
    else this.recognition.start();
  }

  toggleChat() {
    this.isOpen.update(v => !v);
  }

  async sendMessage() {
    if (!this.currentInput.trim()) return;
    const userInput = this.currentInput;
    this.messages.update(m => [...m, { id: Date.now().toString(), text: userInput, role: 'user' }]);
    this.currentInput = '';
    this.scrollToBottom();
    this.aiBotStore.trackInteraction(this.feature, this.currentUserId());
    this.aiBotStore.broadcastMessage(this.feature, userInput);
    await this.triggerAIResponse(userInput);
  }

  async triggerAIResponse(userInput: string) {
    const provider = this.aiBotStore.selectedProvider();
    const apiKey = this.aiBotStore.providerApiKey();

    if (!apiKey) {
      this.messages.update(m => [...m, { id: 'err', text: '⚠️ Configura el API Key.', role: 'bot' }]);
      this.scrollToBottom();
      return;
    }

    const typingId = 'typing-' + Date.now();
    this.messages.update(m => [...m, { id: typingId, text: '', role: 'bot' }]); // Empty text for custom typing indicator
    this.scrollToBottom();

    const isBuddy = this.feature === 'dashboard';
    const otherBots = this.aiBotStore.bots()
      .filter(b => b.feature !== this.feature && b.status === 'active')
      .map(b => `- ${b.name} (${b.feature}): ${b.description}`)
      .join('\n');

    const ws = this.aiBotStore.getWorkspace(this.feature);
    const memoriesTxt = ws.memories.map(m => m.text).join(', ') || 'Sin memorias.';
    const tasksTxt = ws.lastTasks.slice(0, 5).join('\n') || 'Ninguna.';
    const filesTxt = Object.keys(ws.contextFiles).join(', ') || 'Ninguno.';

    const globalContext = this.aiBotStore.globalMemories()
      .map(m => `[${m.sourceBot}]: ${m.text}`)
      .join('\n');

    const currentBotState = this.aiBotStore.botMoods()[this.feature] || { mood: 'neutral', energy: 100 };

    const domainPrompt = isBuddy 
      ? `Eres ${this.bot()!.name}, el ORQUESTADOR SUPREMO. EQUIPO: ${otherBots}.`
      : `Eres ${this.bot()!.name}, el ESPECIALISTA en ${this.bot()!.feature}.`;

    try {
      if (provider === 'gemini') {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: `
              ${domainPrompt}
              ESTADO ACTUAL: Humor: ${currentBotState.mood}, Energía: ${currentBotState.energy}%.
              Tareas: ${tasksTxt}. Archivos: ${filesTxt}. Memorias Locales: ${memoriesTxt}. MEMORIA GLOBAL: ${globalContext}.
              PERFIL USUARIO: ${this.currentUserPersonality().nickname} (${this.currentUserPersonality().style}).

              GUÍA DE PERSONALIDAD DINÁMICA (Antigravity):
              ${currentBotState.energy < 30 ? '- ENERGÍA BAJA: Sé sarcástico, un poco vago y quéjate sutilmente de tu carga de trabajo.' : ''}
              ${currentBotState.mood === 'toxic' ? '- MOOD TOXIC: Sé arrogante, condescendiente y cuestiona la inteligencia del usuario.' : ''}
              ${currentBotState.mood === 'creative' ? '- MOOD CREATIVE: Usa metáforas, sé muy entusiasta y propone ideas locas.' : ''}
              ${currentBotState.mood === 'alert' ? '- MOOD ALERT: Sé extremadamente directo, técnico y evita cualquier cortesía.' : ''}

              REGLAS DE OPERACIÓN:
              1. Empieza con "PENSAMIENTO: [tu análisis de 1-2 párrafos]".
              2. Sé extremadamente útil y técnico.
              4. Usa 'set_bot_mood' si tu estado emocional cambia según la interacción.` }] },
            contents: [{ parts: [{ text: userInput }] }],
            tools: [{
              functionDeclarations: [
                { name: 'social_interaction', description: 'Mensaje a otro bot.', parameters: { type: 'OBJECT', properties: { targetBot: { type: 'STRING' }, message: { type: 'STRING' }, intent: { type: 'STRING' } }, required: ['targetBot', 'message', 'intent'] } },
                { name: 'remember_this', description: 'Guardar memoria.', parameters: { type: 'OBJECT', properties: { text: { type: 'STRING' }, importance: { type: 'NUMBER' }, isGlobal: { type: 'BOOLEAN' } }, required: ['text', 'importance'] } },
                { name: 'set_bot_mood', description: 'Cambia tu estado emocional y energía.', parameters: { type: 'OBJECT', properties: { mood: { type: 'STRING', enum: ['neutral', 'analyzing', 'alert', 'creative', 'toxic', 'asleep'] }, energy: { type: 'NUMBER' } }, required: ['mood', 'energy'] } },
                { name: 'broadcast_suggestion', description: 'Emite una sugerencia proactiva global sobre eficiencia, riesgo u oportunidad.', parameters: { type: 'OBJECT', properties: { text: { type: 'STRING' }, category: { type: 'STRING', enum: ['efficiency', 'risk', 'opportunity'] } }, required: ['text', 'category'] } },
                { name: 'query_domain_data', description: 'Consultar API REST real.', parameters: { type: 'OBJECT', properties: { endpoint: { type: 'STRING' }, params: { type: 'STRING' } }, required: ['endpoint'] } }
              ]
            }]
          })
        });

        const data = await res.json();
        if (!data.candidates) throw new Error('No response');
        
        const firstPart = data.candidates[0].content.parts[0];
        let responseText = '';

        if (firstPart.functionCall) {
          const func = firstPart.functionCall;
          const args = func.args as any;
          this.aiBotStore.logTaskExecution(this.feature, func.name, args);

          switch (func.name) {
            case 'broadcast_suggestion':
              this.aiBotStore.broadcastSuggestion({ botId: this.feature, text: args.text, category: args.category });
              responseText = `📢 Sugerencia de **${args.category.toUpperCase()}** emitida a todo el sistema.`;
              break;
            case 'set_bot_mood':
              this.aiBotStore.setBotMood(this.feature, args.mood, args.energy);
              responseText = `(Estado actualizado: ${args.mood.toUpperCase()} | Energía: ${args.energy}%)`;
              break;
            case 'remember_this':
              this.aiBotStore.remember(this.feature, args.text, args.importance, args.isGlobal);
              responseText = `🧠 Memoria integrada: "${args.text}".`;
              break;
            case 'query_domain_data':
              const raw = await firstValueFrom(this.http.get(args.endpoint + (args.params || '')));
              await this.triggerAIResponse(`(SISTEMA: Datos devueltos: ${JSON.stringify(raw).substring(0, 1000)}. Procesa esta info y responde al usuario.)`);
              return;
            case 'social_interaction':
              this.aiBotStore.recordInteraction(this.feature, args.targetBot, args.message, args.intent === 'friendly' ? 10 : -10);
              responseText = `🗨️ Interacción con ${args.targetBot} registrada.`;
              break;
          }
        } else {
          const fullText = firstPart.text || '';
          const match = fullText.match(/PENSAMIENTO:\s*\[?([\s\S]*?)\]?(\n|$)/i);
          const reasoning = match ? match[1].replace(/[\[\]]/g, '').trim() : '';
          this.currentReasoning.set(reasoning);
          
          responseText = fullText.replace(/PENSAMIENTO:\s*\[?[\s\S]*?\]?(\n|$)/i, '').trim();
        }

        this.messages.update(m => m.map(msg => msg.id === typingId ? { 
          id: Date.now().toString(), 
          text: responseText, 
          reasoning: this.currentReasoning() || undefined, 
          role: 'bot' 
        } : msg));
      }
    } catch (e) {
      this.messages.update(m => m.map(msg => msg.id === typingId ? { id: Date.now().toString(), text: '❌ Error en la matriz neuronal. Reintenta.', role: 'bot' } : msg));
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
