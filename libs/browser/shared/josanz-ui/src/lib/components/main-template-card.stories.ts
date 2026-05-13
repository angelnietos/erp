import type { Meta, StoryObj } from '@storybook/angular';
import { MainTemplateCardComponent } from './main-template-card';

const meta: Meta<MainTemplateCardComponent> = {
  component: MainTemplateCardComponent,
  title: 'Josanz UI / Main Template Card',
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text', description: 'Título / primera columna de la fila' },
    status: { control: 'text', description: 'Texto del badge de estado' },
    statusVariant: {
      control: 'radio',
      options: ['primary', 'success', 'warning', 'error'],
      description: 'Color del badge',
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
      <div class="p-8 bg-slate-50 space-y-2">
        <josanz-main-template-card
          [title]="title"
          [status]="status"
          [statusVariant]="statusVariant"
          [data]="data"
        ></josanz-main-template-card>
        <josanz-main-template-card
          title="Nóminas Marzo"
          status="Cobrada"
          statusVariant="success"
          [data]="['INV-2026-003', '01/03/2026', 'Autónomo SA', '890 €', '15 días']"
        ></josanz-main-template-card>
        <josanz-main-template-card
          title="Alquiler Oficina"
          status="Vencida"
          statusVariant="error"
          [data]="['INV-2026-001', '10/01/2026', 'Inmobiliaria XL', '2.100 €', '0 días']"
        ></josanz-main-template-card>
      </div>
    `,
  }),
};
