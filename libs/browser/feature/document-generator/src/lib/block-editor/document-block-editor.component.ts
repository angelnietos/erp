import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
  ElementRef,
} from '@angular/core';
import type { Editor } from '@tiptap/core';
import { DocumentBlockSerializerService } from './document-block-serializer.service';
import { createTiptapEditor } from './tiptap-editor.loader';

@Component({
  selector: 'lib-document-block-editor',
  standalone: true,
  template: `
    <div class="dg-block-editor">
      <div class="dg-block-editor__toolbar" role="toolbar" aria-label="Formato visual">
        <button type="button" (click)="run('bold')" title="Negrita"><strong>B</strong></button>
        <button type="button" (click)="run('italic')" title="Cursiva"><em>I</em></button>
        <button type="button" (click)="run('underline')" title="Subrayado"><u>U</u></button>
        <span class="dg-block-editor__sep" aria-hidden="true"></span>
        <button type="button" (click)="run('h1')">H1</button>
        <button type="button" (click)="run('h2')">H2</button>
        <button type="button" (click)="run('h3')">H3</button>
        <span class="dg-block-editor__sep" aria-hidden="true"></span>
        <button type="button" (click)="run('bulletList')">• Lista</button>
        <button type="button" (click)="run('orderedList')">1. Lista</button>
        <button type="button" (click)="run('blockquote')">" Cita</button>
        <button type="button" (click)="run('hr')">—</button>
        <span class="dg-block-editor__sep" aria-hidden="true"></span>
        <button type="button" (click)="insertTable()">Tabla</button>
        <button type="button" (click)="setLink()">Enlace</button>
      </div>
      <div class="dg-block-editor__body">
        @if (editorLoading()) {
          <p class="dg-block-editor__loading" aria-live="polite">
            Cargando editor visual…
          </p>
        }
        <div #host class="dg-block-editor__content tiptap-host"></div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-height: 0;
        min-width: 0;
      }

      .dg-block-editor__body {
        position: relative;
        flex: 1 1 auto;
        min-height: 0;
        display: flex;
        flex-direction: column;
      }

      .dg-block-editor__loading {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0;
        font-size: 0.875rem;
        color: var(--text-secondary);
        background: color-mix(in srgb, var(--surface, #fff) 88%, transparent);
        z-index: 2;
      }

      .dg-block-editor__sep {
        width: 1px;
        align-self: stretch;
        background: var(--border-soft, rgba(148, 163, 184, 0.45));
        margin: 0 0.15rem;
      }

      :host ::ng-deep .tiptap blockquote {
        border-left: 4px solid var(--brand, #2563eb);
        margin: 0.75rem 0;
        padding: 0.35rem 0 0.35rem 0.85rem;
        color: var(--text-secondary);
        background: color-mix(in srgb, var(--text-primary) 4%, transparent);
      }

      :host ::ng-deep .tiptap table {
        width: 100%;
        border-collapse: collapse;
        margin: 1rem 0;
      }

      :host ::ng-deep .tiptap th,
      :host ::ng-deep .tiptap td {
        border: 1px solid var(--border-soft);
        padding: 0.45rem 0.65rem;
        vertical-align: top;
      }

      :host ::ng-deep .tiptap th {
        background: color-mix(in srgb, var(--text-primary) 6%, transparent);
        font-weight: 700;
      }

      :host ::ng-deep .tiptap p.is-editor-empty:first-child::before {
        color: var(--text-muted, #94a3b8);
        content: attr(data-placeholder);
        float: left;
        height: 0;
        pointer-events: none;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentBlockEditorComponent implements AfterViewInit, OnDestroy {
  private readonly serializer = inject(DocumentBlockSerializerService);
  private readonly hostRef = viewChild.required<ElementRef<HTMLDivElement>>('host');
  private editor: Editor | null = null;
  private syncingExternal = false;

  readonly editorLoading = signal(true);

  readonly initialHtml = input('');
  readonly placeholder = input('Escribe o pega contenido…');
  readonly disabled = input(false);

  readonly htmlChange = output<string>();

  constructor() {
    effect(() => {
      const html = this.initialHtml();
      if (!this.editor || this.syncingExternal) {
        return;
      }
      const current = this.editor.getHTML();
      if (html !== current) {
        this.editor.commands.setContent(html || '<p></p>', { emitUpdate: false });
      }
    });

    effect(() => {
      const disabled = this.disabled();
      this.editor?.setEditable(!disabled);
    });
  }

  async ngAfterViewInit(): Promise<void> {
    this.editorLoading.set(true);
    const element = this.hostRef().nativeElement;
    try {
      this.editor = await createTiptapEditor({
        element,
        content: this.initialHtml() || '<p></p>',
        placeholder: this.placeholder(),
        editable: !this.disabled(),
        onUpdate: (html) => {
          this.syncingExternal = true;
          this.htmlChange.emit(this.serializer.normalizeEditorHtml(html));
          queueMicrotask(() => {
            this.syncingExternal = false;
          });
        },
      });
    } finally {
      this.editorLoading.set(false);
    }
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
    this.editor = null;
  }

  run(action: string): void {
    const chain = this.editor?.chain().focus();
    if (!chain) {
      return;
    }
    switch (action) {
      case 'bold':
        chain.toggleBold().run();
        break;
      case 'italic':
        chain.toggleItalic().run();
        break;
      case 'underline':
        chain.toggleUnderline().run();
        break;
      case 'h1':
        chain.toggleHeading({ level: 1 }).run();
        break;
      case 'h2':
        chain.toggleHeading({ level: 2 }).run();
        break;
      case 'h3':
        chain.toggleHeading({ level: 3 }).run();
        break;
      case 'bulletList':
        chain.toggleBulletList().run();
        break;
      case 'orderedList':
        chain.toggleOrderedList().run();
        break;
      case 'blockquote':
        chain.toggleBlockquote().run();
        break;
      case 'hr':
        chain.setHorizontalRule().run();
        break;
      default:
        break;
    }
  }

  insertTable(): void {
    this.editor
      ?.chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  }

  setLink(): void {
    const url = window.prompt('URL del enlace', 'https://');
    if (url === null) {
      return;
    }
    if (url === '') {
      this.editor?.chain().focus().unsetLink().run();
      return;
    }
    this.editor?.chain().focus().setLink({ href: url }).run();
  }

  getHtml(): string {
    return this.serializer.normalizeEditorHtml(this.editor?.getHTML() ?? '');
  }

  focus(): void {
    this.editor?.commands.focus();
  }
}
