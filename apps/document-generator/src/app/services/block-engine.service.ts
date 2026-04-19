import { Injectable, signal, computed } from '@angular/core';

export interface Block {
  id: string;
  type: 'text' | 'heading' | 'list' | 'image' | 'table' | 'code' | 'quote';
  content: string;
  metadata: Record<string, any>;
  createdAt: number;
  updatedAt: number;
  version: number;
}

export interface DocumentState {
  blocks: Block[];
  activeBlockId: string | null;
  selection: {
    start: number;
    end: number;
    blockId: string;
  } | null;
  history: HistoryEntry[];
  historyIndex: number;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  type: 'create' | 'update' | 'delete' | 'move';
  before: any;
  after: any;
  description: string;
}

@Injectable({ providedIn: 'root' })
export class BlockEngineService {
  private readonly state = signal<DocumentState>({
    blocks: [],
    activeBlockId: null,
    selection: null,
    history: [],
    historyIndex: -1,
  });

  readonly blocks = computed(() => this.state().blocks);
  readonly activeBlock = computed(() => {
    const s = this.state();
    return s.blocks.find((b) => b.id === s.activeBlockId) || null;
  });
  readonly canUndo = computed(() => this.state().historyIndex > 0);
  readonly canRedo = computed(
    () => this.state().historyIndex < this.state().history.length - 1,
  );

  createBlock(type: Block['type'], content = ''): Block {
    const block: Block = {
      id: crypto.randomUUID(),
      type,
      content,
      metadata: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
    };

    this.state.update((s) => ({
      ...s,
      blocks: [...s.blocks, block],
      activeBlockId: block.id,
    }));

    this.addHistoryEntry('create', null, block, `Crear bloque ${type}`);
    return block;
  }

  updateBlock(id: string, changes: Partial<Block>): void {
    const before = this.state().blocks.find((b) => b.id === id);
    if (!before) return;

    const after = {
      ...before,
      ...changes,
      updatedAt: Date.now(),
      version: before.version + 1,
    };

    this.state.update((s) => ({
      ...s,
      blocks: s.blocks.map((b) => (b.id === id ? after : b)),
    }));

    this.addHistoryEntry('update', before, after, `Actualizar bloque`);
  }

  deleteBlock(id: string): void {
    const block = this.state().blocks.find((b) => b.id === id);
    if (!block) return;

    this.state.update((s) => ({
      ...s,
      blocks: s.blocks.filter((b) => b.id !== id),
      activeBlockId: s.activeBlockId === id ? null : s.activeBlockId,
    }));

    this.addHistoryEntry('delete', block, null, `Eliminar bloque`);
  }

  moveBlock(id: string, newIndex: number): void {
    const blocks = [...this.state().blocks];
    const currentIndex = blocks.findIndex((b) => b.id === id);
    if (currentIndex === -1 || currentIndex === newIndex) return;

    const [block] = blocks.splice(currentIndex, 1);
    blocks.splice(newIndex, 0, block);

    this.state.update((s) => ({ ...s, blocks }));
    this.addHistoryEntry(
      'move',
      { index: currentIndex },
      { index: newIndex },
      `Mover bloque`,
    );
  }

  setActiveBlock(id: string | null): void {
    this.state.update((s) => ({ ...s, activeBlockId: id }));
  }

  undo(): void {
    if (!this.canUndo()) return;

    this.state.update((s) => {
      const entry = s.history[s.historyIndex];
      const newIndex = s.historyIndex - 1;

      let blocks = [...s.blocks];

      switch (entry.type) {
        case 'create':
          blocks = blocks.filter((b) => b.id !== entry.after.id);
          break;
        case 'update':
          blocks = blocks.map((b) =>
            b.id === entry.before.id ? entry.before : b,
          );
          break;
        case 'delete':
          blocks.push(entry.before);
          break;
        case 'move': {
          const [moved] = blocks.splice(entry.after.index, 1);
          blocks.splice(entry.before.index, 0, moved);
          break;
        }
      }

      return { ...s, blocks, historyIndex: newIndex };
    });
  }

  redo(): void {
    if (!this.canRedo()) return;

    this.state.update((s) => {
      const newIndex = s.historyIndex + 1;
      const entry = s.history[newIndex];

      let blocks = [...s.blocks];

      switch (entry.type) {
        case 'create':
          blocks.push(entry.after);
          break;
        case 'update':
          blocks = blocks.map((b) =>
            b.id === entry.after.id ? entry.after : b,
          );
          break;
        case 'delete':
          blocks = blocks.filter((b) => b.id !== entry.before.id);
          break;
        case 'move': {
          const [moved] = blocks.splice(entry.before.index, 1);
          blocks.splice(entry.after.index, 0, moved);
          break;
        }
      }

      return { ...s, blocks, historyIndex: newIndex };
    });
  }

  private addHistoryEntry(
    type: HistoryEntry['type'],
    before: any,
    after: any,
    description: string,
  ): void {
    this.state.update((s) => {
      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        type,
        before,
        after,
        description,
      };

      const history = s.history.slice(0, s.historyIndex + 1);
      history.push(entry);

      return {
        ...s,
        history,
        historyIndex: history.length - 1,
      };
    });
  }

  getBlockById(id: string): Block | undefined {
    return this.state().blocks.find((b) => b.id === id);
  }

  clearAll(): void {
    this.state.set({
      blocks: [],
      activeBlockId: null,
      selection: null,
      history: [],
      historyIndex: -1,
    });
  }
}
