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
    model: string = GEMINI_FREE_MODELS.FLASH
  ): Promise<string> {
    try {
      const payload: Record<string, unknown> = {
        contents: [{ parts: [{ text: prompt }] }]
      };

      if (systemInstruction) {
        payload['systemInstruction'] = {
          parts: [{ text: systemInstruction }]
        };
      }

      // Utilizamos fetch nativo (Node 18+) para interoperabilidad out-of-the-box sin engordar bundle
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        this.logger.error('Gemini API Error Payload:', errorData);
        throw new Error(`Fallo en OpenAI/Gemini Endpoint: ${response.statusText}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (e: unknown) {
      if (e instanceof Error) {
        this.logger.error('Gemini processing failed', e.message);
      }
      throw new Error('No se pudo generar la respuesta mediante Gemini.');
    }
  }

  private async processOpenAI(_apiKey: string, _prompt: string): Promise<string> {
    // Stub architecture ready for ChatGPT integration
    return 'Integración con OpenAI (GPT-4) pendiente de implementación. Usa Gemini por defecto.';
  }

  private async processAnthropic(_apiKey: string, _prompt: string): Promise<string> {
    // Stub architecture ready for Claude integration
    return 'Integración con Anthropic (Claude 3.5) pendiente de implementación. Usa Gemini por defecto.';
  }
}
