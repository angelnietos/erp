import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { moduleMetadata } from '@storybook/angular';
import { josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { DropdownMenuComponent } from './dropdown-menu';
import { PopoverComponent } from './popover';
import { TooltipComponent } from './tooltip';

const meta: Meta = {
  title: 'Josanz UI / Overlay / Menus & Popovers',
  decorators: [
    moduleMetadata({
      imports: [PopoverComponent, DropdownMenuComponent, TooltipComponent],
    }),
  ],
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Superficies flotantes: popover informativo, menú desplegable de acciones y tooltip de ayuda.',
        ),
      },
    },
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj;

const menuItems = [
  { id: 'edit', label: 'Editar', shortcut: 'E' },
  { id: 'duplicate', label: 'Duplicar', shortcut: 'D' },
  { id: 'archive', label: 'Archivar', dividerBefore: true },
  { id: 'delete', label: 'Eliminar', tone: 'danger' as const },
];

export const OverlaySuite: Story = {
  args: {
    menuSelect: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Opciones/i }));
    await expect(canvas.getByRole('menuitem', { name: /Editar/i })).toBeVisible();
  },
  render: (args) => ({
    props: { ...args, menuItems },
    template: `
      <section class="flex flex-wrap items-center gap-6 rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-popover triggerLabel="Info" title="SLA de taller" description="Las órdenes urgentes deben cerrarse en menos de 24 h." [open]="true"></josanz-popover>
        <josanz-dropdown-menu label="Opciones" [items]="menuItems" [open]="true" (itemSelect)="menuSelect($event)"></josanz-dropdown-menu>
        <josanz-tooltip text="Copia el identificador al portapapeles">
          <button type="button" class="rounded-full border border-solid px-3 py-2 text-sm font-black" style="border-color: var(--josanz-border); color: var(--josanz-text);">ID pedido</button>
        </josanz-tooltip>
      </section>
    `,
  }),
};
