import type { Meta, StoryObj } from '@storybook/angular';
import { MainTabsComponent } from './main-tabs';

const meta: Meta<MainTabsComponent> = {
  component: MainTabsComponent,
  title: 'Josanz UI / Main Tabs',
  tags: ['autodocs'],
  argTypes: {
    options: { control: 'object' },
    selection: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<MainTabsComponent>;

export const Playground: Story = {
  args: {
    options: ['General', 'Seguridad', 'Facturación', 'Usuarios'],
    selection: 'General',
  },
};

export const NavigationExamples: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="flex flex-col gap-12 p-10 bg-white shadow-inner rounded-3xl">
        <section>
          <h4 class="text-slate-300 text-xs font-bold uppercase tracking-widest mb-6">Ficha de Cliente</h4>
          <josanz-main-tabs 
            [options]="['Datos Básicos', 'Operadores', 'Presupuestos', 'Facturas', 'Archivos']" 
            selection="Datos Básicos"
          ></josanz-main-tabs>
        </section>

        <section>
          <h4 class="text-slate-300 text-xs font-bold uppercase tracking-widest mb-6">Configuración de Flota</h4>
          <josanz-main-tabs 
            [options]="['Vehículos', 'Conductores', 'Rutas', 'Mantenimiento']" 
            selection="Vehículos"
          ></josanz-main-tabs>
        </section>
      </div>
    `,
  }),
};
