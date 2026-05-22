/**
 * Shared Storybook argTypes for ui-kit: selects instead of free-text for variants.
 * Import from stories: `import { sbSelect } from '../../../.storybook/story-arg-types'`
 */
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

/** Large JSON payloads — hide from Controls to keep variant pickers usable */
export const sbHideData: ArgTypes[string] = {
  control: false,
  table: { disable: true },
};
