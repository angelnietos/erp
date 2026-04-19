import { inject, Injectable } from '@angular/core';
import { AIInferenceService } from '@josanz-erp/shared-data-access';
import type { DocumentPersistedPayload } from './document-persistence.service';

export type AnalysisStatus = 'pass' | 'warning' | 'error' | 'pending';

export interface ProposalAnalysisCriterion {
  id: string;
  name: string;
  description: string;
}

export interface ProposalAnalysisResultItem {
  checkId: string;
  status: AnalysisStatus;
  message: string;
  suggestions: string[];
}

const SYSTEM_ANALYST = `Eres un analista senior de propuestas comerciales y documentación B2B en español.
Debes evaluar el documento REAL que recibes (Markdown o texto). No inventes contenido que no esté o no se deduzca con claridad.
Responde ÚNICAMENTE con un array JSON válido (RFC 8259), sin markdown, sin texto antes ni después.
Formato de cada elemento:
{"checkId":"string","status":"pass"|"warning"|"error","message":"string breve en español","suggestions":["máx. 4 frases accionables"]}
Reglas de status:
- pass: el criterio se cumple de forma clara en el documento.
- warning: hay algo parcial, ambiguo o mejorable.
- error: falta, es insuficiente o contradice el objetivo del criterio.`;

const SYSTEM_CHAT = `Eres un asistente de calidad para propuestas y documentos comerciales en español.
Respondes de forma breve y accionable. Si el usuario pregunta por el documento, basa tus respuestas en el texto proporcionado; no inventes datos que no aparezcan.`;

const MAX_DOC_CHARS = 120_000;

@Injectable({ providedIn: 'root' })
export class ProposalAnalysisService {
  private readonly inference = inject(AIInferenceService);

  /** Construye un único texto para análisis a partir del payload guardado en IndexedDB. */
  buildTextFromPayload(payload: DocumentPersistedPayload): string {
    const p = payload as Record<string, unknown>;
    const lines: string[] = [];

    const push = (label: string, key: string) => {
      const v = p[key];
      if (typeof v === 'string' && v.trim()) {
        lines.push(`## ${label}\n${v.trim()}`);
      }
    };

    if (typeof p['type'] === 'string' && p['type']) {
      lines.push(`_Tipo de documento:_ ${String(p['type'])}`);
    }
    push('Título', 'title');
    if (typeof p['client'] === 'string' && p['client']) {
      lines.push(`**Cliente / destinataria:** ${String(p['client'])}`);
    }
    push('Nombre del proyecto', 'projectName');
    push('Descripción', 'description');
    push('Resumen ejecutivo', 'executiveSummary');
    push('Objetivos', 'objectives');
    push('Alcance', 'scope');
    push('Entregables', 'deliverables');
    push('Cronograma', 'timeline');
    push('Precio / inversión', 'pricing');
    push('Condiciones / términos', 'terms');
    push('Visión general del sistema', 'systemOverview');
    push('Diagrama de arquitectura (texto)', 'architectureDiagram');
    push('Componentes', 'components');
    push('Flujo de datos', 'dataFlow');
    push('APIs', 'apis');
    push('Tecnologías', 'technologies');
    push('Despliegue', 'deployment');

    const content = typeof p['content'] === 'string' ? p['content'].trim() : '';
    if (content) {
      lines.push('---\n## Contenido principal\n\n' + content);
    }

    return lines.join('\n\n').trim();
  }

  /**
   * Ejecuta todas las comprobaciones seleccionadas en una sola llamada al modelo.
   */
  async analyzeCriteria(
    documentText: string,
    criteria: ProposalAnalysisCriterion[],
  ): Promise<ProposalAnalysisResultItem[]> {
    const trimmed = documentText.trim();
    if (!trimmed) {
      throw new Error(
        'No hay texto para analizar. Carga un documento guardado o pega el contenido.',
      );
    }

    const slice = trimmed.length > MAX_DOC_CHARS
      ? trimmed.slice(0, MAX_DOC_CHARS) +
        '\n\n[… documento truncado por longitud; el análisis se basa en el inicio …]'
      : trimmed;

    const criteriaBlock = criteria
      .map(
        (c, i) =>
          `${i + 1}. checkId exacto: "${c.id}" — ${c.name}. Criterio: ${c.description}`,
      )
      .join('\n');

    const userPrompt = `Documento a evaluar:

---
${slice}
---

Comprueba SOLO estos criterios (devuelve exactamente un objeto JSON por cada checkId listado, en un array, en cualquier orden):

${criteriaBlock}

Devuelve un array JSON con ${criteria.length} elementos. Cada checkId debe aparecer una vez.`;

    const raw = await this.inference.generateResponse(userPrompt, SYSTEM_ANALYST, {
      maxOutputTokens: 8192,
    });

    const parsed = this.parseResultsArray(raw);
    return this.mergeWithCriteria(criteria, parsed);
  }

  /** Chat contextual sobre el documento cargado (respuesta real del modelo). */
  async chatAboutDocument(
    userMessage: string,
    documentText: string,
    analysisSummary: string,
  ): Promise<string> {
    const doc =
      documentText.trim().length > MAX_DOC_CHARS
        ? documentText.trim().slice(0, MAX_DOC_CHARS) +
          '\n[…truncado…]'
        : documentText.trim();

    const prompt = [
      analysisSummary.trim()
        ? `Resumen del último análisis automático:\n${analysisSummary}\n`
        : '',
      'Documento (referencia):',
      '---',
      doc || '(vacío)',
      '---',
      'Pregunta o instrucción del usuario:',
      userMessage.trim(),
    ]
      .filter(Boolean)
      .join('\n');

    return this.inference.generateResponse(prompt, SYSTEM_CHAT, {
      maxOutputTokens: 4096,
    });
  }

  private parseResultsArray(raw: string): ProposalAnalysisResultItem[] {
    let t = raw.trim();
    const fence = /^```(?:json)?\s*([\s\S]*?)```\s*$/im.exec(t);
    if (fence) {
      t = fence[1].trim();
    }
    const start = t.indexOf('[');
    const end = t.lastIndexOf(']');
    if (start >= 0 && end > start) {
      t = t.slice(start, end + 1);
    }

    const data = JSON.parse(t) as unknown;
    if (!Array.isArray(data)) {
      throw new Error('La respuesta del modelo no es un array JSON.');
    }

    const out: ProposalAnalysisResultItem[] = [];
    for (const item of data) {
      if (!item || typeof item !== 'object') continue;
      const o = item as Record<string, unknown>;
      const checkId = typeof o['checkId'] === 'string' ? o['checkId'] : '';
      const status = o['status'];
      const message = typeof o['message'] === 'string' ? o['message'] : '';
      const suggestions = Array.isArray(o['suggestions'])
        ? o['suggestions'].filter((s): s is string => typeof s === 'string')
        : [];

      if (!checkId || !message) continue;

      let st: AnalysisStatus = 'warning';
      if (status === 'pass' || status === 'warning' || status === 'error') {
        st = status;
      } else if (status === 'pending') {
        st = 'pending';
      }

      out.push({
        checkId,
        status: st,
        message,
        suggestions: suggestions.slice(0, 6),
      });
    }

    return out;
  }

  private mergeWithCriteria(
    criteria: ProposalAnalysisCriterion[],
    parsed: ProposalAnalysisResultItem[],
  ): ProposalAnalysisResultItem[] {
    const byId = new Map(parsed.map((r) => [r.checkId, r]));
    return criteria.map((c) => {
      const r = byId.get(c.id);
      if (r) {
        return r;
      }
      return {
        checkId: c.id,
        status: 'error' as const,
        message:
          'El modelo no devolvió evaluación para esta comprobación. Reintenta el análisis.',
        suggestions: [
          'Revisa la conexión con la IA en Config. IA',
          'Reduce el tamaño del documento o el número de comprobaciones',
        ],
      };
    });
  }
}
