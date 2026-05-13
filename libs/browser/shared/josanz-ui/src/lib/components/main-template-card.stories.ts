import type { Meta, StoryObj } from '@storybook/angular';
import { MainTemplateCardComponent } from './main-template-card';

const meta: Meta<MainTemplateCardComponent> = {
  component: MainTemplateCardComponent,
  title: 'Josanz UI / Main Template Card',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<MainTemplateCardComponent>;

export const Playground: Story = {
  args: {
    title: 'Información de Contacto',
    data: [
      { label: 'Teléfono', value: '+34 600 000 000' },
      { label: 'Email', value: 'contacto@josanz.com' },
      { label: 'Dirección', value: 'Calle Principal 123, Madrid' },
    ],
    status: 'Completado'
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="p-10 bg-slate-50 max-w-lg">
        <josanz-main-template-card 
          [title]="title" 
          [data]="data" 
          [status]="status"
        ></josanz-main-template-card>
      </div>
    `,
  }),
};
