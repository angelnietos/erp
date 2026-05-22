import type { Meta, StoryObj } from '@storybook/angular';
import { sbEmit, sbSelect, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { ListViewSelectorComponent } from './list-view-selector';

const viewOptions = [
  'tabla',
  'tabla-compacta',
  'tarjetas-lista',
  'tarjetas-2',
  'tarjetas-3',
  'tarjetas-4',
] as const;

const meta: Meta<ListViewSelectorComponent> = {
  component: ListViewSelectorComponent,
  title: 'Josanz UI / List View Selector',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Selector desplegable de densidad/vista de listado. Agrupa opciones de tabla y tarjetas, cierra con click exterior o Escape y emite `selectionChange`.',
        ),
      },
    },
  },
  argTypes: {
    label: { control: 'text', description: 'Texto previo al resumen de vista' },
    selected: sbSelect(viewOptions, 'Vista activa'),
    selectionChange: sbEmit('selectionChange', 'Vista seleccionada'),
  },
};

export default meta;
type Story = StoryObj<ListViewSelectorComponent>;

export const Playground: Story = {
  args: {
    label: 'Eleccion de vista',
    selected: 'tarjetas-lista',
  },
};

export const InToolbar: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => ({
    template: `
      <div class="flex max-w-4xl flex-wrap items-center justify-between gap-4 rounded-3xl border border-solid p-5" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <div>
          <h3 class="m-0 text-lg font-black" style="color: var(--josanz-text);">Clientes</h3>
          <p class="m-0 text-sm" style="color: var(--josanz-text-muted);">128 registros encontrados</p>
        </div>
        <div class="flex items-center gap-3">
          <josanz-list-view-selector label="Vista" selected="tabla"></josanz-list-view-selector>
          <josanz-list-view-selector label="Cards" selected="tarjetas-3"></josanz-list-view-selector>
        </div>
      </div>
    `,
  }),
};
