import type { Meta, StoryObj } from '@storybook/angular';
import { sbEmit, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { MainListLayoutComponent } from './main-list-layout';

const meta: Meta<MainListLayoutComponent> = {
  component: MainListLayoutComponent,
  title: 'Josanz UI / Main List Layout',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Layout de listado con título acoplado a `atmosphere.text`, filtros y botones que respetan el tema activo.',
        ),
      },
    },
    layout: 'fullscreen',
  },
  argTypes: {
    title: { control: 'text', description: 'Título de la página' },
    primaryBtnLabel: { control: 'text', description: 'Texto del botón principal' },
    filterOptions: {
      control: 'object',
      description: 'Opciones del componente de filtros (array de strings)',
    },
    paginationPage: { control: 'number', description: 'Página actual (1-based)' },
    paginationTotal: { control: 'number', description: 'Total de páginas (0 = sin paginación)' },
    primaryAction: sbEmit('primaryAction', 'Click en botón principal'),
    excelAction: sbEmit('excelAction', 'Click en Excel'),
    filterChange: sbEmit('filterChange', 'Cambio de filtro'),
    paginationChange: sbEmit('paginationChange', 'Cambio de página'),
  },
};

export default meta;
type Story = StoryObj<MainListLayoutComponent>;

export const Playground: Story = {
  args: {
    title: 'Listado de Clientes',
    primaryBtnLabel: 'Nuevo Cliente',
    filterOptions: ['Todos', 'Activos', 'Potenciales', 'Baja'],
    paginationPage: 1,
    paginationTotal: 0,
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="bg-slate-50 min-h-[520px]">
        <josanz-main-list-layout
          [title]="title"
          [primaryBtnLabel]="primaryBtnLabel"
          [filterOptions]="filterOptions"
          [paginationPage]="paginationPage"
          [paginationTotal]="paginationTotal"
          (primaryAction)="primaryAction($event)"
          (excelAction)="excelAction($event)"
          (filterChange)="filterChange($event)"
          (paginationChange)="paginationChange($event)"
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

export const WithPagination: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Misma vista con paginación visible (17 páginas, página 5).',
      },
    },
  },
  args: {
    title: 'Facturas',
    primaryBtnLabel: 'Nueva factura',
    filterOptions: ['Todas', 'Pendientes', 'Cobradas'],
    paginationPage: 5,
    paginationTotal: 17,
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="bg-slate-50 min-h-[520px]">
        <josanz-main-list-layout
          [title]="title"
          [primaryBtnLabel]="primaryBtnLabel"
          [filterOptions]="filterOptions"
          [paginationPage]="paginationPage"
          [paginationTotal]="paginationTotal"
          (paginationChange)="paginationChange($event)"
        >
          <p class="text-sm text-slate-500 p-4">Contenido de ejemplo: tabla o cards aquí.</p>
        </josanz-main-list-layout>
      </div>
    `,
  }),
};
