import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { moduleMetadata } from '@storybook/angular';
import {
  sbEmit,
  josanzStoryThemeDescription,
} from '../../../.storybook/story-arg-types';
import { BottomSheetComponent } from './bottom-sheet';
import { ButtonComponent } from './button';
import { ListItemComponent } from './list-item';

const meta: Meta<BottomSheetComponent> = {
  component: BottomSheetComponent,
  title: 'Josanz UI / Bottom Sheet',
  decorators: [
    moduleMetadata({
      imports: [BottomSheetComponent, ButtonComponent, ListItemComponent],
    }),
  ],
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Panel inferior para acciones rápidas en móvil. API `open` / `openChange`, backdrop y Escape.',
        ),
      },
    },
    layout: 'fullscreen',
  },
  argTypes: {
    open: { control: 'boolean' },
    openChange: sbEmit('openChange', 'Cambio open'),
    closed: sbEmit('closed', 'Cerrado'),
  },
};

export default meta;
type Story = StoryObj<BottomSheetComponent>;

export const Playground: Story = {
  args: {
    open: true,
    title: 'Acciones del vehículo',
    description: 'Elige una operación rápida.',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="min-h-[520px] p-8" style="background: var(--josanz-bg);">
        <josanz-bottom-sheet
          [open]="open"
          [title]="title"
          [description]="description"
        >
          <div class="grid gap-2">
            <josanz-list-item title="Asignar técnico" subtitle="Taller principal"></josanz-list-item>
            <josanz-list-item title="Registrar entrada" subtitle="Hoy 09:30"></josanz-list-item>
            <josanz-list-item title="Enviar presupuesto" subtitle="Pendiente firma"></josanz-list-item>
          </div>
        </josanz-bottom-sheet>
      </div>
    `,
  }),
};

export const InteractiveClose: Story = {
  args: {
    open: true,
    title: 'Confirmar salida',
    openChange: fn(),
    closed: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <josanz-bottom-sheet
        [open]="open"
        [title]="title"
        (openChange)="openChange($event)"
        (closed)="closed()"
      >
        <p style="color: var(--josanz-text-muted);">Pulsa backdrop o × para cerrar.</p>
      </josanz-bottom-sheet>
    `,
  }),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: /cerrar bottom sheet/i }),
    );
    await expect(args.openChange).toHaveBeenCalledWith(false);
    await expect(args.closed).toHaveBeenCalledTimes(1);
  },
};
