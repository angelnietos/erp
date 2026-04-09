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
                <span
                  *ngFor="let skill of bot()!.activeSkills; trackBy: trackBySkill"
                  class="skill-badge"
                  [style.background]="bot()!.color + '22'"
                  [style.color]="bot()!.color"
                >
                  {{ skill }}
                </span>
              </div>
              <div class="commands-help" *ngIf="bot()!.feature === 'buddy'">
                <p><strong>Comandos disponibles:</strong></p>
                <ul>
                  <li><code>calcula [expresión]</code> - Cálculos matemáticos</li>
                  <li><code>busca [término]</code> - Búsqueda web</li>
                  <li><code>genera imagen de [descripción]</code> - Generación de imágenes</li>
                  <li><code>resume [texto]</code> - Resumen de texto</li>
                  <li><code>qué hora es</code> - Hora actual</li>
                  <li><code>qué fecha es</code> - Fecha actual</li>
                  <li><code>cambiar tema</code> - Cambiar apariencia</li>
                </ul>
              </div>
            </div>

            <div
              *ngFor="let msg of messages(); trackBy: trackByMsg"
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

              <!-- Typing Indicator -->
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
          </div>

          <!-- Input Area -->
          <div class="chat-input-area">
            <button
              class="voice-btn"
              (click)="toggleSpeech()"
              [class.active]="isListening()"
              [title]="isListening() ? 'Detener Dictado' : 'Iniciar Dictado'"
            >
              <lucide-icon
                [name]="isListening() ? 'mic' : 'mic-off'"
                [size]="20"
              ></lucide-icon>
            </button>
            <input
              type="text"
              [(ngModel)]="currentInput"
              (keyup.enter)="sendMessage()"
              placeholder="Escribe un mensaje..."
            />
            <ui-josanz-button
              variant="ghost"
              size="sm"
              icon="send"
              (clicked)="sendMessage()"
              [disabled]="!currentInput.trim()"
            >
            </ui-josanz-button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .ai-assistant-wrapper {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 99999;
    }

    .ai-assistant-wrapper > * {
      pointer-events: auto;
    }

    .ai-assistant-wrapper.secondary {
      z-index: 10000;
    }

    .mascot-trigger {
      cursor: grab;
      transition: all 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28);
      opacity: 0.85;
      transform: scale(0.9);
      filter: saturate(0.9) drop-shadow(0 10px 20px rgba(0,0,0,0.3));
      position: absolute;
      user-select: none;
      width: 100px;
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10001;
      top: 0;
      left: 0;
    }

    .notification-dot {
      position: absolute;
      top: 5px;
      right: 5px;
      width: 14px;
      height: 14px;
      background: #ff4757;
      border: 2px solid rgba(255, 255, 255, 0.8);
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(255, 71, 87, 0.5);
      z-index: 10;
    }

    @keyframes animate-pulse {
      0%,
      100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.7;
        transform: scale(1.1);
      }
    }

    .animate-pulse {
      animation: animate-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes slide-up {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .animate-slide-up {
      animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
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
      padding: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: rgba(0, 0, 0, 0.2);
    }

    .voice-btn {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      cursor: pointer;
      transition: all 0.3s;
    }

    .voice-btn.active {
      background: #ef4444;
      border-color: #ef4444;
      box-shadow: 0 0 15px rgba(239, 68, 68, 0.5);
    }

    .chat-input-area input {
      flex: 1;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 0.65rem 1.25rem;
      color: #fff;
      outline: none;
      transition: border-color 0.3s;
    }

    .chat-input-area input:focus {
      border-color: var(--brand);
    }

    .commands-help {
      margin-top: 0.5rem;
      padding: 0.5rem;
      background: rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .commands-help ul {
      margin: 0.25rem 0 0 0;
      padding-left: 1rem;
    }

    .commands-help li {
      margin-bottom: 0.25rem;
    }

    .commands-help code {
      background: rgba(255, 255, 255, 0.1);
      padding: 0.1rem 0.3rem;
      border-radius: 3px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      color: #fff;
    }
  `],
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
      const b = this.bot();
      console.log(`[AI Assistant] Feature: ${this.feature}, Bot: ${b?.name}, Status: ${b?.status}`);
      
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
      if (themeCommand === 'random') {
        // User said "cambiar tema" without specifying - offer suggestions
        await this.handleRandomThemeRequest(userInput);
      } else {
        await this.executeThemeCommand(themeCommand as Theme, userInput);
      }
      return;
    }

    // Detectar otros comandos útiles
    const generalCommand = this.detectGeneralCommand(userInput);
    if (generalCommand) {
      await this.executeGeneralCommand(
        generalCommand.type,
        generalCommand.args,
        userInput,
      );
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
      // Construir contexto basado en el rol del bot y historial de conversación
      const botMemories = this.aiBotStore.getBotContext(this.feature);
      const conversationHistory = this.messages()
        .slice(-6) // Últimos 6 mensajes para mantener contexto relevante
        .map((m) => `${m.role === 'user' ? 'Usuario' : 'Asistente'}: ${m.text}`)
        .join('\n');

      const systemPrompt = `Eres ${this.bot()!.name}, un asistente de IA especializado en ${this.bot()!.feature}. Responde de manera útil, precisa y en español. Mantén el contexto de la conversación anterior. Si el usuario pregunta sobre tus capacidades, menciona los comandos disponibles como cálculos matemáticos, búsqueda web, generación de imágenes, resumen de texto, hora y fecha actual.`;

      const context =
        `${systemPrompt}\n\nHistorial de conversación reciente:\n${conversationHistory}\n\n` +
        (botMemories.length > 0
          ? `Contexto relevante:\n${botMemories
              .sort((a, b) => b.importance - a.importance)
              .slice(0, 10)
              .map(
                (m) =>
                  `- ${m.text} (${new Date(m.timestamp).toLocaleDateString()})`,
              )
              .join('\n')}\n\n`
          : '');

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

  private detectThemeCommand(text: string): Theme | 'random' | null {
    const lowerText = text.toLowerCase();

    // Check for random theme request
    if (
      lowerText.includes('elige uno aleatorio') ||
      lowerText.includes('random') ||
      lowerText.includes('aleatorio')
    ) {
      // Pick a random theme from popular ones
      const popularThemes: Theme[] = [
        'dark',
        'light',
        'purple',
        'blue',
        'green',
        'orange',
        'rose',
        'cyberpunk-2077',
        'matrix-reloaded',
        'vaporwave-80s',
      ];
      return popularThemes[Math.floor(Math.random() * popularThemes.length)];
    }

    // Check for theme change commands
    const themeChangeKeywords = [
      'cambiar tema',
      'pon un tema',
      'set theme',
      'cambiar a tema',
      'tema',
    ];
    const hasThemeCommand = themeChangeKeywords.some((keyword) =>
      lowerText.includes(keyword),
    );

    if (!hasThemeCommand) {
      return null;
    }

    // Get all available theme names and their keys
    const themeEntries = Object.entries(this.themeService.themes);

    // Check if user mentioned any theme name
    for (const [themeKey, themeConfig] of themeEntries) {
      const themeName = themeConfig.name.toLowerCase();
      const themeKeyLower = themeKey.toLowerCase();

      // Check for theme name or key in user input
      if (lowerText.includes(themeName) || lowerText.includes(themeKeyLower)) {
        return themeKey as Theme;
      }
    }

    // Fallback to common keywords for popular themes
    const keywordMappings: Record<string, Theme> = {
      verde: 'green',
      green: 'green',
      oscuro: 'dark',
      dark: 'dark',
      claro: 'light',
      light: 'light',
      azul: 'blue',
      blue: 'blue',
      morado: 'purple',
      purple: 'purple',
      naranja: 'orange',
      orange: 'orange',
      rosa: 'rose',
      rose: 'rose',
      cyan: 'cyan',
      teal: 'teal',
      amarillo: 'amber',
      amber: 'amber',
      indigo: 'indigo',
      lime: 'lime',
      violet: 'violet',
      crimson: 'crimson',
      mint: 'mint',
      coral: 'coral',
      oro: 'gold',
      gold: 'gold',
    };

    for (const [keyword, theme] of Object.entries(keywordMappings)) {
      if (lowerText.includes(keyword)) {
        return theme;
      }
    }

    // If user just said "cambiar tema" without specifying, return a special flag
    // We'll handle this in sendMessage by offering suggestions or picking random
    return 'random'; // Special case to show suggestions
  }

  private async handleRandomThemeRequest(userInput: string) {
    // Agregar mensaje del usuario
    this.messages.update((m) => [
      ...m,
      { id: Date.now().toString(), text: userInput, role: 'user' },
    ]);

    // Get some popular/fun themes to suggest
    const popularThemes: Theme[] = [
      'dark',
      'light',
      'purple',
      'blue',
      'green',
      'orange',
      'rose',
      'cyberpunk-2077',
      'matrix-reloaded',
      'vaporwave-80s',
    ];
    const randomThemes = popularThemes
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);

    const themeOptions = randomThemes
      .map((theme) => {
        const themeName = this.themeService.themes[theme]?.name || theme;
        return `"${themeName}"`;
      })
      .join(', ');

    const botResponse = `¡Claro! Tengo muchos temas disponibles. Aquí van algunas sugerencias populares: ${themeOptions}. ¿Cuál te gustaría probar? O dime "elige uno aleatorio" para que yo escoja uno por ti.`;

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

  private detectGeneralCommand(
    text: string,
  ): { type: string; args: Record<string, any> } | null {
    const lowerText = text.toLowerCase();

    // Detección de cálculos matemáticos
    const calcPatterns = [
      /calcula?\s+(.+)/i,
      /cuánto\s+es\s+(.+)/i,
      /what\s+is\s+(.+)/i,
      /calculate\s+(.+)/i,
      /(\d+[\+\-\*\/\(\)\.\s]*\d+)/, // Expresiones con números y operadores
    ];

    for (const pattern of calcPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const expression = match[1].trim();
        // Verificar que contenga operadores matemáticos
        if (/[\+\-\*\/]/.test(expression)) {
          return { type: 'calculate', args: { expression } };
        }
      }
    }

    // Detección de búsqueda web
    const searchPatterns = [
      /busca\s+(.+)/i,
      /buscar\s+(.+)/i,
      /search\s+(.+)/i,
      /investiga\s+(.+)/i,
    ];

    for (const pattern of searchPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return { type: 'web_search', args: { query: match[1].trim() } };
      }
    }

    // Detección de generación de imágenes
    const imagePatterns = [
      /genera\s+(?:una\s+)?imagen\s+de\s+(.+)/i,
      /crea\s+(?:una\s+)?imagen\s+de\s+(.+)/i,
      /generate\s+(?:an\s+)?image\s+of\s+(.+)/i,
    ];

    for (const pattern of imagePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return { type: 'generate_image', args: { prompt: match[1].trim() } };
      }
    }

    // Detección de resumen de texto
    if (/resume\s+(.+)/i.test(text) || /resumir\s+(.+)/i.test(text)) {
      const match = text.match(/(?:resume|resumir)\s+(.+)/i);
      if (match) {
        return { type: 'summarize', args: { text: match[1].trim() } };
      }
    }

    // Detección de hora actual
    if (
      /qué\s+hora\s+es/i.test(lowerText) ||
      /what\s+time\s+is\s+it/i.test(lowerText)
    ) {
      return { type: 'current_time', args: {} };
    }

    // Detección de fecha actual
    if (
      /qué\s+fecha\s+es/i.test(lowerText) ||
      /what\s+date\s+is\s+it/i.test(lowerText) ||
      /qué\s+día\s+es\s+hoy/i.test(lowerText)
    ) {
      return { type: 'current_date', args: {} };
    }

    return null;
  }

  private async executeGeneralCommand(
    type: string,
    args: Record<string, any>,
    userInput: string,
  ) {
    // Agregar mensaje del usuario
    this.messages.update((m) => [
      ...m,
      { id: Date.now().toString(), text: userInput, role: 'user' },
    ]);
    this.currentInput = '';
    this.scrollToBottom();

    let botResponse = '';
    let reasoning = '';

    try {
      switch (type) {
        case 'calculate':
          reasoning = `Calculando la expresión matemática: ${args['expression']}`;
          const result = this.safeEvaluateMath(args['expression']);
          botResponse = `El resultado de ${args['expression']} es: **${result}**`;
          break;

        case 'web_search':
          reasoning = `Realizando búsqueda web para: ${args['query']}`;
          botResponse = `Buscando información sobre "${args['query']}"... Para búsquedas avanzadas, considera usar Gemini como proveedor de IA.`;
          // Aquí podrías integrar una API de búsqueda si tienes acceso
          break;

        case 'generate_image':
          reasoning = `Generando imagen con el prompt: ${args['prompt']}`;
          botResponse = `Generando imagen de "${args['prompt']}"... Esta función requiere integración con servicios de IA como DALL-E o Stable Diffusion.`;
          break;

        case 'summarize':
          reasoning = `Resumiendo el texto proporcionado`;
          const summary = this.generateSummary(args['text']);
          botResponse = `Resumen: ${summary}`;
          break;

        case 'current_time':
          reasoning = `Consultando la hora actual`;
          botResponse = `La hora actual es: **${new Date().toLocaleTimeString('es-ES')}**`;
          break;

        case 'current_date':
          reasoning = `Consultando la fecha actual`;
          botResponse = `La fecha actual es: **${new Date().toLocaleDateString('es-ES')}**`;
          break;

        default:
          botResponse = `Comando "${type}" no reconocido.`;
      }

      this.messages.update((m) => [
        ...m,
        {
          id: (Date.now() + 1).toString(),
          text: botResponse,
          role: 'bot',
          reasoning: reasoning || undefined,
        },
      ]);
    } catch (error) {
      this.messages.update((m) => [
        ...m,
        {
          id: (Date.now() + 1).toString(),
          text: `Error ejecutando comando ${type}: ${error}`,
          role: 'bot',
        },
      ]);
    }

    this.scrollToBottom();
  }

  private safeEvaluateMath(expression: string): string {
    try {
      // Limpiar la expresión para seguridad básica
      const cleanExpr = expression
        .replace(/[^0-9+\-*/().\s]/g, '') // Solo permitir números, operadores y paréntesis
        .replace(/\s+/g, ''); // Remover espacios

      // Evaluar con Function constructor para mayor seguridad
      const result = new Function('return ' + cleanExpr)();
      return typeof result === 'number'
        ? result.toString()
        : 'Resultado no numérico';
    } catch (error) {
      return `Error en cálculo: ${error}`;
    }
  }

  private generateSummary(text: string): string {
    // Implementación básica de resumen
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    if (sentences.length <= 3) return text;

    // Tomar primera y última oración, y una del medio si hay muchas
    const summary =
      [
        sentences[0],
        sentences[Math.floor(sentences.length / 2)],
        sentences[sentences.length - 1],
      ]
        .filter((s, i, arr) => arr.indexOf(s) === i) // Remover duplicados
        .join('. ') + '.';

    return summary.length > 100 ? summary.substring(0, 100) + '...' : summary;
  }

  trackBySkill(index: number, skill: string) {
    return skill;
  }

  trackByMsg(index: number, msg: any) {
    return msg.id;
  }
}
