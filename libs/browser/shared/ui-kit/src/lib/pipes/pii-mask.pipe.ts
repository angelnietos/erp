import { Pipe, PipeTransform } from '@angular/core';
import {
  maskEmail,
  maskPhone,
  maskTaxId,
  redactPiiString,
} from '@josanz-erp/shared-utils';

export type PiiMaskType = 'email' | 'phone' | 'taxId' | 'default';

@Pipe({
  name: 'piiMask',
  standalone: true,
})
export class PiiMaskPipe implements PipeTransform {
  transform(
    value: string | null | undefined,
    type: PiiMaskType = 'default',
  ): string {
    if (value == null || value === '') return '';
    switch (type) {
      case 'email':
        return maskEmail(value);
      case 'phone':
        return maskPhone(value);
      case 'taxId':
        return maskTaxId(value);
      default:
        return redactPiiString('default', value);
    }
  }
}
