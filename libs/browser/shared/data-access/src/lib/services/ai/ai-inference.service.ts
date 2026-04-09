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

@Injectable({ providedIn: 'root' })
export class AIInferenceService {
  private _isCheckingProviders = false;
  private _lastCheckTime = 0;
  private readonly CHECK_THROTTLE_MS = 60000;

  readonly selectedProvider = signal<AIProvider>(this.getInitialProvider());
  readonly selectedModelId = signal<string>(this.getInitialModelId());
  readonly providerApiKey = signal<string>(
    localStorage.getItem('ai_api_key') ||
      AI_CONFIG.google_api_key ||
      AI_CONFIG.openrouter_api_key ||
      AI_CONFIG.xai_api_key ||
      '',
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
    return localStorage.getItem('ai_selected_model_id') || 'gemini';
  }

  readonly aiModelOptions = computed(() => {
    const options = [
      { value: 'grok', label: 'Grok (xAI) - Gratuito' },
      { value: 'together', label: 'Together AI - Gratuito' },
      { value: 'openrouter', label: 'OpenRouter (Gemma 4 FREE) - Gratuito' },
      { value: 'gemini', label: 'Google Gemini 2.5 Flash (Pata Negra)' },
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

  async generateResponse(prompt: string, context?: string): Promise<string> {
    const provider = this.selectedProvider();
    try {
      switch (provider) {
        case 'gemini': return await this.generateWithGemini(prompt, context);
        case 'openai': return await this.generateWithOpenAI(prompt, context);
        case 'ollama': return await this.generateWithOllama(prompt, context);
        case 'grok': return await this.generateWithGrok(prompt, context);
        case 'together': return await this.generateWithTogether(prompt, context);
        case 'openrouter': return await this.generateWithOpenRouter(prompt, context);
        case 'free': return this.generateSmartFallback(prompt, context);
        default: return this.generateSmartFallback(prompt, context);
      }
    } catch (error: unknown) {
      console.error(`🔴 Error crítico con ${provider}:`, error);
      await this.autoSelectProvider();
      return this.generateBasicResponse();
    }
  }

  private async generateWithGemini(prompt: string, context?: string): Promise<string> {
    const apiKey = this.providerApiKey();
    if (!apiKey) throw new Error('API Key de Gemini no configurada');

    const model = AI_CONFIG.gemini_model;
    const body: {
      contents: Array<{ role: string; parts: Array<{ text: string }> }>;
      generationConfig: { temperature: number; topK: number; topP: number; maxOutputTokens: number };
      system_instruction?: { parts: Array<{ text: string }> };
    } = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 2048 }
    };

    if (context) {
      body.system_instruction = { parts: [{ text: context }] };
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Error en Gemini API');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  private async generateWithOpenAI(prompt: string, context?: string): Promise<string> {
    const apiKey = this.providerApiKey();
    if (!apiKey) throw new Error('API Key de OpenAI no configurada');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          ...(context ? [{ role: 'system', content: context }] : []),
          { role: 'user', content: prompt },
        ],
      }),
    });
    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async generateWithOllama(prompt: string, context?: string): Promise<string> {
    const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;
    const response = await fetch(`${this.ollamaConfig().baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.ollamaConfig().model,
        prompt: fullPrompt,
        stream: false,
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

  private async generateWithTogether(prompt: string, context?: string): Promise<string> {
    const apiKey = this.providerApiKey();
    if (!apiKey) return `[Simulación Together] Sin API Key para: ${prompt}`;
    const resp = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-V3',
        messages: [
          ...(context ? [{ role: 'system', content: context }] : []),
          { role: 'user', content: prompt },
        ],
      }),
    });
    const data = await resp.json();
    return data.choices[0].message.content;
  }

  private async generateWithOpenRouter(prompt: string, context?: string): Promise<string> {
    const apiKey = this.providerApiKey();
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
    if (this._isCheckingProviders) return;
    this._isCheckingProviders = true;
    const providers = [
      { name: 'ollama' as const, check: () => this.checkOllamaAvailability() },
      { name: 'grok' as const, check: () => Promise.resolve(!!this.providerApiKey()) },
      { name: 'gemini' as const, check: () => Promise.resolve(!!this.providerApiKey()) },
    ];
    for (const p of providers) {
      if (await p.check()) {
        this.selectedProvider.set(p.name as AIProvider);
        this._isCheckingProviders = false;
        return;
      }
    }
    this.selectedProvider.set('free');
    this._isCheckingProviders = false;
  }

  private generateBasicResponse(): string {
    return 'Estoy funcionando en modo básico. Configura una API premium para mejores resultados.';
  }

  private generateSmartFallback(prompt: string, context?: string): string {
    console.debug('Generating smart fallback for:', prompt, 'with context:', context?.length);
    return `[Modo Offline] Entiendo que preguntas sobre "${prompt}". Configura una API para una respuesta real.`;
  }
}

