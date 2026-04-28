
  argTypes: {
    label: { control: 'text', description: 'Etiqueta del campo' },
    placeholder: { control: 'text', description: 'Texto de placeholder' },
    hint: { control: 'text', description: 'Texto de ayuda' },
    variant: sbSelect(
      ['default', 'filled', 'outlined', 'ghost', 'dark', 'light', 'error', 'success', 'warning', 'info', 'rounded', 'minimal', 'soft', 'glass'] as const,
      'Variante',
    ),
    rows: { control: { type: 'number', min: 1, max: 20 }, description: 'Número de filas' },
    disabled: { control: 'boolean', description: 'Deshabilitado' },
    error: { control: 'boolean', description: 'Estado de error' },
    value: { control: 'text', description: 'Valor inicial' },
  },
};
export default meta;
type Story = StoryObj<UiTextareaComponent>;

const baseArgs = {
  label: '',
  placeholder: 'Escribe aquí...',
  hint: '',
  variant: 'default' as const,
  rows: 4,
  disabled: false,
  error: false,
  value: '',
};

/**
 * PLAYGROUND: Textarea interactivo
 */
export const Playground: Story = {
  args: {
    ...baseArgs,
    label: 'Descripción del proyecto',
    placeholder: 'Describe los objetivos principales...',
    hint: 'Mínimo 50 caracteres, máximo 500',
    variant: 'default',
    rows: 6,
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-textarea
        [label]="label"
        [placeholder]="placeholder"
        [hint]="hint"
        [variant]="variant"
        [rows]="rows"
        [disabled]="disabled"
        [error]="error"
        [value]="value"
      ></ui-textarea>
    `,
  }),
};

/**
 * VARIANTES: Todas las variantes
 */
export const Variants: Story = {
  args: {
    ...baseArgs,
    label: 'Campo',
    placeholder: 'Ejemplo de texto',
    rows: 4,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <ui-textarea [variant]="'default'" [label]="'Default'" [placeholder]="'default'" [rows]="4"></ui-textarea>
        <ui-textarea [variant]="'filled'" [label]="'Filled'" [placeholder]="'filled'" [rows]="4"></ui-textarea>
        <ui-textarea [variant]="'outlined'" [label]="'Outlined'" [placeholder]="'outlined'" [rows]="4"></ui-textarea>
        <ui-textarea [variant]="'ghost'" [label]="'Ghost'" [placeholder]="'ghost'" [rows]="4"></ui-textarea>
        <ui-textarea [variant]="'dark'" [label]="'Dark'" [placeholder]="'dark'" [rows]="4"></ui-textarea>
        <ui-textarea [variant]="'light'" [label]="'Light'" [placeholder]="'light'" [rows]="4"></ui-textarea>
        <ui-textarea [variant]="'error'" [label]="'Error'" [placeholder]="'error'" [rows]="4"></ui-textarea>
        <ui-textarea [variant]="'success'" [label]="'Success'" [placeholder]="'success'" [rows]="4"></ui-textarea>
        <ui-textarea [variant]="'warning'" [label]="'Warning'" [placeholder]="'warning'" [rows]="4"></ui-textarea>
        <ui-textarea [variant]="'info'" [label]="'Info'" [placeholder]="'info'" [rows]="4"></ui-textarea>
        <ui-textarea [variant]="'rounded'" [label]="'Rounded'" [placeholder]="'rounded'" [rows]="4"></ui-textarea>
        <ui-textarea [variant]="'minimal'" [label]="'Minimal'" [placeholder]="'minimal'" [rows]="4"></ui-textarea>
        <ui-textarea [variant]="'soft'" [label]="'Soft'" [placeholder]="'soft'" [rows]="4"></ui-textarea>
        <ui-textarea [variant]="'glass'" [label]="'Glass'" [placeholder]="'glass'" [rows]="4"></ui-textarea>
      </div>
    `,
  }),
};

/**
 * TAMAÑOS: Variantes de tamaño (filas)
 */
export const Sizes: Story = {
  args: {
    ...baseArgs,
    label: 'Campo',
    placeholder: 'Ejemplo de texto',
    variant: 'default',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <ui-textarea [rows]="2" [label]="'Pequeño (2 filas)'" [placeholder]="'2 filas'" [variant]="variant"></ui-textarea>
        <ui-textarea [rows]="4" [label]="'Mediano (4 filas)'" [placeholder]="'4 filas'" [variant]="variant"></ui-textarea>
        <ui-textarea [rows]="8" [label]="'Grande (8 filas)'" [placeholder]="'8 filas'" [variant]="variant"></ui-textarea>
        <ui-textarea [rows]="12" [label]="'Extra grande (12 filas)'" [placeholder]="'12 filas'" [variant]="variant"></ui-textarea>
      </div>
    `,
  }),
};

/**
 * ESTADOS: Estados del textarea
 */
export const States: Story = {
  args: {
    ...baseArgs,
    label: 'Campo',
    placeholder: 'Ejemplo de texto',
    variant: 'default',
    rows: 4,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <ui-textarea [label]="'Normal'" [placeholder]="'Estado normal'" [variant]="variant" [rows]="4"></ui-textarea>
        <ui-textarea [label]="'Error'" [placeholder]="'Hay un error'" [hint]="'Este campo es obligatorio'" [error]="true" [variant]="'error'" [rows]="4"></ui-textarea>
        <ui-textarea [label]="'Éxito'" [placeholder]="'¡Correcto!'" [hint]="'Campo válido'" [variant]="'success'" [rows]="4"></ui-textarea>
        <ui-textarea [label]="'Advertencia'" [placeholder]="'Cuidado'" [hint]="'Revisa este campo'" [variant]="'warning'" [rows]="4"></ui-textarea>
        <ui-textarea [label]="'Deshabilitado'" [placeholder]="'No editable'" [disabled]="true" [variant]="variant" [rows]="4"></ui-textarea>
        <ui-textarea [label]="'Con valor inicial'" [placeholder]="'Texto pre-cargado'" [value]="'Este es un texto inicial que ya está en el campo. Puedes editarlo o borrarlo.'" [variant]="variant" [rows]="4"></ui-textarea>
      </div>
    `,
  }),
};

/**
 * HINTS: Textareas con textos de ayuda
 */
export const Hints: Story = {
  args: {
    ...baseArgs,
    label: 'Campo con ayuda',
    placeholder: 'Escribe aquí...',
    variant: 'default',
    rows: 4,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <ui-textarea [label]="'Comentario'" [placeholder]="'Escribe tu comentario'" [hint]="'Máximo 500 caracteres'" [variant]="variant" [rows]="4"></ui-textarea>
        <ui-textarea [label]="'Descripción'" [placeholder]="'Describe el problema'" [hint]="'Sé lo más específico posible'" [variant]="'success'" [rows]="6"></ui-textarea>
        <ui-textarea [label]="'Código'" [placeholder]="'Pega tu código aquí'" [hint]="'Formato: JavaScript, TypeScript, Python'" [variant]="'info'" [rows]="8"></ui-textarea>
        <ui-textarea [label]="'Reporte'" [placeholder]="'Detalla el incidente'" [hint]="'Incluye fecha, hora y ubicación'" [error]="true" [variant]="'error'" [rows]="6"></ui-textarea>
      </div>
    `,
  }),
};

/**
 * COMBINACIONES: Ejemplos reales
 */
export const Combinations: Story = {
  args: {
    ...baseArgs,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <ui-textarea [label]="'Resumen'" [placeholder]="'Resumen del proyecto'" [hint]="'Breve descripción'" [variant]="'default'" [rows]="3"></ui-textarea>
        <ui-textarea [label]="'Detalles'" [placeholder]="'Descripción detallada'" [hint]="'Máximo 1000 caracteres'" [variant]="'filled'" [rows]="6"></ui-textarea>
        <ui-textarea [label]="'Notas adicionales'" [placeholder]="'Información extra'" [hint]="'Opcional'" [variant]="'outlined'" [rows]="4"></ui-textarea>
      </div>
    `,
  }),
};
export default meta;
type Story = StoryObj<UiTextareaComponent>;

export const Default: Story = {
  args: {
    label: 'Description',
    placeholder: 'Enter your description',
  },
  render: (args) => ({
    props: args,
    template: `<ui-textarea [label]="label" [placeholder]="placeholder"></ui-textarea>`,
  }),
};

export const WithHint: Story = {
  args: {
    label: 'Message',
    placeholder: 'Type your message',
    hint: 'Maximum 500 characters',
  },
  render: (args) => ({
    props: args,
    template: `<ui-textarea [label]="label" [placeholder]="placeholder" [hint]="hint"></ui-textarea>`,
  }),
};

export const Error: Story = {
  args: {
    label: 'Feedback',
    placeholder: 'Enter feedback',
    error: true,
    hint: 'This field is required',
  },
  render: (args) => ({
    props: args,
    template: `<ui-textarea [label]="label" [placeholder]="placeholder" [error]="error" [hint]="hint"></ui-textarea>`,
  }),
};

export const GlassVariant: Story = {
  args: {
    label: 'Comment',
    placeholder: 'Add a comment',
    variant: 'glass',
  },
  render: (args) => ({
    props: args,
    template: `<ui-textarea [label]="label" [placeholder]="placeholder" [variant]="variant"></ui-textarea>`,
  }),
};

export const MinimalVariant: Story = {
  args: {
    label: 'Note',
    placeholder: 'Quick note',
    variant: 'minimal',
  },
  render: (args) => ({
    props: args,
    template: `<ui-textarea [label]="label" [placeholder]="placeholder" [variant]="variant"></ui-textarea>`,
  }),
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Field',
    placeholder: 'Cannot edit',
    disabled: true,
  },
  render: (args) => ({
    props: args,
    template: `<ui-textarea [label]="label" [placeholder]="placeholder" [disabled]="disabled"></ui-textarea>`,
  }),
};
