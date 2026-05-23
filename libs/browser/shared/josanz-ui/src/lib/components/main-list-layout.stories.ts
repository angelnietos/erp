import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
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
    secondaryBtnLabel: { control: 'text', description: 'Texto del botón secundario/exportación' },
    figmaCatalogLayout: {
      control: 'boolean',
      description: 'Activa la composición de catálogo inspirada en Figma',
    },
    typologyTabsVariant: sbRadio(
      ['figma', 'underline', 'brand'] as const,
      'Variante visual de tabs de tipología',
    ),
    filterOptions: {
      control: 'object',
      description: 'Opciones del componente de filtros (array de strings)',
    },
    showViewSelector: { control: 'boolean', description: 'Muestra selector de vista lista/grid' },
    viewSelectorLabel: { control: 'text', description: 'Etiqueta accesible del selector de vista' },
    showSearch: { control: 'boolean', description: 'Muestra campo de búsqueda integrado' },
    searchPlacement: sbRadio(['toolbar', 'actions'] as const, 'Ubicación del buscador'),
    searchPlaceholder: { control: 'text', description: 'Placeholder del buscador' },
    searchValue: { control: 'text', description: 'Valor controlado del buscador' },
    searchAriaLabel: { control: 'text', description: 'Etiqueta accesible del buscador' },
    paginationVariant: sbRadio(['figma', 'numbered'] as const, 'Variante de paginación'),
    paginationPage: { control: 'number', description: 'Página actual (1-based)' },
    paginationTotal: { control: 'number', description: 'Total de páginas (0 = sin paginación)' },
    avatarLink: { control: 'text', description: 'Ruta del avatar/área de usuario' },
    avatarAriaLabel: { control: 'text', description: 'Etiqueta accesible del avatar' },
    shape: sbRadio(['rounded', 'pill', 'square'] as const, 'Override de shape para controles internos'),
    customColor: { control: 'color', description: 'Color de marca para botones, filtros y paginacion' },
    primaryAction: sbEmit('primaryAction', 'Click en botón principal'),
    secondaryAction: sbEmit('secondaryAction', 'Click en acción secundaria'),
    excelAction: sbEmit('excelAction', 'Click en Excel'),
    filterChange: sbEmit('filterChange', 'Cambio de filtro'),
    searchChange: sbEmit('searchChange', 'Cambio del término de búsqueda'),
    viewChange: sbEmit('viewChange', 'Cambio de vista lista/grid'),
    paginationChange: sbEmit('paginationChange', 'Cambio de página'),
  },
};

export default meta;
type Story = StoryObj<MainListLayoutComponent>;

export const Playground: Story = {
  args: {
    title: 'Listado de Clientes',
    primaryBtnLabel: 'Nuevo Cliente',
    secondaryBtnLabel: 'Importar',
    filterOptions: ['Todos', 'Activos', 'Potenciales', 'Baja'],
    paginationPage: 1,
    paginationTotal: 4,
    searchPlaceholder: 'Buscar cliente o NIF...',
    shape: 'rounded',
    customColor: '',
    primaryAction: fn(),
    secondaryAction: fn(),
    excelAction: fn(),
    filterChange: fn(),
    searchChange: fn(),
    paginationChange: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="min-h-[520px]" style="background: var(--josanz-bg);">
        <josanz-main-list-layout
          [title]="title"
          [primaryBtnLabel]="primaryBtnLabel"
          [secondaryBtnLabel]="secondaryBtnLabel"
          [filterOptions]="filterOptions"
          [paginationPage]="paginationPage"
          [paginationTotal]="paginationTotal"
          [searchPlaceholder]="searchPlaceholder"
          [shape]="shape"
          [customColor]="customColor"
          (primaryAction)="primaryAction($event)"
          (secondaryAction)="secondaryAction($event)"
          (excelAction)="excelAction($event)"
          (filterChange)="filterChange($event)"
          (searchChange)="searchChange($event)"
          (paginationChange)="paginationChange($event)"
        >
          <div class="grid grid-cols-1 gap-4 mt-6">
            <div class="flex justify-between items-center rounded-2xl border border-solid p-5" style="background: var(--josanz-surface); border-color: var(--josanz-border); box-shadow: var(--josanz-shadow-card);">
              <div class="flex items-center gap-4">
                <div class="flex h-11 w-11 items-center justify-center rounded-full text-sm font-black" style="background: color-mix(in srgb, var(--josanz-primary) 14%, var(--josanz-surface)); color: var(--josanz-primary);">AB</div>
                <div>
                  <h5 class="m-0 text-sm font-black" style="color: var(--josanz-text);">Construcciones ABC</h5>
                  <p class="m-0 text-xs" style="color: var(--josanz-text-muted);">B-99887766 · contacto@abc.com</p>
                </div>
              </div>
              <div class="rounded-full px-3 py-1 text-[10px] font-black uppercase" style="background: var(--josanz-pill-confirmado-bg); color: var(--josanz-pill-confirmado-text);">Activo</div>
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
          <div class="mt-6 grid gap-3">
            <div class="rounded-2xl border border-solid p-5" style="background: var(--josanz-surface); border-color: var(--josanz-border); color: var(--josanz-text);">INV-2026-004 · NovaByte · Pendiente · 1.250 EUR</div>
            <div class="rounded-2xl border border-solid p-5" style="background: var(--josanz-surface); border-color: var(--josanz-border); color: var(--josanz-text);">INV-2026-003 · Auralux · Cobrada · 8.900 EUR</div>
          </div>
        </josanz-main-list-layout>
      </div>
    `,
  }),
};

export const InteractiveToolbar: Story = {
  args: {
    title: 'Órdenes',
    primaryBtnLabel: 'Nueva orden',
    secondaryBtnLabel: 'Asignar lote',
    filterOptions: ['Todas', 'Urgentes', 'En taller', 'Facturables'],
    paginationPage: 1,
    paginationTotal: 3,
    searchPlaceholder: 'Buscar orden o cliente...',
    primaryAction: fn(),
    secondaryAction: fn(),
    excelAction: fn(),
    filterChange: fn(),
    searchChange: fn(),
    paginationChange: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="min-h-[640px]" style="background: var(--josanz-bg);">
        <josanz-main-list-layout
          [title]="title"
          [primaryBtnLabel]="primaryBtnLabel"
          [secondaryBtnLabel]="secondaryBtnLabel"
          [filterOptions]="filterOptions"
          [paginationPage]="paginationPage"
          [paginationTotal]="paginationTotal"
          [searchPlaceholder]="searchPlaceholder"
          (primaryAction)="primaryAction($event)"
          (secondaryAction)="secondaryAction($event)"
          (excelAction)="excelAction($event)"
          (filterChange)="filterChange($event)"
          (searchChange)="searchChange($event)"
          (paginationChange)="paginationChange($event)"
        >
          <div class="mt-6 grid gap-3">
            <div class="rounded-2xl border border-solid p-5" style="background: var(--josanz-surface); border-color: var(--josanz-border); color: var(--josanz-text);">#1042 · Ana Muñoz · En taller</div>
            <div class="rounded-2xl border border-solid p-5" style="background: var(--josanz-surface); border-color: var(--josanz-border); color: var(--josanz-text);">#1038 · Luis Romero · Facturable</div>
          </div>
        </josanz-main-list-layout>
      </div>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Urgentes/i }));
    await expect(args['filterChange']).toHaveBeenCalledWith('Urgentes');
    await userEvent.type(canvas.getByRole('searchbox'), 'Ana');
    await expect(args['searchChange']).toHaveBeenLastCalledWith('Ana');
    await userEvent.click(canvas.getByRole('button', { name: /Nueva orden/i }));
    await expect(args['primaryAction']).toHaveBeenCalled();
  },
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
