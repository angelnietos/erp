import type { Meta, StoryObj } from '@storybook/angular';
import { josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { ThemePersonalizationPanelComponent } from './theme-personalization-panel';

const meta: Meta<ThemePersonalizationPanelComponent> = {
  component: ThemePersonalizationPanelComponent,
  title: 'Josanz UI / Theme Personalization Panel',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Panel de personalización que modifica `JosanzThemeService`: color de marca, atmósfera, columnas de listado y variante de paginación. Referencia funcional para validar todos los tokens.',
        ),
      },
    },
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<ThemePersonalizationPanelComponent>;

const panelShell = `
  <div class="min-h-[760px] p-6" style="background: var(--josanz-bg);">
    <div class="mx-auto max-w-6xl rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
      <josanz-theme-personalization-panel></josanz-theme-personalization-panel>
    </div>
  </div>
`;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Interactúa con los controles del panel y observa cómo cambian Marca, Shape y listados en otras stories abiertas.',
      },
    },
  },
  render: () => ({ template: panelShell }),
};

export const UseCases: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Panel con tarjetas de preview que muestran cómo afectan color de marca, atmósfera y paginación al resto del sistema.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="min-h-[760px] p-6" style="background: var(--josanz-bg);">
        <div class="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div class="rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
            <josanz-theme-personalization-panel></josanz-theme-personalization-panel>
          </div>
          <div class="space-y-4">
            <div class="rounded-3xl border border-solid p-5" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
              <p class="m-0 text-xs font-bold uppercase tracking-widest" style="color: var(--josanz-text-muted);">Preview botón</p>
              <div class="mt-4 flex gap-3">
                <div class="rounded-xl px-4 py-2 text-sm font-bold text-white" style="background: var(--josanz-primary);">Primario</div>
                <div class="rounded-xl border border-solid px-4 py-2 text-sm font-bold" style="border-color: var(--josanz-border); color: var(--josanz-text);">Secundario</div>
              </div>
            </div>
            <div class="rounded-3xl border border-solid p-5" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
              <p class="m-0 text-xs font-bold uppercase tracking-widest" style="color: var(--josanz-text-muted);">Preview listado</p>
              <div class="mt-4 h-10 rounded-xl" style="background: var(--josanz-surface-muted, var(--josanz-bg)); border: 1px solid var(--josanz-border);"></div>
              <div class="mt-2 h-10 rounded-xl" style="background: var(--josanz-surface-muted, var(--josanz-bg)); border: 1px solid var(--josanz-border);"></div>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
};

export const CompactPreview: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Vista más estrecha para validar responsive del panel.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="min-h-[640px] p-4" style="background: var(--josanz-bg);">
        <div class="mx-auto max-w-md rounded-2xl border border-solid p-4" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
          <josanz-theme-personalization-panel></josanz-theme-personalization-panel>
        </div>
      </div>
    `,
  }),
};
