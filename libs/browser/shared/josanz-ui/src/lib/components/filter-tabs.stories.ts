import type { Meta, StoryObj } from '@storybook/angular';
import { sbEmit } from '../../../.storybook/story-arg-types';
import { FilterTabsComponent } from './filter-tabs';

const meta: Meta<FilterTabsComponent> = {
  component: FilterTabsComponent,
  title: 'Josanz UI / Filter Tabs',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Filtros horizontales estilo pill para listados. `selected` debe coincidir con una entrada de `options`. Emite `selectionChange` al cambiar; el resaltado se mantiene al pulsar sin depender del padre.',
      },
    },
    layout: 'padded',
  },
  argTypes: {
    options: {
      control: 'object',
      description: 'Opciones del filtro (array de strings).',
    },
    selected: { control: 'text', description: 'Opción activa inicial' },
    selectionChange: sbEmit('selectionChange', 'Opción seleccionada'),
  },
};

export default meta;
type Story = StoryObj<FilterTabsComponent>;

export const Playground: Story = {
  args: {
    options: ['Todas', 'Activas', 'Finalizadas', 'Borrador'],
    selected: 'Todas',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="p-6 bg-[#F8F9FA] rounded-2xl border border-slate-200 max-w-3xl">
        <josanz-filter-tabs
          [options]="options"
          [selected]="selected"
          (selectionChange)="selectionChange($event)"
        ></josanz-filter-tabs>
      </div>
    `,
  }),
};

export const CommonScenarios: Story = {
  parameters: {
    docs: {
      description: { story: 'Dos bloques de filtros con datos fijos (estados y periodos).' },
    },
  },
  render: () => ({
    template: `
      <div class="flex flex-col gap-10 p-8 bg-[#F8F9FA] rounded-2xl border border-slate-200 max-w-4xl">
        <section>
          <h4 class="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Estados</h4>
          <josanz-filter-tabs
            [options]="['Pendientes', 'Enviadas', 'Cobradas', 'Vencidas']"
            selected="Pendientes"
          ></josanz-filter-tabs>
        </section>

        <section>
          <h4 class="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Periodos</h4>
          <josanz-filter-tabs
            [options]="['Semana', 'Mes', 'Trimestre', 'Año']"
            selected="Mes"
          ></josanz-filter-tabs>
        </section>
      </div>
    `,
  }),
};
