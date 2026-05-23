import type { Meta, StoryObj } from '@storybook/angular';
import {
  sbRadio,
  josanzStoryThemeDescription,
} from '../../../.storybook/story-arg-types';
import { SkeletonComponent, type JosanzSkeletonVariant } from './skeleton';

const meta: Meta<SkeletonComponent> = {
  component: SkeletonComponent,
  title: 'Josanz UI / Skeleton',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Skeleton loader genérico para mantener estructura visual mientras cargan listas, tarjetas, avatares o multimedia.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    variant: sbRadio(
      [
        'text',
        'avatar',
        'button',
        'card',
        'media',
      ] as readonly JosanzSkeletonVariant[],
      'Variante',
    ),
    lines: {
      control: { type: 'range', min: 1, max: 8, step: 1 },
      description: 'Líneas en modo text',
    },
    shape: sbRadio(['rounded', 'pill', 'square'] as const, 'Override de shape'),
    animated: { control: 'boolean', description: 'Activa shimmer' },
    width: { control: 'text', description: 'Ancho CSS opcional' },
    height: { control: 'text', description: 'Alto CSS opcional' },
  },
};

export default meta;
type Story = StoryObj<SkeletonComponent>;

export const Playground: Story = {
  args: {
    variant: 'text',
    lines: 4,
    shape: 'rounded',
    animated: true,
    width: '',
    height: '',
  },
};

export const LoadingCard: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div class="max-w-sm rounded-3xl border border-solid p-5" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-skeleton variant="media"></josanz-skeleton>
        <div class="mt-5 flex items-center gap-3">
          <josanz-skeleton variant="avatar"></josanz-skeleton>
          <josanz-skeleton variant="text" [lines]="2"></josanz-skeleton>
        </div>
        <div class="mt-5">
          <josanz-skeleton variant="button" shape="pill"></josanz-skeleton>
        </div>
      </div>
    `,
  }),
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div class="grid max-w-4xl gap-5 p-4 md:grid-cols-2" style="background: var(--josanz-bg);">
        <josanz-skeleton variant="text" [lines]="5"></josanz-skeleton>
        <josanz-skeleton variant="card"></josanz-skeleton>
        <josanz-skeleton variant="media" shape="square"></josanz-skeleton>
        <josanz-skeleton variant="button" shape="pill"></josanz-skeleton>
      </div>
    `,
  }),
};
