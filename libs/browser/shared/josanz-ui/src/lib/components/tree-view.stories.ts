import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { sbEmit } from '../../../.storybook/story-arg-types';
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
  argTypes: {
    checkedIdsChange: sbEmit('checkedIdsChange', 'Cambio de selección'),
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

export const CheckableTree: Story = {
  args: {
    title: 'Permisos por módulo',
    nodes,
    expandedIds: ['workshop', 'warehouse'],
    checkable: true,
    checkedIds: ['brakes'],
    checkedIdsChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const boxes = canvas.getAllByRole('checkbox');
    await userEvent.click(boxes[0]);
    await expect(args['checkedIdsChange']).toHaveBeenCalled();
  },
};

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
