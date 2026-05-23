import type { Meta, StoryObj } from '@storybook/angular';
import { sbRadio, sbShapeArgTypes, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import type { JosanzStatusPillVariant } from './main-template-card';
import { MainTemplateCardComponent } from './main-template-card';

const STATUS_VARIANTS = [
  'primary',
  'success',
  'warning',
  'error',
  'borrador',
  'presupuesto',
  'presupuesto-solid',
  'confirmado',
  'en-proceso',
  'en-produccion',
  'cancelado',
  'incidencia',
  'incidencia-solid',
  'pospuesto',
  'facturado',
  'facturado-muted',
] as const satisfies readonly JosanzStatusPillVariant[];

const meta: Meta<MainTemplateCardComponent> = {
  component: MainTemplateCardComponent,
  title: 'Josanz UI / Main Template Card',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Fila tipo tarjeta: superficie, borde y sombra del tema; pastilla de estado con tokens `--josanz-pill-*` (guía de flujo) o alias legacy `primary`…`error`. Soporta `leadingMark` para listados de clientes.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    title: { control: 'text', description: 'Primera columna / título de la fila' },
    status: { control: 'text', description: 'Texto del badge' },
    statusVariant: sbRadio(STATUS_VARIANTS, 'Clave de pastilla o alias legacy'),
    leadingMark: { control: 'text', description: 'Iniciales o marca en círculo junto al título' },
    labels: { control: 'object', description: 'Etiquetas por celda (misma longitud que `data`)' },
    data: { control: 'object', description: 'Celdas adicionales (array de strings)' },
    ...sbShapeArgTypes,
  },
};

export default meta;
type Story = StoryObj<MainTemplateCardComponent>;

const cardTemplate = `
  <div class="max-w-4xl space-y-3 rounded-2xl p-6" style="background: var(--josanz-bg);">
    <josanz-main-template-card
      [title]="title"
      [status]="status"
      [statusVariant]="statusVariant"
      [leadingMark]="leadingMark"
      [labels]="labels"
      [data]="data"
      [shape]="shape"
      [customColor]="customColor"
    ></josanz-main-template-card>
  </div>
`;

export const Playground: Story = {
  args: {
    title: 'Facturación General',
    status: 'Pendiente',
    statusVariant: 'warning',
    leadingMark: '',
    shape: 'rounded',
    customColor: '',
    labels: ['Nº', 'Fecha', 'Cliente', 'Importe', 'Plazo'],
    data: ['INV-2026-004', '12/05/2026', 'Empresa SA', '1.250 €', '30 días'],
  },
  render: (args) => ({ props: args, template: cardTemplate }),
};

export const ClientRow: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Listado de clientes Figma con marca inicial y columnas etiquetadas.',
      },
    },
  },
  args: {
    title: 'NovaByte S.L.',
    leadingMark: 'NB',
    status: 'Activo',
    statusVariant: 'confirmado',
    labels: ['CIF', 'Ciudad', 'Email', 'Facturación'],
    data: ['B-12345678', 'Madrid', 'contacto@novabyte.es', '12.450 EUR'],
    shape: 'rounded',
  },
  render: (args) => ({ props: args, template: cardTemplate }),
};

export const StatusGrid: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: 'Alias legacy (`primary`…`error`) mapeados a la guía de pastillas.' },
    },
  },
  render: () => ({
    template: `
      <div class="max-w-4xl space-y-3 rounded-2xl p-6" style="background: var(--josanz-bg);">
        <josanz-main-template-card title="Factura A" status="En revisión" statusVariant="primary" [data]="['INV-001', '01/01/2026', 'Cliente X', '500 €', '15 días']"></josanz-main-template-card>
        <josanz-main-template-card title="Factura B" status="Cobrada" statusVariant="success" [data]="['INV-002', '02/02/2026', 'Cliente Y', '900 €', '0 días']"></josanz-main-template-card>
        <josanz-main-template-card title="Factura C" status="Pendiente" statusVariant="warning" [data]="['INV-003', '03/03/2026', 'Cliente Z', '120 €', '7 días']"></josanz-main-template-card>
        <josanz-main-template-card title="Factura D" status="Vencida" statusVariant="error" [data]="['INV-004', '04/04/2026', 'Cliente W', '2.000 €', '-5 días']"></josanz-main-template-card>
      </div>
    `,
  }),
};

export const UseCases: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Listados reales: clientes con marca inicial y facturas con columnas de negocio.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="max-w-5xl space-y-8 rounded-3xl p-6" style="background: var(--josanz-bg);">
        <section>
          <h4 class="mb-4 mt-0 text-sm font-black" style="color: var(--josanz-text);">Clientes</h4>
          <div class="space-y-3">
            <josanz-main-template-card title="NovaByte S.L." leadingMark="NB" status="Activo" statusVariant="confirmado" [labels]="['CIF', 'Ciudad', 'Email']" [data]="['B-12345678', 'Madrid', 'contacto@novabyte.es']"></josanz-main-template-card>
            <josanz-main-template-card title="Eventos del Sur" leadingMark="ES" status="Potencial" statusVariant="en-proceso" [labels]="['CIF', 'Ciudad', 'Email']" [data]="['B-55443322', 'Sevilla', 'ops@eventosur.es']"></josanz-main-template-card>
          </div>
        </section>
        <section>
          <h4 class="mb-4 mt-0 text-sm font-black" style="color: var(--josanz-text);">Facturación</h4>
          <div class="space-y-3">
            <josanz-main-template-card title="INV-2026-004" status="Pendiente" statusVariant="warning" [labels]="['Cliente', 'Importe', 'Vencimiento']" [data]="['NovaByte', '1.250 EUR', '12 días']"></josanz-main-template-card>
            <josanz-main-template-card title="INV-2026-003" status="Cobrada" statusVariant="facturado" [labels]="['Cliente', 'Importe', 'Vencimiento']" [data]="['Auralux', '8.900 EUR', '0 días']"></josanz-main-template-card>
          </div>
        </section>
      </div>
    `,
  }),
};

export const EstadosFlujo: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Claves explícitas: fondo suave + texto en tono oscuro; `facturado` = verde intenso + blanco.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="max-w-4xl space-y-3 rounded-2xl p-6" style="background: var(--josanz-bg);">
        <josanz-main-template-card title="ORD-1001" status="Borrador" statusVariant="borrador" [labels]="['Cliente','Importe','Fecha','Equipo']" [data]="['NovaByte','24.500 EUR','23/05','Taller']"></josanz-main-template-card>
        <josanz-main-template-card title="PRE-2044" status="En presupuesto" statusVariant="presupuesto" [labels]="['Cliente','Importe','Fecha','Equipo']" [data]="['Auralux','18.200 EUR','24/05','Comercial']"></josanz-main-template-card>
        <josanz-main-template-card title="PRE-2045" status="En presupuesto" statusVariant="presupuesto-solid" [labels]="['Cliente','Importe','Fecha','Equipo']" [data]="['Hotel Miramar','31.000 EUR','25/05','Ventas']"></josanz-main-template-card>
        <josanz-main-template-card title="EVT-3301" status="Confirmado" statusVariant="confirmado" [labels]="['Cliente','Importe','Fecha','Equipo']" [data]="['NovaByte','24.500 EUR','26/05','Eventos']"></josanz-main-template-card>
        <josanz-main-template-card title="ALB-8842" status="En proceso" statusVariant="en-proceso" [labels]="['Cliente','Importe','Fecha','Equipo']" [data]="['Logística Prado','8.400 EUR','27/05','Almacén']"></josanz-main-template-card>
        <josanz-main-template-card title="EVT-1900" status="Cancelado" statusVariant="cancelado" [labels]="['Cliente','Importe','Fecha','Equipo']" [data]="['Eventos Sur','0 EUR','28/05','Operaciones']"></josanz-main-template-card>
        <josanz-main-template-card title="STK-0451" status="Incidencia" statusVariant="incidencia" [labels]="['Cliente','Importe','Fecha','Equipo']" [data]="['Taller Norte','310 EUR','29/05','Stock']"></josanz-main-template-card>
        <josanz-main-template-card title="STK-0452" status="Incidencia" statusVariant="incidencia-solid" [labels]="['Cliente','Importe','Fecha','Equipo']" [data]="['Solaris Retail','1.200 EUR','30/05','Compras']"></josanz-main-template-card>
        <josanz-main-template-card title="RUTA-22" status="Pospuesto" statusVariant="pospuesto" [labels]="['Cliente','Importe','Fecha','Equipo']" [data]="['Hotel Miramar','4.600 EUR','31/05','Flota']"></josanz-main-template-card>
        <josanz-main-template-card title="INV-2026-004" status="Facturado" statusVariant="facturado" [labels]="['Cliente','Importe','Fecha','Equipo']" [data]="['NovaByte','1.250 EUR','01/06','Admin']"></josanz-main-template-card>
        <josanz-main-template-card title="INV-2026-005" status="Facturado" statusVariant="facturado-muted" [labels]="['Cliente','Importe','Fecha','Equipo']" [data]="['Auralux','8.900 EUR','02/06','Admin']"></josanz-main-template-card>
      </div>
    `,
  }),
};

