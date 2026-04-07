import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { VerifactuHashService } from './verifactu-hash.service';

@Injectable()
export class VerifactuQrService {
  constructor(private readonly hashService: VerifactuHashService) {}

  generateQrUrl(params: {
    nif: string;
    invoiceNumber: string;
    invoiceDate: string;
    totalAmount: number;
    environment: 'test' | 'production';
  }): string {
    return this.hashService.generateQrValidationUrl(params);
  }

  async generateQrBase64(params: {
    nif: string;
    invoiceNumber: string;
    invoiceDate: string;
    totalAmount: number;
    environment: 'test' | 'production';
  }): Promise<string> {
    const dataUrl = await QRCode.toDataURL(this.generateQrUrl(params), { width: 300, margin: 2 });
    return dataUrl.split(',')[1];
  }
}

