import { inject, Injectable } from '@angular/core';
import {
  AIInferenceService,
  GenerateResponseOptions,
} from '@josanz-erp/shared-data-access';
import { AgentPersonaService } from './agent-persona.service';

export interface DocumentAiContext {
  /** quote | proposal | documentation | architecture | resume | interview | offer */
  documentTypeId: string;
  documentTypeLabel: string;
  title?: string;
  /** Cliente seleccionado en el formulario (si aplica). */
  clientName?: string;
  templateName?: string;
  templateDescription?: string;
  existingContent?: string;
}

/** Borradores largos: más tokens de salida en proveedores compatibles. */
const DOCUMENT_AI_GEN_OPTS: GenerateResponseOptions = {
  maxOutputTokens: 8192,
};

const SYSTEM_DOC_WRITER = `Eres un redactor profesional de documentos empresariales en español.
Reglas:
- Salida SOLO en Markdown (GFM): títulos ## numerados (## 1. Título, ## 2. …), listas, tablas cuando ayuden.
- Tono claro y formal; sin marketing vacío.
- Usa marcadores [rellenar: …] donde falten datos concretos.
- No envuelvas la respuesta en bloques \`\`\`markdown; solo el texto.`;

@Injectable({ providedIn: 'root' })
export class DocumentAiService {
  private readonly inference = inject(AIInferenceService);
  private readonly persona = inject(AgentPersonaService);

  /** Genera un borrador completo a partir de una consigna breve. */
  async generateDraft(
    brief: string,
    ctx: DocumentAiContext,
  ): Promise<string> {
    const prompt = this.buildPrompt(brief, ctx, 'full');
    const system = await this.buildSystemPrompt();
    const raw = await this.inference.generateResponse(
      prompt,
      system,
      DOCUMENT_AI_GEN_OPTS,
    );
    return this.stripCodeFences(raw);
  }

  /** Amplía o reescribe el contenido actual según instrucciones. */
  async transformContent(
    instruction: string,
    ctx: DocumentAiContext,
  ): Promise<string> {
    const prompt = this.buildPrompt(instruction, ctx, 'transform');
    const system = await this.buildSystemPrompt();
    const raw = await this.inference.generateResponse(
      prompt,
      system,
      DOCUMENT_AI_GEN_OPTS,
    );
    return this.stripCodeFences(raw);
  }

  private async buildSystemPrompt(): Promise<string> {
    try {
      const extra = await this.persona.getPromptAugmentation();
      return `${SYSTEM_DOC_WRITER}\n\n---\nInstrucciones y memoria del entorno:\n${extra}`;
    } catch {
      return SYSTEM_DOC_WRITER;
    }
  }

  private buildPrompt(
    userText: string,
    ctx: DocumentAiContext,
    mode: 'full' | 'transform',
  ): string {
    const parts: string[] = [
      `Tipo de documento: ${ctx.documentTypeLabel} (id: ${ctx.documentTypeId}).`,
    ];
    if (ctx.title?.trim()) {
      parts.push(`Título de trabajo: ${ctx.title.trim()}.`);
    }
    if (ctx.clientName?.trim()) {
      parts.push(`Cliente o destinataria: ${ctx.clientName.trim()}.`);
    }
    if (ctx.templateName) {
      parts.push(
        `Plantilla de referencia: ${ctx.templateName}${ctx.templateDescription ? ` — ${ctx.templateDescription}` : ''}.`,
      );
    }

    if (mode === 'full') {
      parts.push(
        'Genera un documento completo y listo para revisar, con secciones numeradas.',
        'Consigna del usuario:',
        userText.trim(),
      );
    } else {
      parts.push(
        'Contenido actual del documento:',
        '---',
        (ctx.existingContent ?? '').slice(0, 120_000),
        '---',
        'Instrucción:',
        userText.trim(),
        'Devuelve el documento completo en Markdown aplicando la instrucción (no solo un fragmento), manteniendo estructura salvo que pida lo contrario.',
      );
    }

    return parts.join('\n');
  }

  private stripCodeFences(text: string): string {
    let t = text.trim();
    const wrapped = /^```(?:markdown|md)?\s*([\s\S]*?)```\s*$/i.exec(t);
    if (wrapped) {
      return wrapped[1].trim();
    }
    if (t.startsWith('```')) {
      t = t.replace(/^```(?:markdown|md)?\s*/i, '');
      t = t.replace(/\s*```\s*$/i, '');
    }
    return t.trim();
  }
}
