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
    controls: { disable: true },
  },
  argTypes: {
    // AppSettingsPage no expone @Input/@Output: su estado inicial llega por ActivatedRoute.
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
  ...settingsRender('marca'),
  parameters: {
    docs: {
      description: {
        story: 'Pestaña Marca: color de marca (presets + picker) y estilo de formas.',
      },
    },
  },
};

export const Temas: Story = {
  ...settingsRender('temas'),
  parameters: {
    docs: {
      description: {
        story: 'Pestaña Temas: selección de atmósferas visuales.',
      },
    },
  },
};

export const Listados: Story = {
  ...settingsRender('listados'),
  parameters: {
    docs: {
      description: {
        story: 'Pestaña Listados: vista, cuadrícula y paginación por defecto.',
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
  ...settingsRender('marca'),
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

export const ProductFrame: Story = {
  ...settingsRender('personalizacion'),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Ajustes dentro de un marco de producto con contexto de tenant y resumen de configuración activa.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="min-h-[900px] p-6" style="background: var(--josanz-bg);">
        <div class="mx-auto max-w-7xl">
          <header class="mb-6 grid gap-4 rounded-3xl border border-solid p-6 lg:grid-cols-[1fr_auto]" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
            <div>
              <p class="m-0 text-[10px] font-black uppercase tracking-[0.18em]" style="color: var(--josanz-text-muted);">Josanz Eventos · Backoffice</p>
              <h1 class="m-0 mt-1 text-3xl font-black" style="color: var(--josanz-text);">Configuración de experiencia</h1>
              <p class="m-0 mt-2 text-sm" style="color: var(--josanz-text-muted);">Personaliza marca, densidad y navegación para el equipo operativo.</p>
            </div>
            <div class="grid gap-2 text-xs font-bold" style="color: var(--josanz-text-muted);">
              <span>Atmósfera: sincronizada</span>
              <span>Listados: preferencia por usuario</span>
              <span>Ruta: /settings?tab=personalizacion</span>
            </div>
          </header>
          <josanz-app-settings-page></josanz-app-settings-page>
        </div>
      </div>
    `,
  }),
};
