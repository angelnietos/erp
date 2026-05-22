import type { Meta, StoryObj } from '@storybook/angular';
import { sbRadio, sbEmit, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { SecondaryButtonComponent } from './secondary-button';

const meta: Meta<SecondaryButtonComponent> = {
  component: SecondaryButtonComponent,
  title: 'Josanz UI / Secondary Button',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Botón secundario: fondo `surface`, texto `atmosphere.text` (o `customColor`). `shape` sigue la convención de `josanz-button`. Emite `btnClick`.',
        ),
      },
    },
    layout: 'centered',
  },
  argTypes: {
    label: { control: 'text', description: 'Texto del botón' },
    type: sbRadio(['excel', 'pdf', 'cancel'] as const, 'Tipo de acción visual'),
    shape: sbRadio(['rounded', 'pill', 'square'] as const, 'Esquinas (como josanz-button)'),
    customColor: { control: 'color', description: 'Color de texto e icono' },
    btnClick: sbEmit('btnClick', 'Click en el botón'),
  },
};

export default meta;
type Story = StoryObj<SecondaryButtonComponent>;

export const Playground: Story = {
  args: {
    label: 'Exportar Excel',
    type: 'excel',
    shape: 'rounded',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="p-6">
        <josanz-secondary-button
          [label]="label"
          [type]="type"
          [shape]="shape"
          [customColor]="customColor"
          (btnClick)="btnClick($event)"
        ></josanz-secondary-button>
      </div>
    `,
  }),
};

export const AllTypes: Story = {
  parameters: {
    controls: { disable: true },
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
