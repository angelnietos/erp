import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { DividerComponent } from './divider';

const meta: Meta<DividerComponent> = {
  component: DividerComponent,
  title: 'Josanz UI / Divider',
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [DividerComponent] })],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription('Separador horizontal u orientación vertical con etiqueta opcional.'),
      },
    },
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<DividerComponent>;

export const Playground: Story = {
  render: () => ({
    template: `
      <section class="grid max-w-md gap-6 rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <p class="m-0 text-sm" style="color: var(--josanz-text);">Sección A</p>
        <josanz-divider label="o"></josanz-divider>
        <p class="m-0 text-sm" style="color: var(--josanz-text);">Sección B</p>
        <div class="flex h-24 items-stretch gap-4">
          <span class="text-sm" style="color: var(--josanz-text-muted);">Izq</span>
          <josanz-divider orientation="vertical"></josanz-divider>
          <span class="text-sm" style="color: var(--josanz-text-muted);">Der</span>
        </div>
      </section>
    `,
  }),
};
