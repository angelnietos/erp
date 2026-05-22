import { Injectable, signal, computed, effect } from '@angular/core';
import { AI_CONFIG } from '../../configs/ai.config';

export type AIProvider =
  | 'gemini'
  | 'openai'
  | 'anthropic'
  | 'grok'
  | 'together'
  | 'openrouter'
  | 'ollama'
  | 'free';

/** Opciones opcionales para `generateResponse` (retrocompatibles). */
export interface GenerateResponseOptions {
  /** Tokens de salida máximos donde el proveedor lo permita (p. ej. documentos largos). Por defecto 2048. */
  maxOutputTokens?: number;
}

@Injectable({ providedIn: 'root' })
export class AIInferenceService {
  private _isCheckingProviders = false;
  private _lastCheckTime = 0;
  private readonly CHECK_THROTTLE_MS = 60000;

  readonly selectedProvider = signal<AIProvider>(this.getInitialProvider());
  readonly selectedModelId = signal<string>(this.getInitialModelId());
  readonly providerApiKey = signal<string>(
    localStorage.getItem('ai_api_key') || this.getInitialApiKey()
  );

  readonly ollamaConfig = signal<{
    baseUrl: string;
    model: string;
    available: boolean;
  }>({
    baseUrl: localStorage.getItem('ollama_base_url') || 'http://localhost:11434',
    model: localStorage.getItem('ollama_model') || 'llama2',
    available: false,
  });

  readonly freeModels = signal<{
    huggingface: { model: string; available: boolean };
    localModels: string[];
  }>({
    huggingface: { model: 'mistralai/Mistral-7B-v0.1', available: true },
    localModels: [],
  });

  constructor() {
    // MIGRATION: stale 'grok' provider + existing Google key → switch to gemini
    const storedProvider = localStorage.getItem('ai_provider');
    if (storedProvider === 'grok' && AI_CONFIG.google_api_key) {
      localStorage.setItem('ai_provider', 'gemini');
      localStorage.setItem('ai_selected_model_id', 'gemini-2.5-flash');
      this.selectedProvider.set('gemini');
      this.selectedModelId.set('gemini-2.5-flash');
    } else if (!storedProvider && AI_CONFIG.google_api_key) {
      this.selectedProvider.set('gemini');
      this.selectedModelId.set('gemini-2.5-flash');
    }

    effect(() => {
      localStorage.setItem('ai_provider', this.selectedProvider());
      localStorage.setItem('ai_selected_model_id', this.selectedModelId());
      localStorage.setItem('ai_api_key', this.providerApiKey());
      localStorage.setItem('ollama_base_url', this.ollamaConfig().baseUrl);
      localStorage.setItem('ollama_model', this.ollamaConfig().model);
    });
  }

  private getInitialProvider(): AIProvider {
    const persisted = localStorage.getItem('ai_provider');
    const validProviders = ['gemini', 'openai', 'anthropic', 'grok', 'together', 'openrouter', 'ollama', 'free'];
    return (validProviders.includes(persisted || '') ? persisted : 'gemini') as AIProvider;
  }

  private getInitialModelId(): string {
    const model = localStorage.getItem('ai_selected_model_id');
    return model === 'gemini' || !model ? 'gemini-2.5-flash' : model;
  }

  private getInitialApiKey(): string {
    const provider = this.getInitialProvider();
    switch (provider) {
      case 'gemini': return AI_CONFIG.google_api_key || '';
      case 'grok': return AI_CONFIG.xai_api_key || '';
      case 'openrouter': return AI_CONFIG.openrouter_api_key || '';
      default: return AI_CONFIG.google_api_key || AI_CONFIG.openrouter_api_key || AI_CONFIG.xai_api_key || '';
    }
  }

  readonly aiModelOptions = computed(() => {
    const options = [
      { value: 'grok', label: 'Grok (xAI) - Gratuito' },
      { value: 'together', label: 'Together AI - Gratuito' },
      { value: 'openrouter', label: 'OpenRouter (Gemma 4 FREE) - Gratuito' },
      { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Default)' },
      { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (Calidad)' },
      { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
      { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash Preview' },
      { value: 'gemini-3.1-flash-lite-preview', label: 'Gemini 3.1 Flash Lite Preview' },
      { value: 'gemini-3.1-flash-live-preview', label: 'Gemini 3.1 Flash Live Preview' },
      { value: 'openai', label: 'OpenAI GPT-4o' },
      { value: 'anthropic', label: 'Anthropic Claude 3.5' },
    ];

    this.freeModels().localModels.forEach((m) => {
      options.push({ value: `ollama:${m}`, label: `Ollama: ${m} (Local)` });
    });

    return options;
  });

  readonly needsApiKey = computed(() => {
    return !['ollama', 'free'].includes(this.selectedProvider());
  });

  async generateResponse(
    prompt: string,
    context?: string,
    options?: GenerateResponseOptions,
  ): Promise<string> {
    // selectedModelId is the source of truth — it's what the Settings UI dropdown controls.
    // selectedProvider is kept in sync by setAIModel, but may lag due to HMR or initialization order.
    const modelId = this.selectedModelId();
    let provider: AIProvider;
    
    if (modelId.startsWith('ollama:')) {
      provider = 'ollama';
    } else if (modelId.startsWith('gemini')) {
      provider = 'gemini';
    } else {
      provider = modelId as AIProvider;
    }

    // Keep selectedProvider in sync silently
    if (this.selectedProvider() !== provider) {
      this.selectedProvider.set(provider);
    }

    try {
      switch (provider) {
        case 'gemini': return await this.generateWithGemini(prompt, context, options);
        case 'openai': return await this.generateWithOpenAI(prompt, context, options);
        case 'ollama': return await this.generateWithOllama(prompt, context, options);
        case 'grok': return await this.generateWithGrok(prompt, context);
        case 'together': return await this.generateWithTogether(prompt, context, options);
        case 'openrouter': return await this.generateWithOpenRouter(prompt, context, options);
        case 'free': return this.generateSmartFallback(prompt, context);
        default: return this.generateSmartFallback(prompt, context);
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`🔴 Error con proveedor [${provider}]:`, msg);
      throw new Error(`[🤖 ${provider.toUpperCase()}] ${msg}`);
    }
  }

  private resolveMaxOutputTokens(
    options: GenerateResponseOptions | undefined,
    fallback = 2048,
    cap = 8192,
  ): number {
    const n = options?.maxOutputTokens ?? fallback;
    return Math.min(Math.max(256, n), cap);
  }

  private async generateWithGemini(
    prompt: string,
    context?: string,
    options?: GenerateResponseOptions,
  ): Promise<string> {
    // Always prefer the Google-specific key, then fall back to the generic stored key
    const apiKey = AI_CONFIG.google_api_key || this.providerApiKey();
    if (!apiKey) throw new Error('API Key de Gemini no configurada. Ve a Configuración → Asistentes de IA y añade tu clave de Google.');

    const selectedModelId = this.selectedModelId();
    const primaryModel = selectedModelId.startsWith('gemini') 
      ? selectedModelId 
      : (AI_CONFIG.gemini_model || 'gemini-2.5-flash');

    // Chain of fallbacks to ensure availability
    const fallbackChain = [
      primaryModel,
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-3.1-flash-lite-preview',
      'gemini-2.5-pro'
    ];

    // Deduplicate while maintaining priority order
    const modelsToTry = [...new Set(fallbackChain)];
    let lastError = 'No se pudo obtener respuesta de ningún modelo de Gemini.';

    for (const model of modelsToTry) {
      try {
        // Prepend context as part of the user message — works universally across all API versions
        const fullPrompt = context ? `${context}\n\n---\n\nUsuario: ${prompt}` : prompt;

        const maxOut = this.resolveMaxOutputTokens(options);
        const body = {
          contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: maxOut,
          },
        };

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (response.status === 429) {
          console.warn(`⚡ [AI Fallback] Modelo "${model}" agotado por cuota (429). Saltando al siguiente...`);
          continue;
        }

        if (!response.ok) {
          const errorData = await response.json();
          const errorMsg = errorData.error?.message || `Error HTTP ${response.status}`;
          
          // Si es un error de modelo sobrecargado o temporal, intentamos el siguiente
          if (response.status >= 500 || errorMsg.toLowerCase().includes('overloaded') || errorMsg.toLowerCase().includes('expired')) {
             console.warn(`⚠️ [AI Fallback] Error temporal en "${model}": ${errorMsg}. Reintentando con otro...`);
             continue;
          }

          throw new Error(errorMsg);
        }

        const data = await response.json();
        
        if (model !== primaryModel) {
          console.info(`✅ [AI Recovery] Recuperado exitosamente usando modelo de backup: ${model}`);
        }

        return data.candidates[0].content.parts[0].text;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        lastError = errorMessage;
        console.error(`❌ Fallo en intento con ${model}:`, errorMessage);
        // Seguir al siguiente modelo en el bucle
      }
    }

    throw new Error(`Fallback Fallido: ${lastError}`);
  }

  private async generateWithOpenAI(
    prompt: string,
    context?: string,
    options?: GenerateResponseOptions,
  ): Promise<string> {
    const apiKey = this.providerApiKey();
    if (!apiKey) throw new Error('API Key de OpenAI no configurada');
    const maxTokens = this.resolveMaxOutputTokens(options, 2048, 16384);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          ...(context ? [{ role: 'system', content: context }] : []),
          { role: 'user', content: prompt },
        ],
        max_tokens: maxTokens,
      }),
    });
    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async generateWithOllama(
    prompt: string,
    context?: string,
    options?: GenerateResponseOptions,
  ): Promise<string> {
    const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;
    const numPredict = this.resolveMaxOutputTokens(options, 2048, 8192);
    const response = await fetch(`${this.ollamaConfig().baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.ollamaConfig().model,
        prompt: fullPrompt,
        stream: false,
        options: { num_predict: numPredict },
      }),
    });
    const data = await response.json();
    return data.response || 'Error con Ollama';
  }

  private async generateWithGrok(prompt: string, context?: string): Promise<string> {
    const apiKey = this.providerApiKey();
    if (!apiKey) return `[Simulación Grok] Sin API Key para: ${prompt}`;
    const resp = await fetch('https://api.x.ai/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'grok-4.20-reasoning',
        input: context ? `${context}\n\nPregunta: ${prompt}` : prompt,
      }),
    });
    const data = await resp.json();
    return data.output || data.choices?.[0]?.message?.content || 'Error Grok';
  }

  private async generateWithTogether(
    prompt: string,
    context?: string,
    options?: GenerateResponseOptions,
  ): Promise<string> {
    const apiKey = this.providerApiKey();
    if (!apiKey) return `[Simulación Together] Sin API Key para: ${prompt}`;
    const maxTokens = this.resolveMaxOutputTokens(options, 2048, 8192);
    const resp = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-V3',
        messages: [
          ...(context ? [{ role: 'system', content: context }] : []),
          { role: 'user', content: prompt },
        ],
        max_tokens: maxTokens,
      }),
    });
    const data = await resp.json();
    return data.choices[0].message.content;
  }

  private async generateWithOpenRouter(
    prompt: string,
    context?: string,
    options?: GenerateResponseOptions,
  ): Promise<string> {
    const apiKey = this.providerApiKey();
    const maxTokens = this.resolveMaxOutputTokens(options, 2048, 8192);
    const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey || ''}`,
        'HTTP-Referer': 'http://localhost:4200',
        'X-Title': 'Josanz ERP',
      },
      body: JSON.stringify({
        model: AI_CONFIG.openrouter_model,
        messages: [
          ...(context ? [{ role: 'system', content: context }] : []),
          { role: 'user', content: prompt },
        ],
        max_tokens: maxTokens,
      }),
    });
    const data = await resp.json();
    return data.choices[0].message.content;
  }

  async checkOllamaAvailability(force = false): Promise<boolean> {
    const now = Date.now();
    if (!force && now - this._lastCheckTime < this.CHECK_THROTTLE_MS) return this.ollamaConfig().available;
    this._lastCheckTime = now;
    try {
      const response = await fetch(`${this.ollamaConfig().baseUrl}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        const availableModels = (data.models as Array<{name: string}>)?.map((m) => m.name) || [];
        this.freeModels.update(c => ({ ...c, localModels: availableModels }));
        this.ollamaConfig.update(c => ({ ...c, available: true }));
        return true;
      }
    } catch (e) {
      console.warn('Ollama not available', e);
    }
    this.ollamaConfig.update(c => ({ ...c, available: false }));
    return false;
  }

  async autoSelectProvider(): Promise<void> {
    // Only auto-select if the provider is explicitly 'free' (never override a user's choice)
    if (this.selectedProvider() !== 'free') return;
    if (this._isCheckingProviders) return;
    this._isCheckingProviders = true;
    try {
      const ollamaAvailable = await this.checkOllamaAvailability();
      if (ollamaAvailable) {
        this.selectedProvider.set('ollama');
        return;
      }
      if (AI_CONFIG.google_api_key) {
        this.selectedProvider.set('gemini');
        return;
      }
      if (AI_CONFIG.xai_api_key) {
        this.selectedProvider.set('grok');
        return;
      }
      if (AI_CONFIG.openrouter_api_key) {
        this.selectedProvider.set('openrouter');
        return;
      }
    } finally {
      this._isCheckingProviders = false;
    }
  }

  private generateBasicResponse(): string {
    return 'Estoy funcionando en modo básico. Configura una API premium para mejores resultados.';
  }

  private generateSmartFallback(prompt: string, context?: string): string {
    console.debug('Generating smart fallback for:', prompt, 'with context:', context?.length);
    return `[Modo Offline] Entiendo que preguntas sobre "${prompt}". Configura una API para una respuesta real.`;
  }
}

