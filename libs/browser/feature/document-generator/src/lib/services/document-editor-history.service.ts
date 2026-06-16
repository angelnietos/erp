/** Historial undo/redo para el contenido del editor (string). */
export class DocumentEditorHistory {
  private stack: string[] = [];
  private index = -1;
  private recording = true;
  private readonly maxEntries: number;

  constructor(maxEntries = 80) {
    this.maxEntries = maxEntries;
  }

  reset(content: string): void {
    this.stack = [content];
    this.index = 0;
  }

  push(content: string): void {
    if (!this.recording) {
      return;
    }
    const current = this.stack[this.index];
    if (current === content) {
      return;
    }
    this.stack = this.stack.slice(0, this.index + 1);
    this.stack.push(content);
    if (this.stack.length > this.maxEntries) {
      const overflow = this.stack.length - this.maxEntries;
      this.stack.splice(0, overflow);
      this.index = Math.max(0, this.index - overflow);
    }
    this.index = this.stack.length - 1;
  }

  undo(): string | null {
    if (this.index <= 0) {
      return null;
    }
    this.recording = false;
    this.index--;
    const value = this.stack[this.index] ?? null;
    this.recording = true;
    return value;
  }

  redo(): string | null {
    if (this.index >= this.stack.length - 1) {
      return null;
    }
    this.recording = false;
    this.index++;
    const value = this.stack[this.index] ?? null;
    this.recording = true;
    return value;
  }

  canUndo(): boolean {
    return this.index > 0;
  }

  canRedo(): boolean {
    return this.index < this.stack.length - 1;
  }
}
