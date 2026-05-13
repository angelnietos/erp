import type { ArgTypes } from '@storybook/angular';

export function sbSelect<T extends string>(
  options: readonly T[],
  description?: string,
): ArgTypes[string] {
  return {
    control: { type: 'select' },
    options: [...options],
    ...(description ? { description } : {}),
  };
}

export function sbRadio<T extends string>(
  options: readonly T[],
  description?: string,
): ArgTypes[string] {
  return {
    control: { type: 'inline-radio' },
    options: [...options],
    ...(description ? { description } : {}),
  };
}

export const sbHideData: ArgTypes[string] = {
  control: false,
  table: { disable: true },
};
