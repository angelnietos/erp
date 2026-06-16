import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { DocumentBlockSerializerService } from './document-block-serializer.service';

@Component({
  selector: 'lib-document-block-editor',
  standalone: true,
  template: `
    <div class="block-editor-shell">
      <div class="block-editor-toolbar" role="toolbar" aria-label="Formato visual">
        <button type="button" (click)="run('bold')" title="Negrita"><strong>B</strong></button>
        <button type="button" (click)="run('italic')" title="Cursiva"><em>I</em></button>
        <button type="button" (click)="run('underline')" title="Subrayado"><u>U</u></button>
        <span class="block-editor-toolbar__sep"></span>
        <button type="button" (click)="run('h1')">H1</button>
        <button type="button" (click)="run('h2')">H2</button>
        <button type="button" (click)="run('h3')">H3</button>
        <span class="block-editor-toolbar__sep"></span>
        <button type="button" (click)="run('bulletList')">• Lista</button>
        <button type="button" (click)="run('orderedList')">1. Lista</button>
        <button type="button" (click)="run('blockquote')">" Cita</button>
        <button type="button" (click)="run('hr')">—</button>
        <span class="block-editor-toolbar__sep"></span>
        <button type="button" (click)="insertTable()">Tabla</button>
        <button type="button" (click)="setLink()">Enlace</button>
      </div>
      <div #host class="block-editor-host tiptap-host"></div>
    </div>
  `,
  styles: [
    `
      .block-editor-shell {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        min-height: 420px;
      }
      .block-editor-toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
        padding: 0.5rem;
        border: 1px solid rgba(148, 163, 184, 0.45);
        border-radius: 10px;
        background: rgba(248, 250, 252, 0.95);
      }
      .block-editor-toolbar button {
        padding: 0.25rem 0.55rem;
        border-radius: 6px;
        border: 1px solid rgba(148, 163, 184, 0.5);
        background: #fff;
        font-size: 0.75rem;
        cursor: pointer;
      }
      .block-editor-toolbar button:hover {
        border-color: #e60012;
        color: #e60012;
      }
      .block-editor-toolbar__sep {
        width: 1px;
        align-self: stretch;
        background: rgba(148, 163, 184, 0.45);
        margin: 0 0.15rem;
      }
      .block-editor-host {
        flex: 1;
        min-height: 360px;
        padding: 1rem 1.1rem;
        border: 1px solid rgba(148, 163, 184, 0.55);
        border-radius: 12px;
        background: #fff;
        overflow-y: auto;
      }
      :host ::ng-deep .tiptap {
        outline: none;
        min-height: 320px;
        font-family: 'DM Sans', 'Segoe UI', system-ui, sans-serif;
        font-size: 1rem;
        line-height: 1.72;
        color: #1f2937;
      }
      :host ::ng-deep .tiptap h1 {
        font-size: 1.75rem;
        font-weight: 800;
        margin: 1.25rem 0 0.65rem;
      }
      :host ::ng-deep .tiptap h2 {
        font-size: 1.35rem;
        font-weight: 700;
        margin: 1rem 0 0.5rem;
      }
      :host ::ng-deep .tiptap h3 {
        font-size: 1.15rem;
        font-weight: 600;
        margin: 0.85rem 0 0.4rem;
      }
      :host ::ng-deep .tiptap p {
        margin: 0.5rem 0;
      }
      :host ::ng-deep .tiptap ul,
      :host ::ng-deep .tiptap ol {
        padding-left: 1.35rem;
        margin: 0.5rem 0;
      }
      :host ::ng-deep .tiptap blockquote {
        border-left: 4px solid #2563eb;
        margin: 0.75rem 0;
        padding: 0.35rem 0 0.35rem 0.85rem;
        color: #475569;
        background: #f8fafc;
      }
      :host ::ng-deep .tiptap table {
        width: 100%;
        border-collapse: collapse;
        margin: 1rem 0;
      }
      :host ::ng-deep .tiptap th,
      :host ::ng-deep .tiptap td {
        border: 1px solid #cbd5e1;
        padding: 0.45rem 0.65rem;
        vertical-align: top;
      }
      :host ::ng-deep .tiptap th {
        background: #f1f5f9;
        font-weight: 700;
      }
      :host ::ng-deep .tiptap p.is-editor-empty:first-child::before {
        color: #94a3b8;
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
  }

  ngAfterViewInit(): void {
    const element = this.hostRef().nativeElement;
    this.editor = new Editor({
      element,
      extensions: [
        StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
        Placeholder.configure({ placeholder: this.placeholder() }),
        Link.configure({ openOnClick: false }),
        Underline,
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        Image,
        Table.configure({ resizable: true }),
        TableRow,
        TableHeader,
        TableCell,
      ],
      content: this.initialHtml() || '<p></p>',
      editable: !this.disabled(),
      onUpdate: ({ editor }) => {
        this.syncingExternal = true;
        this.htmlChange.emit(this.serializer.normalizeEditorHtml(editor.getHTML()));
        queueMicrotask(() => {
          this.syncingExternal = false;
        });
      },
    });
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
