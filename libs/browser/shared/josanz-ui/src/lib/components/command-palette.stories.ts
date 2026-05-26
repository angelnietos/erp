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

export const OperationsShell: Story = {
  args: {
    open: true,
    placeholder: 'Buscar cliente, módulo o acción...',
    commands: [
      ...commands,
      { id: 'delivery', label: 'Abrir albaranes', description: 'Entregas pendientes', group: 'Navegación', shortcut: 'A' },
      { id: 'settings', label: 'Cambiar delegación', description: 'Preferencias de la sesión', group: 'Sistema' },
    ],
    commandSelect: fn(),
    queryChange: fn(),
    openChange: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <main class="min-h-[560px] p-8" style="background: var(--josanz-bg);">
        <section class="mx-auto max-w-4xl rounded-3xl border border-solid p-8" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
          <p class="m-0 text-[10px] font-black uppercase tracking-[0.18em]" style="color: var(--josanz-text-muted);">Centro de mando</p>
          <h1 class="m-0 mt-1 text-3xl font-black" style="color: var(--josanz-text);">Operaciones de taller</h1>
          <p class="m-0 mt-2 text-sm" style="color: var(--josanz-text-muted);">Pulsa una acción de la paleta para navegar o ejecutar tareas frecuentes.</p>
        </section>
        <josanz-command-palette
          [open]="open"
          [placeholder]="placeholder"
          [commands]="commands"
          (queryChange)="queryChange($event)"
          (openChange)="openChange($event)"
          (commandSelect)="commandSelect($event)"
        ></josanz-command-palette>
      </main>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByPlaceholderText(/Buscar cliente/i), 'delegación');
    await expect(args['queryChange']).toHaveBeenCalled();
    await userEvent.click(canvas.getByText(/Cambiar delegación/i));
    await expect(args['commandSelect']).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'settings' }),
    );
    await expect(args['openChange']).toHaveBeenCalledWith(false);
  },
};

export const DismissWithEscape: Story = {
  args: {
    open: true,
    commands,
    openChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('dialog')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect(args['openChange']).toHaveBeenCalledWith(false);
  },
};
