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

/** Para @Output: `action` es el nombre que verás en el panel Actions de Storybook */
export function sbEmit(channel: string, description?: string): ArgTypes[string] {
  return {
    action: channel,
    ...(description ? { description } : {}),
  };
}

/** Texto estándar para documentación de stories: integración con `JosanzThemeService`. */
export const JOSANZ_STORYBOOK_THEME_DOCS =
  '**Tema:** usa las barras **Atmósfera**, **Marca**, **Shape** y **Theme**. Storybook sincroniza `JosanzThemeService` y los tokens CSS `--josanz-*`, asi los componentes que leen `currentTheme()` y los que leen CSS vars reaccionan igual que en la app.';

export function josanzStoryThemeDescription(extra?: string): string {
  return extra ? `${JOSANZ_STORYBOOK_THEME_DOCS}\n\n${extra}` : JOSANZ_STORYBOOK_THEME_DOCS;
}

export const JOSANZ_SHAPES = ['rounded', 'pill', 'square'] as const;

/** ArgTypes compartidos para `shape` + `customColor` en playgrounds. */
export const sbShapeArgTypes: ArgTypes = {
  shape: sbRadio(JOSANZ_SHAPES, 'Forma de los controles (rounded, pill, square)'),
  customColor: {
    control: 'color',
    description: 'Color de marca o acento local. Si se deja vacío, usa la toolbar Marca.',
  },
};
