import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { josanzStoryThemeDescription, sbEmit } from '../../../.storybook/story-arg-types';
import type { JosanzContextMenuItem } from './context-menu';
import { DropdownMenuComponent } from './dropdown-menu';

const meta: Meta<DropdownMenuComponent> = {
  component: DropdownMenuComponent,
  title: 'Josanz UI / Overlay / Dropdown Menu',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Menú desplegable de acciones con atajos, divisores, acciones destructivas y cierre automático por selección o click exterior. Emite `itemSelect` y `openChange`.',
        ),
      },
    },
    layout: 'centered',
  },
  argTypes: {
    label: { control: 'text', description: 'Texto del trigger' },
    items: { control: 'object', description: 'Items del menú' },
    open: { control: 'boolean', description: 'Estado abierto controlado' },
    closeOnOutsideClick: { control: 'boolean', description: 'Cierra al hacer click fuera del host' },
    itemSelect: sbEmit('itemSelect', 'Selección de item'),
    openChange: sbEmit('openChange', 'Cambio de estado abierto/cerrado'),
  },
};

export default meta;
type Story = StoryObj<DropdownMenuComponent>;

const items: JosanzContextMenuItem[] = [
  { id: 'open', label: 'Abrir detalle', shortcut: 'Enter' },
  { id: 'assign', label: 'Asignar técnico', shortcut: 'A' },
  { id: 'duplicate', label: 'Duplicar orden', shortcut: 'D' },
  { id: 'archive', label: 'Archivar', dividerBefore: true },
  { id: 'delete', label: 'Eliminar', tone: 'danger' },
];

export const Playground: Story = {
  args: {
    label: 'Acciones',
    items,
    open: true,
    closeOnOutsideClick: true,
    itemSelect: fn(),
    openChange: fn(),
  },
};

export const VariantStates: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Estados del menú: abierto, cerrado, items deshabilitados, divisores y acción destructiva.',
      },
    },
  },
  render: () => ({
    props: {
      items,
      disabledItems: [
        { id: 'view', label: 'Ver factura', shortcut: 'V' },
        { id: 'send', label: 'Enviar por email', shortcut: 'E', disabled: true },
        { id: 'void', label: 'Anular factura', dividerBefore: true, tone: 'danger' as const },
      ] satisfies JosanzContextMenuItem[],
      itemSelect: fn(),
      openChange: fn(),
    },
    template: `
      <div class="grid min-h-[340px] w-[min(760px,calc(100vw-2rem))] grid-cols-2 place-items-start gap-8 p-10">
        <josanz-dropdown-menu
          label="Abierto"
          [items]="items"
          [open]="true"
          (itemSelect)="itemSelect($event)"
          (openChange)="openChange($event)"
        ></josanz-dropdown-menu>

        <josanz-dropdown-menu
          label="Con disabled"
          [items]="disabledItems"
          [open]="true"
          (itemSelect)="itemSelect($event)"
          (openChange)="openChange($event)"
        ></josanz-dropdown-menu>

        <josanz-dropdown-menu
          label="Cerrado"
          [items]="items"
          [open]="false"
          (itemSelect)="itemSelect($event)"
          (openChange)="openChange($event)"
        ></josanz-dropdown-menu>
      </div>
    `,
  }),
};

export const UseCases: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Casos reales: acciones de orden, documento y cliente desde tarjetas o cabeceras.',
      },
    },
  },
  render: () => ({
    props: {
      orderItems: items,
      documentItems: [
        { id: 'preview', label: 'Previsualizar', shortcut: 'P' },
        { id: 'download', label: 'Descargar PDF', shortcut: 'D' },
        { id: 'send', label: 'Enviar al cliente', shortcut: 'E' },
        { id: 'remove', label: 'Eliminar documento', dividerBefore: true, tone: 'danger' as const },
      ] satisfies JosanzContextMenuItem[],
      clientItems: [
        { id: 'call', label: 'Llamar', shortcut: 'C' },
        { id: 'email', label: 'Enviar email', shortcut: 'M' },
        { id: 'merge', label: 'Fusionar duplicado', dividerBefore: true },
      ] satisfies JosanzContextMenuItem[],
      itemSelect: fn(),
      openChange: fn(),
    },
    template: `
      <div class="flex flex-wrap gap-6 rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-dropdown-menu
          label="Orden"
          [items]="orderItems"
          [open]="true"
          (itemSelect)="itemSelect($event)"
          (openChange)="openChange($event)"
        ></josanz-dropdown-menu>

        <josanz-dropdown-menu
          label="Documento"
          [items]="documentItems"
          [open]="true"
          (itemSelect)="itemSelect($event)"
          (openChange)="openChange($event)"
        ></josanz-dropdown-menu>

        <josanz-dropdown-menu
          label="Cliente"
          [items]="clientItems"
          [open]="false"
          (itemSelect)="itemSelect($event)"
          (openChange)="openChange($event)"
        ></josanz-dropdown-menu>
      </div>
    `,
  }),
};

export const InteractiveSelect: Story = {
  args: {
    label: 'Opciones',
    items,
    open: false,
    closeOnOutsideClick: true,
    itemSelect: fn(),
    openChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: /opciones/i }));
    await expect(args.openChange).toHaveBeenCalledWith(true);

    await userEvent.click(canvas.getByRole('menuitem', { name: /asignar técnico/i }));
    await expect(args.itemSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'assign' }));
    await expect(args.openChange).toHaveBeenLastCalledWith(false);
  },
};
