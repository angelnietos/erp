import {
  Component,
  input,
  output,
  viewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import type { ContentEditorMode } from '../models/document-render.models';

@Component({
  selector: 'app-document-editor-canvas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="document-editor-column" [formGroup]="documentForm()">
      <div class="document-editor-column__bar">
        <div
          class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between w-full"
        >
          <span>{{ editorModeLabel() }}</span>
          <div
            class="inline-flex rounded-lg border border-soft bg-secondary p-1 text-xs font-semibold"
          >
            <button
              type="button"
              class="px-2.5 py-1 rounded-md transition-colors"
              [class.bg-surface]="contentEditorMode() === 'markdown'"
              [class.text-brand]="contentEditorMode() === 'markdown'"
              (click)="modeChange.emit('markdown')"
            >
              Markdown
            </button>
            <button
              type="button"
              class="px-2.5 py-1 rounded-md transition-colors"
              [class.bg-surface]="contentEditorMode() === 'html'"
              [class.text-brand]="contentEditorMode() === 'html'"
              (click)="modeChange.emit('html')"
            >
              HTML
            </button>
            <button
              type="button"
              class="px-2.5 py-1 rounded-md transition-colors"
              [class.bg-surface]="contentEditorMode() === 'plain'"
              [class.text-brand]="contentEditorMode() === 'plain'"
              (click)="modeChange.emit('plain')"
            >
              Texto
            </button>
          </div>
          <button
            type="button"
            (click)="applyCorporateTemplate.emit()"
            title="Usar plantilla corporativa"
            class="ml-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium bg-[#7a0000] hover:bg-[#5b0000] text-white transition-colors"
          >
            Plantilla corporativa
          </button>
        </div>
        <button
          type="button"
          (click)="toggleFullscreen.emit()"
          class="hover:text-brand transition-colors"
        >
          Pantalla completa
        </button>
      </div>
      <div class="document-editor-textarea-wrap relative">
        <textarea
          #contentTextarea
          formControlName="content"
          [placeholder]="editorPlaceholder()"
          rows="24"
          spellcheck="true"
          [attr.disabled]="isAiGenerating() ? true : null"
          class="document-editor-textarea w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-surface font-mono text-sm resize-vertical"
          (input)="contentInput.emit()"
          (keydown)="onTextareaKeydown($event)"
        ></textarea>
        @if (showSlashCommands()) {
          <div class="slash-menu-host">
            <ng-content select="[slashCommands]"></ng-content>
          </div>
        }
        @if (isAiGenerating()) {
          <div
            class="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 rounded-xl"
            aria-live="polite"
            aria-label="La IA está procesando el documento"
          >
            <div class="flex flex-col items-center gap-3">
              <svg
                class="w-10 h-10 animate-spin text-brand"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span class="text-sm font-medium text-primary"
                >Mejorando con IA...</span
              >
            </div>
          </div>
        }
      </div>
      <p class="document-editor-hint text-xs text-secondary mt-2 px-1">
        Atajos:
        <kbd class="editor-kbd">Ctrl+B</kbd> negrita ·
        <kbd class="editor-kbd">Ctrl+I</kbd> cursiva ·
        <kbd class="editor-kbd">Ctrl+Z</kbd> deshacer ·
        <kbd class="editor-kbd">Ctrl+Shift+Z</kbd> rehacer ·
        <kbd class="editor-kbd">/</kbd> comandos · Tab indentar
      </p>
    </div>
  `,
  styles: [
    `
      .document-editor-textarea-wrap {
        position: relative;
      }
      .slash-menu-host {
        position: absolute;
        left: 12px;
        bottom: 12px;
        z-index: 50;
      }
      .document-editor-hint .editor-kbd {
        display: inline-block;
        padding: 1px 5px;
        margin: 0 2px;
        border-radius: 4px;
        border: 1px solid rgba(148, 163, 184, 0.45);
        background: rgba(241, 245, 249, 0.8);
        font-family: ui-monospace, monospace;
        font-size: 0.65rem;
      }
    `,
  ],
})
export class DocumentEditorCanvasComponent {
  readonly contentTextarea =
    viewChild.required<ElementRef<HTMLTextAreaElement>>('contentTextarea');

  readonly documentForm = input.required<FormGroup>();
  readonly editorModeLabel = input('');
  readonly contentEditorMode = input<ContentEditorMode>('markdown');
  readonly editorPlaceholder = input('');
  readonly isAiGenerating = input(false);
  readonly showSlashCommands = input(false);

  readonly modeChange = output<ContentEditorMode>();
  readonly toggleFullscreen = output<void>();
  readonly contentInput = output<void>();
  readonly editorKeydown = output<KeyboardEvent>();
  readonly slashOpen = output<void>();
  readonly applyCorporateTemplate = output<void>();

  focusTextarea(): void {
    this.contentTextarea().nativeElement.focus();
  }

  getTextareaElement(): HTMLTextAreaElement {
    return this.contentTextarea().nativeElement;
  }

  onTextareaKeydown(event: KeyboardEvent): void {
    if (event.key === 'Tab' && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      const ta = event.target as HTMLTextAreaElement;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const indent = '  ';
      const value = ta.value;
      ta.value = value.substring(0, start) + indent + value.substring(end);
      ta.selectionStart = ta.selectionEnd = start + indent.length;
      ta.dispatchEvent(new Event('input', { bubbles: true }));
      return;
    }

    if (
      event.key === '/' &&
      !event.ctrlKey &&
      !event.metaKey &&
      !this.showSlashCommands()
    ) {
      const ta = event.target as HTMLTextAreaElement;
      const pos = ta.selectionStart;
      const lineStart = ta.value.lastIndexOf('\n', Math.max(0, pos - 1)) + 1;
      const before = ta.value.substring(lineStart, pos);
      if (before.trim() === '') {
        event.preventDefault();
        this.slashOpen.emit();
        return;
      }
    }

    this.editorKeydown.emit(event);
  }
}
