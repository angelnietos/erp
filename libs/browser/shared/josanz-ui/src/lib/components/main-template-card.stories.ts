import type { Meta, StoryObj } from '@storybook/angular';
import { sbRadio, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { MainTemplateCardComponent } from './main-template-card';

const meta: Meta<MainTemplateCardComponent> = {
  component: MainTemplateCardComponent,
  title: 'Josanz UI / Main Template Card',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Fila tipo tarjeta: superficie, borde y sombra del tema; badge con contraste automático (`josanzReadableOnSolid`) según variante.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    title: { control: 'text', description: 'Primera columna / título de la fila' },
    status: { control: 'text', description: 'Texto del badge' },
    statusVariant: sbRadio(['primary', 'success', 'warning', 'error'] as const, 'Semántica del color del badge'),
    data: {
      control: 'object',
      description: 'Celdas adicionales (array de strings), en orden de columnas',
    },
  },
};

export default meta;

type Story = StoryObj<MainTemplateCardComponent>;

export const Playground: Story = {
  args: {
    title: 'Facturación General',
    status: 'Pendiente',
    statusVariant: 'warning',
    data: ['INV-2026-004', '12/05/2026', 'Empresa SA', '1.250 €', '30 días'],
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="p-8 bg-slate-50 max-w-4xl space-y-3">
        <josanz-main-template-card
          [title]="title"
          [status]="status"
          [statusVariant]="statusVariant"
          [data]="data"
        ></josanz-main-template-card>
      </div>
    `,
  }),
};

export const StatusGrid: Story = {
  parameters: {
    docs: {
      description: { story: 'Las cuatro variantes de badge en filas de ejemplo.' },
    },
  },
  render: () => ({
    template: `
      <div class="p-8 bg-slate-50 space-y-3 max-w-4xl">
        <josanz-main-template-card
          title="Factura A"
          status="En revisión"
          statusVariant="primary"
          [data]="['INV-001', '01/01/2026', 'Cliente X', '500 €', '15 días']"
        ></josanz-main-template-card>
        <josanz-main-template-card
          title="Factura B"
          status="Cobrada"
          statusVariant="success"
          [data]="['INV-002', '02/02/2026', 'Cliente Y', '900 €', '0 días']"
        ></josanz-main-template-card>
        <josanz-main-template-card
          title="Factura C"
          status="Pendiente"
          statusVariant="warning"
          [data]="['INV-003', '03/03/2026', 'Cliente Z', '120 €', '7 días']"
        ></josanz-main-template-card>
        <josanz-main-template-card
          title="Factura D"
          status="Vencida"
          statusVariant="error"
          [data]="['INV-004', '04/04/2026', 'Cliente W', '2.000 €', '-5 días']"
        ></josanz-main-template-card>
      </div>
    `,
  }),
};
