import type { Meta, StoryObj } from '@storybook/angular';
import { JosanzUiComponent } from './josanz-ui';

const meta: Meta<JosanzUiComponent> = {
  component: JosanzUiComponent,
  title: 'Josanz UI / Welcome',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<JosanzUiComponent>;

export const Welcome: Story = {
  render: () => ({
    template: `
      <div class="min-h-screen bg-slate-50 flex items-center justify-center p-10">
        <div class="max-w-2xl bg-white p-12 rounded-3xl shadow-xl border border-slate-100 text-center">
          <div class="w-20 h-20 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-lg shadow-blue-200">
            J
          </div>
          <h1 class="text-4xl font-black text-slate-900 mb-4 tracking-tight">Josanz UI</h1>
          <p class="text-lg text-slate-500 mb-8 leading-relaxed">
            Bienvenido a la librería de componentes compartidos para la aplicación Josanz Web App. 
            Aquí encontrarás todos los elementos base para construir interfaces coherentes, 
            modernas y escalables.
          </p>
          <div class="grid grid-cols-2 gap-4 text-left">
            <div class="p-6 bg-slate-50 rounded-2xl">
              <h3 class="font-bold text-slate-800 mb-2">✨ Luxe Design</h3>
              <p class="text-sm text-slate-500">Basado en el sistema de diseño Luxe con bordes suaves, sombras sutiles y alto contraste.</p>
            </div>
            <div class="p-6 bg-slate-50 rounded-2xl">
              <h3 class="font-bold text-slate-800 mb-2">🧩 Componentes Base</h3>
              <p class="text-sm text-slate-500">Botones, inputs, modales y layouts estandarizados listos para usar en tus features.</p>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
};
