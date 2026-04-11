import { Injectable, signal, computed, inject } from '@angular/core';
import { BlockEngineService, Block } from './block-engine.service';

export interface Prediction {
  id: string;
  text: string;
  confidence: number;
  type: 'completion' | 'suggestion' | 'correction' | 'format';
  source: string;
}

@Injectable({ providedIn: 'root' })
export class PredictiveGeneratorService {
  private readonly blockEngine = inject(BlockEngineService);

  private readonly _currentPrediction = signal<Prediction | null>(null);
  private readonly _autoFormatEnabled = signal(true);
  private readonly _lastTypingTime = signal(0);

  readonly currentPrediction = computed(() => this._currentPrediction());
  readonly autoFormatEnabled = computed(() => this._autoFormatEnabled());

  analyzeTyping(currentText: string, cursorPosition: number): void {
    const now = Date.now();
    const timeSinceLastType = now - this._lastTypingTime();
    this._lastTypingTime.set(now);

    if (
      timeSinceLastType > 800 &&
      timeSinceLastType < 3000 &&
      cursorPosition === currentText.length
    ) {
      this.generatePrediction(currentText);
    }

    if (this._autoFormatEnabled()) {
      this.autoFormat(currentText, cursorPosition);
    }
  }

  acceptPrediction(): string | null {
    const prediction = this._currentPrediction();
    if (!prediction) return null;
    this._currentPrediction.set(null);
    return prediction.text;
  }

  dismissPrediction(): void {
    this._currentPrediction.set(null);
  }

  toggleAutoFormat(): void {
    this._autoFormatEnabled.update((v) => !v);
  }

  private generatePrediction(text: string): void {
    if (text.length < 20) return;

    const lastSentence = text.split(/[.!?]\s*/).pop() || '';
    if (lastSentence.length < 15) return;

    const predictions = this.getContextualPredictions(text, lastSentence);

    if (predictions.length > 0) {
      const best = predictions.sort((a, b) => b.confidence - a.confidence)[0];
      this._currentPrediction.set(best);
    }
  }

  private getContextualPredictions(
    fullText: string,
    lastSentence: string,
  ): Prediction[] {
    const predictions: Prediction[] = [];
    const lowerText = fullText.toLowerCase();

    if (/el objetivo de este documento es/i.test(lastSentence)) {
      predictions.push({
        id: crypto.randomUUID(),
        text: ' ofrecer claridad, transparencia y valor a nuestros clientes estableciendo las bases de una relación duradera y de confianza.',
        confidence: 0.82,
        type: 'completion',
        source: 'document-patterns',
      });
    }

    if (
      /por lo tanto/i.test(lastSentence) ||
      /en consecuencia/i.test(lastSentence)
    ) {
      predictions.push({
        id: crypto.randomUUID(),
        text: ' podemos concluir que la mejor opción es avanzar con la propuesta presentada, ya que cumple todos los requisitos establecidos.',
        confidence: 0.78,
        type: 'completion',
        source: 'argumentative-structure',
      });
    }

    if (
      /en resumen/i.test(lastSentence) ||
      /para concluir/i.test(lastSentence)
    ) {
      predictions.push({
        id: crypto.randomUUID(),
        text: ' hemos presentado los puntos clave que sustentan nuestra propuesta, demostrando el valor y los beneficios que aporta esta solución.',
        confidence: 0.85,
        type: 'completion',
        source: 'conclusion-patterns',
      });
    }

    if (lowerText.includes('precio') || lowerText.includes('coste')) {
      predictions.push({
        id: crypto.randomUUID(),
        text: ' Este precio incluye todos los servicios descritos, sin cargos ocultos y con garantía de satisfacción total.',
        confidence: 0.75,
        type: 'suggestion',
        source: 'commercial-patterns',
      });
    }

    return predictions;
  }

  private autoFormat(text: string, cursorPosition: number): void {
    const replacements: [RegExp, string][] = [
      [/--$/, '—'],
      [/\.\.\.$/, '…'],
      [/(\d)\s*x\s*(\d)/i, '$1 × $2'],
      [/(\w)\'(\w)/, '$1’$2'],
      [/^#\s+(.*)/, '# $1'],
      [/^##\s+(.*)/, '## $1'],
      [/^\*\s+(.*)/, '• $1'],
    ];

    for (const [pattern, replacement] of replacements) {
      const match = text.match(pattern);
      if (
        match &&
        match.index !== undefined &&
        match.index + match[0].length === cursorPosition
      ) {
        const activeBlock = this.blockEngine.activeBlock();
        if (activeBlock) {
          const newText = text.replace(pattern, replacement);
          this.blockEngine.updateBlock(activeBlock.id, { content: newText });
        }
        break;
      }
    }
  }

  generateSmartTitle(content: string): string {
    const words = content.replace(/[^\wáéíóúñ\s]/g, '').split(/\s+/);
    const frequency: Record<string, number> = {};

    words
      .filter((w) => w.length > 5)
      .forEach((w) => {
        frequency[w.toLowerCase()] = (frequency[w.toLowerCase()] || 0) + 1;
      });

    const keywords = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));

    if (keywords.length >= 2) {
      return `${keywords[0]} y ${keywords[1]} - Documento Oficial`;
    }

    return 'Nuevo Documento';
  }
}
