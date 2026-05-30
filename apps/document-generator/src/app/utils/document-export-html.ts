import type { CoverConfig } from '../document-create/cover-editor.component';
import type { SignatureConfig } from '../document-create/signature-editor.component';
import type { HeaderFooterConfig } from '../document-create/header-footer-editor.component';
import type { WatermarkConfig } from '../document-create/watermark-dialog.component';

/** Altura A4 real para portada (evita 100vh en html2canvas/Chromium). */
export const PDF_COVER_A4_STYLE =
  'width: 210mm; height: 297mm; min-height: 297mm; box-sizing: border-box; page-break-after: always;';

export function exportCoverConfigToHtml(c: Partial<CoverConfig>): string {
  if (!c?.enabled) return '';

  let backgroundStyle = `background: ${c.backgroundColor};`;
  if (c.backgroundType === 'gradient') {
    backgroundStyle = `background: linear-gradient(135deg, ${c.gradientFrom}, ${c.gradientTo});`;
  } else if (c.backgroundType === 'solid') {
    backgroundStyle = `background: ${c.backgroundColor};`;
  } else if (c.backgroundImageUrl) {
    backgroundStyle = `background: url('${c.backgroundImageUrl}') center/cover; background-size: cover;`;
  }

  const textAlign = c.layout === 'left-aligned' ? 'left' : 'center';
  const titleFontSize = c.htmlTitleFontSize ?? c.titleFontSize ?? '2.25rem';
  const subtitleFontSize = c.htmlSubtitleFontSize ?? c.subtitleFontSize ?? '1rem';
  const metadataItems = [
    c.showAuthor && c.author ? { label: 'Autor', value: c.author } : null,
    c.showDate && c.date ? { label: 'Fecha', value: c.date } : null,
  ].filter((item): item is { label: string; value: string } => Boolean(item));

  return `
<div class="pdf-cover pdf-cover-page" style="${PDF_COVER_A4_STYLE} ${backgroundStyle} color: ${c.textColor}; display: flex; align-items: center; justify-content: center; padding: 40px; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
  <div class="cover-container" style="text-align: ${textAlign}; width: 100%; max-width: 760px;">
    ${c.logoUrl ? `<div style="display: flex; justify-content: ${textAlign}; margin-bottom: 26px;"><img src="${c.logoUrl}" style="max-width: 140px; height: auto;" alt="Logo"/></div>` : ''}
    <div class="cover-header">
      <h1 class="cover-title" style="color: ${c.textColor}; font-size: ${titleFontSize}; overflow-wrap: break-word; word-break: break-word; white-space: normal;">${c.title || 'Título del documento'}</h1>
      ${c.subtitle ? `<p class="cover-subtitle" style="color: ${c.textColor}; font-size: ${subtitleFontSize}; overflow-wrap: break-word; word-break: break-word; white-space: normal;">${c.subtitle}</p>` : ''}
    </div>
    ${c.showDivider ? `<div style="width: 96px; height: 4px; background: ${c.textColor}; opacity: 0.65; border-radius: 999px; margin: 28px auto 0;"></div>` : ''}
    ${metadataItems.length
      ? `<div class="cover-meta">
          ${metadataItems
            .map(
              (item) =>
                `<div class="cover-meta-item"><strong>${item.label}</strong><span>${item.value}</span></div>`,
            )
            .join('')}
        </div>`
      : ''}
  </div>
</div>`;
}

export function exportSignatureConfigToHtml(c: Partial<SignatureConfig>): string {
  if (!c?.enabled) return '';

  const signatureBlock = renderSignatureBlock(c);
  const layout = getSignatureLayout(c.layout);
  return renderSignatureLayout(layout, signatureBlock, c);
}

function renderSignatureBlock(c: Partial<SignatureConfig>): string {
  const blocks: string[] = [];
  if (c.signatureImageUrl) {
    blocks.push(
      `<img src="${c.signatureImageUrl}" style="max-width: 150px; max-height: 60px; object-fit: contain; margin-bottom: 8px;" alt="Firma"/>`,
    );
  }
  if (c.showLine) {
    blocks.push('<div style="border-top: 1px solid #374151; margin: 0 auto 8px; min-width: 180px;"></div>');
  }
  blocks.push(`<div style="font-weight: 600; color: #111827; font-size: 0.95rem;">${c.name || 'Nombre del firmante'}</div>`);
  if (c.title) {
    blocks.push(`<div style="color: #6b7280; font-size: 0.8rem;">${c.title}</div>`);
  }
  if (c.company) {
    blocks.push(`<div style="color: #6b7280; font-size: 0.8rem;">${c.company}</div>`);
  }

  const locationAndDate = [c.showLocation && c.location ? c.location : '', c.showDate && c.date ? c.date : '']
    .filter(Boolean)
    .join(', ');
  if (locationAndDate) {
    blocks.push(`<div style="color: #9ca3af; font-size: 0.75rem; margin-top: 8px;">${locationAndDate}</div>`);
  }

  const flexStyle = c.layout === 'horizontal' ? 'flex: 1;' : '';
  return `
<div style="text-align: center; ${flexStyle}">
  ${blocks.join('')}
</div>`;
}

function getSignatureLayout(layout?: string): 'horizontal' | 'vertical' | 'default' {
  if (layout === 'horizontal') {
    return 'horizontal';
  }
  if (layout === 'vertical') {
    return 'vertical';
  }
  return 'default';
}

function renderSignatureLayout(
  layout: 'horizontal' | 'vertical' | 'default',
  signatureBlock: string,
  c: Partial<SignatureConfig>,
): string {
  if (layout === 'horizontal') {
    return `
<div class="pdf-signatures" style="margin-top: 60px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
  <div style="display: flex; justify-content: space-between; gap: 40px;">
    ${signatureBlock}
    ${signatureBlock}
  </div>
</div>`;
  }

  if (layout === 'vertical') {
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

  const samplePage = Number.isFinite(c.startPageFrom ?? NaN) ? c.startPageFrom! : 1;
  const sampleTotal = samplePage + 3;

  const resolveVars = (text: string): string =>
    text
      .replace(/\{page\}/g, String(samplePage))
      .replace(/\{total\}/g, String(sampleTotal))
      .replace(/\{title\}/g, documentTitle)
      .replace(/\{date\}/g, new Date().toLocaleDateString('es-ES'))
      .replace(/\{author\}/g, '');

  const pageNumberFormat = c.pageNumberFormat ?? 'simple';
  const defaultFooter = pageNumberFormat === 'x-of-y'
    ? `Página ${samplePage} de ${sampleTotal}`
    : pageNumberFormat === 'page-x'
    ? `Pág. ${samplePage}`
    : `${samplePage}`;

  const effectiveRight = isHeader ? right : right || defaultFooter;
  const hasContent = [left, center, effectiveRight].some((t) => t.trim());
  if (!hasContent) return '';

  let dividerStyle = '';
  if (c.showDivider) {
    dividerStyle = isHeader
      ? 'border-bottom: 1px solid rgba(226, 232, 240, 0.95); margin-bottom: 8px; padding-bottom: 6px;'
      : 'border-top: 1px solid rgba(226, 232, 240, 0.95); margin-top: 8px; padding-top: 6px;';
  }

  const sectionStyle = `min-width: 0; flex: 1;`; 
  return `
<div class="pdf-${zone}" style="display:flex; justify-content:space-between; align-items:center; gap: 1rem; padding: 10px 20px; font-size:${c.fontSize ?? '9pt'}; color:${c.textColor ?? '#475569'}; background:${c.backgroundColor && c.backgroundColor !== 'transparent' ? c.backgroundColor : 'rgba(255,255,255,0.92)'}; ${dividerStyle}">
  <span class="pdf-section left" style="${sectionStyle}; text-align:left;">${resolveVars(left)}</span>
  <span class="pdf-section center" style="${sectionStyle}; text-align:center;">${resolveVars(center)}</span>
  <span class="pdf-section right" style="${sectionStyle}; text-align:right;">${resolveVars(right)}</span>
</div>`;
}

export function exportWatermarkConfigToHtml(c: Partial<WatermarkConfig>): string {
  if (!c?.enabled || !c?.text) return '';

  const opacity = Math.max(0.05, Math.min(0.5, c.opacity ?? 0.1));
  const fontSize = c.fontSize ?? 48;
  const rotation = c.rotation ?? -45;
  const color = c.color ?? '#000000';

  return `
<div class="pdf-watermark" style="
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(${rotation}deg);
  font-size: ${fontSize}px;
  color: ${color};
  opacity: ${opacity};
  pointer-events: none;
  user-select: none;
  z-index: -1;
  white-space: nowrap;
  font-weight: 700;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
">${c.text}</div>`;
}

export interface DocumentExtrasInput {
  coverConfig?: Partial<CoverConfig>;
  signatureConfig?: Partial<SignatureConfig>;
  headerFooterConfig?: Partial<HeaderFooterConfig>;
  watermarkConfig?: Partial<WatermarkConfig>;
  coverPanelEnabled?: boolean;
  signaturePanelEnabled?: boolean;
  headerFooterPanelEnabled?: boolean;
  watermarkPanelEnabled?: boolean;
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

  const watermarkEnabled =
    extras.watermarkPanelEnabled || extras.watermarkConfig?.enabled;
  if (watermarkEnabled && extras.watermarkConfig) {
    const watermarkHtml = exportWatermarkConfigToHtml(extras.watermarkConfig);
    if (watermarkHtml) {
      body = watermarkHtml + '\n' + body;
    }
  }

  return body;
}
