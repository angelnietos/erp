import type { Meta, StoryObj } from '@storybook/angular';
import { sbRadio, sbEmit } from '../../../.storybook/story-arg-types';
import { SecondaryButtonComponent } from './secondary-button';

const meta: Meta<SecondaryButtonComponent> = {
  component: SecondaryButtonComponent,
  title: 'Josanz UI / Secondary Button',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Botón secundario para exportación (Excel/PDF) o cancelación. El icono y el estilo dependen de `type`. Emite `btnClick` al pulsar.',
      },
    },
    layout: 'centered',
  },
  argTypes: {
    label: { control: 'text', description: 'Texto del botón' },
    type: sbRadio(['excel', 'pdf', 'cancel'] as const, 'Tipo de acción visual'),
    btnClick: sbEmit('btnClick', 'Click en el botón'),
  },
};

export default meta;
type Story = StoryObj<SecondaryButtonComponent>;

export const Playground: Story = {
  args: {
    label: 'Exportar Excel',
    type: 'excel',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="p-6">
        <josanz-secondary-button
          [label]="label"
          [type]="type"
          (btnClick)="btnClick($event)"
        ></josanz-secondary-button>
      </div>
    `,
  }),
};

export const AllTypes: Story = {
  parameters: {
    docs: {
      description: { story: 'Los tres tipos lado a lado para comparar iconografía y estilo.' },
    },
  },
  render: () => ({
    template: `
      <div class="flex flex-col gap-6 p-4 max-w-2xl">
        <section>
          <h4 class="text-slate-400 text-xs uppercase tracking-widest mb-4">Exportación</h4>
          <div class="flex items-center gap-4 flex-wrap">
            <josanz-secondary-button label="Descargar Excel" type="excel"></josanz-secondary-button>
            <josanz-secondary-button label="Generar PDF" type="pdf"></josanz-secondary-button>
          </div>
        </section>

        <section>
          <h4 class="text-slate-400 text-xs uppercase tracking-widest mb-4">Acciones</h4>
          <div class="flex items-center gap-4 flex-wrap">
            <josanz-secondary-button label="Cancelar operación" type="cancel"></josanz-secondary-button>
          </div>
        </section>
      </div>
    `,
  }),
};
