import { Pipe, PipeTransform } from '@angular/core';

/**
 * Maps array items to select options format { label, value }.
 * Works with any object type that has string properties.
 */
@Pipe({
  name: 'selectMapper',
  standalone: true
})
export class SelectMapperPipe implements PipeTransform {
  transform<T extends object>(items: T[] | null, labelKey: keyof T, valueKey: keyof T): { label: string; value: T[keyof T] }[] {
    if (!items) return [];
    return items.map((item) => ({
      label: String(item[labelKey] ?? ''),
      value: item[valueKey]
    }));
  }
}
