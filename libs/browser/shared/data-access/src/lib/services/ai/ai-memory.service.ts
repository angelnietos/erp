import { Injectable, signal } from '@angular/core';
import { AIRangeMemory } from '../../models/ai-bot.model';

const STORAGE_KEY = 'ai_memory_persist_v1';

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

  private persistTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.hydrateFromStorage();
  }

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
    this.schedulePersist();
  }

  private hydrateFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw) as {
        global?: AIRangeMemory[];
        workspaces?: Record<
          string,
          {
            memories: AIRangeMemory[];
            lastTasks: unknown[];
            contextFiles: Record<string, unknown>;
          }
        >;
      };
      if (Array.isArray(data.global)) {
        this._globalMemories.set(data.global);
      }
      if (data.workspaces && typeof data.workspaces === 'object') {
        this._botWorkspaces.set(data.workspaces);
      }
    } catch {
      /* ignore corrupt storage */
    }
  }

  private schedulePersist() {
    if (this.persistTimer) clearTimeout(this.persistTimer);
    this.persistTimer = setTimeout(() => this.persistToStorage(), 400);
  }

  private persistToStorage() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          global: this._globalMemories(),
          workspaces: this._botWorkspaces(),
        }),
      );
    } catch {
      /* quota or private mode */
    }
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
      this.schedulePersist();
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
