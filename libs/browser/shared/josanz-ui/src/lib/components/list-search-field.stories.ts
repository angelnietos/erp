import type { Meta, StoryObj } from '@storybook/angular';
import { sbEmit, sbRadio, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { ListSearchFieldComponent } from './list-search-field';

const meta: Meta<ListSearchFieldComponent> = {
  component: ListSearchFieldComponent,
  title: 'Josanz UI / List Search Field',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Campo de busqueda para listados. Usa `role=search`, emite `valueChange` y hereda el shape del tema salvo que se fuerce con `shape`.',
        ),
      },
    },
  },
  argTypes: {
    placeholder: { control: 'text', description: 'Texto placeholder' },
    value: { control: 'text', description: 'Valor controlado del input' },
    ariaLabel: { control: 'text', description: 'Etiqueta accesible del searchbox' },
    shape: sbRadio(['rounded', 'pill', 'square'] as const, 'Override de esquinas'),
    valueChange: sbEmit('valueChange', 'Nuevo texto escrito'),
  },
};

export default meta;
type Story = StoryObj<ListSearchFieldComponent>;

export const Playground: Story = {
  args: {
    placeholder: 'Buscar clientes, CIF o email...',
    value: '',
    ariaLabel: 'Buscar clientes',
    shape: 'rounded',
  },
};

export const SearchStates: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Estados habituales: vacio, con busqueda activa y variaciones de shape.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="grid max-w-4xl gap-5 rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-list-search-field placeholder="Buscar..." ariaLabel="Busqueda vacia"></josanz-list-search-field>
        <josanz-list-search-field value="Novabyte" placeholder="Buscar cliente" ariaLabel="Busqueda con valor"></josanz-list-search-field>
        <josanz-list-search-field shape="pill" placeholder="Busqueda pill"></josanz-list-search-field>
        <josanz-list-search-field shape="square" placeholder="Busqueda square"></josanz-list-search-field>
      </div>
    `,
  }),
};
