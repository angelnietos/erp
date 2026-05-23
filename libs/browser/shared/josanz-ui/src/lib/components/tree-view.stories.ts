import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, within } from '@storybook/test';
import { josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { TreeViewComponent } from './tree-view';

const meta: Meta<TreeViewComponent> = {
  component: TreeViewComponent,
  title: 'Josanz UI / Tree View',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Árbol jerárquico para carpetas, permisos, categorías o estructura de documentos.',
        ),
      },
    },
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<TreeViewComponent>;

const nodes = [
  {
    id: 'workshop',
    label: 'Taller',
    children: [
      { id: 'brakes', label: 'Frenos', description: '3 órdenes' },
      { id: 'oil', label: 'Aceite', description: '1 orden' },
    ],
  },
  {
    id: 'warehouse',
    label: 'Almacén',
    children: [{ id: 'parts', label: 'Recambios', description: 'Stock bajo' }],
  },
];

export const Playground: Story = {
  args: {
    title: 'Estructura',
    nodes,
    expandedIds: ['workshop'],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const expandButtons = canvas.getAllByRole('button', { name: '+' });
    await userEvent.click(expandButtons[expandButtons.length - 1]);
    await expect(canvas.getByText(/Recambios/i)).toBeVisible();
  },
};
