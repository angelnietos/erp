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

export const UseCases: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Modal legacy frente a la página de ajustes: conservado para compatibilidad, no para nuevas pantallas.',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="min-h-[640px] rounded-3xl p-8" style="background: var(--josanz-bg);">
        <div class="mx-auto max-w-2xl rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
          <p class="m-0 text-[10px] font-black uppercase tracking-[0.18em]" style="color: var(--josanz-text-muted);">Legacy</p>
          <h3 class="m-0 mt-2 text-xl font-black" style="color: var(--josanz-text);">Personalización (modal)</h3>
          <p class="mt-3 text-sm leading-relaxed" style="color: var(--josanz-text-muted);">
            Usa <code class="text-xs">josanz-theme-modal</code> solo si necesitas mantener flujos antiguos.
            Para producto nuevo, prefiere <strong>josanz-app-settings-page</strong> con pestaña Personalización.
          </p>
          <p class="mt-4 text-xs" style="color: var(--josanz-text-muted);">Emite <code class="text-xs">modalClose</code> al cerrar.</p>
        </div>
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
