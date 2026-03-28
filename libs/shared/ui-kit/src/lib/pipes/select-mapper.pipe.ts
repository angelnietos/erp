import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'selectMapper',
  standalone: true
})
export class SelectMapperPipe implements PipeTransform {
  transform<T extends Record<string, unknown>>(items: T[] | null, labelKey: string, valueKey: string): { label: unknown, value: unknown }[] {
    if (!items) return [];
    return items.map((item: T) => ({
      label: item[labelKey],
      value: item[valueKey]
    }));
  }
}
