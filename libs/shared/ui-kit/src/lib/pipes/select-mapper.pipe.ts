import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'selectMapper',
  standalone: true
})
export class SelectMapperPipe implements PipeTransform {
  transform(items: unknown[] | null, labelKey: string, valueKey: string): { label: string, value: any }[] {
    if (!items) return [];
    return items.map((item: any) => ({
      label: item[labelKey],
      value: item[valueKey]
    }));
  }
}
