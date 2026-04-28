

const meta: Meta<UiButtonComponent> = {
  component: UiButtonComponent,
  title: 'UI Kit / Botón',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', description: 'Texto del botón' },
    type: sbRadio(['button', 'submit'], 'Tipo HTML'),
    color: sbSelect(
      ['primary', 'secondary', 'danger', 'success', 'warning', 'info', 'app', 'default'] as const,
      'Color',
    ),
    shape: sbSelect(
      ['auto', 'solid', 'glass', 'outline', 'flat', 'ghost', 'neumorphic', 'gradient', 'soft', 'link'] as const,
      'Forma',
    ),
    size: sbRadio(['sm', 'md', 'lg'] as const, 'Tamaño'),
    loading: { control: 'boolean', description: 'Estado de carga' },
    disabled: { control: 'boolean', description: 'Deshabilitado' },
    icon: { control: 'text', description: 'Nombre del icono (lucide)' },
    iconPosition: sbRadio(['left', 'right'], 'Posición icono'),
    fullWidth: { control: 'boolean', description: 'Ancho completo' },
    block: { control: 'boolean', description: 'Bloque (ocupa todo el espacio disponible)' },
    rounded: sbRadio(['none', 'sm', 'md', 'lg', 'full', 'pill'], 'Radio de borde'),
    elevation: { control: 'boolean', description: 'Sombra elevada' },
    pulse: { control: 'boolean', description: 'Animación de pulso' },
    href: { control: 'text', description: 'URL para comportamiento de enlace' },
    target: { control: 'text', description: 'Target del enlace (_blank, _self, etc.)' },
    ariaLabel: { control: 'text', description: 'Etiqueta ARIA para accesibilidad' },
  },
};
export default meta;
type Story = StoryObj<UiButtonComponent>;

const baseArgs = {
  label: 'Botón',
  type: 'button' as const,
  disabled: false,
  loading: false,
  icon: '',
  iconPosition: 'left' as const,
  color: 'primary' as const,
  shape: 'solid' as const,
  size: 'md' as const,
  fullWidth: false,
  block: false,
  rounded: 'md' as const,
  elevation: false,
  pulse: false,
  href: '',
  target: '',
  ariaLabel: '',
};

/**
 * PLAYGROUND: Botón interactivo con todos los controles
 */
export const Playground: Story = {
  args: {
    ...baseArgs,
    label: 'Botón Interactivo',
    color: 'primary',
    shape: 'solid',
    size: 'md',
    icon: 'arrow-right',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="padding: 2rem; display: flex; gap: 1rem; align-items: center; justify-content: center; min-height: 200px;">
        <ui-button
          [type]="type"
          [disabled]="disabled"
          [loading]="loading"
          [icon]="icon"
          [iconPosition]="iconPosition"
          [color]="color"
          [shape]="shape"
          [size]="size"
          [fullWidth]="fullWidth"
          [block]="block"
          [rounded]="rounded"
          [elevation]="elevation"
          [pulse]="pulse"
          [href]="href || null"
          [target]="target || null"
          [attr.aria-label]="ariaLabel || null"
        >{{ label }}</ui-button>
      </div>
    `,
  }),
};

/**
 * COLORES: Todas las variantes de color
 */
export const Colors: Story = {
  args: {
    ...baseArgs,
    label: 'Botón',
    shape: 'solid',
    size: 'md',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; padding: 1.5rem; align-items: center;">
        <ui-button [color]="'primary'" [shape]="shape" [size]="size">Primary</ui-button>
        <ui-button [color]="'secondary'" [shape]="shape" [size]="size">Secondary</ui-button>
        <ui-button [color]="'danger'" [shape]="shape" [size]="size">Danger</ui-button>
        <ui-button [color]="'success'" [shape]="shape" [size]="size">Success</ui-button>
        <ui-button [color]="'warning'" [shape]="shape" [size]="size">Warning</ui-button>
        <ui-button [color]="'info'" [shape]="shape" [size]="size">Info</ui-button>
        <ui-button [color]="'app'" [shape]="shape" [size]="size">App</ui-button>
        <ui-button [color]="'default'" [shape]="shape" [size]="size">Default</ui-button>
      </div>
    `,
  }),
};

/**
 * FORMAS: Todas las variantes de forma
 */
export const Shapes: Story = {
  args: {
    ...baseArgs,
    label: 'Botón',
    color: 'primary',
    size: 'md',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; padding: 1.5rem; align-items: center;">
        <ui-button [color]="color" [shape]="'auto'" [size]="size">Auto</ui-button>
        <ui-button [color]="color" [shape]="'solid'" [size]="size">Solid</ui-button>
        <ui-button [color]="color" [shape]="'glass'" [size]="size">Glass</ui-button>
        <ui-button [color]="color" [shape]="'outline'" [size]="size">Outline</ui-button>
        <ui-button [color]="color" [shape]="'flat'" [size]="size">Flat</ui-button>
        <ui-button [color]="color" [shape]="'ghost'" [size]="size">Ghost</ui-button>
        <ui-button [color]="color" [shape]="'neumorphic'" [size]="size">Neumorphic</ui-button>
        <ui-button [color]="color" [shape]="'gradient'" [size]="size">Gradient</ui-button>
        <ui-button [color]="color" [shape]="'soft'" [size]="size">Soft</ui-button>
        <ui-button [color]="color" [shape]="'link'" [size]="size">Link</ui-button>
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
    label: 'Botón',
    color: 'primary',
    shape: 'solid',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; padding: 1.5rem; align-items: center;">
        <ui-button [color]="color" [shape]="shape" size="sm">Pequeño</ui-button>
        <ui-button [color]="color" [shape]="shape" size="md">Mediano</ui-button>
        <ui-button [color]="color" [shape]="shape" size="lg">Grande</ui-button>
      </div>
    `,
  }),
};

/**
 * ICONOS: Variantes con iconos
 */
export const WithIcons: Story = {
  args: {
    ...baseArgs,
    label: 'Guardar',
    color: 'primary',
    shape: 'solid',
    size: 'md',
    icon: 'save',
    iconPosition: 'left',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; padding: 1.5rem; align-items: center;">
        <ui-button [icon]="'save'" [iconPosition]="'left'" [color]="color" [shape]="shape" [size]="size">Guardar</ui-button>
        <ui-button [icon]="'arrow-right'" [iconPosition]="'right'" [color]="color" [shape]="shape" [size]="size">Siguiente</ui-button>
        <ui-button [icon]="'trash-2'" [iconPosition]="'left'" [color]="'danger'" [shape]="shape" [size]="size">Eliminar</ui-button>
        <ui-button [icon]="'download'" [iconPosition]="'left'" [color]="'success'" [shape]="shape" [size]="size">Descargar</ui-button>
        <ui-button [icon]="'share-2'" [iconPosition]="'left'" [color]="'info'" [shape]="shape" [size]="size">Compartir</ui-button>
        <ui-button [icon]="'heart'" [iconPosition]="'left'" [color]="'app'" [shape]="'gradient'" [size]="size">Favorito</ui-button>
      </div>
    `,
  }),
};

/**
 * ICONO SOLO: Botones solo con icono (sin texto)
 */
export const IconOnly: Story = {
  args: {
    ...baseArgs,
    label: '',
    color: 'primary',
    shape: 'solid',
    size: 'md',
    icon: 'search',
    ariaLabel: 'Buscar',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; padding: 1.5rem; align-items: center;">
        <ui-button [icon]="'search'" [size]="'sm'" [ariaLabel]="'Buscar'" [color]="color"> </ui-button>
        <ui-button [icon]="'search'" [size]="'md'" [ariaLabel]="'Buscar'" [color]="color"> </ui-button>
        <ui-button [icon]="'search'" [size]="'lg'" [ariaLabel]="'Buscar'" [color]="color"> </ui-button>
        <ui-button [icon]="'settings'" [size]="'md'" [ariaLabel]="'Configuración'" [color]="'secondary'"> </ui-button>
        <ui-button [icon]="'bell'" [size]="'md'" [ariaLabel]="'Notificaciones'" [color]="'warning'"> </ui-button>
        <ui-button [icon]="'user'" [size]="'md'" [ariaLabel]="'Perfil'" [color]="'info'"> </ui-button>
        <ui-button [icon]="'trash-2'" [size]="'md'" [ariaLabel]="'Eliminar'" [color]="'danger'"> </ui-button>
        <ui-button [icon]="'check'" [size]="'md'" [ariaLabel]="'Confirmar'" [color]="'success'"> </ui-button>
      </div>
    `,
  }),
};

/**
 * ESTADOS: Estados del botón
 */
export const States: Story = {
  args: {
    ...baseArgs,
    label: 'Botón',
    color: 'primary',
    shape: 'solid',
    size: 'md',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; padding: 1.5rem; align-items: center;">
        <ui-button [color]="color" [shape]="shape" [size]="size">Normal</ui-button>
        <ui-button [color]="color" [shape]="shape" [size]="size" [loading]="true">Cargando...</ui-button>
        <ui-button [color]="color" [shape]="shape" [size]="size" [disabled]="true">Deshabilitado</ui-button>
        <ui-button [color]="color" [shape]="shape" [size]="size" [loading]="true" [icon]="'refresh'" [disabled]="true">Cargando...</ui-button>
      </div>
    `,
  }),
};

/**
 * ANCHO: Variantes de ancho
 */
export const Widths: Story = {
  args: {
    ...baseArgs,
    label: 'Botón de Ancho Completo',
    color: 'primary',
    shape: 'solid',
    size: 'md',
    fullWidth: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; flex-direction: column; gap: 0.75rem; padding: 1.5rem; max-width: 400px;">
        <ui-button [color]="color" [shape]="shape" [size]="size" [fullWidth]="true">Ancho Completo</ui-button>
        <ui-button [color]="'secondary'" [shape]="'outline'" [size]="size" [fullWidth]="true">Outline Full Width</ui-button>
        <ui-button [color]="'danger'" [shape]="'flat'" [size]="size" [fullWidth]="true" [disabled]="true">Deshabilitado</ui-button>
      </div>
    `,
  }),
};

/**
 * ELEVACIÓN: Botones con sombra
 */
export const Elevation: Story = {
  args: {
    ...baseArgs,
    label: 'Botón Elevado',
    color: 'primary',
    shape: 'solid',
    size: 'md',
    elevation: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; padding: 1.5rem; align-items: center;">
        <ui-button [color]="'primary'" [shape]="'solid'" [elevation]="true">Primary</ui-button>
        <ui-button [color]="'secondary'" [shape]="'glass'" [elevation]="true">Glass</ui-button>
        <ui-button [color]="'danger'" [shape]="'gradient'" [elevation]="true">Gradient</ui-button>
        <ui-button [color]="'success'" [shape]="'neumorphic'" [elevation]="true">Neumorphic</ui-button>
      </div>
    `,
  }),
};

/**
 * PULSO: Botones con animación
 */
export const Pulse: Story = {
  args: {
    ...baseArgs,
    label: 'Botón con Pulso',
    color: 'primary',
    shape: 'solid',
    size: 'md',
    pulse: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; padding: 1.5rem; align-items: center;">
        <ui-button [color]="'primary'" [pulse]="true">Primary</ui-button>
        <ui-button [color]="'danger'" [pulse]="true">Danger</ui-button>
        <ui-button [color]="'success'" [pulse]="true">Success</ui-button>
        <ui-button [color]="'warning'" [pulse]="true">Warning</ui-button>
      </div>
    `,
  }),
};

/**
 * ENLACES: Botones como enlaces
 */
export const Links: Story = {
  args: {
    ...baseArgs,
    label: 'Ir a Google',
    color: 'primary',
    shape: 'outline',
    size: 'md',
    href: 'https://google.com',
    target: '_blank',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; padding: 1.5rem; align-items: center;">
        <ui-button [href]="'https://google.com'" [target]="'_blank'" [color]="'primary'" [shape]="'outline'">Google</ui-button>
        <ui-button [href]="'https://github.com'" [target]="'_blank'" [color]="'secondary'" [shape]="'ghost'">GitHub</ui-button>
        <ui-button [href]="'mailto:contact@example.com'" [color]="'info'" [shape]="'flat'">Email</ui-button>
      </div>
    `,
  }),
};

/**
 * ACCESIBILIDAD: Ejemplos ARIA
 */
export const Accessibility: Story = {
  args: {
    ...baseArgs,
    label: 'Acción Principal',
    color: 'primary',
    shape: 'solid',
    size: 'md',
    ariaLabel: 'Guardar cambios en el sistema',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; padding: 1.5rem; align-items: center;">
        <ui-button [icon]="'save'" [ariaLabel]="'Guardar cambios'">Guardar</ui-button>
        <ui-button [icon]="'trash-2'" [color]="'danger'" [ariaLabel]="'Eliminar registro permanentemente'">Eliminar</ui-button>
        <ui-button [icon]="'download'" [color]="'success'" [ariaLabel]="'Descargar archivo PDF'">Descargar</ui-button>
        <ui-button [icon]="'search'" [size]="'sm'" [ariaLabel]="'Buscar en la base de datos'"> </ui-button>
      </div>
    `,
  }),
};

/**
 * COMBINACIONES: Ejemplos reales de uso
 */
export const Combinations: Story = {
  args: {
    ...baseArgs,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; padding: 1.5rem; align-items: center; background: var(--bg-secondary); border-radius: 12px;">
        <ui-button [color]="'primary'" [shape]="'solid'" [icon]="'save'">Guardar</ui-button>
        <ui-button [color]="'secondary'" [shape]="'outline'">Cancelar</ui-button>
        <ui-button [color]="'danger'" [shape]="'ghost'" [icon]="'trash-2'">Eliminar</ui-button>
      </div>
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; padding: 1.5rem; align-items: center; background: var(--bg-primary); border-radius: 12px; margin-top: 1rem;">
        <ui-button [color]="'app'" [shape]="'gradient'" [icon]="'sparkles'" [elevation]="true">Premium</ui-button>
        <ui-button [color]="'success'" [shape]="'flat'" [icon]="'check'">Confirmar</ui-button>
        <ui-button [color]="'warning'" [shape]="'outline'" [icon]="'alert-circle'">Advertencia</ui-button>
      </div>
    `,
  }),
};
