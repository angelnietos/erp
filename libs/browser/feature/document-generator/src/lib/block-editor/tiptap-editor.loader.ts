import type { Editor } from '@tiptap/core';

export interface CreateTiptapEditorOptions {
  element: HTMLElement;
  content: string;
  placeholder: string;
  editable: boolean;
  onUpdate: (html: string) => void;
}

/** Carga TipTap y extensiones bajo demanda (chunk separado del editor principal). */
export async function createTiptapEditor(
  options: CreateTiptapEditorOptions,
): Promise<Editor> {
  const [
    { Editor },
    { default: StarterKit },
    { default: Placeholder },
    { default: Link },
    { default: Underline },
    { default: TextAlign },
    { default: Image },
    { Table },
    { TableRow },
    { TableCell },
    { TableHeader },
  ] = await Promise.all([
    import('@tiptap/core'),
    import('@tiptap/starter-kit'),
    import('@tiptap/extension-placeholder'),
    import('@tiptap/extension-link'),
    import('@tiptap/extension-underline'),
    import('@tiptap/extension-text-align'),
    import('@tiptap/extension-image'),
    import('@tiptap/extension-table'),
    import('@tiptap/extension-table-row'),
    import('@tiptap/extension-table-cell'),
    import('@tiptap/extension-table-header'),
  ]);

  return new Editor({
    element: options.element,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder: options.placeholder }),
      Link.configure({ openOnClick: false }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: options.content || '<p></p>',
    editable: options.editable,
    onUpdate: ({ editor }) => {
      options.onUpdate(editor.getHTML());
    },
  });
}
