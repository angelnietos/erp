import type { Meta, StoryObj } from '@storybook/angular';
import { MainListLayoutComponent } from './main-list-layout';

const meta: Meta<MainListLayoutComponent> = {
  component: MainListLayoutComponent,
  title: 'Josanz UI / Main List Layout',
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    primaryBtnLabel: { control: 'text' },
    filterOptions: { control: 'object' },
  },
};

export default meta;
type Story = StoryObj<MainListLayoutComponent>;

export const Playground: Story = {
  args: {
    title: 'Listado de Clientes',
    primaryBtnLabel: 'Nuevo Cliente',
    filterOptions: ['Todos', 'Activos', 'Potenciales', 'Baja'],
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="bg-slate-50">
        <josanz-main-list-layout 
          [title]="title" 
          [primaryBtnLabel]="primaryBtnLabel" 
          [filterOptions]="filterOptions"
        >
          <div class="grid grid-cols-1 gap-4 mt-6">
            <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">C1</div>
                <div>
                  <h5 class="font-bold text-slate-800 text-sm">Construcciones ABC</h5>
                  <p class="text-xs text-slate-500">contacto@abc.com</p>
                </div>
              </div>
              <div class="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase">Activo</div>
            </div>
          </div>
        </josanz-main-list-layout>
      </div>
    `,
  }),
};
