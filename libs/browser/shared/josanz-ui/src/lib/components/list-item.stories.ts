import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { josanzStoryThemeDescription, sbEmit } from '../../../.storybook/story-arg-types';
import { ListItemComponent } from './list-item';

const meta: Meta<ListItemComponent> = {
  component: ListItemComponent,
  title: 'Josanz UI / List Item',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Fila de lista accionable para clientes, ordenes y documentos con avatar, metadata y etiqueta final.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    meta: { control: 'text' },
    trailingLabel: { control: 'text' },
    avatarName: { control: 'text' },
    avatarColor: { control: 'color' },
    disabled: { control: 'boolean' },
    itemClick: sbEmit('itemClick', 'Click en fila'),
  },
};

export default meta;
type Story = StoryObj<ListItemComponent>;

export const Playground: Story = {
  args: {
    title: 'Ana Muñoz',
    description: 'Toyota Corolla · Revision anual',
    meta: '09:30',
    trailingLabel: 'VIP',
    avatarName: 'Ana Muñoz',
    avatarColor: '#635BFF',
    disabled: false,
    itemClick: fn(),
  },
};

export const StatesAndVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div class="max-w-xl overflow-hidden rounded-3xl border border-solid" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-list-item title="Ana Muñoz" description="Toyota Corolla · Revision anual" meta="09:30" trailingLabel="VIP" avatarName="Ana Muñoz"></josanz-list-item>
        <josanz-list-item title="Luis Ortega" description="Factura pendiente de firma" meta="Ayer" trailingLabel="Nuevo" avatarName="Luis Ortega" avatarColor="#0f766e"></josanz-list-item>
        <josanz-list-item title="Parte sin asignar" description="Esperando recepcion" meta="--" [disabled]="true"></josanz-list-item>
      </div>
    `,
  }),
};

export const InteractiveClick: Story = {
  args: {
    title: 'Abrir cliente',
    description: 'Ficha completa',
    avatarName: 'Cliente Demo',
    itemClick: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /abrir cliente/i }));
    await expect(args.itemClick).toHaveBeenCalledTimes(1);
  },
};
