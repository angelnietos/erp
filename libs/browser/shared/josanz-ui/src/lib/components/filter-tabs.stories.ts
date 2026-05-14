import type { Meta, StoryObj } from '@storybook/angular';
import { sbRadio, sbEmit, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { FilterTabsComponent } from './filter-tabs';

const meta: Meta<FilterTabsComponent> = {
  component: FilterTabsComponent,
  title: 'Josanz UI / Filter Tabs',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Filtros horizontales: inactivos usan `surface` y `textMuted`; activos mezclan el color de marca con la superficie. `shape` y `customColor` siguen la convención de `josanz-button`.',
        ),
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
    shape: sbRadio(['rounded', 'pill', 'square'] as const, 'Esquinas de cada pestaña'),
    customColor: { control: 'color', description: 'Color activo (texto + fondo suave)' },
    selectionChange: sbEmit('selectionChange', 'Opción seleccionada'),
  },
};

export default meta;
type Story = StoryObj<FilterTabsComponent>;

export const Playground: Story = {
  args: {
    options: ['Todas', 'Activas', 'Finalizadas', 'Borrador'],
    selected: 'Todas',
    shape: 'rounded',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="p-6 bg-[#F8F9FA] rounded-2xl border border-slate-200 max-w-3xl">
        <josanz-filter-tabs
          [options]="options"
          [selected]="selected"
          [shape]="shape"
          [customColor]="customColor"
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
