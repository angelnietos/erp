import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { sbEmit, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { ContextMenuComponent } from './context-menu';

const meta: Meta<ContextMenuComponent> = {
  component: ContextMenuComponent,
  title: 'Josanz UI / Context Menu',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription('Menú contextual con atajos, divisores y acciones destructivas.'),
      },
    },
    layout: 'centered',
  },
  argTypes: {
    buttonText: { control: 'text', description: 'Texto visible del trigger' },
    buttonLabel: { control: 'text', description: 'Etiqueta accesible del trigger' },
    items: { control: 'object', description: 'Elementos del menú, atajos, divisores y tono danger' },
    open: { control: 'boolean', description: 'Estado abierto controlado' },
    closeOnOutsideClick: { control: 'boolean', description: 'Cierra al hacer click fuera del host' },
    openChange: sbEmit('openChange', 'Cambio de apertura'),
    itemSelect: sbEmit('itemSelect', 'Selección de ítem'),
  },
};

export default meta;
type Story = StoryObj<ContextMenuComponent>;

const items = [
  { id: 'open', label: 'Abrir detalle', shortcut: '↵' },
  { id: 'assign', label: 'Asignar técnico', shortcut: 'A' },
  { id: 'archive', label: 'Archivar', dividerBefore: true },
  { id: 'delete', label: 'Eliminar', tone: 'danger' as const },
];

export const Playground: Story = {
  args: {
    buttonText: 'Acciones',
    items,
    open: true,
    itemSelect: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('menuitem', { name: /Asignar/i }));
    await expect(args['itemSelect']).toHaveBeenCalled();
  },
};
