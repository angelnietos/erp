import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { sbEmit, sbRadio, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { MainListLayoutComponent } from './main-list-layout';
import { MainTemplateCardComponent } from './main-template-card';

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
    shape: sbRadio(['rounded', 'pill', 'square'] as const, 'Override de shape para controles internos'),
    customColor: { control: 'color', description: 'Color de marca para botones, filtros y paginacion' },
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
    shape: 'rounded',
    customColor: '',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="min-h-[520px]" style="background: var(--josanz-bg);">
        <josanz-main-list-layout
          [title]="title"
          [primaryBtnLabel]="primaryBtnLabel"
          [filterOptions]="filterOptions"
          [paginationPage]="paginationPage"
          [paginationTotal]="paginationTotal"
          [shape]="shape"
          [customColor]="customColor"
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
    shape: 'rounded',
    customColor: '',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="min-h-[520px]" style="background: var(--josanz-bg);">
        <josanz-main-list-layout
          [title]="title"
          [primaryBtnLabel]="primaryBtnLabel"
          [filterOptions]="filterOptions"
          [paginationPage]="paginationPage"
          [paginationTotal]="paginationTotal"
          [shape]="shape"
          [customColor]="customColor"
          (paginationChange)="paginationChange($event)"
        >
          <p class="text-sm text-slate-500 p-4">Contenido de ejemplo: tabla o cards aquí.</p>
        </josanz-main-list-layout>
      </div>
    `,
  }),
};

export const ClientUseCase: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Listado realista de clientes con filtros, CTA principal, exportación y tarjetas de resumen.',
      },
    },
  },
  args: {
    title: 'Clientes',
    primaryBtnLabel: 'Nuevo cliente',
    filterOptions: ['Todos', 'Activos', 'Potenciales', 'Baja'],
    paginationPage: 1,
    paginationTotal: 8,
    shape: 'rounded',
    customColor: '',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="min-h-[720px]" style="background: var(--josanz-bg);">
        <josanz-main-list-layout
          [title]="title"
          [primaryBtnLabel]="primaryBtnLabel"
          [filterOptions]="filterOptions"
          [paginationPage]="paginationPage"
          [paginationTotal]="paginationTotal"
          [shape]="shape"
          [customColor]="customColor"
          (primaryAction)="primaryAction($event)"
          (excelAction)="excelAction($event)"
          (filterChange)="filterChange($event)"
          (paginationChange)="paginationChange($event)"
        >
          <div class="mt-6 grid gap-4">
            <div class="flex items-center justify-between rounded-2xl border border-solid p-5" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
              <div class="flex items-center gap-4">
                <div class="flex h-11 w-11 items-center justify-center rounded-full text-sm font-black" style="background: color-mix(in srgb, var(--josanz-primary) 14%, var(--josanz-surface)); color: var(--josanz-primary);">NB</div>
                <div>
                  <h5 class="m-0 text-sm font-black" style="color: var(--josanz-text);">NovaByte S.L.</h5>
                  <p class="m-0 text-xs" style="color: var(--josanz-text-muted);">B-12345678 · contacto@novabyte.es</p>
                </div>
              </div>
              <span class="rounded-full px-3 py-1 text-[10px] font-black uppercase" style="background: var(--josanz-pill-confirmado-bg); color: var(--josanz-pill-confirmado-text);">Activo</span>
            </div>
            <div class="flex items-center justify-between rounded-2xl border border-solid p-5" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
              <div class="flex items-center gap-4">
                <div class="flex h-11 w-11 items-center justify-center rounded-full text-sm font-black" style="background: color-mix(in srgb, var(--josanz-warning) 14%, var(--josanz-surface)); color: var(--josanz-warning);">ES</div>
                <div>
                  <h5 class="m-0 text-sm font-black" style="color: var(--josanz-text);">Eventos del Sur</h5>
                  <p class="m-0 text-xs" style="color: var(--josanz-text-muted);">Sevilla · ops@eventosur.es</p>
                </div>
              </div>
              <span class="rounded-full px-3 py-1 text-[10px] font-black uppercase" style="background: var(--josanz-pill-en-proceso-bg); color: var(--josanz-pill-en-proceso-text);">Potencial</span>
            </div>
          </div>
        </josanz-main-list-layout>
      </div>
    `,
  }),
};

export const EventsUseCase: Story = {
  decorators: [
    moduleMetadata({
      imports: [MainTemplateCardComponent],
    }),
  ],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Catálogo de eventos con layout Figma: tabs subrayados, búsqueda en toolbar y filas `main-template-card`.',
      },
    },
  },
  args: {
    title: 'Eventos',
    primaryBtnLabel: 'Nuevo evento',
    filterOptions: ['Todos', 'Confirmados', 'En presupuesto', 'Cancelados'],
    paginationPage: 2,
    paginationTotal: 9,
    shape: 'rounded',
    customColor: '#635BFF',
  },
  render: (args) => ({
    props: { ...args, figmaCatalogLayout: true, searchPlaceholder: 'Buscar evento o cliente...' },
    template: `
      <div class="min-h-[760px]" style="background: var(--josanz-bg);">
        <josanz-main-list-layout
          [title]="title"
          [primaryBtnLabel]="primaryBtnLabel"
          [filterOptions]="filterOptions"
          [paginationPage]="paginationPage"
          [paginationTotal]="paginationTotal"
          [shape]="shape"
          [customColor]="customColor"
          [figmaCatalogLayout]="figmaCatalogLayout"
          [searchPlaceholder]="searchPlaceholder"
          (primaryAction)="primaryAction($event)"
          (excelAction)="excelAction($event)"
          (filterChange)="filterChange($event)"
          (paginationChange)="paginationChange($event)"
        >
          <div class="mt-2 space-y-3">
            <josanz-main-template-card
              title="Gala Primavera 2026"
              status="Confirmado"
              statusVariant="confirmado"
              [labels]="['Cliente', 'Ciudad', 'Presupuesto', 'Equipo']"
              [data]="['NovaByte', 'Sevilla', '24.500 EUR', '6 técnicos']"
            ></josanz-main-template-card>
            <josanz-main-template-card
              title="Convención Retail Q3"
              status="En presupuesto"
              statusVariant="presupuesto"
              [labels]="['Cliente', 'Ciudad', 'Presupuesto', 'Equipo']"
              [data]="['Auralux', 'Madrid', '18.200 EUR', '4 técnicos']"
            ></josanz-main-template-card>
            <josanz-main-template-card
              title="Festival Sonido Sur"
              status="En proceso"
              statusVariant="en-proceso"
              [labels]="['Cliente', 'Ciudad', 'Presupuesto', 'Equipo']"
              [data]="['Eventos del Sur', 'Cádiz', '9.800 EUR', '8 técnicos']"
            ></josanz-main-template-card>
          </div>
        </josanz-main-list-layout>
      </div>
    `,
  }),
};

export const BillingUseCase: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Listado de facturación con paginación visible y foco en estados de cobro.',
      },
    },
  },
  args: {
    title: 'Facturación',
    primaryBtnLabel: 'Nueva factura',
    filterOptions: ['Todas', 'Pendientes', 'Cobradas', 'Vencidas'],
    paginationPage: 3,
    paginationTotal: 12,
    shape: 'pill',
    customColor: '#0F1E2F',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="min-h-[720px]" style="background: var(--josanz-bg);">
        <josanz-main-list-layout
          [title]="title"
          [primaryBtnLabel]="primaryBtnLabel"
          [filterOptions]="filterOptions"
          [paginationPage]="paginationPage"
          [paginationTotal]="paginationTotal"
          [shape]="shape"
          [customColor]="customColor"
          (primaryAction)="primaryAction($event)"
          (excelAction)="excelAction($event)"
          (filterChange)="filterChange($event)"
          (paginationChange)="paginationChange($event)"
        >
          <div class="mt-6 grid gap-3">
            <div class="grid grid-cols-[1fr_auto] gap-4 rounded-2xl border border-solid p-5" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
              <div>
                <h5 class="m-0 text-sm font-black" style="color: var(--josanz-text);">INV-2026-004 · NovaByte</h5>
                <p class="m-0 text-xs" style="color: var(--josanz-text-muted);">Vence en 12 días · 1.250 EUR</p>
              </div>
              <span class="self-start rounded-full px-3 py-1 text-[10px] font-black uppercase" style="background: var(--josanz-pill-en-proceso-bg); color: var(--josanz-pill-en-proceso-text);">Pendiente</span>
            </div>
            <div class="grid grid-cols-[1fr_auto] gap-4 rounded-2xl border border-solid p-5" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
              <div>
                <h5 class="m-0 text-sm font-black" style="color: var(--josanz-text);">INV-2026-003 · Auralux</h5>
                <p class="m-0 text-xs" style="color: var(--josanz-text-muted);">Pagada · 8.900 EUR</p>
              </div>
              <span class="self-start rounded-full px-3 py-1 text-[10px] font-black uppercase" style="background: var(--josanz-pill-facturado-bg); color: var(--josanz-pill-facturado-text);">Cobrada</span>
            </div>
          </div>
        </josanz-main-list-layout>
      </div>
    `,
  }),
};
