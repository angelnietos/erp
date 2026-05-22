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
          'Panel de personalizacion que modifica el `JosanzThemeService`: color de marca, atmosfera, columnas de listado y variante de paginacion. Es la referencia funcional para validar todos los tokens.',
        ),
      },
    },
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<ThemePersonalizationPanelComponent>;

export const Playground: Story = {
  render: () => ({
    template: `
      <div class="min-h-[760px] p-6" style="background: var(--josanz-bg);">
        <div class="mx-auto max-w-6xl rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
          <josanz-theme-personalization-panel></josanz-theme-personalization-panel>
        </div>
      </div>
    `,
  }),
};
