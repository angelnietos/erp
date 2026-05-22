import type { Meta, StoryObj } from '@storybook/angular';
import { josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { JosanzUiComponent } from './josanz-ui';

const meta: Meta<JosanzUiComponent> = {
  component: JosanzUiComponent,
  title: 'Josanz UI / Welcome',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Punto de entrada visual de la librería **josanz-ui**: componentes standalone compartidos con Josanz Web (Angular + Tailwind + Storybook).',
        ),
      },
    },
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<JosanzUiComponent>;

export const Welcome: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Resumen del propósito del paquete y enlaces al design system documentado en MDX.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="flex min-h-screen items-center justify-center p-10" style="background: var(--josanz-bg);">
        <div class="max-w-2xl rounded-3xl border border-solid p-12 text-center shadow-xl" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
          <div
            class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl text-3xl font-black shadow-lg"
            style="background: var(--josanz-primary); color: var(--josanz-on-primary);"
          >J</div>
          <h1 class="mb-4 text-4xl font-black tracking-tight" style="color: var(--josanz-text); font-family: 'DM Sans', sans-serif;">Josanz UI</h1>
          <p class="mb-8 text-lg leading-relaxed" style="color: var(--josanz-text-muted);">
            Librería de componentes compartidos: layouts, formularios, navegación y feedback coherentes con el design system.
          </p>
          <div class="grid grid-cols-2 gap-4 text-left">
            <div class="rounded-2xl p-6" style="background: var(--josanz-surface-muted, var(--josanz-bg));">
              <h3 class="mb-2 font-bold" style="color: var(--josanz-text);">Design system</h3>
              <p class="text-sm" style="color: var(--josanz-text-muted);">Tokens y estilos globales en <code class="text-xs">styles.scss</code>. Usa las toolbars Atmósfera, Marca y Shape.</p>
            </div>
            <div class="rounded-2xl p-6" style="background: var(--josanz-surface-muted, var(--josanz-bg));">
              <h3 class="mb-2 font-bold" style="color: var(--josanz-text);">Cómo usar</h3>
              <p class="text-sm" style="color: var(--josanz-text-muted);">Importa desde <code class="text-xs">@josanz-erp/josanz-ui</code> y revisa cada historia para props y eventos.</p>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
};

export const RootComponent: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Componente exportado <code>josanz-ui-root</code> (tarjeta compacta de marca).',
      },
    },
  },
  render: () => ({
    template: `
      <div class="flex min-h-[200px] items-center justify-center p-10" style="background: var(--josanz-bg);">
        <josanz-ui-root></josanz-ui-root>
      </div>
    `,
  }),
};
