import { Injectable, signal, computed, effect } from '@angular/core';
import { BlockEngineService, Block } from './block-engine.service';

export interface AssistantSuggestion {
  id: string;
  type: 'improvement' | 'correction' | 'completion' | 'format' | 'structure';
  confidence: number;
  title: string;
  description: string;
  apply: () => void;
  discard: () => void;
}

export interface DocumentAnalysis {
  readability: number;
  tone: string;
  length: number;
  keywords: string[];
  improvements: string[];
  score: number;
}

@Injectable({ providedIn: 'root' })
export class IntelligentAssistantService {
  private readonly blockEngine = inject(BlockEngineService);

  private readonly _isActive = signal(true);
  private readonly _suggestions = signal<AssistantSuggestion[]>([]);
  private readonly _analysis = signal<DocumentAnalysis | null>(null);
  private readonly _lastActivity = signal(Date.now());
  private readonly _zenMode = signal(false);

  readonly isActive = computed(() => this._isActive());
  readonly suggestions = computed(() => this._suggestions());
  readonly analysis = computed(() => this._analysis());
  readonly zenMode = computed(() => this._zenMode());
  readonly isUserConcentrated = computed(() => {
    const inactiveTime = Date.now() - this._lastActivity();
    return inactiveTime > 3000 && inactiveTime < 120000;
  });

  constructor() {
    effect(() => {
      const blocks = this.blockEngine.blocks();
      if (blocks.length > 0) {
        this.analyzeDocument(blocks);
        this.generateSuggestions(blocks);
      }
    });

    effect(() => {
      if (this.isUserConcentrated() && this._isActive() && !this._zenMode()) {
        setTimeout(() => this._zenMode.set(true), 500);
      }
    });
  }

  notifyActivity(): void {
    this._lastActivity.set(Date.now());
    if (this._zenMode()) this._zenMode.set(false);
  }

  toggle(): void {
    this._isActive.update((v) => !v);
  }

  private analyzeDocument(blocks: Block[]): void {
    const fullText = blocks.map((b) => b.content).join(' ');
    const words = fullText.split(/\s+/).filter((w) => w.length > 0);
    const sentences = fullText.split(/[.!?]+/).filter((s) => s.length > 0);

    const avgSentenceLength = words.length / Math.max(1, sentences.length);
    const readability = Math.max(0, 100 - Math.abs(avgSentenceLength - 15) * 5);

    const tone = this.detectTone(fullText);
    const keywords = this.extractKeywords(fullText);

    const improvements: string[] = [];
    if (avgSentenceLength > 25)
      improvements.push('Reducir longitud de oraciones');
    if (words.length < 50) improvements.push('Añadir mas contenido');
    if (blocks.filter((b) => b.type === 'heading').length === 0)
      improvements.push('Añadir títulos');

    const score = Math.round(
      readability * 0.5 +
        Math.min(words.length / 500, 1) * 30 +
        (improvements.length === 0 ? 20 : 10),
    );

    this._analysis.set({
      readability: Math.round(readability),
      tone,
      length: fullText.length,
      keywords,
      improvements,
      score,
    });
  }

  private generateSuggestions(blocks: Block[]): void {
    const suggestions: AssistantSuggestion[] = [];
    const fullText = blocks.map((b) => b.content).join(' ');

    if (!fullText.toLowerCase().includes('resumen') && blocks.length > 5) {
      suggestions.push({
        id: crypto.randomUUID(),
        type: 'structure',
        confidence: 0.85,
        title: 'Añadir resumen ejecutivo',
        description:
          'Los documentos con resumen tienen un 72% mas de efectividad',
        apply: () => {
          this.blockEngine.createBlock('heading', 'Resumen Ejecutivo');
          this.blockEngine.createBlock('text', '');
        },
        discard: () => this.discardSuggestion(suggestions[0].id),
      });
    }

    if (
      fullText.split(' ').filter((w) => w === 'muy' || w === 'mucho').length > 3
    ) {
      suggestions.push({
        id: crypto.randomUUID(),
        type: 'improvement',
        confidence: 0.78,
        title: 'Reducir adverbios cualitativos',
        description: 'Sustituir palabras vagas por datos concretos',
        apply: () => {},
        discard: () => this.discardSuggestion(suggestions[1]?.id),
      });
    }

    this._suggestions.set(suggestions);
  }

  private detectTone(text: string): string {
    const formalWords = [
      'por lo tanto',
      'en consecuencia',
      'no obstante',
      'respecto',
    ];
    const informalWords = ['genial', 'guay', 'chulo', 'increible'];

    const formalCount = formalWords.filter((w) =>
      text.toLowerCase().includes(w),
    ).length;
    const informalCount = informalWords.filter((w) =>
      text.toLowerCase().includes(w),
    ).length;

    if (formalCount > informalCount * 2) return 'Formal';
    if (informalCount > formalCount * 2) return 'Informal';
    return 'Neutro';
  }

  private extractKeywords(text: string): string[] {
    const words = text
      .toLowerCase()
      .replace(/[^\wáéíóúñ\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 4);

    const frequency: Record<string, number> = {};
    words.forEach((w) => (frequency[w] = (frequency[w] || 0) + 1));

    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  private discardSuggestion(id: string): void {
    if (!id) return;
    this._suggestions.update((s) => s.filter((x) => x.id !== id));
  }

  acceptSuggestion(id: string): void {
    const suggestion = this._suggestions().find((s) => s.id === id);
    if (suggestion) {
      suggestion.apply();
      this.discardSuggestion(id);
    }
  }

  rejectSuggestion(id: string): void {
    this.discardSuggestion(id);
  }

  clearSuggestions(): void {
    this._suggestions.set([]);
  }
}
