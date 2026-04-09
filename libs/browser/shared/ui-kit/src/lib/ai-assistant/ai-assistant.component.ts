import {
  Component,
  Input,
  inject,
  signal,
  computed,
  effect,
  NgZone,
  ElementRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { Router, RouterModule } from '@angular/router';
import {
  AIBotStore,
  DashboardAnalyticsService,
  ThemeService,
  Theme,
  THEMES,
  MasterFilterService,
  InterBotMessage,
} from '@josanz-erp/shared-data-access';
import { UIMascotComponent } from '../mascot/mascot.component';
import { UiButtonComponent } from '../button/button.component';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragEnd } from '@angular/cdk/drag-drop';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'ui-josanz-ai-assistant',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    UIMascotComponent,
    UiButtonComponent,
    FormsModule,
    DragDropModule,
  ],
  template: `
    <div
      class="ai-assistant-wrapper"
      [class]="'feature-' + feature"
      [class.is-open]="isOpen()"
      [class.secondary]="feature === 'buddy'"
      *ngIf="bot() && bot()!.status === 'active'"
    >
      <!-- Floating Mascot Bubble -->
      <div
        class="mascot-trigger"
        [class.open]="isOpen()"
        cdkDrag
        cdkDragBoundary="body"
        [style.transform]="
          'translate3d(' + botPosition().x + 'px, ' + botPosition().y + 'px, 0)'
        "
        (click)="toggleChat()"
        (cdkDragEnded)="onMascotDragEnd($event)"
      >
        <ui-josanz-mascot
          [type]="$any(bot()!.mascotType)"
          [color]="bot()!.color"
          [personality]="$any(bot()!.personality)"
          [bodyShape]="$any(bot()!.bodyShape)"
          [eyesType]="$any(bot()!.eyesType)"
          [mouthType]="$any(bot()!.mouthType)"
          [rageMode]="aiBotStore.rageMode()"
          [rageStyle]="aiBotStore.rageStyle()"
        ></ui-josanz-mascot>
        <div class="notification-dot animate-pulse"></div>
      </div>

      <!-- Chat Window -->
      <div
        class="chat-window-container"
        *ngIf="isOpen()"
        cdkDrag
        cdkDragBoundary="body"
        [style.left.px]="chatWindowPosition().x"
        [style.top.px]="chatWindowPosition().y"
        (click)="$event.stopPropagation()"
        (cdkDragEnded)="onChatWindowDragEnd($event)"
      >
        <div class="chat-window animate-slide-up">
          <div
            class="chat-header"
            cdkDragHandle
            [style.border-bottom-color]="bot()!.color"
          >
            <div class="bot-status-info">
              <lucide-icon
                name="grip-vertical"
                size="14"
                class="drag-handle-icon"
              ></lucide-icon>
              <span
                class="status-indicator"
                [style.background]="bot()!.color"
              ></span>
              <div>
                <h4>{{ bot()!.name }}</h4>
                <p>Tu asistente de {{ bot()!.feature }}</p>
              </div>
            </div>
            <div class="window-actions">
              <button
                class="action-btn minimize"
                (click)="minimize()"
                title="Minimizar"
              >
                <lucide-icon name="minus" size="18"></lucide-icon>
              </button>
              <button
                class="action-btn close"
                (click)="closeSession()"
                title="Finalizar Sesión"
              >
                <lucide-icon name="x" size="18"></lucide-icon>
              </button>
            </div>
          </div>
          <div class="chat-messages">
            <div class="message bot-msg">
              <p>
                ¡Hola! Soy {{ bot()!.name }}. Estoy analizando tus datos de **{{
                  bot()!.feature
                }}** en tiempo real. ¿En qué puedo ayudarte hoy?
              </p>
              <div class="bot-skills-badges">
                @for (skill of bot()!.activeSkills; track skill) {
                  <span
                    class="skill-badge"
                    [style.background]="bot()!.color + '22'"
                    [style.color]="bot()!.color"
                  >
                    {{ skill }}
                  </span>
                }
              </div>
            </div>

            @for (msg of messages(); track msg.id) {
              <div
                class="message"
                [class.user-msg]="msg.role === 'user'"
                [class.bot-msg]="msg.role === 'bot'"
              >
                <!-- Reasoning Block -->
                <div
                  class="msg-reasoning"
                  *ngIf="msg.reasoning"
                  [style.border-left-color]="bot()!.color"
                >
                  <div class="reasoning-header">
                    <div
                      class="ai-pulse"
                      [style.background]="bot()!.color"
                    ></div>
                    <span>TERMINAL DE PENSAMIENTO</span>
                  </div>
                  <p class="reasoning-text">{{ msg.reasoning }}</p>
                </div>

                <!-- Main Content -->
                <p
                  class="msg-content"
                  *ngIf="msg.text"
                  [innerHTML]="msg.text"
                ></p>

                <!-- Premium Typing Indicator -->
                <div
                  class="typing-indicator"
                  *ngIf="!msg.text && msg.id.toString().startsWith('typing')"
                >
                  <span class="dot"></span>
                  <span class="dot"></span>
                  <span class="dot"></span>
                </div>

                <div
                  class="msg-feedback"
                  *ngIf="msg.role === 'bot' && msg.id !== 'err' && msg.text"
                >
                  <div class="feedback-actions" *ngIf="!msg.feedbackSubmitted">
                    <button
                      class="feedback-btn"
                      (click)="submitFeedback(msg, 'positive')"
                      title="Me gusta esta respuesta"
                    >
                      👍
                    </button>
                    <button
                      class="feedback-btn"
                      (click)="submitFeedback(msg, 'negative')"
                      title="No me gusta esta respuesta"
                    >
                      👎
                    </button>
                  </div>
                  <div
                    class="feedback-submitted text-friendly"
                    *ngIf="msg.feedbackSubmitted"
                  >
                    <lucide-icon name="check" size="12"></lucide-icon> Guardado
                    en Memoria
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Bot Status Bar -->
          <div
            class="bot-status-bar"
            *ngIf="bot()"
            [style.border-top-color]="bot()!.color"
          >
            <div class="status-item">
              <span class="label">HUMOR:</span>
              <span class="val">{{
                (
                  aiBotStore.botMoods()[this.feature]?.mood || 'NEUTRAL'
                ).toUpperCase()
              }}</span>
            </div>
            <div class="status-item">
              <span class="label">ENERGÍA:</span>
              <div class="energy-bar">
                <div
                  class="energy-fill"
                  [style.width]="
                    (aiBotStore.botMoods()[this.feature]?.energy || 100) + '%'
                  "
                  [style.background]="bot()!.color"
                ></div>
              </div>
            </div>
          </div>

          <div class="chat-input-area">
            <button
              class="voice-btn"
              [class.recording]="isListening()"
              (click)="toggleSpeech()"
            >
              <lucide-icon
                [name]="isListening() ? 'mic-off' : 'mic'"
                size="18"
              ></lucide-icon>
            </button>
            <input
              type="text"
              placeholder="Escribe aquí tu consulta..."
              [(ngModel)]="currentInput"
              (keyup.enter)="sendMessage()"
            />
            <ui-josanz-button
              variant="filled"
              size="sm"
              (click)="sendMessage()"
            >
              <lucide-icon name="send" size="16"></lucide-icon>
            </ui-josanz-button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .ai-assistant-wrapper {
        position: fixed;
        top: 0;
        left: 0;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 1.2rem;
        z-index: 1000;
        pointer-events: none;
      }

      .ai-assistant-wrapper > * {
        pointer-events: auto;
      }

      .ai-assistant-wrapper.secondary {
        z-index: 999;
      }

      .mascot-trigger {
        cursor: grab;
        transition: all 0.4s var(--ease-out-expo);
        opacity: 0.85;
        transform: scale(0.9);
        filter: saturate(0.9);
        position: absolute;
        user-select: none;
      }

      .mascot-trigger:active,
      .mascot-trigger.cdk-drag-dragging {
        cursor: grabbing;
        transform: scale(1.05);
        z-index: 10002;
      }

      .mascot-trigger:hover,
      .ai-assistant-wrapper.is-open .mascot-trigger {
        opacity: 1;
        transform: scale(1);
        filter: saturate(1);
      }

      .mascot-trigger:hover,
      .ai-assistant-wrapper.is-open .mascot-trigger {
        opacity: 1;
        transform: scale(1);
        filter: saturate(1);
      }

      .chat-window-container {
        position: fixed;
        width: 400px;
        z-index: 10001;
        margin: 0;
      }

      .chat-window-container.cdk-drag-dragging {
        transform: rotate(2deg);
        z-index: 10003 !important;
      }

      .chat-window-container.cdk-drag-dragging .chat-window {
        box-shadow: 0 40px 80px rgba(0, 0, 0, 0.9);
      }

      .chat-window {
        padding: 0;
        display: flex;
        flex-direction: column;
        height: 550px;
        overflow: hidden;
        border-radius: 24px;
        box-shadow: 0 30px 60px rgba(0, 0, 0, 0.8);
        background: #0f172a !important;
        backdrop-filter: blur(25px) saturate(180%);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .chat-header {
        flex-shrink: 0;
        padding: 1.5rem;
        background: rgba(255, 255, 255, 0.05);
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

      .chat-header h4 {
        margin: 0;
        font-size: 1.1rem;
        color: #fff;
        font-weight: 800;
      }
      .chat-header p {
        margin: 0;
        font-size: 0.8rem;
        color: var(--text-muted);
        font-weight: 600;
      }

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
        background: rgba(0, 0, 0, 0.3);
        border-top: 1px solid rgba(255, 255, 255, 0.05);
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

      .status-item .label {
        color: var(--text-muted);
        font-weight: 800;
      }
      .status-item .val {
        color: #fff;
        font-weight: 800;
        text-shadow: 0 0 5px currentColor;
      }

      .energy-bar {
        width: 60px;
        height: 4px;
        background: rgba(255, 255, 255, 0.1);
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
        0% {
          transform: scale(1);
          opacity: 1;
          box-shadow: 0 0 0 0 currentColor;
        }
        70% {
          transform: scale(1.5);
          opacity: 0.5;
          box-shadow: 0 0 0 6px rgba(0, 0, 0, 0);
        }
        100% {
          transform: scale(1);
          opacity: 1;
          box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
        }
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

      .typing-indicator .dot:nth-child(2) {
        animation-delay: 0.2s;
      }
      .typing-indicator .dot:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes typingDot {
        0%,
        60%,
        100% {
          transform: translateY(0);
          opacity: 0.3;
        }
        30% {
          transform: translateY(-4px);
          opacity: 1;
        }
      }

      .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        background: rgba(0, 0, 0, 0.1);
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
        background: rgba(255, 255, 255, 0.07);
        border: 1px solid rgba(255, 255, 255, 0.05);
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
        background: rgba(0, 0, 0, 0.2);
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
        background: rgba(0, 0, 0, 0.2);
      }

      .voice-btn {
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.1);
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
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--border-soft);
        border-radius: 14px;
        padding: 0.75rem 1.25rem;
        color: #fff;
        outline: none;
      }

      .chat-input-area input:focus {
        border-color: var(--brand);
      }
    `,
  ],
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
  masterFilter = inject(MasterFilterService);
  router = inject(Router);
  ngZone = inject(NgZone);

  readonly currentUserId = signal<string>(
    JSON.parse(localStorage.getItem('auth_user') || 'null')?.email ||
      JSON.parse(localStorage.getItem('auth_user') || 'null')?.id ||
      'anonymous',
  );

  readonly currentUserPersonality = computed(() =>
    this.aiBotStore.getUserPersonality(this.feature, this.currentUserId()),
  );

  readonly bot = computed(() => this.aiBotStore.getBotByFeature(this.feature));
  readonly botPosition = computed(() =>
    this.aiBotStore.getBotPosition(this.feature),
  );

  // Calculate chat window position based on mascot position
  readonly chatWindowPosition = computed(() => {
    const mascotPos = this.botPosition();
    // Position chat window to the left of the mascot, or adjust if too close to edge
    let x = mascotPos.x - 420; // 400px width + 20px margin
    let y = mascotPos.y;

    // Keep within viewport bounds
    if (x < 20) x = mascotPos.x + 80; // Position to the right instead
    if (y < 20) y = 20;
    if (y > window.innerHeight - 570) y = window.innerHeight - 570; // 550px height + 20px margin

    return { x, y };
  });
  readonly isOpen = signal(false);
  readonly messages = signal<
    {
      id: string;
      text: string;
      role: 'user' | 'bot';
      reasoning?: string;
      feedbackSubmitted?: boolean;
    }[]
  >([]);
  readonly currentReasoning = signal<string>('');
  hfToken = signal<string>(localStorage.getItem('hf_token') || '');
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
    this.messages.update((m) => [...m]);
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
      this.aiBotStore.interBotTick();
      const items = this.aiBotStore.pullInterBotMessagesFor(this.feature);
      if (items.length === 0) return;
      items.forEach((item: InterBotMessage, i: number) => {
        const delay = 80 + i * 350;
        setTimeout(() => {
          this.ngZone.run(() => {
            if (item.displayOnly) {
              this.appendPeerBotLine(item.from, item.text);
            } else {
              this.onDirectMessageReceived(item.from, item.text);
            }
          });
        }, delay);
      });
    });
  }

  private appendPeerBotLine(fromFeature: string, text: string) {
    const esc = (s: string) =>
      s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    const name = esc(
      this.aiBotStore.getBotByFeature(fromFeature)?.name || fromFeature,
    );
    const safe = esc(text);
    this.messages.update((m) => [
      ...m,
      {
        id: `${Date.now()}-peer-${fromFeature}`,
        text: `💬 <strong>${name}</strong>: ${safe}`,
        role: 'bot',
      },
    ]);
    this.scrollToBottom();
  }

  private onDirectMessageReceived(sourceFeature: string, text: string) {
    const sourceName =
      this.aiBotStore.getBotByFeature(sourceFeature)?.name || sourceFeature;
    const incomingText = `[${sourceName}]: ${text}`;
    this.messages.update((m) => [
      ...m,
      { id: `${Date.now()}-in`, text: incomingText, role: 'user' },
    ]);
    this.scrollToBottom();
    void this.triggerAIResponse(
      `Te escribe el bot **${sourceName}** (dominio \`${sourceFeature}\`):\n"${text}"\n\nResponde en español, breve y cordial, en tu rol de especialista de este dominio. Si es un saludo, devuélvelo con naturalidad. No uses herramientas salvo que necesites datos reales de APIs.`,
      { relayReplyToFeature: sourceFeature },
    );
  }

  ngOnInit() {
    document.body.appendChild(this.el.nativeElement);
  }

  private async initializeFreeProviders() {
    try {
      // Solo seleccionar automáticamente si el proveedor actual es 'free'
      const currentProvider = this.aiBotStore.selectedProvider();
      if (currentProvider === 'free') {
        await this.aiBotStore.autoSelectProvider();
      }

      // Log del estado de proveedores
      const status = this.aiBotStore.getProviderStatus();
      console.log('Estado de proveedores de IA:', status);
    } catch (error) {
      console.warn('Error inicializando proveedores gratuitos:', error);
    }
  }

  async checkOllamaConnection() {
    const available = await this.aiBotStore.checkOllamaAvailability();
    if (available) {
      alert(
        `✅ Ollama conectado exitosamente!\nModelos disponibles: ${this.aiBotStore.freeModels().localModels.join(', ')}`,
      );
    } else {
      alert(
        '❌ No se pudo conectar con Ollama. Verifica que esté ejecutándose.',
      );
    }
  }

  ngOnDestroy() {
    this.el.nativeElement.remove();
  }

  private initSpeechRecognition() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
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
    this.isOpen.update((v) => !v);
  }

  onMascotDragEnd(event: CdkDragEnd) {
    const element = event.source.element.nativeElement;
    const rect = element.getBoundingClientRect();
    const newPosition = {
      x: rect.left,
      y: rect.top,
    };
    this.aiBotStore.updateBotPosition(this.feature, newPosition);
  }

  onChatWindowDragEnd(event: CdkDragEnd) {
    // Optional: could save chat window positions separately if needed
    // For now, just ensure it stays within bounds
    const element = event.source.element.nativeElement;
    const rect = element.getBoundingClientRect();
    // Keep chat windows within viewport
    if (
      rect.left < 0 ||
      rect.top < 0 ||
      rect.right > window.innerWidth ||
      rect.bottom > window.innerHeight
    ) {
      // Reset to a safe position if dragged outside viewport
      element.style.transform = 'translate3d(20px, 100px, 0)';
    }
  }

  async sendMessage() {
    if (!this.currentInput.trim()) return;
    const userInput = this.currentInput;

    // Detectar comandos especiales antes de procesar con IA
    const themeCommand = this.detectThemeCommand(userInput);
    if (themeCommand) {
      await this.executeThemeCommand(themeCommand, userInput);
      return;
    }

    this.messages.update((m) => [
      ...m,
      { id: Date.now().toString(), text: userInput, role: 'user' },
    ]);
    this.currentInput = '';
    this.scrollToBottom();
    this.aiBotStore.trackInteraction(this.feature, this.currentUserId());
    this.aiBotStore.broadcastMessage(this.feature, userInput, 'all');
    await this.triggerAIResponse(userInput);
  }

  async triggerAIResponse(
    userInput: string,
    opts?: { relayReplyToFeature?: string },
  ) {
    // Mostrar indicador de escritura
    const typingId = `typing-${Date.now()}`;
    this.messages.update((m) => [
      ...m,
      { id: typingId, text: 'Escribiendo...', role: 'bot', reasoning: '' },
    ]);
    this.scrollToBottom();

    try {
      // Construir contexto basado en el rol del bot
      const botMemories = this.aiBotStore.getBotContext(this.feature);
      const context =
        botMemories.length > 0
          ? `Contexto relevante:\n${botMemories
              .sort((a, b) => b.importance - a.importance)
              .slice(0, 10)
              .map(
                (m) =>
                  `- ${m.text} (${new Date(m.timestamp).toLocaleDateString()})`,
              )
              .join('\n')}\n\n`
          : '';

      // Generar respuesta usando proveedores gratuitos con contexto
      const response = await this.aiBotStore.generateFreeResponse(
        userInput,
        context,
      );

      // Actualizar mensaje con respuesta
      this.messages.update((m) =>
        m.map((msg) =>
          msg.id === typingId
            ? { ...msg, text: response, id: Date.now().toString() }
            : msg,
        ),
      );
      this.scrollToBottom();

      // Enviar respuesta a otros bots si es necesario
      if (opts?.relayReplyToFeature) {
        this.forwardReplyToPeerIfNeeded(response, opts.relayReplyToFeature);
      }

      // Registrar interacción exitosa
      this.aiBotStore.recordSuccessfulInteraction(
        this.feature,
        'current_user',
        userInput,
        'chat_response',
        Date.now(),
      );
    } catch (e) {
      // Manejar errores
      this.messages.update((m) =>
        m.map((msg) =>
          msg.id === typingId
            ? {
                ...msg,
                text: 'Lo siento, ocurrió un error. Reintenta por favor.',
                id: Date.now().toString(),
              }
            : msg,
        ),
      );
      this.scrollToBottom();
    }
  }

  async executeFunction(
    funcName: string,
    args: Record<string, any>,
  ): Promise<void> {
    try {
      switch (funcName) {
        case 'configure_ollama': {
          const baseUrl = String(args['baseUrl'] ?? 'http://localhost:11434');
          const model = String(args['model'] ?? 'llama2');
          this.aiBotStore.configureOllama(baseUrl, model);
          await this.triggerAIResponse(
            `(SISTEMA: Ollama configurado con URL: ${baseUrl} y modelo: ${model}. Verificando disponibilidad...)`,
          );
          // Verificar disponibilidad después de configurar
          const available = await this.aiBotStore.checkOllamaAvailability();
          await this.triggerAIResponse(
            available
              ? `(SISTEMA: ¡Ollama conectado exitosamente! Modelos disponibles: ${this.aiBotStore.freeModels().localModels.join(', ')})`
              : `(SISTEMA: No se pudo conectar con Ollama. Verifica que esté ejecutándose en ${baseUrl})`,
          );
          break;
        }

        case 'switch_to_free_provider': {
          const preferred = String(args['preferred'] ?? '');
          if (preferred) {
            this.aiBotStore.selectedProvider.set(preferred as any);
            await this.triggerAIResponse(
              `(SISTEMA: Cambiado a proveedor gratuito: ${preferred})`,
            );
          } else {
            await this.aiBotStore.autoSelectProvider();
            await this.triggerAIResponse(
              `(SISTEMA: Seleccionado automáticamente el mejor proveedor gratuito disponible: ${this.aiBotStore.selectedProvider()})`,
            );
          }
          break;
        }
        case 'check_provider_status': {
          const status = this.aiBotStore.getProviderStatus();
          const statusText = Object.entries(status)
            .map(
              ([provider, available]) =>
                `${provider}: ${available ? '✅ Disponible' : '❌ No disponible'}`,
            )
            .join('\n');
          await this.triggerAIResponse(
            `(SISTEMA: Estado de proveedores de IA:\n${statusText}\n\nProveedor actual: ${this.aiBotStore.selectedProvider()})`,
          );
          break;
        }
        default:
          await this.triggerAIResponse(`Función "${funcName}" no reconocida.`);
      }
    } catch (error) {
      await this.triggerAIResponse(
        `Error ejecutando función ${funcName}: ${error}`,
      );
    }
  }

  private scrollToBottom() {
    setTimeout(() => {
      const el = document.querySelector('.chat-messages');
      if (el) el.scrollTop = el.scrollHeight;
    }, 100);
  }

  private forwardReplyToPeerIfNeeded(text: string, targetFeature: string) {
    if (targetFeature !== this.feature) {
      this.sendToPeer(targetFeature, text);
    }
  }

  private sendToPeer(targetFeature: string, text: string) {
    const targetBot = this.aiBotStore.getBotByFeature(targetFeature);
    if (targetBot) {
      // Enviar mensaje al bot objetivo
      this.aiBotStore.sendInterBotMessage(this.feature, targetFeature, text);
    }
  }

  private detectThemeCommand(text: string): Theme | null {
    const lowerText = text.toLowerCase();

    // Detectar tema verde
    const greenKeywords = [
      'verde',
      'green',
      'tema verdoso',
      'verde app',
      'cambiar tema verde',
      'cambiar tema ',
    ];
    if (greenKeywords.some((keyword) => lowerText.includes(keyword))) {
      return 'green' as Theme;
    }

    // Detectar otros temas comunes
    if (lowerText.includes('tema oscuro') || lowerText.includes('dark')) {
      return 'dark' as Theme;
    }
    if (lowerText.includes('tema claro') || lowerText.includes('light')) {
      return 'light' as Theme;
    }
    if (lowerText.includes('tema azul') || lowerText.includes('blue')) {
      return 'blue' as Theme;
    }

    return null;
  }

  private async executeThemeCommand(theme: Theme, userInput: string) {
    // Ejecutar el cambio de tema
    this.themeService.setTheme(theme);

    // Agregar mensaje del usuario
    this.messages.update((m) => [
      ...m,
      { id: Date.now().toString(), text: userInput, role: 'user' },
    ]);

    // Agregar respuesta de confirmación
    const themeName = this.themeService.themes[theme]?.name || theme;
    const botResponse = `¡Perfecto! He cambiado el tema de la aplicación a "${themeName}". ¿Te gusta cómo se ve?`;

    this.messages.update((m) => [
      ...m,
      {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        role: 'bot',
        reasoning: '',
      },
    ]);

    this.currentInput = '';
    this.scrollToBottom();

    // Broadcast del cambio de tema
    this.aiBotStore.broadcastMessage(
      this.feature,
      `Tema cambiado a ${themeName}`,
      'all',
    );
  }

  private inferGreenThemeKeyFromUserText(text: string): Theme | null {
    // Lógica mejorada para detectar si el usuario quiere un tema verde
    const greenKeywords = [
      'verde',
      'green',
      'nature',
      'forest',
      'emerald',
      'tema verdoso',
      'verde app',
      'cambiar tema',
    ];
    const lowerText = text.toLowerCase();
    return greenKeywords.some((keyword) => lowerText.includes(keyword))
      ? ('green' as Theme)
      : null;
  }
}
