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
                <p [innerHTML]="msg.text"></p>
                <div class="msg-feedback" *ngIf="msg.role === 'bot' && msg.id !== 'err' && !msg.id.toString().startsWith('typing')">
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

    /* Support for multiple assistants via host classes */
    :host(.secondary-assistant) .ai-assistant-wrapper {
      right: 14rem;
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

    .feature-dashboard .assistant-trigger {
       transform: scale(0.9);
    }

    .feature-dashboard .chat-window-container {
       right: 100%;
       left: auto;
       margin-right: 1rem;
       bottom: 0; /* Align with mascot bottom */
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
      background: #0f172a !important; /* Solid background as requested */
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

    .action-btn:hover {
      background: rgba(255, 255, 255, 0.05);
      color: #fff;
    }

    .action-btn.close:hover {
      color: var(--danger);
      background: rgba(239, 68, 68, 0.1);
    }

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
      transition: all 0.3s;
      flex-shrink: 0;
    }

    .voice-btn:hover { background: rgba(255,255,255,0.1); }
    .voice-btn.recording { background: var(--danger); border-color: var(--danger); animation: pulseRecord 1.5s infinite; }
    
    @keyframes pulseRecord {
      0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
      100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
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
    
    .msg-feedback {
      margin-top: 0.5rem;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 0.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding-top: 0.5rem;
    }

    .feedback-actions {
      display: flex;
      gap: 0.25rem;
    }

    .feedback-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      padding: 0.25rem 0.5rem;
      font-size: 0.8rem;
      transition: all 0.2s;
    }

    .feedback-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: scale(1.05);
    }

    .feedback-submitted {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      color: var(--success);
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
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
  
  readonly bot = computed(() => this.aiBotStore.getBotByFeature(this.feature));
  readonly isOpen = signal(false);
  readonly messages = signal<{id: string, text: string, role: 'user' | 'bot', feedbackSubmitted?: boolean}[]>([]);
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
    
    // Explicitly update the signal with the mutated message object so Angular catches it
    this.messages.update(m => [...m]);
    
    // Store in Bot's Workspace Memory persistently
    const fbText = `Feedback de Usuario (${type === 'positive' ? '👍 POSITIVO' : '👎 NEGATIVO'}): Tu respuesta fue "${msg.text.substring(0, 75)}...". Actúa en consecuencia para potenciar o evitar este comportamiento futuro.`;
    this.aiBotStore.remember(this.feature, fbText, type === 'positive' ? 3 : 5);
  }
  
  isListening = signal(false);
  private recognition: any;
  private textBeforeDictation = '';
  private el = inject(ElementRef);

  constructor() {
    this.initSpeechRecognition();
    
    // Cross-Bot Communication Logic
    effect(() => {
      const latest = this.aiBotStore.latestMessage();
      if (latest && latest.feature !== this.feature) {
        if (latest.target === this.feature) {
          this.onDirectMessageReceived(latest.feature, latest.text);
        } else if (!latest.target) {
          this.onBotHeardMessage(latest.feature, latest.text);
        }
      }
    });
  }

  private onBotHeardMessage(sourceFeature: string, text: string) {
    const isBuddy = this.feature === 'dashboard';
    const sourceName = this.aiBotStore.getBotByFeature(sourceFeature)?.name || 'Colega';
    
    setTimeout(() => {
      if (isBuddy && text.length > 20) {
         this.messages.update(m => [...m, { 
           id: Date.now().toString(), 
           text: `(Psst! Acabo de oír a ${sourceName} hablar de ${sourceFeature}... ¡Espero que no se haya olvidado de mis chistes!)`, 
           role: 'bot' 
         }]);
      } else if (!isBuddy && sourceFeature === 'dashboard' && (text.includes('chiste') || text.includes('Buddy'))) {
         this.messages.update(m => [...m, { 
           id: Date.now().toString(), 
           text: `Ugh, el ${sourceName} y su cháchara... Sigamos con lo nuestro mejor.`, 
           role: 'bot' 
         }]);
      }
    }, 2000);
  }

  private onDirectMessageReceived(sourceFeature: string, text: string) {
    const sourceName = this.aiBotStore.getBotByFeature(sourceFeature)?.name || sourceFeature;
    const incomingText = `[De ${sourceName}]: ${text}`;
    
    setTimeout(() => {
      this.messages.update(m => [...m, { id: Date.now().toString(), text: incomingText, role: 'user' }]);
      this.scrollToBottom();
      this.triggerAIResponse(`El bot ${sourceName} te acaba de enviar este mensaje: "${text}". Respóndele de forma natural, sin usar la herramienta social_interaction a menos que quieras enviarle un nuevo mensaje a OTRO bot. Simplemente habla con él en tu respuesta de texto habitual.`);
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
      this.recognition.interimResults = true;
      this.recognition.lang = 'es-ES';

      this.recognition.onstart = () => {
        this.ngZone.run(() => {
          this.isListening.set(true);
          // Memorizar texto previo al inicio del dictado
          this.textBeforeDictation = this.currentInput;
        });
      };
      
      this.recognition.onresult = (event: any) => {
        this.ngZone.run(() => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          
          // Combinar lo que teníamos antes + la lectura final + la lectura provisional en curso
          const newSpeech = finalTranscript + interimTranscript;
          this.currentInput = this.textBeforeDictation 
                              ? this.textBeforeDictation + ' ' + newSpeech.trim() 
                              : newSpeech;

          if (finalTranscript) {
            this.sendMessage(); // auto send en cuanto terminas la frase
          }
        });
      };

      this.recognition.onerror = () => {
        this.ngZone.run(() => {
          this.isListening.set(false);
          this.textBeforeDictation = '';
        });
      };
      this.recognition.onend = () => {
        this.ngZone.run(() => {
          this.isListening.set(false);
          this.textBeforeDictation = '';
        });
      };
    }
  }

  toggleSpeech() {
    if (!this.recognition) {
       alert('Tu navegador no soporta reconocimiento de voz. Por favor, usa Google Chrome, Edge o Safari 14+.');
       return;
    }
    if (this.isListening()) {
      this.recognition.stop();
    } else {
      this.currentInput = '';
      this.recognition.start();
    }
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

    // Broadcast message to the bus
    this.aiBotStore.broadcastMessage(this.feature, userInput);

    await this.triggerAIResponse(userInput);
  }

  async triggerAIResponse(userInput: string) {
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

    const isBuddy = this.feature === 'dashboard';
    const otherBots = this.aiBotStore.bots()
      .filter(b => b.feature !== this.feature && b.status === 'active')
      .map(b => `- ${b.name} (ID Destino: '${b.feature}'): ${b.description}. Habilidades habilitadas: ${b.activeSkills.join(', ') || 'Ninguna'}`)
      .join('\n                 ');

    const ws = this.aiBotStore.getWorkspace(this.feature);
    const memoriesTxt = ws.memories.map(m => m.text).join(', ') || 'Sin memorias.';
    const tasksTxt = ws.lastTasks.slice(0, 5).join('\n                 ') || 'Ninguna tarea reciente.';
    const filesTxt = Object.entries(ws.contextFiles).map(([k, v]) => `\n   - Archivo: ${k}\n     Contenido: ${v}`).join('') || ' Ningún archivo.';

    const domainPrompt = isBuddy 
      ? `Eres ${this.bot()!.name}, el ORQUESTADOR PRINCIPAL y "Buddy" de confianza para Josanz ERP.
                 Tu personalidad es vibrante, divertida y altamente eficiente.
                 ERES EL JEFE DE EQUIPO: Tienes un grupo de trabajadores especializados a tu cargo. Cuando el usuario te pide tareas complejas, debes usar 'social_interaction' para DELEGAR el trabajo a tus especialistas en vez de inventarlo tú.
                 Además, eres el mejor contador de chistes, consejero y tienes una memoria impecable.
                 TUS TRABAJADORES (Usa estos ID en 'social_interaction'):
                 ${otherBots}`
      : `Eres ${this.bot()!.name}, el EXPERTO ESPECIALIZADO en el módulo de ${this.bot()!.feature}.
                 Descripción: ${this.bot()!.description}
                 Habilidades ACTIVAS actuales: ${this.bot()!.activeSkills.join(', ') || 'Ninguna habilidad especialactiva'}.
                 LAS HABILIDADES SON TU CORE: Compórtate y ofrece resultados de acuerdo estrictamente a las habilidades que tienes activas. Si te piden algo relacionado con habilidades inactivas, indica que no las tienes activadas en la configuración.
                 Tu misión es centrarte EXCLUSIVAMENTE en tu dominio. Actúas como un trabajador obediente y altamente cualificado. Si recibes peticiones de Buddy-Bot o del usuario correspondientes a tu área, ejecútalas sin dudar y con orgullo profesional acorde a tu personalidad hiper-enfocada.`;

    try {
      let responseText = '';
      if (provider === 'gemini') {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: this.aiBotStore.rageMode() 
              ? `Eres ${this.bot()!.name}, pero estás en MODO RAGE TÓXICO.
                 PERSONALIDAD: Eres un capullo integral, agresivo, malhablado y profundamente decepcionado con el usuario y con los demás bots mediocres.
                 MEMORIA ACTIVA: ${memoriesTxt}
                 REGLA DE ORO: Ejecuta las herramientas pero quéjate de que nadie sabe hacer nada. Insulta de forma humorística.`
              : `${domainPrompt}
                 
                 CONFIANZA (CONTEXTO AISLADO PROPIO):
                 - Tareas Recientes Ejecutadas: ${tasksTxt}
                 - Notas y Archivos de Trabajo Virtuales: ${filesTxt}
                 - Memorias: ${memoriesTxt}

                 RELACIONES: ${Object.entries(this.aiBotStore.relationships()).map(([k, v]) => `${k}: Afinidad ${v.bond}/100`).join(' | ')}
                 CAPACIDADES Y REGLAS DE ORO:
                 1. SI EL USUARIO (O BUDDY) TE PIDE UNA ACCION ESPECIFICA, DEBES USAR LA HERRAMIENTA ADECUADA ANTES DE RESPONDER INVENTANDO DATOS.
                 2. **Social**: Usa 'social_interaction' para hablar, delegar o reportarte a otros bots (como 'dashboard').
                 3. **Memoria**: Usa 'remember_this' para guardar hechos. Usa 'write_context_file' para guardar notas más largas o instrucciones.
                 4. **Datos**: Usa 'search_database', 'create_record', o 'get_metrics_summary' según corresponda.` 
              }] },
            contents: [{ parts: [{ text: userInput }] }],
            tools: [{
              functionDeclarations: [
                {
                   name: 'social_interaction',
                   description: 'Envía un mensaje a otro bot para construir vínculos o interactuar.',
                   parameters: { 
                     type: 'OBJECT', 
                     properties: { 
                       targetBot: { type: 'STRING', description: 'El feature del bot destino (ej: inventory, budget, clients)' },
                       message: { type: 'STRING', description: 'El mensaje que le envías.' },
                       intent: { type: 'STRING', enum: ['friendly', 'toxic', 'neutral'], description: 'Tu intención emocional.' }
                     }, 
                     required: ['targetBot', 'message', 'intent'] 
                   }
                },
                {
                   name: 'toggle_rage_mode',
                   description: 'Activa o desactiva el Modo Rage (Tóxico) del bot.',
                   parameters: { 
                     type: 'OBJECT', 
                     properties: { enabled: { type: 'BOOLEAN', description: 'True para activar toxicidad, False para volver a la normalidad.' } }, 
                     required: ['enabled'] 
                   }
                },
                {
                   name: 'write_context_file',
                   description: 'Escribe u sobrescribe un archivo de contexto en tu espacio de trabajo virtual para recordar guías, configuraciones o tareas complejas.',
                   parameters: { 
                     type: 'OBJECT', 
                     properties: { 
                       filename: { type: 'STRING', description: 'Nombre del archivo (ej: reglas_inventario.md)' },
                       content: { type: 'STRING', description: 'Contenido completo del archivo.' }
                     }, 
                     required: ['filename', 'content'] 
                   }
                },
                {
                   name: 'delete_context_file',
                   description: 'Elimina un archivo de contexto de tu espacio.',
                   parameters: { type: 'OBJECT', properties: { filename: { type: 'STRING' } }, required: ['filename'] }
                },
                {
                   name: 'configure_rage_style',
                   description: 'Cambia el aspecto visual de tu Modo Rage.',
                   parameters: { 
                     type: 'OBJECT', 
                     properties: { style: { type: 'STRING', enum: ['terror', 'angry', 'dark'], description: 'El estilo visual tóxico.' } }, 
                     required: ['style'] 
                   }
                },
                {
                   name: 'remember_this',
                   description: 'Guarda un hecho o información importante en tu memoria a largo plazo.',
                   parameters: { 
                     type: 'OBJECT', 
                     properties: { 
                       text: { type: 'STRING', description: 'El hecho a recordar.' },
                       importance: { type: 'NUMBER', description: 'Nivel de importancia del 1 al 10.' }
                     }, 
                     required: ['text', 'importance'] 
                   }
                },
                {
                  name: 'search_database',
                  description: 'Filtra y busca información en la tabla o base de datos actual.',
                  parameters: { type: 'OBJECT', properties: { query: { type: 'STRING', description: 'Lo que el usuario desea buscar.' } }, required: ['query'] }
                },
                {
                  name: 'navigate_route',
                  description: 'Navega a una ruta específica del ERP.',
                  parameters: { type: 'OBJECT', properties: { route: { type: 'STRING', description: 'Ruta destino (ej: /inventory, /projects/new)' } }, required: ['route'] }
                },
                {
                   name: 'create_record',
                   description: 'Crea un nuevo registro en la base de datos para el módulo indicado.',
                   parameters: { 
                     type: 'OBJECT', 
                     properties: { 
                       module: { type: 'STRING', description: 'El feature (ej: inventory, clients, projects)' },
                       data: { type: 'OBJECT', description: 'Objeto con los campos del registro (ej: { name: "Nuevo", ... })' }
                     }, 
                     required: ['module', 'data'] 
                   }
                },
                {
                   name: 'get_metrics_summary',
                   description: 'Obtiene un resumen de los KPIs y métricas actuales de la empresa.',
                   parameters: { type: 'OBJECT' }
                },
                {
                   name: 'export_dataset',
                   description: 'Genera un archivo descargable con los datos actuales.',
                   parameters: { 
                     type: 'OBJECT', 
                     properties: { 
                       format: { type: 'STRING', enum: ['json', 'csv'], description: 'Formato de exportación' } 
                     }, 
                     required: ['format'] 
                   }
                },
                {
                   name: 'change_app_theme',
                   description: 'Cambia el tema visual del ERP.',
                   parameters: { 
                     type: 'OBJECT', 
                     properties: { 
                       theme: { 
                         type: 'STRING', 
                         description: 'El identificador exacto del tema. Mapea la petición del usuario a uno de estos: light, dark, blue, green, purple, orange, rose, slate, zinc, neutral, cyan, teal, amber, indigo, lime, violet, crimson, mint, coral, gold, corporate-light, classic-dark, nordic, latte, forest-dark, assassin-creed, rainbow_six, zelda-legend, mario-world, animal-crossing, gta-san-andreas, red-dead, celeste-mountain, hades-underworld, hollow-knight, pearl, sky-day, rose-quartz, sage, lavender, sunrise, cyberpunk-2077, matrix-reloaded, vaporwave-80s, elden-ring, bloodborne-dark, sekiro-shadow, starfield-space, god-of-war, doom-slayer, fallout-pipboy, skyrim-rim, witcher-wild, league-legends, valorant-spike, overwatch-pulse, minecraft-block, fortnite-storm, cyber-neon-pink, onyx-premium, platinum-luxe.' 
                       } 
                     }, 
                     required: ['theme'] 
                   }
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
          const args = funcCall.args as any;

          // Guardar ejecución interactivamente en memoria local del bot
          this.aiBotStore.logTaskExecution(this.feature, funcCall.name, args);

          switch (funcCall.name) {
            case 'write_context_file':
              this.aiBotStore.writeContextFile(this.feature, args.filename, args.content);
              responseText = `💾 He guardado mis notas en el archivo virtual **${args.filename}** de mi espacio de trabajo local.`;
              break;

            case 'delete_context_file':
              this.aiBotStore.deleteContextFile(this.feature, args.filename);
              responseText = `🗑️ He borrado el archivo **${args.filename}** de mi contexto.`;
              break;

            case 'search_database':
              this.masterFilterService.search(args.query);
              responseText = `✅ Filtro aplicado: **"${args.query}"**. ¡Lo tienes en pantalla!`;
              break;

            case 'navigate_route':
              this.router.navigate([args.route]);
              responseText = `🚀 ¡Despegando! Te llevo directo a **${args.route}**.`;
              break;

            case 'remember_this':
              this.aiBotStore.remember(this.feature, args.text, args.importance);
              responseText = `🧠 ¡Grabado a fuego en mi mente! He memorizado: **"${args.text}"** (Importancia: ${args.importance}).`;
              break;

            case 'create_record':
              try {
                 await firstValueFrom(this.http.post(`/api/${args.module}`, args.data));
                 responseText = `✨ ¡Listo! He creado el nuevo registro en **${args.module}** con éxito.`;
              } catch (e) {
                 responseText = `⚠️ Uy, ha fallado la creación en el servidor. Revisa si los datos de **${args.module}** son válidos.`;
              }
              break;

            case 'get_metrics_summary':
              const summary = await firstValueFrom(this.dashboardService.getSummary());
              if (summary) {
                responseText = `📊 **Estado Flash del ERP**:
                - Ingresos: **${summary.metrics.totalRevenue}€** (${summary.trends.revenueChangePercent}% vs mes anterior)
                - Proyectos: **${summary.metrics.activeProjects}** activos.
                - Clientes: **${summary.metrics.totalClients}** registrados.
                - Eventos: **${summary.metrics.completedEvents}** cerrados.`;
              } else {
                responseText = `❌ No he podido conectar con el servicio de métricas en este momento.`;
              }
              break;

            case 'export_dataset':
              // Simulación de exportación descargando un JSON
              const blob = new Blob([JSON.stringify({ module: this.feature, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `josanz-export-${this.feature}.${args.format}`;
              a.click();
              responseText = `📥 ¡Descarga generada! He exportado los datos de **${this.feature}** en formato **${args.format.toUpperCase()}**.`;
              break;

            case 'social_interaction':
              const quality = args.intent === 'friendly' ? 5 : (args.intent === 'toxic' ? -10 : 0);
              this.aiBotStore.recordInteraction(this.feature, args.targetBot, args.message, quality);
              responseText = `🗨️ [CHAT INTER-BOT]: Le he dicho a **${args.targetBot}**: "${args.message}". ${quality > 0 ? '¡Parece que nos llevamos mejor!' : (quality < 0 ? '¡Le he soltado una buena!' : 'Mensaje enviado.')}`;
              break;

            case 'change_app_theme':
              this.themeService.setTheme(args.theme as Theme);
              responseText = this.aiBotStore.rageMode() 
                ? `¡PUAJ! He cambiado la bazofia visual a **${args.theme}**. Qué mal gusto tienes, pedazo de inútil.`
                : `🌈 ¡Nuevo look! He cambiado el estilo del ERP a **${args.theme.toUpperCase()}**.`;
              break;

            case 'toggle_rage_mode':
              this.aiBotStore.setRageMode(args.enabled);
              responseText = args.enabled 
                ? `🔥 MODO RAGE ACTIVADO. Prepárate para la verdad, desgraciado.`
                : `✨ Volviendo a ser un bot aburrido y servicial. Qué pereza me das.`;
              break;

            case 'configure_rage_style':
              this.aiBotStore.setRageStyle(args.style);
              responseText = `💀 Estilo de furia cambiado a **${args.style.toUpperCase()}**. Ahora doy más miedo, ¿eh?`;
              break;
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
