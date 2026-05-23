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
      <section class="grid max-w-4xl gap-4 rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <div>
          <p class="m-0 text-[10px] font-black uppercase tracking-[0.18em]" style="color: var(--josanz-text-muted);">Factura INV-2026-004</p>
          <h2 class="m-0 mt-1 text-xl font-black" style="color: var(--josanz-text);">Superficies flotantes sobre registro real</h2>
        </div>
        <div class="grid gap-3 rounded-2xl border border-solid p-4 md:grid-cols-[1fr_auto_auto_auto]" style="border-color: var(--josanz-border);">
          <div>
            <strong style="color: var(--josanz-text);">NovaByte · 1.250 EUR</strong>
            <p class="m-0 mt-1 text-sm" style="color: var(--josanz-text-muted);">Vence en 12 días · SLA facturación 48h</p>
          </div>
          <josanz-popover triggerLabel="SLA" title="SLA de facturación" description="Las facturas pendientes se revisan cada 48h. Esta aún está dentro del plazo."></josanz-popover>
          <josanz-dropdown-menu label="Opciones" [items]="menuItems" (itemSelect)="menuSelect($event)"></josanz-dropdown-menu>
          <josanz-tooltip text="Copia INV-2026-004 al portapapeles">
            <button type="button" class="rounded-full border border-solid px-3 py-2 text-sm font-black" style="border-color: var(--josanz-border); color: var(--josanz-text);">INV-2026-004</button>
          </josanz-tooltip>
        </div>
      </section>
    `,
  }),
};

export const DestructiveFlowContext: Story = {
  args: {
    menuSelect: fn(),
  },
  render: (args) => ({
    props: {
      ...args,
      menuItems: [
        { id: 'reopen', label: 'Reabrir orden', shortcut: 'R' },
        { id: 'duplicate', label: 'Duplicar para garantía', shortcut: 'D' },
        { id: 'archive', label: 'Archivar', dividerBefore: true },
        { id: 'delete', label: 'Eliminar orden', tone: 'danger' },
      ],
    },
    template: `
      <section class="max-w-3xl rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="m-0 text-[10px] font-black uppercase tracking-[0.18em]" style="color: var(--josanz-text-muted);">Orden cerrada</p>
            <h2 class="m-0 mt-1 text-xl font-black" style="color: var(--josanz-text);">#1031 · Sara Vega</h2>
            <p class="m-0 mt-1 text-sm" style="color: var(--josanz-text-muted);">Cerrada y facturada · acciones con zona destructiva separada.</p>
          </div>
          <josanz-dropdown-menu label="Gestionar" [items]="menuItems" [open]="true" (itemSelect)="menuSelect($event)"></josanz-dropdown-menu>
        </div>
      </section>
    `,
  }),
};
