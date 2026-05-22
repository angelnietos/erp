import type { Meta, StoryObj } from '@storybook/angular';
import { sbEmit, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { ThemeModalComponent } from './theme-modal';

const meta: Meta<ThemeModalComponent> = {
  component: ThemeModalComponent,
  title: 'Josanz UI / Theme Modal',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Modal legacy de personalizacion. Se conserva para compatibilidad, aunque la experiencia preferida es `josanz-app-settings-page`.',
        ),
      },
    },
    layout: 'fullscreen',
  },
  argTypes: {
    modalClose: sbEmit('modalClose', 'Cierre del modal'),
  },
};

export default meta;
type Story = StoryObj<ThemeModalComponent>;

export const Playground: Story = {
  render: () => ({
    template: `
      <div class="h-[820px] overflow-hidden rounded-3xl bg-slate-900 p-8">
        <josanz-theme-modal (modalClose)="modalClose($event)"></josanz-theme-modal>
      </div>
    `,
  }),
};
