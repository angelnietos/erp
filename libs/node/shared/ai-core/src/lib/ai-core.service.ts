import { Injectable, Logger } from '@nestjs/common';

export const GEMINI_FREE_MODELS = {
  PRO: 'gemini-2.5-pro',
  FLASH: 'gemini-2.5-flash',
  FLASH_LITE: 'gemini-2.5-flash-lite',
  FLASH_3_PREVIEW: 'gemini-3-flash-preview',
  FLASH_LITE_31_PREVIEW: 'gemini-3.1-flash-lite-preview',
  FLASH_LIVE_31_PREVIEW: 'gemini-3.1-flash-live-preview',
} as const;

export interface AiPromptRequest {
  provider: 'gemini' | 'openai' | 'anthropic';
  apiKey: string;
  model?: string;
  systemInstruction?: string;
  prompt: string;
}

@Injectable()
export class AiCoreService {
  private readonly logger = new Logger(AiCoreService.name);

  /**
   * Genera texto estructurado usando el modelo de IA seleccionado por el usuario.
   */
  async generateText(request: AiPromptRequest): Promise<string> {
    this.logger.log(`Iniciando inferencia con proveedor: ${request.provider}${request.model ? ` (modelo: ${request.model})` : ''}`);
    
    if (!request.apiKey) {
      throw new Error('Critical: API Key no proporcionada para el servicio de IA.');
    }

    switch(request.provider) {
      case 'gemini':
        return this.processGemini(request.apiKey, request.prompt, request.systemInstruction, request.model);
      case 'openai':
        return this.processOpenAI(request.apiKey, request.prompt);
      case 'anthropic':
        return this.processAnthropic(request.apiKey, request.prompt);
      default:
        throw new Error(`Proveedor ${request.provider} no soportado.`);
    }
  }

  private async processGemini(
    apiKey: string, 
    prompt: string, 
    systemInstruction?: string, 
    preferredModel: string = GEMINI_FREE_MODELS.FLASH
  ): Promise<string> {
    const fallbackChain = [
      preferredModel,
      GEMINI_FREE_MODELS.FLASH,
      GEMINI_FREE_MODELS.FLASH_LITE,
      GEMINI_FREE_MODELS.FLASH_LITE_31_PREVIEW,
      GEMINI_FREE_MODELS.PRO,
    ];

    const modelsToTry = [...new Set(fallbackChain)];
    let lastError = 'No se pudo obtener respuesta de ningún modelo de Gemini disponible.';

    for (const model of modelsToTry) {
      try {
        const payload: Record<string, unknown> = {
          contents: [{ parts: [{ text: prompt }] }]
        };

        if (systemInstruction) {
          payload['systemInstruction'] = {
            parts: [{ text: systemInstruction }]
          };
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.status === 429) {
          this.logger.warn(`⚠️ [Gemini Fallback] El modelo "${model}" ha alcanzado su límite de cuota (429). Intentando siguiente modelo...`);
          continue;
        }

        if (!response.ok) {
          const errorData = await response.json();
          const errorMsg = errorData.error?.message || `Error HTTP ${response.status}`;
          
          if (response.status >= 500 || errorMsg.toLowerCase().includes('overloaded') || errorMsg.toLowerCase().includes('expired')) {
            this.logger.warn(`⚠️ [Gemini Fallback] Error temporal en "${model}": ${errorMsg}. Probando alternativa...`);
            continue;
          }
          
          throw new Error(errorMsg);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!text) {
          this.logger.warn(`⚠️ [Gemini Fallback] "${model}" devolvió una respuesta vacía o sin candidatos. Reintentando...`);
          continue;
        }

        if (model !== preferredModel) {
          this.logger.log(`✅ [Gemini Recovery] Operación completada exitosamente usando modelo de respaldo: ${model}`);
        }

        return text;
      } catch (e: unknown) {
        if (e instanceof Error) {
          this.logger.error(`Fallo intento con modelo ${model}: ${e.message}`);
          lastError = e.message;
        }
      }
    }

    throw new Error(`Fallo crítico en todos los modelos Gemini: ${lastError}`);
  }

  private async processOpenAI(apiKey: string, prompt: string): Promise<string> {
    // Stub architecture ready for ChatGPT integration
    this.logger.debug(`OpenAI inference requested for prompt length: ${prompt.length}. API Key present: ${!!apiKey}`);
    return 'Integración con OpenAI (GPT-4) pendiente de implementación. Usa Gemini por defecto.';
  }

  private async processAnthropic(apiKey: string, prompt: string): Promise<string> {
    // Stub architecture ready for Claude integration
    this.logger.debug(`Anthropic inference requested for prompt length: ${prompt.length}. API Key present: ${!!apiKey}`);
    return 'Integración con Anthropic (Claude 3.5) pendiente de implementación. Usa Gemini por defecto.';
  }
}
