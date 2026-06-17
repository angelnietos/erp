import { marked } from 'marked';

const MARKDOWN_OPTIONS = { gfm: true, breaks: true, async: false } as const;

marked.setOptions(MARKDOWN_OPTIONS);

/** Convierte Markdown a HTML (síncrono). Usado por editor, preview y PDF. */
export function parseMarkdownToHtml(content: string): string {
  if (!content.trim()) {
    return '';
  }
  try {
    const result = marked.parse(content, MARKDOWN_OPTIONS);
    return typeof result === 'string' ? result : content;
  } catch {
    return content;
  }
}
