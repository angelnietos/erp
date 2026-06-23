import * as QRCode from 'qrcode';

export function buildAeatQrValidationUrl(params: {
  nif: string;
  invoiceNumber: string;
  issueDate: string;
  totalAmount: number;
  environment: 'test' | 'production';
}): string {
  const baseUrl =
    params.environment === 'production'
      ? 'https://www2.agenciatributaria.gob.es/wlpl/TIKE-CONT/ValidarQR'
      : 'https://prewww2.aeat.es/wlpl/TIKE-CONT/ValidarQR';

  const formattedDate = formatDateForQr(params.issueDate);
  const query = [
    `nif=${encodeURIComponent(params.nif)}`,
    `numserie=${encodeURIComponent(params.invoiceNumber)}`,
    `fecha=${encodeURIComponent(formattedDate)}`,
    `importe=${encodeURIComponent(params.totalAmount.toFixed(2))}`,
  ].join('&');

  return `${baseUrl}?${query}`;
}

function formatDateForQr(date: string): string {
  if (/^\d{2}-\d{2}-\d{4}$/.test(date)) {
    return date;
  }
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) {
    return date;
  }
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export async function qrPngDataUrl(content: string): Promise<string> {
  return QRCode.toDataURL(content, { width: 280, margin: 2 });
}
