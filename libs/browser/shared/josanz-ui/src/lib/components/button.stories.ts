import type { Meta, StoryObj } from '@storybook/angular';
import { sbSelect, sbRadio } from '../../../.storybook/story-arg-types';
import { ButtonComponent } from './button';

const meta: Meta<ButtonComponent> = {
  component: ButtonComponent,
  title: 'Josanz UI / Button',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', description: 'Texto del botón' },
    variant: sbRadio(['primary', 'secondary'] as const, 'Variante de estilo'),
    size: sbRadio(['sm', 'md', 'lg'] as const, 'Tamaño del botón'),
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
    disabled: false,
    showIcon: true,
  },
};

export const AllVariants: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="flex flex-col gap-6 p-4">
        <section>
          <h4 class="text-slate-400 text-xs uppercase tracking-widest mb-4">Primary Buttons</h4>
          <div class="flex items-center gap-4 flex-wrap">
            <josanz-button label="Primary LG" variant="primary" size="lg"></josanz-button>
            <josanz-button label="With Icon" variant="primary" size="md" [showIcon]="true"></josanz-button>
            <josanz-button label="Disabled" variant="primary" size="md" [disabled]="true"></josanz-button>
          </div>
        </section>

        <section>
          <h4 class="text-slate-400 text-xs uppercase tracking-widest mb-4">Secondary Buttons</h4>
          <div class="flex items-center gap-4 flex-wrap">
            <josanz-button label="Secondary MD" variant="secondary" size="md"></josanz-button>
            <josanz-button label="Secondary LG" variant="secondary" size="lg"></josanz-button>
            <josanz-button label="Disabled" variant="secondary" size="md" [disabled]="true"></josanz-button>
          </div>
        </section>

        <section>
          <h4 class="text-slate-400 text-xs uppercase tracking-widest mb-4">Sizes Comparison</h4>
          <div class="flex items-end gap-4 flex-wrap">
            <josanz-button label="Small" variant="primary" size="sm"></josanz-button>
            <josanz-button label="Medium" variant="primary" size="md"></josanz-button>
            <josanz-button label="Large" variant="primary" size="lg"></josanz-button>
          </div>
        </section>
      </div>
    `,
  }),
};
