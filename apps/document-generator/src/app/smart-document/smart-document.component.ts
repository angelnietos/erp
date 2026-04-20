import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BlockEngineService } from '../services/block-engine.service';
import { PredictiveGeneratorService } from '../services/predictive-generator.service';
import { IntelligentAssistantService } from '../services/intelligent-assistant.service';

@Component({
  selector: 'app-smart-document',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [
    `
      .document-container {
        max-width: 850px;
        margin: 0 auto;
        padding: 80px 24px 120px;
        min-height: calc(100vh - 160px);
      }

      .block-editor {
        position: relative;
        margin: 4px 0;
        padding: 8px 12px;
        border-radius: 8px;
        transition: background 0.15s;
        outline: none;
        min-height: 28px;
        line-height: 1.6;
        font-size: 16px;
        color: #1e293b;
      }

      .block-editor:focus {
        background: #f8fafc;
      }

      .block-editor:empty:before {
        content: 'Escribe algo...';
        color: #94a3b8;
        pointer-events: none;
      }

      .block-editor.heading {
        font-size: 24px;
        font-weight: 700;
        color: #0f172a;
        margin-top: 24px;
      }

      .prediction-overlay {
        position: absolute;
        left: 12px;
        color: #94a3b8;
        pointer-events: none;
        user-select: none;
        font-style: italic;
      }

      .accept-hint {
        font-size: 12px;
        color: #cbd5e1;
        margin-left: 8px;
      }

      .block-handle {
        position: absolute;
        left: -32px;
        top: 50%;
        transform: translateY(-50%);
        width: 24px;
        height: 24px;
        opacity: 0;
        cursor: grab;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        transition: opacity 0.15s;
        color: #94a3b8;
      }

      .block-wrapper:hover .block-handle {
        opacity: 1;
      }

      .block-handle:hover {
        background: #f1f5f9;
      }

      .block-wrapper {
        position: relative;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(4px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .prediction-overlay {
        animation: fadeIn 0.15s ease;
      }

      h1 {
        font-size: 36px;
        font-weight: 700;
        color: #0f172a;
        margin-bottom: 8px;
        border: none;
        outline: none;
        width: 100%;
        background: transparent;
      }

      .document-meta {
        color: #64748b;
        font-size: 14px;
        margin-bottom: 40px;
      }

      .score-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
      }
    `,
  ],
  template: `
    <div class="document-container">
      <input
        #titleInput
        type="text"
        [value]="documentTitle"
        (input)="updateTitle($any($event.target).value)"
        placeholder="Título del documento"
        class="block w-full h1"
      />

      <div class="document-meta flex items-center justify-between">
        <span>Creado hoy • {{ blockEngine.blocks().length }} bloques</span>
        @if (assistant.analysis()) {
          <div class="score-badge">
            ✨ Calidad {{ assistant.analysis()?.score }}%
          </div>
        }
      </div>

      @for (block of blockEngine.blocks(); track block.id) {
        <div class="block-wrapper">
          <div
            class="block-handle"
            (mousedown)="startDragBlock(block.id, $event)"
          >
            ⋮⋮
          </div>

          <div
            class="block-editor"
            [class.heading]="block.type === 'heading'"
            contenteditable="true"
            [attr.data-block-id]="block.id"
            (input)="onBlockInput(block.id, $event)"
            (keydown)="onBlockKeydown(block.id, $event)"
            (focus)="blockEngine.setActiveBlock(block.id)"
            (blur)="onBlockBlur()"
          >
            {{ block.content }}
          </div>

          @if (
            predictiveGenerator.currentPrediction() &&
            blockEngine.activeBlock()?.id === block.id
          ) {
            <button
              type="button"
              class="prediction-overlay text-left w-full"
              (click)="acceptPrediction()"
            >
              {{ predictiveGenerator.currentPrediction()?.text }}
              <span class="accept-hint">Tab para aceptar</span>
            </button>
          }
        </div>
      }

      @if (blockEngine.blocks().length === 0) {
        <div class="text-center py-16 text-slate-400">
          <div class="text-5xl mb-4">📄</div>
          <p>Empieza a escribir. DOCS 2.0 se encargará del resto.</p>
          <p class="text-sm mt-2">Pulsa Enter para crear nuevos bloques</p>
        </div>
      }
    </div>
  `,
})
export class SmartDocumentComponent {
  readonly blockEngine = inject(BlockEngineService);
  readonly predictiveGenerator = inject(PredictiveGeneratorService);
  readonly assistant = inject(IntelligentAssistantService);

  documentTitle = 'Nuevo Documento';

  private lastBlockContent = '';

  constructor() {
    effect(() => {
      const blocks = this.blockEngine.blocks();
      if (blocks.length > 0 && this.documentTitle === 'Nuevo Documento') {
        const content = blocks.map((b) => b.content).join(' ');
        if (content.length > 100) {
          this.documentTitle =
            this.predictiveGenerator.generateSmartTitle(content);
        }
      }
    });

    if (this.blockEngine.blocks().length === 0) {
      this.blockEngine.createBlock('text');
    }
  }

  updateTitle(title: string): void {
    this.documentTitle = title;
  }

  onBlockInput(blockId: string, event: Event): void {
    const element = event.target as HTMLElement;
    const content = element.innerText;
    const cursorPosition = this.getCursorPosition();

    this.blockEngine.updateBlock(blockId, { content });
    this.predictiveGenerator.analyzeTyping(content, cursorPosition);
    this.assistant.notifyActivity();
  }

  onBlockKeydown(blockId: string, event: KeyboardEvent): void {
    if (event.key === 'Tab' && this.predictiveGenerator.currentPrediction()) {
      event.preventDefault();
      this.acceptPrediction();
      return;
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.blockEngine.createBlock('text');
      setTimeout(() => this.focusLastBlock(), 0);
      return;
    }

    if (event.key === 'Backspace') {
      const block = this.blockEngine.getBlockById(blockId);
      if (
        block &&
        block.content.length === 0 &&
        this.blockEngine.blocks().length > 1
      ) {
        event.preventDefault();
        this.blockEngine.deleteBlock(blockId);
        setTimeout(() => this.focusLastBlock(), 0);
      }
    }

    if (event.key === 'Escape') {
      this.predictiveGenerator.dismissPrediction();
    }

    this.assistant.notifyActivity();
  }

  onBlockBlur(): void {
    setTimeout(() => {
      if (!document.activeElement?.classList.contains('block-editor')) {
        this.predictiveGenerator.dismissPrediction();
      }
    }, 100);
  }

  acceptPrediction(): void {
    const prediction = this.predictiveGenerator.acceptPrediction();
    const activeBlock = this.blockEngine.activeBlock();

    if (prediction && activeBlock) {
      const newContent = activeBlock.content + prediction;
      this.blockEngine.updateBlock(activeBlock.id, { content: newContent });

      const element = document.querySelector(
        `[data-block-id="${activeBlock.id}"]`,
      ) as HTMLElement;
      if (element) {
        element.innerText = newContent;
        this.setCursorPosition(element, newContent.length);
      }
    }
  }

  startDragBlock(blockId: string, event: MouseEvent): void {
    event.preventDefault();
  }

  private focusLastBlock(): void {
    const blocks = this.blockEngine.blocks();
    if (blocks.length > 0) {
      const lastBlock = blocks[blocks.length - 1];
      setTimeout(() => {
        const element = document.querySelector(
          `[data-block-id="${lastBlock.id}"]`,
        ) as HTMLElement;
        element?.focus();
      }, 0);
    }
  }

  private getCursorPosition(): number {
    const selection = window.getSelection();
    return selection?.anchorOffset || 0;
  }

  private setCursorPosition(element: HTMLElement, position: number): void {
    const selection = window.getSelection();
    const range = document.createRange();

    if (element.firstChild) {
      range.setStart(
        element.firstChild,
        Math.min(position, element.firstChild.textContent?.length || 0),
      );
      range.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }
}
