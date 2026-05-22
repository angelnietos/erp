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
        <josanz-main-template-card title="Ejemplo" status="Borrador" statusVariant="borrador" [data]="['—','—','—','—']"></josanz-main-template-card>
        <josanz-main-template-card title="Ejemplo" status="En presupuesto" statusVariant="presupuesto" [data]="['—','—','—','—']"></josanz-main-template-card>
        <josanz-main-template-card title="Ejemplo" status="En presupuesto" statusVariant="presupuesto-solid" [data]="['—','—','—','—']"></josanz-main-template-card>
        <josanz-main-template-card title="Ejemplo" status="Confirmado" statusVariant="confirmado" [data]="['—','—','—','—']"></josanz-main-template-card>
        <josanz-main-template-card title="Ejemplo" status="En proceso" statusVariant="en-proceso" [data]="['—','—','—','—']"></josanz-main-template-card>
        <josanz-main-template-card title="Ejemplo" status="Cancelado" statusVariant="cancelado" [data]="['—','—','—','—']"></josanz-main-template-card>
        <josanz-main-template-card title="Ejemplo" status="Incidencia" statusVariant="incidencia" [data]="['—','—','—','—']"></josanz-main-template-card>
        <josanz-main-template-card title="Ejemplo" status="Incidencia" statusVariant="incidencia-solid" [data]="['—','—','—','—']"></josanz-main-template-card>
        <josanz-main-template-card title="Ejemplo" status="Pospuesto" statusVariant="pospuesto" [data]="['—','—','—','—']"></josanz-main-template-card>
        <josanz-main-template-card title="Ejemplo" status="Facturado" statusVariant="facturado" [data]="['—','—','—','—']"></josanz-main-template-card>
        <josanz-main-template-card title="Ejemplo" status="Facturado" statusVariant="facturado-muted" [data]="['—','—','—','—']"></josanz-main-template-card>
      </div>
    `,
  }),
};
