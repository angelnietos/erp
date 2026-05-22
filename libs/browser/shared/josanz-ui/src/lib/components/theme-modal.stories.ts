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
          'Modal legacy de personalización. Se conserva para compatibilidad; la experiencia preferida es `josanz-app-settings-page`.',
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
  parameters: {
    docs: {
      description: {
        story: 'Modal a pantalla completa con panel de tema. Usa Actions para ver `modalClose`.',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="h-[820px] overflow-hidden rounded-3xl p-8" style="background: var(--josanz-bg);">
        <josanz-theme-modal (modalClose)="modalClose($event)"></josanz-theme-modal>
      </div>
    `,
  }),
};

export const OnDarkCanvas: Story = {
  parameters: {
    globals: { theme: 'dark' },
    docs: {
      description: {
        story: 'Comprueba legibilidad del modal sobre fondo oscuro.',
      },
    },
  },
  render: Playground.render,
};
