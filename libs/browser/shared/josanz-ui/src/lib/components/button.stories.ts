import type { Meta, StoryObj } from '@storybook/angular';
import { sbRadio, sbEmit, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { ButtonComponent } from './button';

const meta: Meta<ButtonComponent> = {
  component: ButtonComponent,
  title: 'Josanz UI / Button',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Botón principal del sistema Josanz: variantes de color, tamaños, formas y color personalizado opcional. `shape` (`rounded` | `pill` | `square`) y `customColor` comparten la convención `JosanzControlShape` con input, tabs, paginación, modal y avatar. El texto sobre `primary`/`danger` se calcula con `josanzReadableOnSolid` para mantener contraste con el color de marca. Emite `btnClick` al pulsar (no emite si `disabled`).',
        ),
      },
    },
    layout: 'centered',
  },
  argTypes: {
    label: { control: 'text', description: 'Texto del botón' },
    variant: sbRadio(['primary', 'secondary', 'outline', 'ghost', 'danger'] as const, 'Variante de estilo'),
    size: sbRadio(['sm', 'md', 'lg', 'xl'] as const, 'Tamaño del botón'),
    shape: sbRadio(['rounded', 'pill', 'square'] as const, 'Forma del botón'),
    customColor: { control: 'color', description: 'Color personalizado (Hex/RGBA)' },
    disabled: { control: 'boolean', description: 'Estado deshabilitado' },
    showIcon: { control: 'boolean', description: 'Mostrar icono (+) después del texto' },
    fullWidth: { control: 'boolean', description: 'Ancho completo' },
    btnClick: sbEmit('btnClick', 'Click en el botón'),
  },
};

export default meta;
type Story = StoryObj<ButtonComponent>;

export const Playground: Story = {
  args: {
    label: 'Acción Principal',
    variant: 'primary',
    size: 'md',
    shape: 'rounded',
    disabled: false,
    showIcon: true,
    fullWidth: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="p-6 min-w-[280px]">
        <josanz-button
          [label]="label"
          [variant]="variant"
          [size]="size"
          [shape]="shape"
          [disabled]="disabled"
          [showIcon]="showIcon"
          [fullWidth]="fullWidth"
          [customColor]="customColor"
          (btnClick)="btnClick($event)"
        ></josanz-button>
      </div>
    `,
  }),
};

export const CustomColors: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Ejemplos de forma, colores personalizados y todas las variantes en una sola vista.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="flex flex-col gap-8 p-4 max-w-4xl">
        <section>
          <h4 class="text-slate-400 text-xs uppercase tracking-widest mb-4 font-bold">Formas</h4>
          <div class="flex items-center gap-4 flex-wrap">
            <josanz-button label="Rounded" shape="rounded"></josanz-button>
            <josanz-button label="Pill Shape" shape="pill"></josanz-button>
            <josanz-button label="Square" shape="square"></josanz-button>
          </div>
        </section>

        <section>
          <h4 class="text-slate-400 text-xs uppercase tracking-widest mb-4 font-bold">Colores personalizados</h4>
          <div class="flex items-center gap-4 flex-wrap">
            <josanz-button label="Emerald" variant="primary" customColor="#10b981"></josanz-button>
            <josanz-button label="Rose" variant="primary" customColor="#f43f5e"></josanz-button>
            <josanz-button label="Amber Outline" variant="outline" customColor="#f59e0b"></josanz-button>
            <josanz-button label="Violet Ghost" variant="ghost" customColor="#8b5cf6"></josanz-button>
          </div>
        </section>

        <section>
          <h4 class="text-slate-400 text-xs uppercase tracking-widest mb-4 font-bold">Variantes</h4>
          <div class="flex items-center gap-4 flex-wrap">
            <josanz-button label="Primary" variant="primary"></josanz-button>
            <josanz-button label="Secondary" variant="secondary"></josanz-button>
            <josanz-button label="Outline" variant="outline"></josanz-button>
            <josanz-button label="Ghost" variant="ghost"></josanz-button>
            <josanz-button label="Danger" variant="danger"></josanz-button>
          </div>
        </section>

        <section>
          <h4 class="text-slate-400 text-xs uppercase tracking-widest mb-4 font-bold">Deshabilitado</h4>
          <josanz-button label="No disponible" variant="primary" [disabled]="true"></josanz-button>
        </section>
      </div>
    `,
  }),
};

export const UseCases: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Casos reales de producto: CTA principal de listado, formulario de detalle, acción destructiva y barra mobile.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="grid max-w-5xl gap-6 p-4 md:grid-cols-2">
        <section class="rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
          <p class="m-0 mb-4 text-[10px] font-black uppercase tracking-[0.18em]" style="color: var(--josanz-text-muted);">Listado de clientes</p>
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 class="m-0 text-xl font-black" style="color: var(--josanz-text);">Clientes</h3>
              <p class="m-0 text-sm" style="color: var(--josanz-text-muted);">128 registros</p>
            </div>
            <josanz-button label="Nuevo cliente" variant="primary" size="md" [showIcon]="true"></josanz-button>
          </div>
        </section>

        <section class="rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
          <p class="m-0 mb-4 text-[10px] font-black uppercase tracking-[0.18em]" style="color: var(--josanz-text-muted);">Detalle / formulario</p>
          <div class="flex flex-wrap gap-3">
            <josanz-button label="Cancelar" variant="secondary" size="md" [showIcon]="false"></josanz-button>
            <josanz-button label="Guardar cambios" variant="primary" size="md" [showIcon]="false"></josanz-button>
          </div>
        </section>

        <section class="rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
          <p class="m-0 mb-4 text-[10px] font-black uppercase tracking-[0.18em]" style="color: var(--josanz-text-muted);">Zona peligrosa</p>
          <div class="flex flex-wrap gap-3">
            <josanz-button label="Archivar" variant="outline" size="sm" [showIcon]="false"></josanz-button>
            <josanz-button label="Eliminar cliente" variant="danger" size="sm" [showIcon]="false"></josanz-button>
          </div>
        </section>

        <section class="rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
          <p class="m-0 mb-4 text-[10px] font-black uppercase tracking-[0.18em]" style="color: var(--josanz-text-muted);">Mobile CTA</p>
          <div class="max-w-xs">
            <josanz-button label="Crear informe" variant="primary" size="lg" shape="pill" [fullWidth]="true" [showIcon]="true"></josanz-button>
          </div>
        </section>
      </div>
    `,
  }),
};
