import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import {
  sbEmit,
  sbRadio,
  josanzStoryThemeDescription,
} from '../../../.storybook/story-arg-types';
import {
  BadgeComponent,
  type JosanzBadgeSize,
  type JosanzBadgeTone,
  type JosanzBadgeVariant,
} from './badge';

const meta: Meta<BadgeComponent> = {
  component: BadgeComponent,
  title: 'Josanz UI / Badge',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Badge/chip genérico para estados, tags, filtros activos y pequeñas etiquetas semánticas.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    label: { control: 'text', description: 'Texto visible' },
    tone: sbRadio(
      [
        'primary',
        'success',
        'warning',
        'danger',
        'neutral',
        'custom',
      ] as readonly JosanzBadgeTone[],
      'Tono',
    ),
    variant: sbRadio(
      ['soft', 'solid', 'outline'] as readonly JosanzBadgeVariant[],
      'Variante visual',
    ),
    size: sbRadio(['sm', 'md', 'lg'] as readonly JosanzBadgeSize[], 'Tamaño'),
    shape: sbRadio(['rounded', 'pill', 'square'] as const, 'Override de shape'),
    customColor: { control: 'color', description: 'Color custom' },
    dot: { control: 'boolean', description: 'Muestra punto de estado' },
    removable: { control: 'boolean', description: 'Muestra acción de quitar' },
    remove: sbEmit('remove', 'Quitar etiqueta'),
  },
};

export default meta;
type Story = StoryObj<BadgeComponent>;

export const Playground: Story = {
  args: {
    label: 'Confirmado',
    tone: 'success',
    variant: 'soft',
    size: 'md',
    shape: 'pill',
    dot: true,
    removable: false,
  },
};

export const StatusMatrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div class="flex max-w-3xl flex-wrap gap-3 p-4" style="background: var(--josanz-bg);">
        <josanz-badge label="Activo" tone="success" [dot]="true"></josanz-badge>
        <josanz-badge label="Pendiente" tone="warning" variant="outline" [dot]="true"></josanz-badge>
        <josanz-badge label="Error" tone="danger" variant="solid"></josanz-badge>
        <josanz-badge label="Borrador" tone="neutral"></josanz-badge>
        <josanz-badge label="VIP" tone="custom" customColor="#635BFF" size="lg"></josanz-badge>
      </div>
    `,
  }),
};

export const InteractiveRemove: Story = {
  args: {
    label: 'Filtro: Madrid',
    tone: 'primary',
    removable: true,
    remove: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: /quitar etiqueta/i }),
    );
    await expect(args.remove).toHaveBeenCalledTimes(1);
  },
};
