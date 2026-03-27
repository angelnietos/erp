import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

@Injectable()
export class VerifactuHashService {
  generateSha256Hash(data: string): string {
    return createHash('sha256').update(data, 'utf8').digest('hex').toUpperCase();
  }

  generateInitialHash(): string {
    return '0000000000000000000000000000000000000000000000000000000000000000';
  }

  generateTimestamp(date = new Date()): string {
    const iso = date.toISOString().replace('Z', '');
    const offset = -date.getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const hh = Math.floor(Math.abs(offset) / 60)
      .toString()
      .padStart(2, '0');
    const mm = (Math.abs(offset) % 60).toString().padStart(2, '0');
    return `${iso}${sign}${hh}:${mm}`;
  }

  generateQrValidationUrl(params: {
    nif: string;
    invoiceNumber: string;
    invoiceDate: string;
    totalAmount: number;
    environment: 'test' | 'production';
  }): string {
    const baseUrl =
      params.environment === 'production'
        ? 'https://www2.agenciatributaria.gob.es/wlpl/TIKE-CONT/ValidarQR'
        : 'https://prewww2.aeat.es/wlpl/TIKE-CONT/ValidarQR';
    const query = [
      `nif=${encodeURIComponent(params.nif)}`,
      `numserie=${encodeURIComponent(params.invoiceNumber)}`,
      `fecha=${encodeURIComponent(this.formatDateForHash(params.invoiceDate))}`,
      `importe=${encodeURIComponent(params.totalAmount.toFixed(2))}`,
    ].join('&');
    return `${baseUrl}?${query}`;
  }

  private formatDateForHash(date: string): string {
    if (date.includes('-') && date.split('-')[0].length === 2) return date;
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }
}

