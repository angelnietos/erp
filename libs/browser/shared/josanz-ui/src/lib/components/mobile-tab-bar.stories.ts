import { moduleMetadata } from '@storybook/angular';
import { RouterModule } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';
import type { Meta, StoryObj } from '@storybook/angular';
import { josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { MobileTabBarComponent } from './mobile-tab-bar';

const meta: Meta<MobileTabBarComponent> = {
  component: MobileTabBarComponent,
  title: 'Josanz UI / Mobile Tab Bar',
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [RouterModule.forRoot([])],
      providers: [{ provide: APP_BASE_HREF, useValue: '/' }],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Navegación inferior para mobile. Cinco rutas principales y una acción central prominente para crear informe. Los colores siguen el tema activo.',
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

const shellTemplate = `
  <div class="relative mx-auto h-[720px] max-w-[390px] overflow-hidden rounded-[32px] border border-solid" style="background: var(--josanz-bg); border-color: var(--josanz-border);">
    <div class="p-6 pb-28">
      <h2 class="m-0 text-2xl font-black" style="color: var(--josanz-text);">Inicio</h2>
      <p class="mt-2 text-sm" style="color: var(--josanz-text-muted);">Shell móvil con tab bar fija. Cambia Atmósfera y Marca en la toolbar.</p>
    </div>
    <josanz-mobile-tab-bar></josanz-mobile-tab-bar>
  </div>
`;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Vista por defecto en viewport móvil.',
      },
    },
  },
  render: () => ({ template: shellTemplate }),
};

export const DarkAtmosphere: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Combina con toolbar Theme → Dark y atmósferas oscuras para validar contraste.',
      },
    },
    globals: {
      theme: 'dark',
      josanzAtmosphere: 'neutral',
    },
  },
  render: () => ({ template: shellTemplate }),
};
