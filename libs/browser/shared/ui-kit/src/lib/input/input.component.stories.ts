
  argTypes: {
    label: { control: 'text', description: 'Etiqueta del campo' },
    placeholder: { control: 'text', description: 'Texto de placeholder' },
    hint: { control: 'text', description: 'Texto de ayuda' },
    type: sbSelect(['text', 'password', 'email', 'number', 'tel', 'url', 'date', 'time', 'search'], 'Tipo'),
    color: sbSelect(['default', 'primary', 'danger', 'success', 'warning', 'info'] as const, 'Color'),
    shape: sbSelect(
      ['auto', 'solid', 'glass', 'outline', 'flat', 'neumorphic', 'underline', 'minimal', 'rounded'] as const,
      'Forma',
    ),
    size: sbRadio(['sm', 'md'], 'Tamaño'),
    icon: { control: 'text', description: 'Icono (lucide)' },
    disabled: { control: 'boolean', description: 'Deshabilitado' },
    error: { control: 'boolean', description: 'Estado de error' },
    id: { control: 'text', description: 'ID del input' },
  },
};
export default meta;
type Story = StoryObj<UiInputComponent>;

const baseArgs = {
  label: '',
  placeholder: 'Escribe aquí...',
  hint: '',
  type: 'text' as const,
  disabled: false,
  error: false,
  icon: '',
  color: 'default' as const,
  shape: 'auto' as const,
  size: 'md' as const,
  id: 'input-field',
};

/**
 * PLAYGROUND: Input interactivo
 */
export const Playground: Story = {
  args: {
    ...baseArgs,
    label: 'Nombre completo',
    placeholder: 'Juan Pérez',
    hint: 'Ingresa tu nombre completo',
    type: 'text',
    color: 'primary',
    shape: 'solid',
    size: 'md',
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-input
        [label]="label"
        [placeholder]="placeholder"
        [hint]="hint"
        [type]="type"
        [disabled]="disabled"
        [error]="error"
        [icon]="icon"
        [color]="color"
        [shape]="shape"
        [size]="size"
        [id]="id"
      ></ui-input>
    `,
  }),
};

/**
 * COLORES: Variantes de color
 */
export const Colors: Story = {
  args: {
    ...baseArgs,
    label: 'Campo',
    placeholder: 'Ejemplo',
    shape: 'solid',
    size: 'md',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <ui-input [color]="'default'" [shape]="shape" [label]="'Default'" [placeholder]="'default'" [size]="size"></ui-input>
        <ui-input [color]="'primary'" [shape]="shape" [label]="'Primary'" [placeholder]="'primary'" [size]="size"></ui-input>
        <ui-input [color]="'danger'" [shape]="shape" [label]="'Danger'" [placeholder]="'danger'" [size]="size"></ui-input>
        <ui-input [color]="'success'" [shape]="shape" [label]="'Success'" [placeholder]="'success'" [size]="size"></ui-input>
        <ui-input [color]="'warning'" [shape]="shape" [label]="'Warning'" [placeholder]="'warning'" [size]="size"></ui-input>
        <ui-input [color]="'info'" [shape]="shape" [label]="'Info'" [placeholder]="'info'" [size]="size"></ui-input>
      </div>
    `,
  }),
};

/**
 * FORMAS: Variantes de forma
 */
export const Shapes: Story = {
  args: {
    ...baseArgs,
    label: 'Campo',
    placeholder: 'Ejemplo',
    color: 'primary',
    size: 'md',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <ui-input [shape]="'auto'" [label]="'Auto'" [placeholder]="'auto'" [color]="color" [size]="size"></ui-input>
        <ui-input [shape]="'solid'" [label]="'Solid'" [placeholder]="'solid'" [color]="color" [size]="size"></ui-input>
        <ui-input [shape]="'glass'" [label]="'Glass'" [placeholder]="'glass'" [color]="color" [size]="size"></ui-input>
        <ui-input [shape]="'outline'" [label]="'Outline'" [placeholder]="'outline'" [color]="color" [size]="size"></ui-input>
        <ui-input [shape]="'flat'" [label]="'Flat'" [placeholder]="'flat'" [color]="color" [size]="size"></ui-input>
        <ui-input [shape]="'neumorphic'" [label]="'Neumorphic'" [placeholder]="'neumorphic'" [color]="color" [size]="size"></ui-input>
        <ui-input [shape]="'underline'" [label]="'Underline'" [placeholder]="'underline'" [color]="color" [size]="size"></ui-input>
        <ui-input [shape]="'minimal'" [label]="'Minimal'" [placeholder]="'minimal'" [color]="color" [size]="size"></ui-input>
        <ui-input [shape]="'rounded'" [label]="'Rounded'" [placeholder]="'rounded'" [color]="color" [size]="size"></ui-input>
      </div>
    `,
  }),
};

/**
 * TAMAÑOS: Variantes de tamaño
 */
export const Sizes: Story = {
  args: {
    ...baseArgs,
    label: 'Campo',
    placeholder: 'Ejemplo',
    color: 'primary',
    shape: 'solid',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <ui-input [size]="'sm'" [label]="'Pequeño'" [placeholder]="'sm'" [color]="color" [shape]="shape"></ui-input>
        <ui-input [size]="'md'" [label]="'Mediano'" [placeholder]="'md'" [color]="color" [shape]="shape"></ui-input>
      </div>
    `,
  }),
};

/**
 * ICONOS: Inputs con iconos
 */
export const WithIcons: Story = {
  args: {
    ...baseArgs,
    label: 'Campo con icono',
    placeholder: 'Ejemplo',
    color: 'primary',
    shape: 'solid',
    size: 'md',
    icon: 'search',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <ui-input [icon]="'search'" [label]="'Buscar'" [placeholder]="'Buscar...'" [color]="color" [shape]="shape" [size]="size"></ui-input>
        <ui-input [icon]="'mail'" [label]="'Email'" [placeholder]="'email@ejemplo.com'" [type]="'email'" [color]="'info'" [shape]="shape" [size]="size"></ui-input>
        <ui-input [icon]="'lock'" [label]="'Contraseña'" [placeholder]="'******'" [type]="'password'" [color]="'danger'" [shape]="shape" [size]="size"></ui-input>
        <ui-input [icon]="'user'" [label]="'Usuario'" [placeholder]="'nombre.usuario'" [color]="'success'" [shape]="shape" [size]="size"></ui-input>
        <ui-input [icon]="'phone'" [label]="'Teléfono'" [placeholder]="'+34 123 456 789'" [type]="'tel'" [color]="'warning'" [shape]="shape" [size]="size"></ui-input>
      </div>
    `,
  }),
};

/**
 * TIPOS: Diferentes tipos de input
 */
export const Types: Story = {
  args: {
    ...baseArgs,
    label: 'Campo',
    placeholder: 'Ejemplo',
    color: 'primary',
    shape: 'solid',
    size: 'md',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <ui-input [type]="'text'" [label]="'Texto'" [placeholder]="'Texto plano'" [color]="color" [shape]="shape" [size]="size"></ui-input>
        <ui-input [type]="'email'" [label]="'Email'" [placeholder]="'email@ejemplo.com'" [color]="'info'" [shape]="shape" [size]="size"></ui-input>
        <ui-input [type]="'password'" [label]="'Contraseña'" [placeholder]="'******'" [color]="'danger'" [shape]="shape" [size]="size"></ui-input>
        <ui-input [type]="'number'" [label]="'Número'" [placeholder]="'12345'" [color]="'success'" [shape]="shape" [size]="size"></ui-input>
        <ui-input [type]="'tel'" [label]="'Teléfono'" [placeholder]="'+34 123 456 789'" [color]="'warning'" [shape]="shape" [size]="size"></ui-input>
        <ui-input [type]="'url'" [label]="'URL'" [placeholder]="'https://ejemplo.com'" [color]="'primary'" [shape]="shape" [size]="size"></ui-input>
        <ui-input [type]="'date'" [label]="'Fecha'" [placeholder]="'dd/mm/aaaa'" [color]="'primary'" [shape]="shape" [size]="size"></ui-input>
        <ui-input [type]="'search'" [label]="'Búsqueda'" [placeholder]="'Buscar...'" [color]="'primary'" [shape]="shape" [size]="size"></ui-input>
      </div>
    `,
  }),
};

/**
 * ESTADOS: Estados del input
 */
export const States: Story = {
  args: {
    ...baseArgs,
    label: 'Campo',
    placeholder: 'Ejemplo',
    color: 'primary',
    shape: 'solid',
    size: 'md',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <ui-input [label]="'Normal'" [placeholder]="'Estado normal'" [color]="color" [shape]="shape" [size]="size"></ui-input>
        <ui-input [label]="'Error'" [placeholder]="'Hay un error'" [hint]="'Este campo es obligatorio'" [error]="true" [color]="'danger'" [shape]="shape" [size]="size"></ui-input>
        <ui-input [label]="'Éxito'" [placeholder]="'¡Correcto!'" [hint]="'Campo válido'" [color]="'success'" [shape]="shape" [size]="size"></ui-input>
        <ui-input [label]="'Advertencia'" [placeholder]="'Cuidado'" [hint]="'Revisa este campo'" [color]="'warning'" [shape]="shape" [size]="size"></ui-input>
        <ui-input [label]="'Deshabilitado'" [placeholder]="'No editable'" [disabled]="true" [color]="color" [shape]="shape" [size]="size"></ui-input>
        <ui-input [label]="'Error + Deshabilitado'" [placeholder]="'Error pero bloqueado'" [error]="true" [disabled]="true" [color]="'danger'" [shape]="shape" [size]="size"></ui-input>
      </div>
    `,
  }),
};

/**
 * HINTS: Inputs con textos de ayuda
 */
export const Hints: Story = {
  args: {
    ...baseArgs,
    label: 'Campo con ayuda',
    placeholder: 'Ejemplo',
    color: 'primary',
    shape: 'solid',
    size: 'md',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <ui-input [label]="'Usuario'" [placeholder]="'nombre.de.usuario'" [hint]="'Solo letras minúsculas y números'" [color]="color" [shape]="shape" [size]="size"></ui-input>
        <ui-input [label]="'Contraseña'" [type]="'password'" [placeholder]="'mínimo 8 caracteres'" [hint]="'Debe contener mayúscula, minúscula y número'" [color]="'primary'" [shape]="shape" [size]="size"></ui-input>
        <ui-input [label]="'Email'" [type]="'email'" [placeholder]="'email@dominio.com'" [hint]="'Formato de correo válido requerido'" [color]="'info'" [shape]="shape" [size]="size"></ui-input>
        <ui-input [label]="'Código'" [placeholder]="'ABC123'" [hint]="'Formato: 3 letras + 3 números'" [error]="true" [color]="'danger'" [shape]="shape" [size]="size"></ui-input>
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
        <div style="display: flex; gap: 1rem; align-items: flex-end;">
          <ui-input [label]="'Nombre'" [placeholder]="'Juan'" [icon]="'user'" [color]="'primary'" [shape]="'solid'" [size]="'md'" style="flex: 1;"></ui-input>
          <ui-input [label]="'Apellido'" [placeholder]="'Pérez'" [icon]="'user'" [color]="'primary'" [shape]="'solid'" [size]="'md'" style="flex: 1;"></ui-input>
        </div>
        <ui-input [label]="'Email'" [type]="'email'" [placeholder]="'juan.perez@ejemplo.com'" [icon]="'mail'" [color]="'info'" [shape]="'solid'" [size]="'md'"></ui-input>
        <ui-input [label]="'Contraseña'" [type]="'password'" [placeholder]="'mínimo 8 caracteres'" [icon]="'lock'" [color]="'primary'" [shape]="'solid'" [size]="'md'"></ui-input>
        <ui-input [label]="'Teléfono'" [type]="'tel'" [placeholder]="'+34 123 456 789'" [icon]="'phone'" [color]="'success'" [shape]="'solid'" [size]="'md'"></ui-input>
      </div>
    `,
  }),
};
export default meta;
type Story = StoryObj<UiInputComponent>;

export const Default: Story = {
  args: {
    id: 'email',
    label: 'E-mail',
    placeholder: 'Introduce tu e-mail',
    type: 'email',
    icon: 'user',
    error: false,
  },
};

export const Error: Story = {
  args: {
    ...Default.args,
    error: true,
  },
};

export const Password: Story = {
  args: {
    ...Default.args,
    label: 'Contraseña',
    type: 'password',
    icon: undefined,
  },
};
