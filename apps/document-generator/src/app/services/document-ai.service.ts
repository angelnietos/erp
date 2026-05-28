import { inject, Injectable } from '@angular/core';
import {
  AIInferenceService,
  GenerateResponseOptions,
} from '@josanz-erp/shared-data-access';
import { AgentPersonaService } from './agent-persona.service';
import type { AgentMemoryNoteRow } from '../db/agent-memory-dexie';

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

interface DocumentOutline {
  sections: Array<{
    title: string;
    keyPoints: string[];
  }>;
  tone: string;
  targetAudience?: string;
}

@Injectable({ providedIn: 'root' })
export class DocumentAiService {
  private readonly inference = inject(AIInferenceService);
  private readonly persona = inject(AgentPersonaService);

  /** Genera un borrador completo a partir de una consigna breve. */
  async generateDraft(
    brief: string,
    ctx: DocumentAiContext,
  ): Promise<string> {
    // Chain-of-thought approach: first create outline, then generate content
    const outline = await this.generateDocumentOutline(brief, ctx);
    const content = await this.generateContentFromOutline(outline, brief, ctx);
    
    // Self-reflection: critique and improve the generated content
    const improvedContent = await this.reflectAndImprove(content, ctx);
    
    return improvedContent;
  }

  /** Amplía o reescribe el contenido actual según instrucciones. */
  async transformContent(
    instruction: string,
    ctx: DocumentAiContext,
  ): Promise<string> {
    const prompt = this.buildPrompt(instruction, ctx, 'transform');
    const system = await this.buildSystemPrompt(ctx);
    const raw = await this.inference.generateResponse(
      prompt,
      system,
      DOCUMENT_AI_GEN_OPTS,
    );
    return this.stripCodeFences(raw);
  }

  /** Genera un esquema estructurado del documento antes de escribirlo */
  private async generateDocumentOutline(
    brief: string,
    ctx: DocumentAiContext,
  ): Promise<DocumentOutline> {
    const outlinePrompt = `
Basándote en la siguiente consigna para un ${ctx.documentTypeLabel}, crea un esquema estructurado del documento:

Consigna: ${brief}

El esquema debe incluir:
1. Título principal del documento
2. Secciones numeradas recomendadas (## 1., ## 2., etc.)
3. Puntos clave que deben abordarse en cada sección
4. Tono recomendado (formal, técnico, persuasivo, etc.)
5. Audiencia objetivo si es relevante

Formato de respuesta ESPECIFICO:
TÍTULO: [Título del documento]
TONO: [Tono recomendado]
AUDIENCIA: [Audiencia objetivo, si aplica]
SECCIONES:
## 1. [Título de la sección 1]
- [Punto clave 1]
- [Punto clave 2]
## 2. [Título de la sección 2]
- [Punto clave 1]
- [Punto clave 2]
[Continuar con todas las secciones necesarias]`;

    const system = await this.buildSystemPrompt(ctx);
    const raw = await this.inference.generateResponse(
      outlinePrompt,
      system,
      { maxOutputTokens: 2048 }, // Less tokens needed for outline
    );
    
    return this.parseOutline(this.stripCodeFences(raw));
  }

  /** Genera el contenido completo basado en el esquema */
  private async generateContentFromOutline(
    outline: DocumentOutline,
    brief: string,
    ctx: DocumentAiContext,
  ): Promise<string> {
    const prompt = `
Eres un redactor profesional. Basándote en el siguiente esquema y consigna, genera un documento completo en Markdown:

ESQUEMA:
Título: ${outline.sections.length > 0 ? outline.sections[0].title : 'Documento'}
Tono: ${outline.tone}
${outline.targetAudience ? `Audiencia: ${outline.targetAudience}` : ''}
Secciones a desarrollar:
${outline.sections.map((s, i) => 
  `## ${i + 1}. ${s.title}\n${s.keyPoints.map(p => `- ${p}`).join('\n')}`
).join('\n\n')}

CONSIGNA ORIGINAL DEL USUARIO:
${brief}

INSTRUCCIONES:
1. Genera el documento COMPLETO en Markdown con secciones numeradas (## 1., ## 2., etc.)
2. Desarrolla cada punto del esquema en párrafos coherentes y bien estructurados
3. Mantén el tono especificado a lo largo de todo el documento
4. Usa marcadores [rellenar: descripción] donde falten datos concretos
5. No incluyas explicaciones ni metatexto, solo el documento final
6. Asegúrate de que el flujo entre secciones sea lógico y natural`;

    const system = await this.buildSystemPrompt(ctx);
    const raw = await this.inference.generateResponse(
      prompt,
      system,
      DOCUMENT_AI_GEN_OPTS,
    );
    
    return this.stripCodeFences(raw);
  }

  /** Analiza el contenido generado y propone mejoras mediante auto-reflexión */
  private async reflectAndImprove(
    content: string,
    ctx: DocumentAiContext,
  ): Promise<string> {
    // First, analyze the content for common issues
    const analysisPrompt = `
Analiza el siguiente documento generado y identifica áreas de mejora específica:

DOCUMENTO:
${content}

CONTEXTO:
- Tipo de documento: ${ctx.documentTypeLabel}
- Cliente: ${ctx.clientName || 'No especificado'}
- Título: ${ctx.title || 'No especificado'}

Identifica específicamente:
1. PROBLEMAS DE ESTRUCTURA: ¿Falta alguna sección importante? ¿El flujo es lógico?
2. PROBLEMAS DE TONO: ¿Es demasiado informal/formal para el tipo de documento?
3. PROBLEMAS DE CLARIDAD: ¿Hay ambiguedades, repeticiones o frases confusas?
4. PROBLEMAS DE COMPLETITUD: ¿Falta información crítica según la consigna original?
5. PROBLEMAS DE FORMATO: ¿Cumple con las normas de Markdown GFM y numeración de secciones?

Para cada problema encontrado, proporciona:
- Una descripción clara del problema
- Una sugerencia específica de cómo mejorarlo
- La sección o parte del documento donde aplicar la mejora

Sé específico y constructivo en tu análisis.`;

    const system = await this.buildSystemPrompt(ctx);
    const analysisRaw = await this.inference.generateResponse(
      analysisPrompt,
      system,
      { maxOutputTokens: 2048 },
    );
    
    const analysis = this.stripCodeFences(analysisRaw);
    
    // If no significant issues found, return original content
    if (this.hasNoSignificantIssues(analysis)) {
      return content;
    }
    
    // Generate improvement instructions based on analysis
    const improvementPrompt = `
Basándote en el siguiente análisis de mejora, genera una versión mejorada del documento:

ANÁLISIS DE MEJORAS:
${analysis}

DOCUMENTO ORIGINAL:
${content}

INSTRUCCIONES:
1. Aplica TODAS las mejoras sugeridas en el análisis
2. Mantén la estructura básica y los puntos clave del documento original
3. Mejora el tono, claridad y completitud según se indique
4. Preserva cualquier marcador [rellenar: …] que fuera apropiado
5. Devuelve SOLO el documento mejorado en Markdown, sin explicaciones adicionales`;

    const improvementRaw = await this.inference.generateResponse(
      improvementPrompt,
      system,
      DOCUMENT_AI_GEN_OPTS,
    );
    
    return this.stripCodeFences(improvementRaw);
  }

  /** Parsea el esquema generado por la IA en un objeto estructurado */
  private parseOutline(raw: string): DocumentOutline {
    const lines = raw.split('\n').map(line => line.trim());
    
    let title = '';
    let tone = 'Claro y formal';
    let targetAudience: string | undefined;
    const sections: Array<{ title: string; keyPoints: string[] }> = [];
    
    let currentSection: { title: string; keyPoints: string[] } | null = null;
    
    for (const line of lines) {
      if (line.startsWith('TÍTULO:')) {
        title = line.substring('TÍTULO:'.length).trim();
      } else if (line.startsWith('TONO:')) {
        tone = line.substring('TONO:'.length).trim();
      } else if (line.startsWith('AUDIENCIA:')) {
        targetAudience = line.substring('AUDIENCIA:'.length).trim();
        if (targetAudience.toLowerCase() === 'no especificado' || !targetAudience) {
          targetAudience = undefined;
        }
      } else if (line.startsWith('## ')) {
        // Save previous section if exists
        if (currentSection) {
          sections.push(currentSection);
        }
        
        // Start new section
        const sectionTitle = line.substring(3).trim();
        currentSection = { title: sectionTitle, keyPoints: [] };
      } else if (line.startsWith('- ') && currentSection) {
        const point = line.substring(2).trim();
        if (point) {
          currentSection.keyPoints.push(point);
        }
      }
    }
    
    // Don't forget the last section
    if (currentSection) {
      sections.push(currentSection);
    }
    
    // If no sections were parsed, create a default one
    if (sections.length === 0) {
      sections.push({
        title: 'Contenido Principal',
        keyPoints: [title || 'Desarrollar según la consigna proporcionada']
      });
    }
    
    return {
      sections,
      tone,
      targetAudience
    };
  }

  /** Determina si el análisis indica que no hay problemas significativos */
  private hasNoSignificantIssues(analysis: string): boolean {
    const lowerAnalysis = analysis.toLowerCase();
    const noIssueIndicators = [
      'no se encontraron problemas',
      'no hay problemas significativos',
      'el documento está bien estructurado',
      'no se requieren mejoras',
      'correcto como está',
      'cumple con los requisitos'
    ];
    
    return noIssueIndicators.some(indicator => lowerAnalysis.includes(indicator));
  }

  private async buildSystemPrompt(ctx: DocumentAiContext): Promise<string> {
    try {
      // Usar la nueva función de aumento de prompt consciente del contexto
      const extra = await this.persona.getPromptAugmentationForContext({
        documentTypeId: ctx.documentTypeId,
        title: ctx.title,
        clientName: ctx.clientName,
        existingContent: ctx.existingContent
      });
      return `${SYSTEM_DOC_WRITER}\n\n---\nInstrucciones y memoria del entorno:\n${extra}`;
    } catch {
      // Fallback al método original en caso de error
      const extra = await this.persona.getPromptAugmentation();
      return `${SYSTEM_DOC_WRITER}\n\n---\nInstrucciones y memoria del entorno:\n${extra}`;
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

