import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { sbEmit, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { CommandPaletteComponent } from './command-palette';

const meta: Meta<CommandPaletteComponent> = {
  component: CommandPaletteComponent,
  title: 'Josanz UI / Command Palette',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription('Paleta de comandos con búsqueda, grupos y atajos de teclado.'),
      },
    },
    layout: 'fullscreen',
  },
  argTypes: {
    open: { control: 'boolean', description: 'Estado visible de la paleta' },
    query: { control: 'text', description: 'Texto de búsqueda controlado' },
    placeholder: { control: 'text', description: 'Placeholder del input de comandos' },
    commands: { control: 'object', description: 'Lista de comandos agrupados y atajos' },
    ariaLabel: { control: 'text', description: 'Etiqueta accesible del diálogo' },
    closeOnBackdrop: { control: 'boolean', description: 'Cierra al pulsar backdrop' },
    closeOnEscape: { control: 'boolean', description: 'Cierra con tecla Escape' },
    openChange: sbEmit('openChange', 'Cambio de apertura'),
    queryChange: sbEmit('queryChange', 'Cambio de búsqueda'),
    commandSelect: sbEmit('commandSelect', 'Comando seleccionado'),
  },
};

export default meta;
type Story = StoryObj<CommandPaletteComponent>;

const commands = [
  { id: 'new-order', label: 'Nueva orden', description: 'Crear parte de taller', group: 'Acciones', shortcut: 'N' },
  { id: 'clients', label: 'Ir a clientes', description: 'Listado de clientes', group: 'Navegación' },
  { id: 'invoice', label: 'Generar factura', description: 'Desde orden cerrada', group: 'Finanzas', shortcut: 'F' },
];

export const Playground: Story = {
  args: {
    open: true,
    placeholder: 'Buscar comando...',
    commands,
    commandSelect: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByPlaceholderText(/Buscar comando/i), 'client');
    await userEvent.click(canvas.getByText(/Ir a clientes/i));
    await expect(args['commandSelect']).toHaveBeenCalled();
  },
};
