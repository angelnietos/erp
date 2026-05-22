import { moduleMetadata } from '@storybook/angular';
import { ActivatedRoute } from '@angular/router';
import type { Meta, StoryObj } from '@storybook/angular';
import { josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { AppSettingsPageComponent } from './app-settings-page';

const routeStub = {
  snapshot: {
    queryParamMap: {
      get: () => 'personalizacion',
    },
  },
};

const meta: Meta<AppSettingsPageComponent> = {
  component: AppSettingsPageComponent,
  title: 'Josanz UI / App Settings Page',
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      providers: [{ provide: ActivatedRoute, useValue: routeStub }],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Pagina de ajustes completa con tabs y panel de personalizacion. Es la vista recomendada para configurar color de marca, atmosfera y preferencias de listados.',
        ),
      },
    },
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<AppSettingsPageComponent>;

export const Personalizacion: Story = {
  render: () => ({
    template: `
      <div class="min-h-[820px]" style="background: var(--josanz-bg);">
        <josanz-app-settings-page></josanz-app-settings-page>
      </div>
    `,
  }),
};
