import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { sbEmit, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { SearchFieldComponent } from './search-field';

const meta: Meta<SearchFieldComponent> = {
  component: SearchFieldComponent,
  title: 'Josanz UI / Search Field',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription('Campo de búsqueda genérico con icono y limpiar. Diferente de list-search-field (listados).'),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    valueChange: sbEmit('valueChange', 'Cambio de texto'),
    search: sbEmit('search', 'Búsqueda'),
  },
};

export default meta;
type Story = StoryObj<SearchFieldComponent>;

export const Playground: Story = {
  args: {
    placeholder: 'Buscar órdenes, clientes...',
    value: '',
    clearable: true,
    valueChange: fn(),
    search: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('searchbox'), 'taller');
    await expect(args['search']).toHaveBeenCalled();
  },
};
