import type { Meta, StoryObj } from '@storybook/angular';
import { sbEmit } from '../../../.storybook/story-arg-types';
import { MainTabsComponent } from './main-tabs';

const meta: Meta<MainTabsComponent> = {
  component: MainTabsComponent,
  title: 'Josanz UI / Main Tabs',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Pestañas tipo “segmented control” para secciones de detalle. `options` es la lista de etiquetas; `selection` es la pestaña activa inicial. Al pulsar se emite `selectionChange` y el estado visual se mantiene (útil en Storybook sin estado padre).',
      },
    },
    layout: 'padded',
  },
  argTypes: {
    options: {
      control: 'object',
      description: 'Lista de opciones (array de strings). Editable como JSON en Controls.',
    },
    selection: { control: 'text', description: 'Pestaña activa (debe existir en `options`)' },
    selectionChange: sbEmit('selectionChange', 'Nueva pestaña seleccionada'),
  },
};

export default meta;
type Story = StoryObj<MainTabsComponent>;

export const Playground: Story = {
  args: {
    options: ['General', 'Seguridad', 'Facturación', 'Usuarios'],
    selection: 'General',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm max-w-3xl">
        <josanz-main-tabs
          [options]="options"
          [selection]="selection"
          (selectionChange)="selectionChange($event)"
        ></josanz-main-tabs>
      </div>
    `,
  }),
};

export const NavigationExamples: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Dos layouts típicos: ficha de cliente y configuración de flota.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="flex flex-col gap-12 p-10 bg-white shadow-inner rounded-3xl max-w-4xl">
        <section>
          <h4 class="text-slate-300 text-xs font-bold uppercase tracking-widest mb-6">Ficha de cliente</h4>
          <josanz-main-tabs
            [options]="['Datos Básicos', 'Operadores', 'Presupuestos', 'Facturas', 'Archivos']"
            selection="Datos Básicos"
          ></josanz-main-tabs>
        </section>

        <section>
          <h4 class="text-slate-300 text-xs font-bold uppercase tracking-widest mb-6">Configuración de flota</h4>
          <josanz-main-tabs
            [options]="['Vehículos', 'Conductores', 'Rutas', 'Mantenimiento']"
            selection="Vehículos"
          ></josanz-main-tabs>
        </section>
      </div>
    `,
  }),
};
