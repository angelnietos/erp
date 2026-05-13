import type { Meta, StoryObj } from '@storybook/angular';
import { DetailCardComponent } from './detail-card';

const meta: Meta<DetailCardComponent> = {
  component: DetailCardComponent,
  title: 'Josanz UI / Detail Card',
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    description: { control: 'text' },
    badgeText: { control: 'text' },
    imageUrl: { control: 'text' },
    tags: { control: 'object' },
  },
};

export default meta;
type Story = StoryObj<DetailCardComponent>;

export const Playground: Story = {
  args: {
    title: 'Juan Pérez',
    subtitle: 'Cliente VIP',
    description: 'Empresa líder en el sector logístico con más de 20 años de experiencia.',
    badgeText: 'Activo',
    imageUrl: 'https://i.pravatar.cc/150?u=juan',
    tags: ['Logística', 'Premium', 'Nacional'],
  },
};

export const UseCases: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-slate-100">
        <section class="flex flex-col gap-4">
          <h4 class="text-slate-500 text-xs font-bold uppercase tracking-widest">Client Profile</h4>
          <lib-detail-card 
            title="Soporte Técnico" 
            subtitle="Departamento Interno" 
            badgeText="SLA 99.9%"
            description="Equipo responsable de la infraestructura crítica y mantenimiento de servidores."
            [tags]="['IT', 'Soporte', '24/7']"
            imageUrl="https://i.pravatar.cc/150?u=tech"
          ></lib-detail-card>
        </section>

        <section class="flex flex-col gap-4">
          <h4 class="text-slate-500 text-xs font-bold uppercase tracking-widest">Minimal Project</h4>
          <lib-detail-card 
            title="Refactor UI Kit" 
            subtitle="Frontend Team" 
            description="Migración de componentes legacy a la nueva arquitectura Josanz UI."
            [tags]="['Angular', 'Storybook']"
          ></lib-detail-card>
        </section>
      </div>
    `,
  }),
};
