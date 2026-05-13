import type { Meta, StoryObj } from '@storybook/angular';
import { sbSelect, sbRadio } from '../../../.storybook/story-arg-types';
import { ButtonComponent } from './button';

const meta: Meta<ButtonComponent> = {
  component: ButtonComponent,
  title: 'Josanz UI / Button',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', description: 'Texto del botón' },
    variant: sbRadio(['primary', 'secondary', 'outline', 'ghost', 'danger'] as const, 'Variante de estilo'),
    size: sbRadio(['sm', 'md', 'lg', 'xl'] as const, 'Tamaño del botón'),
    shape: sbRadio(['rounded', 'pill', 'square'] as const, 'Forma del botón'),
    customColor: { control: 'color', description: 'Color personalizado (Hex/RGBA)' },
    disabled: { control: 'boolean', description: 'Estado deshabilitado' },
    showIcon: { control: 'boolean', description: 'Mostrar icono (+) después del texto' },
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
  },
};

export const CustomColors: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="flex flex-col gap-8 p-4">
        <section>
          <h4 class="text-slate-400 text-xs uppercase tracking-widest mb-4 font-bold">Themed Shapes</h4>
          <div class="flex items-center gap-4 flex-wrap">
            <josanz-button label="Rounded" shape="rounded"></josanz-button>
            <josanz-button label="Pill Shape" shape="pill"></josanz-button>
            <josanz-button label="Square" shape="square"></josanz-button>
          </div>
        </section>

        <section>
          <h4 class="text-slate-400 text-xs uppercase tracking-widest mb-4 font-bold">Custom Color Samples</h4>
          <div class="flex items-center gap-4 flex-wrap">
            <josanz-button label="Emerald" variant="primary" customColor="#10b981"></josanz-button>
            <josanz-button label="Rose" variant="primary" customColor="#f43f5e"></josanz-button>
            <josanz-button label="Amber Outline" variant="outline" customColor="#f59e0b"></josanz-button>
            <josanz-button label="Violet Ghost" variant="ghost" customColor="#8b5cf6"></josanz-button>
          </div>
        </section>

        <section>
          <h4 class="text-slate-400 text-xs uppercase tracking-widest mb-4 font-bold">Variants</h4>
          <div class="flex items-center gap-4 flex-wrap">
            <josanz-button label="Primary" variant="primary"></josanz-button>
            <josanz-button label="Secondary" variant="secondary"></josanz-button>
            <josanz-button label="Outline" variant="outline"></josanz-button>
            <josanz-button label="Ghost" variant="ghost"></josanz-button>
            <josanz-button label="Danger" variant="danger"></josanz-button>
          </div>
        </section>
      </div>
    `,
  }),
};
