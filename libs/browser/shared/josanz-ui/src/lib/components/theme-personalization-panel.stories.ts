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
