import type { Meta, StoryObj } from '@storybook/angular';
import { josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { MobileTabBarComponent } from './mobile-tab-bar';

const meta: Meta<MobileTabBarComponent> = {
  component: MobileTabBarComponent,
  title: 'Josanz UI / Mobile Tab Bar',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Navegacion inferior para mobile. Incluye cinco rutas principales y una accion central prominente para crear informe.',
        ),
      },
    },
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

export default meta;
type Story = StoryObj<MobileTabBarComponent>;

export const MobileShell: Story = {
  render: () => ({
    template: `
      <div class="relative mx-auto h-[720px] max-w-[390px] overflow-hidden rounded-[32px] border border-solid" style="background: var(--josanz-bg); border-color: var(--josanz-border);">
        <div class="p-6">
          <h2 class="m-0 text-2xl font-black" style="color: var(--josanz-text);">Inicio</h2>
          <p class="mt-2 text-sm" style="color: var(--josanz-text-muted);">Ejemplo de shell movil con tab bar fija.</p>
        </div>
        <josanz-mobile-tab-bar></josanz-mobile-tab-bar>
      </div>
    `,
  }),
};
