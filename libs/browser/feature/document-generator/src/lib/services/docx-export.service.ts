import { Injectable } from '@angular/core';

type DocxModule = typeof import('docx');

@Injectable({ providedIn: 'root' })
export class DocxExportService {
  private docxModule: Promise<DocxModule> | null = null;

  private loadDocx(): Promise<DocxModule> {
    this.docxModule ??= import('docx');
    return this.docxModule;
  }

  async exportHtml(html: string, title = 'Documento'): Promise<Blob> {
    const docx = await this.loadDocx();
    const doc = new DOMParser().parseFromString(
      html.includes('<body') ? html : `<body>${html}</body>`,
      'text/html',
    );
    const root = doc.body;
    const children = this.nodeListToDocx(docx, root.childNodes);

    if (children.length === 0) {
      children.push(
        new docx.Paragraph({
          children: [new docx.TextRun('Documento vacío')],
        }),
      );
    }

    const document = new docx.Document({
      title,
      sections: [{ children }],
    });

    return docx.Packer.toBlob(document);
  }

  private nodeListToDocx(
    docx: DocxModule,
    nodes: NodeListOf<ChildNode>,
  ): (InstanceType<DocxModule['Paragraph']> | InstanceType<DocxModule['Table']>)[] {
    const out: (
      | InstanceType<DocxModule['Paragraph']>
      | InstanceType<DocxModule['Table']>
    )[] = [];
    nodes.forEach((node) => {
      const converted = this.nodeToDocx(docx, node);
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

  private nodeToDocx(
    docx: DocxModule,
    node: Node,
  ):
    | InstanceType<DocxModule['Paragraph']>
    | InstanceType<DocxModule['Table']>
    | (InstanceType<DocxModule['Paragraph']> | InstanceType<DocxModule['Table']>)[]
    | null {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node.textContent ?? '').trim();
      if (!text) {
        return null;
      }
      return new docx.Paragraph({ children: [new docx.TextRun(text)] });
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return null;
    }

    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    switch (tag) {
      case 'h1':
        return new docx.Paragraph({
          heading: docx.HeadingLevel.HEADING_1,
          children: this.inlineRuns(docx, el),
        });
      case 'h2':
        return new docx.Paragraph({
          heading: docx.HeadingLevel.HEADING_2,
          children: this.inlineRuns(docx, el),
        });
      case 'h3':
      case 'h4':
        return new docx.Paragraph({
          heading: docx.HeadingLevel.HEADING_3,
          children: this.inlineRuns(docx, el),
        });
      case 'p':
      case 'div':
      case 'blockquote':
        return new docx.Paragraph({ children: this.inlineRuns(docx, el) });
      case 'ul':
      case 'ol':
        return Array.from(el.children).map(
          (li, index) =>
            new docx.Paragraph({
              children: [
                new docx.TextRun({
                  text: `${tag === 'ol' ? `${index + 1}.` : '•'} ${li.textContent?.trim() ?? ''}`,
                }),
              ],
            }),
        );
      case 'table':
        return this.tableToDocx(docx, el);
      case 'hr':
        return new docx.Paragraph({
          children: [new docx.TextRun('———————————————')],
        });
      case 'pre':
        return new docx.Paragraph({
          children: [
            new docx.TextRun({
              text: el.textContent ?? '',
              font: 'Courier New',
            }),
          ],
        });
      default:
        if (el.children.length > 0) {
          return this.nodeListToDocx(docx, el.childNodes);
        }
        if (el.textContent?.trim()) {
          return new docx.Paragraph({
            children: [new docx.TextRun(el.textContent.trim())],
          });
        }
        return null;
    }
  }

  private inlineRuns(
    docx: DocxModule,
    el: HTMLElement,
  ): InstanceType<DocxModule['TextRun']>[] {
    const runs: InstanceType<DocxModule['TextRun']>[] = [];
    el.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const t = child.textContent ?? '';
        if (t) {
          runs.push(new docx.TextRun(t));
        }
        return;
      }
      if (child.nodeType !== Node.ELEMENT_NODE) {
        return;
      }
      const childEl = child as HTMLElement;
      const tag = childEl.tagName.toLowerCase();
      runs.push(
        new docx.TextRun({
          text: childEl.textContent ?? '',
          bold: tag === 'strong' || tag === 'b',
          italics: tag === 'em' || tag === 'i',
          underline: tag === 'u' ? {} : undefined,
          strike: tag === 'del' || tag === 's',
        }),
      );
    });
    if (runs.length === 0 && el.textContent?.trim()) {
      runs.push(new docx.TextRun(el.textContent.trim()));
    }
    return runs;
  }

  private tableToDocx(
    docx: DocxModule,
    table: HTMLElement,
  ): InstanceType<DocxModule['Table']> {
    const rows = Array.from(table.querySelectorAll('tr'));
    return new docx.Table({
      width: { size: 100, type: docx.WidthType.PERCENTAGE },
      rows: rows.map(
        (tr) =>
          new docx.TableRow({
            children: Array.from(tr.querySelectorAll('th, td')).map(
              (cell) =>
                new docx.TableCell({
                  children: [
                    new docx.Paragraph({
                      children: [new docx.TextRun(cell.textContent?.trim() ?? '')],
                    }),
                  ],
                  borders: {
                    top: { style: docx.BorderStyle.SINGLE, size: 1 },
                    bottom: { style: docx.BorderStyle.SINGLE, size: 1 },
                    left: { style: docx.BorderStyle.SINGLE, size: 1 },
                    right: { style: docx.BorderStyle.SINGLE, size: 1 },
                  },
                }),
            ),
          }),
      ),
    });
  }
}
