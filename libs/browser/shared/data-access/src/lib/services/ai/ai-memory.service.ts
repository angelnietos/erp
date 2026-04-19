import { Injectable, signal } from '@angular/core';
import { AIRangeMemory } from '../../models/ai-bot.model';

@Injectable({ providedIn: 'root' })
export class AIMemoryService {
  private readonly _globalMemories = signal<AIRangeMemory[]>([]);
  readonly globalMemories = this._globalMemories.asReadonly();

  private readonly _botWorkspaces = signal<
    Record<
      string,
      {
        memories: AIRangeMemory[];
        lastTasks: unknown[];
        contextFiles: Record<string, unknown>;
      }
    >
  >({});
  readonly botWorkspaces = this._botWorkspaces.asReadonly();

  remember(feature: string, text: string, importance = 5, isGlobal = false) {
    const memory: AIRangeMemory = {
      text,
      importance,
      timestamp: Date.now(),
      tags: [feature],
      sourceBot: feature,
    };

    if (isGlobal) {
      this._globalMemories.update((current) => {
        const updated = [...current, memory]
          .sort((a, b) => b.importance - a.importance)
          .slice(0, 200);
        return updated;
      });
    }

    this._botWorkspaces.update((current) => {
      const ws = current[feature] || { memories: [], lastTasks: [], contextFiles: {} };
      const updatedMemories = [...ws.memories, memory];
      const limited = updatedMemories
        .sort((a, b) => b.importance - a.importance)
        .slice(0, 100);
      return { ...current, [feature]: { ...ws, memories: limited } };
    });

    this.autoSummarizeMemories(feature);
  }

  private autoSummarizeMemories(feature: string) {
    const ws = this._botWorkspaces()[feature];
    if (ws && ws.memories.length >= 10 && ws.memories.length % 10 === 0) {
      const recentMemories = ws.memories.slice(-10);
      const summary = this.generateMemorySummary(recentMemories);
      const summaryMemory: AIRangeMemory = {
        text: `RESUMEN AUTOMÁTICO: ${summary}`,
        importance: 8,
        timestamp: Date.now(),
        tags: [feature, 'summary', 'auto-generated'],
        sourceBot: feature,
      };

      this._botWorkspaces.update((current) => {
        const ws = current[feature];
        const updatedMemories = [...ws.memories, summaryMemory];
        const limited = updatedMemories
          .sort((a, b) => b.importance - a.importance)
          .slice(0, 100);
        return { ...current, [feature]: { ...ws, memories: limited } };
      });
    }
  }

  private generateMemorySummary(memories: AIRangeMemory[]): string {
    const topics = memories.flatMap(m => m.tags);
    const uniqueTopics = [...new Set(topics)];
    const timeRange = memories.length > 0
      ? `${new Date(Math.min(...memories.map(m => m.timestamp))).toLocaleDateString()} - ${new Date(Math.max(...memories.map(m => m.timestamp))).toLocaleDateString()}`
      : 'período desconocido';
    const avgImportance = memories.reduce((sum, m) => sum + m.importance, 0) / memories.length;
    return `Durante ${timeRange}, se registraron ${memories.length} eventos relacionados con: ${uniqueTopics.join(', ')}. Importancia promedio: ${avgImportance.toFixed(1)}/10.`;
  }

  getBotContext(feature: string): AIRangeMemory[] {
    if (feature === 'buddy') {
      const globalMemories = this._globalMemories();
      const allBotMemories = Object.values(this._botWorkspaces()).flatMap(ws => ws.memories);
      return [...globalMemories, ...allBotMemories];
    } else {
      return this._botWorkspaces()[feature]?.memories || [];
    }
  }
}
