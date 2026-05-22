/**
 * Tipos mínimos para librerías cargadas por script en `index.html`
 * (`marked`, `html2pdf.js`). Centraliza declaraciones y evita `any`.
 */
export interface MarkedGlobal {
  parse: (src: string, options?: object) => string;
  setOptions?: (options: object) => void;
}

export interface Html2PdfChain {
  set: (options: object) => Html2PdfChain;
  from: (source: string | HTMLElement) => Html2PdfChain;
  outputPdf: (type: 'blob') => Promise<Blob>;
}

export type Html2PdfFactory = () => Html2PdfChain;
