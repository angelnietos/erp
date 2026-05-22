import type { Meta, StoryObj } from '@storybook/angular';
import { sbRadio, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { DetailCardComponent } from './detail-card';

const meta: Meta<DetailCardComponent> = {
  component: DetailCardComponent,
  title: 'Josanz UI / Detail Card',
  tags: ['autodocs'],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Tarjeta de detalle con imagen, título, subtítulo, descripción, badge y `tags`. Fondo, bordes y tipografías siguen la atmósfera activa; el badge de estado usa el color de marca con texto contrastado. Selector: `lib-detail-card`.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    title: { control: 'text', description: 'Título principal' },
    subtitle: { control: 'text', description: 'Subtítulo' },
    description: { control: 'text', description: 'Texto descriptivo' },
    badgeText: { control: 'text', description: 'Texto del badge' },
    imageUrl: { control: 'text', description: 'URL de imagen (opcional)' },
    shape: sbRadio(['rounded', 'pill', 'square'] as const, 'Override de shape'),
    customColor: { control: 'color', description: 'Color del badge' },
    tags: {
      control: 'object',
      description: 'Etiquetas (array de strings)',
    },
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
    shape: 'rounded',
    customColor: '',
    tags: ['Logística', 'Premium', 'Nacional'],
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="max-w-md p-4">
        <lib-detail-card
          [title]="title"
          [subtitle]="subtitle"
          [description]="description"
          [badgeText]="badgeText"
          [imageUrl]="imageUrl"
          [shape]="shape"
          [customColor]="customColor"
          [tags]="tags"
        ></lib-detail-card>
      </div>
    `,
  }),
};

export const UseCases: Story = {
  parameters: {
    docs: {
      description: { story: 'Perfil con imagen y tarjeta mínima sin imagen.' },
    },
  },
  render: () => ({
    template: `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-slate-100 max-w-5xl">
        <section class="flex flex-col gap-4">
          <h4 class="text-slate-500 text-xs font-bold uppercase tracking-widest">Con imagen</h4>
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
          <h4 class="text-slate-500 text-xs font-bold uppercase tracking-widest">Sin imagen</h4>
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
