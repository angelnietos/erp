import type { Meta, StoryObj } from '@storybook/angular';
import { FilterTabsComponent } from './filter-tabs';

const meta: Meta<FilterTabsComponent> = {
  component: FilterTabsComponent,
  title: 'Josanz UI / Filter Tabs',
  tags: ['autodocs'],
  argTypes: {
    options: { control: 'object' },
    selected: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<FilterTabsComponent>;

export const Playground: Story = {
  args: {
    options: ['Todas', 'Activas', 'Finalizadas', 'Borrador'],
    selected: 'Todas',
  },
};

export const CommonScenarios: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="flex flex-col gap-10 p-8 bg-[#F8F9FA] rounded-2xl border border-slate-200">
        <section>
          <h4 class="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Status Filters</h4>
          <josanz-filter-tabs 
            [options]="['Pendientes', 'Enviadas', 'Cobradas', 'Vencidas']" 
            selected="Pendientes"
          ></josanz-filter-tabs>
        </section>

        <section>
          <h4 class="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Time Periods</h4>
          <josanz-filter-tabs 
            [options]="['Semana', 'Mes', 'Trimestre', 'Año']" 
            selected="Mes"
          ></josanz-filter-tabs>
        </section>
      </div>
    `,
  }),
};
