import { Component, input, output } from '@angular/core';
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
          <!-- Corporate template button on toolbar -->
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
      <div class="relative">
        <textarea
          formControlName="content"
          [placeholder]="editorPlaceholder()"
          rows="24"
          [attr.disabled]="isAiGenerating() ? true : null"
          class="document-editor-textarea w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-surface font-mono text-sm resize-vertical"
          (input)="contentInput.emit()"
          (keydown)="editorKeydown.emit($event)"
        ></textarea>
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
    </div>
  `,
})
export class DocumentEditorCanvasComponent {
  readonly documentForm = input.required<FormGroup>();
  readonly editorModeLabel = input('');
  readonly contentEditorMode = input<ContentEditorMode>('markdown');
  readonly editorPlaceholder = input('');
  readonly isAiGenerating = input(false);

  readonly modeChange = output<ContentEditorMode>();
  readonly toggleFullscreen = output<void>();
  readonly contentInput = output<void>();
  readonly editorKeydown = output<KeyboardEvent>();
  readonly applyCorporateTemplate = output<void>();
}
