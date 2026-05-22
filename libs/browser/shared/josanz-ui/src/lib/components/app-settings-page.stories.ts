import { moduleMetadata } from '@storybook/angular';
import { ActivatedRoute } from '@angular/router';
import type { Meta, StoryObj } from '@storybook/angular';
import { josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { AppSettingsPageComponent } from './app-settings-page';

function routeStub(tab: string) {
  return {
    snapshot: {
      queryParamMap: {
        get: (key: string) => (key === 'tab' ? tab : null),
      },
    },
  };
}

const meta: Meta<AppSettingsPageComponent> = {
  component: AppSettingsPageComponent,
  title: 'Josanz UI / App Settings Page',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Página de ajustes completa con tabs y panel de personalización. Es la vista recomendada para configurar color de marca, atmósfera y preferencias de listados.',
        ),
      },
    },
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<AppSettingsPageComponent>;

const settingsRender = (tab: string) => ({
  decorators: [
    moduleMetadata({
      providers: [{ provide: ActivatedRoute, useValue: routeStub(tab) }],
    }),
  ],
  render: () => ({
    template: `
      <div class="min-h-[820px]" style="background: var(--josanz-bg);">
        <josanz-app-settings-page></josanz-app-settings-page>
      </div>
    `,
  }),
});

export const Personalizacion: Story = {
  ...settingsRender('personalizacion'),
  parameters: {
    docs: {
      description: {
        story: 'Pestaña de personalización: color de marca, atmósfera, shape y preferencias de listado.',
      },
    },
  },
};

export const General: Story = {
  ...settingsRender('general'),
  parameters: {
    docs: {
      description: {
        story: 'Pestaña general de ajustes de la aplicación.',
      },
    },
  },
};

export const UseCases: Story = {
  ...settingsRender('personalizacion'),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Vista recomendada de producto: ajustes con pestaña Personalización activa (marca, atmósfera, shape y listados). Sustituye al modal legacy.',
      },
    },
  },
};
