import { Injectable } from '@angular/core';
import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  BorderStyle,
} from 'docx';

@Injectable({ providedIn: 'root' })
export class DocxExportService {
  async exportHtml(html: string, title = 'Documento'): Promise<Blob> {
    const doc = new DOMParser().parseFromString(
      html.includes('<body') ? html : `<body>${html}</body>`,
      'text/html',
    );
    const root = doc.body;
    const children = this.nodeListToDocx(root.childNodes);

    if (children.length === 0) {
      children.push(
        new Paragraph({
          children: [new TextRun('Documento vacío')],
        }),
      );
    }

    const document = new Document({
      title,
      sections: [{ children }],
    });

    return Packer.toBlob(document);
  }

  private nodeListToDocx(nodes: NodeListOf<ChildNode>): (Paragraph | Table)[] {
    const out: (Paragraph | Table)[] = [];
    nodes.forEach((node) => {
      const converted = this.nodeToDocx(node);
      if (converted) {
        if (Array.isArray(converted)) {
          out.push(...converted);
        } else {
          out.push(converted);
        }
      }
    });
    return out;
  }

  private nodeToDocx(node: Node): Paragraph | Table | (Paragraph | Table)[] | null {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node.textContent ?? '').trim();
      if (!text) {
        return null;
      }
      return new Paragraph({ children: [new TextRun(text)] });
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return null;
    }

    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    switch (tag) {
      case 'h1':
        return new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: this.inlineRuns(el),
        });
      case 'h2':
        return new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: this.inlineRuns(el),
        });
      case 'h3':
      case 'h4':
        return new Paragraph({
          heading: HeadingLevel.HEADING_3,
          children: this.inlineRuns(el),
        });
      case 'p':
      case 'div':
      case 'blockquote':
        return new Paragraph({ children: this.inlineRuns(el) });
      case 'ul':
      case 'ol':
        return Array.from(el.children).map(
          (li, index) =>
            new Paragraph({
              children: [
                new TextRun({
                  text: `${tag === 'ol' ? `${index + 1}.` : '•'} ${li.textContent?.trim() ?? ''}`,
                }),
              ],
            }),
        );
      case 'table':
        return this.tableToDocx(el);
      case 'hr':
        return new Paragraph({
          children: [new TextRun('———————————————')],
        });
      case 'pre':
        return new Paragraph({
          children: [
            new TextRun({
              text: el.textContent ?? '',
              font: 'Courier New',
            }),
          ],
        });
      default:
        if (el.children.length > 0) {
          return this.nodeListToDocx(el.childNodes);
        }
        if (el.textContent?.trim()) {
          return new Paragraph({ children: [new TextRun(el.textContent.trim())] });
        }
        return null;
    }
  }

  private inlineRuns(el: HTMLElement): TextRun[] {
    const runs: TextRun[] = [];
    el.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const t = child.textContent ?? '';
        if (t) {
          runs.push(new TextRun(t));
        }
        return;
      }
      if (child.nodeType !== Node.ELEMENT_NODE) {
        return;
      }
      const childEl = child as HTMLElement;
      const tag = childEl.tagName.toLowerCase();
      runs.push(
        new TextRun({
          text: childEl.textContent ?? '',
          bold: tag === 'strong' || tag === 'b',
          italics: tag === 'em' || tag === 'i',
          underline: tag === 'u' ? {} : undefined,
          strike: tag === 'del' || tag === 's',
        }),
      );
    });
    if (runs.length === 0 && el.textContent?.trim()) {
      runs.push(new TextRun(el.textContent.trim()));
    }
    return runs;
  }

  private tableToDocx(table: HTMLElement): Table {
    const rows = Array.from(table.querySelectorAll('tr'));
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: rows.map(
        (tr) =>
          new TableRow({
            children: Array.from(tr.querySelectorAll('th, td')).map(
              (cell) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [new TextRun(cell.textContent?.trim() ?? '')],
                    }),
                  ],
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 1 },
                    bottom: { style: BorderStyle.SINGLE, size: 1 },
                    left: { style: BorderStyle.SINGLE, size: 1 },
                    right: { style: BorderStyle.SINGLE, size: 1 },
                  },
                }),
            ),
          }),
      ),
    });
  }
}
