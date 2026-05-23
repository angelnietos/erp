import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { josanzStoryThemeDescription, sbEmit, sbRadio } from '../../../.storybook/story-arg-types';
import { TagComponent, type JosanzTagTone } from './tag';

const meta: Meta<TagComponent> = {
  component: TagComponent,
  title: 'Josanz UI / Tag',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Etiqueta compacta para filtros, estados secundarios y categorizacion con opcion removible.',
        ),
      },
    },
    layout: 'centered',
  },
  argTypes: {
    label: { control: 'text' },
    tone: sbRadio(['neutral', 'primary', 'success', 'warning', 'danger'] as readonly JosanzTagTone[], 'Tono'),
    customColor: { control: 'color', description: 'Color personalizado' },
    removable: { control: 'boolean' },
    remove: sbEmit('remove', 'Quitar tag'),
  },
};

export default meta;
type Story = StoryObj<TagComponent>;

export const Playground: Story = {
  args: {
    label: 'Madrid',
    tone: 'primary',
    removable: true,
    remove: fn(),
  },
};

export const StatesAndTones: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div class="flex flex-wrap gap-3 rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-tag label="Neutral" tone="neutral"></josanz-tag>
        <josanz-tag label="Primary" tone="primary"></josanz-tag>
        <josanz-tag label="Success" tone="success"></josanz-tag>
        <josanz-tag label="Warning" tone="warning"></josanz-tag>
        <josanz-tag label="Danger" tone="danger"></josanz-tag>
        <josanz-tag label="Custom" customColor="#8b5cf6" [removable]="true"></josanz-tag>
      </div>
    `,
  }),
};

export const InteractiveRemove: Story = {
  args: {
    label: 'Filtro: Activos',
    tone: 'primary',
    removable: true,
    remove: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /quitar etiqueta/i }));
    await expect(args.remove).toHaveBeenCalledTimes(1);
  },
};
