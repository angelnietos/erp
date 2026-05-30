import type { CoverConfig } from '../document-create/cover-editor.component';
import type { SignatureConfig } from '../document-create/signature-editor.component';
import type { HeaderFooterConfig } from '../document-create/header-footer-editor.component';

/** Altura A4 real para portada (evita 100vh en html2canvas/Chromium). */
export const PDF_COVER_A4_STYLE =
  'width: 210mm; height: 297mm; min-height: 297mm; box-sizing: border-box; page-break-after: always;';

export function exportCoverConfigToHtml(c: Partial<CoverConfig>): string {
  if (!c?.enabled) return '';

  const backgroundStyle =
    c.backgroundType === 'gradient'
      ? `background: linear-gradient(135deg, ${c.gradientFrom}, ${c.gradientTo});`
      : c.backgroundType === 'solid'
        ? `background: ${c.backgroundColor};`
        : c.backgroundImageUrl
          ? `background: url('${c.backgroundImageUrl}') center/cover;`
          : `background: ${c.backgroundColor};`;

  const textAlign = c.layout === 'left-aligned' ? 'left' : 'center';
  const dividerMargin =
    c.layout === 'left-aligned' ? '0 0 24px' : '0 auto 24px';

  return `
<div class="pdf-cover pdf-cover-page" style="${PDF_COVER_A4_STYLE} ${backgroundStyle} color: ${c.textColor}; display: flex; align-items: center; justify-content: center; padding: 60px; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
  <div style="text-align: ${textAlign}; max-width: 600px;">
    ${c.logoUrl ? `<img src="${c.logoUrl}" style="max-width: 120px; margin-bottom: 24px;" alt="Logo"/>` : ''}
    <h1 style="font-size: 2.5rem; font-weight: 800; margin: 0 0 16px; color: ${c.textColor};">${c.title || 'Título'}</h1>
    ${c.subtitle ? `<p style="font-size: 1.1rem; opacity: 0.9; margin: 0 0 24px; color: ${c.textColor};">${c.subtitle}</p>` : ''}
    ${c.showDivider ? `<div style="width: 80px; height: 4px; background: ${c.textColor}; opacity: 0.5; border-radius: 4px; margin: ${dividerMargin};"></div>` : ''}
    <p style="font-size: 0.9rem; opacity: 0.85; color: ${c.textColor};">
      ${[c.showAuthor && c.author ? c.author : '', c.showDate && c.date ? c.date : ''].filter(Boolean).join(' · ')}
    </p>
  </div>
</div>`;
}

export function exportSignatureConfigToHtml(c: Partial<SignatureConfig>): string {
  if (!c?.enabled) return '';

  const signatureBlock = `
<div style="text-align: center; ${c.layout === 'horizontal' ? 'flex: 1;' : ''}">
  ${c.signatureImageUrl ? `<img src="${c.signatureImageUrl}" style="max-width: 150px; max-height: 60px; object-fit: contain; margin-bottom: 8px;" alt="Firma"/>` : ''}
  ${c.showLine ? '<div style="border-top: 1px solid #374151; margin: 0 auto 8px; min-width: 180px;"></div>' : ''}
  <div style="font-weight: 600; color: #111827; font-size: 0.95rem;">${c.name || 'Nombre del firmante'}</div>
  ${c.title ? `<div style="color: #6b7280; font-size: 0.8rem;">${c.title}</div>` : ''}
  ${c.company ? `<div style="color: #6b7280; font-size: 0.8rem;">${c.company}</div>` : ''}
  <div style="color: #9ca3af; font-size: 0.75rem; margin-top: 8px;">
    ${[c.showLocation && c.location ? c.location : '', c.showDate && c.date ? c.date : ''].filter(Boolean).join(', ')}
  </div>
</div>`;

  if (c.layout === 'horizontal') {
    return `
<div class="pdf-signatures" style="margin-top: 60px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
  <div style="display: flex; justify-content: space-between; gap: 40px;">
    ${signatureBlock}
    ${signatureBlock}
  </div>
</div>`;
  }

  if (c.layout === 'vertical') {
    return `
<div class="pdf-signatures" style="margin-top: 60px; padding-top: 30px; border-top: 1px solid #e5e7eb; text-align: center;">
  ${signatureBlock}
</div>`;
  }

  return `
<div class="pdf-signatures" style="margin-top: 60px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
  <div style="display: flex; justify-content: space-between; align-items: flex-end;">
    ${signatureBlock}
    <div style="text-align: right; font-size: 0.75rem; color: #9ca3af;">
      ${c.showLocation && c.location ? `<div>${c.location}</div>` : ''}
      ${c.showDate && c.date ? `<div>${c.date}</div>` : ''}
    </div>
  </div>
</div>`;
}

export function exportHeaderFooterConfigToHtml(
  c: Partial<HeaderFooterConfig>,
  zone: 'header' | 'footer',
  documentTitle = 'Documento',
): string {
  if (!c?.enabled) return '';

  const isHeader = zone === 'header';
  const left = isHeader ? (c.headerLeft ?? '') : (c.footerLeft ?? '');
  const center = isHeader ? (c.headerCenter ?? '') : (c.footerCenter ?? '');
  const right = isHeader ? (c.headerRight ?? '') : (c.footerRight ?? '');

  const resolveVars = (text: string): string =>
    text
      .replace(/\{page\}/g, String(c.startPageFrom ?? 1))
      .replace(/\{total\}/g, '?')
      .replace(/\{title\}/g, documentTitle)
      .replace(/\{date\}/g, new Date().toLocaleDateString('es-ES'))
      .replace(/\{author\}/g, '');

  const hasContent = [left, center, right].some((t) => t.trim());
  if (!hasContent) return '';

  const dividerStyle = c.showDivider
    ? isHeader
      ? 'border-bottom: 1px solid #e2e8f0; margin-bottom: 8px; padding-bottom: 6px;'
      : 'border-top: 1px solid #e2e8f0; margin-top: 8px; padding-top: 6px;'
    : '';

  return `
<div class="pdf-${zone}" style="display:flex; justify-content:space-between; align-items:center; padding: 6px 20px; font-size:${c.fontSize ?? '9pt'}; color:${c.textColor ?? '#64748b'}; background:${c.backgroundColor && c.backgroundColor !== 'transparent' ? c.backgroundColor : 'transparent'}; ${dividerStyle}">
  <span>${resolveVars(left)}</span>
  <span>${resolveVars(center)}</span>
  <span>${resolveVars(right)}</span>
</div>`;
}

export interface DocumentExtrasInput {
  coverConfig?: Partial<CoverConfig>;
  signatureConfig?: Partial<SignatureConfig>;
  headerFooterConfig?: Partial<HeaderFooterConfig>;
  coverPanelEnabled?: boolean;
  signaturePanelEnabled?: boolean;
  headerFooterPanelEnabled?: boolean;
  documentTitle?: string;
}

export function assembleDocumentBodyHtml(
  contentMarkup: string,
  extras: DocumentExtrasInput,
): string {
  let body = contentMarkup;

  const coverEnabled =
    extras.coverPanelEnabled || extras.coverConfig?.enabled;
  if (coverEnabled && extras.coverConfig) {
    const coverHtml = exportCoverConfigToHtml(extras.coverConfig);
    if (coverHtml) {
      body = coverHtml + '\n' + body;
    }
  }

  const hfEnabled =
    extras.headerFooterPanelEnabled || extras.headerFooterConfig?.enabled;
  if (hfEnabled && extras.headerFooterConfig) {
    const headerHtml = exportHeaderFooterConfigToHtml(
      extras.headerFooterConfig,
      'header',
      extras.documentTitle,
    );
    const footerHtml = exportHeaderFooterConfigToHtml(
      extras.headerFooterConfig,
      'footer',
      extras.documentTitle,
    );
    body = headerHtml + '\n' + body + '\n' + footerHtml;
  }

  const sigEnabled =
    extras.signaturePanelEnabled || extras.signatureConfig?.enabled;
  if (sigEnabled && extras.signatureConfig) {
    const signatureHtml = exportSignatureConfigToHtml(extras.signatureConfig);
    if (signatureHtml) {
      body = body + '\n' + signatureHtml;
    }
  }

  return body;
}
