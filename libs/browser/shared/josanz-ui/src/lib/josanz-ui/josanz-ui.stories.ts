import type { Meta, StoryObj } from '@storybook/angular';
import { JosanzUiComponent } from './josanz-ui';

const meta: Meta<JosanzUiComponent> = {
  component: JosanzUiComponent,
  title: 'Josanz UI / Welcome',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Punto de entrada visual de la librería **josanz-ui**: componentes standalone compartidos con la app Josanz Web (Angular + Tailwind + Storybook).',
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
        story: 'Resumen del propósito del paquete y enlaces conceptuales al resto de historias.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="min-h-screen bg-slate-50 flex items-center justify-center p-10">
        <div class="max-w-2xl bg-white p-12 rounded-3xl shadow-xl border border-slate-100 text-center">
          <div class="w-20 h-20 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-lg shadow-blue-200">
            J
          </div>
          <h1 class="text-4xl font-black text-slate-900 mb-4 tracking-tight">Josanz UI</h1>
          <p class="text-lg text-slate-500 mb-8 leading-relaxed">
            Librería de componentes compartidos para Josanz Web App: patrones de layout, formularios,
            navegación y feedback coherentes con el design system.
          </p>
          <div class="grid grid-cols-2 gap-4 text-left">
            <div class="p-6 bg-slate-50 rounded-2xl">
              <h3 class="font-bold text-slate-800 mb-2">Design system</h3>
              <p class="text-sm text-slate-500">Tokens, tipografía y estilos globales cargados en Storybook vía <code class="text-xs">styles.scss</code>.</p>
            </div>
            <div class="p-6 bg-slate-50 rounded-2xl">
              <h3 class="font-bold text-slate-800 mb-2">Cómo usar</h3>
              <p class="text-sm text-slate-500">Importa desde <code class="text-xs">@josanz-erp/josanz-ui</code> y revisa cada historia para props y eventos.</p>
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
        story: 'El componente exportado <code class="text-xs">josanz-ui-root</code> (tarjeta compacta de marca).',
      },
    },
  },
  render: () => ({
    template: `
      <div class="p-10 flex justify-center bg-slate-100 min-h-[200px]">
        <josanz-ui-root></josanz-ui-root>
      </div>
    `,
  }),
};
