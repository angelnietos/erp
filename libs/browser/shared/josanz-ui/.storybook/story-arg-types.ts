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
  '**Tema:** usa la barra **Atmósfera** (tokens de `JosanzThemeService`) y **Theme** claro/oscuro. Los componentes usan `atmosphere.text`, `textMuted`, `surface`, `border` y contraste automático sobre el color de marca (`josanzReadableOnSolid`).';

export function josanzStoryThemeDescription(extra?: string): string {
  return extra ? `${JOSANZ_STORYBOOK_THEME_DOCS}\n\n${extra}` : JOSANZ_STORYBOOK_THEME_DOCS;
}
