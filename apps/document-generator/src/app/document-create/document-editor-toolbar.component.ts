import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { EditorBlockTemplate } from '../models/document-render.models';

@Component({
  selector: 'app-document-editor-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './document-editor-toolbar.component.html',
})
export class DocumentEditorToolbarComponent {
  readonly contentEditorMode = input<'markdown' | 'html' | 'plain'>('markdown');
  readonly selectedTextColor = input('#7a0000');
  readonly selectedQuickStylePreset = input('');
  readonly isAiGenerating = input(false);
  readonly editorBlockTemplates = input<EditorBlockTemplate[]>([]);

  readonly formatAction = output<string>();
  readonly textColorChange = output<string>();
  readonly applyTextColor = output<void>();
  readonly blockInsert = output<Event>();
  readonly copyContent = output<void>();
  readonly convertToHtml = output<void>();
  readonly convertToMarkdown = output<void>();
  readonly beautify = output<void>();
  readonly stylePresetChange = output<string>();
  readonly fontSizeDelta = output<number>();
  readonly toggleTool = output<string>();
}
