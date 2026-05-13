import type { Meta, StoryObj } from '@storybook/angular';
import { sbRadio } from '../../../.storybook/story-arg-types';
import { SecondaryButtonComponent } from './secondary-button';

const meta: Meta<SecondaryButtonComponent> = {
  component: SecondaryButtonComponent,
  title: 'Josanz UI / Secondary Button',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', description: 'Texto del botón' },
    type: sbRadio(['excel', 'pdf', 'cancel'] as const, 'Tipo de botón secundario'),
  },
};

export default meta;
type Story = StoryObj<SecondaryButtonComponent>;

export const Playground: Story = {
  args: {
    label: 'Exportar Excel',
    type: 'excel',
  },
};

export const AllTypes: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="flex flex-col gap-6 p-4">
        <section>
          <h4 class="text-slate-400 text-xs uppercase tracking-widest mb-4">Export Options</h4>
          <div class="flex items-center gap-4 flex-wrap">
            <josanz-secondary-button label="Descargar Excel" type="excel"></josanz-secondary-button>
            <josanz-secondary-button label="Generar PDF" type="pdf"></josanz-secondary-button>
          </div>
        </section>

        <section>
          <h4 class="text-slate-400 text-xs uppercase tracking-widest mb-4">Actions</h4>
          <div class="flex items-center gap-4 flex-wrap">
            <josanz-secondary-button label="Cancelar Operación" type="cancel"></josanz-secondary-button>
          </div>
        </section>
      </div>
    `,
  }),
};
