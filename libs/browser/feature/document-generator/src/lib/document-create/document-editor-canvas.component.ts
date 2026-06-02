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
      <textarea
        formControlName="content"
        [placeholder]="editorPlaceholder()"
        rows="24"
        class="document-editor-textarea w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-surface font-mono text-sm resize-vertical"
        (input)="contentInput.emit()"
        (keydown)="editorKeydown.emit($event)"
      ></textarea>
    </div>
  `,
})
export class DocumentEditorCanvasComponent {
  readonly documentForm = input.required<FormGroup>();
  readonly editorModeLabel = input('');
  readonly contentEditorMode = input<ContentEditorMode>('markdown');
  readonly editorPlaceholder = input('');

  readonly modeChange = output<ContentEditorMode>();
  readonly toggleFullscreen = output<void>();
  readonly contentInput = output<void>();
  readonly editorKeydown = output<KeyboardEvent>();
  readonly applyCorporateTemplate = output<void>();
}
