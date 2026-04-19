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
  isDevMode,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import {
  AIBotStore,
  DashboardAnalyticsService,
  ThemeService,
  Theme,
  MasterFilterService,
  InterBotMessage,
  OrchestrationBus,
  TechnicianApiService,
  getAiFeatureFromUrl,
  AIProvider,
} from '@josanz-erp/shared-data-access';
import { UIMascotComponent } from '../mascot/mascot.component';
import { UiButtonComponent } from '../button/button.component';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragEnd } from '@angular/cdk/drag-drop';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

type ChatMessageItem = {
  id: string;
  text: string;
  role: 'user' | 'bot';
  reasoning?: string;
  feedbackSubmitted?: boolean;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

interface SpeechRecognitionLike {
  continuous: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionResultEvent {
  results: {
    [index: number]: { [index: number]: { transcript: string } };
  };
}

type WindowWithSpeechRecognition = Window &
  typeof globalThis & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };

@Component({
  selector: 'ui-ai-assistant',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    UIMascotComponent,
    UiButtonComponent,
    FormsModule,
    DragDropModule,
  ],
  templateUrl: './ai-assistant.component.html',
  styleUrls: ['./ai-assistant.component.scss'],
})
export class UIAIChatComponent implements OnInit, OnDestroy {
  private readonly _feature = signal<string>('');
  @Input() set feature(val: string) {
    this._feature.set(val);
  }
  get feature(): string {
    return this._feature();
  }

  /** En layout dual: Buddy (orquestador) vs bot del módulo actual. */
  @Input() assistantRole: 'buddy' | 'domain' = 'domain';

  aiBotStore = inject(AIBotStore);
  orchestrationBus = inject(OrchestrationBus);
  private technicianApi = inject(TechnicianApiService);
  masterFilterService = inject(MasterFilterService);
  dashboardService = inject(DashboardAnalyticsService);
  themeService = inject(ThemeService);
  http = inject(HttpClient);
  masterFilter = inject(MasterFilterService);
  router = inject(Router);
  ngZone = inject(NgZone);

  /** Módulo ERP actual (eventos, clientes, …) para contexto cuando el shell es Buddy. */
  private readonly navEvents = toSignal(
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)),
  );
  readonly domainFeature = computed(() => {
    this.navEvents();
    return getAiFeatureFromUrl(this.router.url);
  });

  /** Dominio ERP para memoria cuando este chat es el orquestador (antiguo Buddy). */
  readonly contextFeature = computed(() => {
    const f = this._feature();
    return this.assistantRole === 'buddy' ? this.domainFeature() : f;
  });

  readonly currentUserId = signal<string>(
    JSON.parse(localStorage.getItem('auth_user') || 'null')?.email ||
      JSON.parse(localStorage.getItem('auth_user') || 'null')?.id ||
      'anonymous',
  );

  readonly currentUserPersonality = computed(() =>
    this.aiBotStore.getUserPersonality(this.contextFeature(), this.currentUserId()),
  );

  readonly bot = computed(() =>
    this.aiBotStore.getEffectiveBotForCurrentUser(this.feature),
  );
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
  readonly messages = signal<ChatMessageItem[]>([]);
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

  submitFeedback(msg: ChatMessageItem, type: 'positive' | 'negative') {
    msg.feedbackSubmitted = true;
    this.messages.update((m) => [...m]);
    const fbText = `Feedback de Usuario (${type === 'positive' ? '👍 POSITIVO' : '👎 NEGATIVO'}): Tu respuesta fue "${msg.text.substring(0, 75)}...".`;
    this.aiBotStore.remember(
      this.contextFeature(),
      fbText,
      type === 'positive' ? 3 : 5,
    );
  }

  isListening = signal(false);
  private recognition: SpeechRecognitionLike | null = null;
  private textBeforeDictation = '';
  private el = inject(ElementRef);

  constructor() {
    this.initSpeechRecognition();

    // React to inter-bot queue messages
    effect(() => {
      const b = this.bot();
      this.aiBotStore.interBotQueue(); // re-ejecutar cuando lleguen mensajes
      if (isDevMode()) {
        console.debug(
          `[AI Assistant] Feature: ${this.feature}, Bot: ${b?.name}, Status: ${b?.status}`,
        );
      }
      
      this.aiBotStore.interBotTick();
      const items =
        this.assistantRole === 'buddy'
          ? this.aiBotStore.pullInterBotMessagesForFeatures([this._feature()], {
              includeGlobalBroadcast: true,
            })
          : this.aiBotStore.pullInterBotMessagesForDomainFeature(this.feature);
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

    // React to OrchestrationBus tasks dispatched to this bot
    effect(() => {
      this.orchestrationBus.tasks(); // re-ejecutar cuando haya tareas nuevas
      const selfFeature = this._feature();
      if (!selfFeature) return;
      const pending = this.orchestrationBus.getPendingFor(selfFeature);
      if (pending.length === 0) return;

      pending.forEach((task) => {
        const claimed = this.orchestrationBus.claimTask(task.id);
        if (!claimed) return;

        this.ngZone.run(async () => {
          try {
            const instruction = (task.payload['instruction'] as string) ||
              `Ejecuta: ${task.type} — ${JSON.stringify(task.payload)}`;
            const targetDomain = task.to;

            const isOrchestrator = this.assistantRole === 'buddy';
            const orchName = this.aiBotStore.getBotDisplayName(selfFeature);
            const taskLabel = isOrchestrator
              ? `🎯 **Tarea de ${orchName} (orquestador):** ${instruction}`
              : `🎯 **Tarea en tu dominio (${targetDomain}):** ${instruction}`;

            this.messages.update(m => [
              ...m,
              {
                id: `${Date.now()}-orch`,
                text: taskLabel,
                role: 'bot',
              },
            ]);
            this.scrollToBottom();

            if (isOrchestrator) {
              await this.triggerAIResponse(
                `INSTRUCCIÓN AUTOMÁTICA DEL ORQUESTADOR (${orchName}):\n${instruction}\n\nEjecuta esta tarea en el contexto de tu dominio (${targetDomain}). Responde brevemente qué hiciste y ejecuta las acciones de sistema correspondientes.`,
              );
            } else {
              await this.triggerAIResponse(
                `INSTRUCCIÓN DE WORKFLOW:\n${instruction}\n\nActúa como especialista del dominio **${selfFeature}** y ejecuta lo necesario en el ERP.`,
              );
            }

            this.orchestrationBus.complete(
              task.id,
              `Bot ${targetDomain} procesó la tarea`,
            );
          } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e);
            this.orchestrationBus.fail(task.id, message);
          }
        });
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

      if (isDevMode()) {
        console.debug('Estado de proveedores de IA:', this.aiBotStore.getProviderStatus());
      }
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
    const w = window as WindowWithSpeechRecognition;
    const SpeechRecognitionCtor =
      w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (SpeechRecognitionCtor) {
      this.recognition = new SpeechRecognitionCtor();
      this.recognition.continuous = false;
      this.recognition.lang = 'es-ES';
      this.recognition.onstart = () => this.isListening.set(true);
      this.recognition.onresult = (event: SpeechRecognitionResultEvent) => {
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
    this.aiBotStore.trackInteraction(this.contextFeature(), this.currentUserId());
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
      const memoryKeys =
        this.assistantRole === 'buddy'
          ? [...new Set([this._feature(), this.domainFeature()])]
          : [this.feature];
      const botMemories = memoryKeys.flatMap((k) =>
        this.aiBotStore.getBotContext(k),
      );
      const conversationHistory = this.messages()
        .slice(-6) // Últimos 6 mensajes para mantener contexto relevante
        .map((m) => `${m.role === 'user' ? 'Usuario' : 'Asistente'}: ${m.text}`)
        .join('\n');

      const displayName = this.aiBotStore.getBotDisplayName(this.feature);
      const userLayer = this.mergeUserLayersForPrompt();
      const userLayerExtras: string[] = [];
      if (userLayer.rules.trim()) {
        userLayerExtras.push(
          `Reglas que el usuario quiere que respetes:\n${userLayer.rules.trim()}`,
        );
      }
      if (userLayer.systemInstructions.trim()) {
        userLayerExtras.push(
          `Instrucciones adicionales del usuario:\n${userLayer.systemInstructions.trim()}`,
        );
      }
      if (userLayer.promptPresets.length > 0) {
        userLayerExtras.push(
          `Comportamientos / prompts definidos por el usuario:\n${userLayer.promptPresets
            .map((p) => `- **${p.title}**: ${p.content}`)
            .join('\n')}`,
        );
      }
      if (userLayer.activeSkills.length > 0) {
        userLayerExtras.push(
          `Capacidades que este usuario tiene activas (prioriza ayudar en estas áreas): ${userLayer.activeSkills.join(', ')}.`,
        );
      }
      const userLayerBlock =
        userLayerExtras.length > 0 ? `\n\n${userLayerExtras.join('\n\n')}` : '';

      let technicianSnapshot = '';
      if (this.domainFeature() === 'users') {
        try {
          const techs = await firstValueFrom(this.technicianApi.getTechnicians());
          const summary = techs.map((t) => ({
            id: t.id,
            nombre:
              [t.user?.firstName, t.user?.lastName].filter(Boolean).join(' ').trim() ||
              t.user?.email ||
              '(sin nombre)',
            email: t.user?.email,
            skills: t.skills,
            estado: t.status,
          }));
          technicianSnapshot =
            `\n\nDatos actuales de técnicos (API /api/technicians). Usa estos ids y habilidades en tus respuestas:\n${JSON.stringify(summary, null, 2)}\n`;
        } catch {
          technicianSnapshot =
            '\n\n(No se pudo cargar la lista de técnicos; sugiere comprobar sesión y API.)\n';
        }
      }

      const domainHint =
        this.assistantRole === 'buddy'
          ? ` El usuario está ahora en el módulo **${this.domainFeature()}** del ERP; prioriza ese contexto en ejemplos y acciones.`
          : '';
      const botFeature = this.bot()?.feature ?? this.feature;
      const systemPrompt = `Eres ${displayName}, un asistente de IA especializado en ${botFeature}.${domainHint} Responde de manera útil, precisa y en español. Mantén el contexto de la conversación anterior. Si el usuario pregunta sobre tus capacidades, menciona los comandos disponibles como cálculos matemáticos, búsqueda web, generación de imágenes, resumen de texto, hora y fecha actual. ${this.aiBotStore.getActionSystemPrompt()}${userLayerBlock}`;

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
          : '') +
        technicianSnapshot;

      // Generar respuesta usando proveedores gratuitos con contexto
      const response = await this.aiBotStore.generateFreeResponse(
        userInput,
        context,
      );

      // Detectar y procesar acciones del bot
      let displayResponse = response;
      if (response.includes('[ACTION]')) {
        const parts = response.split('[ACTION]');
        displayResponse = parts[0].trim();
        const actionStr = parts[1].trim();

        // Ejecutar la acción técnica en el sistema (Workflow)
        await this.aiBotStore.executeAction(actionStr, {
          sourceFeature: this.feature,
        });
      }

      // Actualizar mensaje con respuesta (limpia de metadatos de acción)
      this.messages.update((m) =>
        m.map((msg) =>
          msg.id === typingId
            ? { ...msg, text: displayResponse, id: Date.now().toString() }
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
        this.contextFeature(),
        'current_user',
        userInput,
        'chat_response',
        Date.now(),
      );
    } catch {
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
    args: Record<string, unknown>,
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
            this.aiBotStore.selectedProvider.set(preferred as AIProvider);
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
  ): { type: string; args: Record<string, unknown> } | null {
    const lowerText = text.toLowerCase();

    // Detección de cálculos matemáticos
    const calcPatterns = [
      /calcula?\s+(.+)/i,
      /cuánto\s+es\s+(.+)/i,
      /what\s+is\s+(.+)/i,
      /calculate\s+(.+)/i,
      /(\d+[-+*/().\s]*\d+)/, // Expresiones con números y operadores
    ];

    for (const pattern of calcPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const expression = match[1].trim();
        // Verificar que contenga operadores matemáticos
        if (/[-+*/]/.test(expression)) {
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
    args: Record<string, unknown>,
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
        case 'calculate': {
          const expression = String(args['expression'] ?? '');
          reasoning = `Calculando la expresión matemática: ${expression}`;
          const result = this.safeEvaluateMath(expression);
          botResponse = `El resultado de ${expression} es: **${result}**`;
          break;
        }

        case 'web_search': {
          const query = String(args['query'] ?? '');
          reasoning = `Realizando búsqueda web para: ${query}`;
          botResponse = `Buscando información sobre "${query}"... Para búsquedas avanzadas, considera usar Gemini como proveedor de IA.`;
          // Aquí podrías integrar una API de búsqueda si tienes acceso
          break;
        }

        case 'generate_image': {
          const prompt = String(args['prompt'] ?? '');
          reasoning = `Generando imagen con el prompt: ${prompt}`;
          botResponse = `Generando imagen de "${prompt}"... Esta función requiere integración con servicios de IA como DALL-E o Stable Diffusion.`;
          break;
        }

        case 'summarize': {
          reasoning = `Resumiendo el texto proporcionado`;
          const summary = this.generateSummary(String(args['text'] ?? ''));
          botResponse = `Resumen: ${summary}`;
          break;
        }

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

  /**
   * Capa de preferencias del usuario: Buddy + capa del módulo actual (p. ej. JAIME en panel).
   */
  private mergeUserLayersForPrompt() {
    if (this.assistantRole !== 'buddy') {
      return this.aiBotStore.getUserAgentConfig(this.feature);
    }
    const principal = this._feature();
    const b = this.aiBotStore.getUserAgentConfig(principal);
    const dom = this.domainFeature();
    const d = this.aiBotStore.getUserAgentConfig(dom);
    if (dom === principal) {
      return b;
    }
    return {
      activeSkills: [...new Set([...b.activeSkills, ...d.activeSkills])],
      rules: [b.rules, d.rules].filter(Boolean).join('\n\n'),
      systemInstructions: [b.systemInstructions, d.systemInstructions]
        .filter(Boolean)
        .join('\n\n'),
      promptPresets: [...b.promptPresets, ...d.promptPresets],
    };
  }
}
