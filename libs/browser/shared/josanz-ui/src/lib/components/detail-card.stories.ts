import type { Meta, StoryObj } from '@storybook/angular';
import { sbRadio, sbShapeArgTypes, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { DetailCardComponent } from './detail-card';

const meta: Meta<DetailCardComponent> = {
  component: DetailCardComponent,
  title: 'Josanz UI / Detail Card',
  tags: ['autodocs'],
  parameters: {
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
    data: { control: 'object', description: 'Datos secundarios (p. ej. ubicación)' },
    tags: { control: 'object', description: 'Etiquetas (array de strings)' },
    ...sbShapeArgTypes,
  },
};

export default meta;
type Story = StoryObj<DetailCardComponent>;

const detailCardTemplate = `
  <div class="max-w-md p-4">
    <lib-detail-card
      [title]="title"
      [subtitle]="subtitle"
      [description]="description"
      [badgeText]="badgeText"
      [imageUrl]="imageUrl"
      [data]="data"
      [tags]="tags"
      [shape]="shape"
      [customColor]="customColor"
    ></lib-detail-card>
  </div>
`;

export const Playground: Story = {
  args: {
    title: 'Juan Pérez',
    subtitle: 'Cliente VIP',
    description: 'Empresa líder en el sector logístico con más de 20 años de experiencia.',
    badgeText: 'Activo',
    imageUrl: 'https://i.pravatar.cc/150?u=juan',
    data: ['Madrid, España'],
    shape: 'rounded',
    customColor: '',
    tags: ['Logística', 'Premium', 'Nacional'],
  },
  render: (args) => ({ props: args, template: detailCardTemplate }),
};

export const WithoutImage: Story = {
  parameters: {
    docs: { description: { story: 'Ficha mínima sin imagen, útil para tareas internas o borradores.' } },
  },
  args: {
    title: 'Refactor UI Kit',
    subtitle: 'Frontend Team',
    description: 'Migración de componentes legacy a la nueva arquitectura Josanz UI.',
    badgeText: 'En curso',
    data: ['Sprint 12'],
    tags: ['Angular', 'Storybook', 'Design system'],
    shape: 'rounded',
  },
  render: (args) => ({ props: args, template: detailCardTemplate }),
};

export const UseCases: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Fichas de detalle por dominio: cliente con imagen, evento sin imagen y contacto interno.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="grid max-w-6xl grid-cols-1 gap-6 rounded-3xl p-6 lg:grid-cols-3" style="background: var(--josanz-bg);">
        <lib-detail-card
          title="NovaByte S.L."
          subtitle="Cliente premium"
          badgeText="Activo"
          description="Empresa tecnológica con contrato marco y facturación recurrente."
          [data]="['Madrid']"
          [tags]="['Tecnología', 'VIP', 'Nacional']"
          imageUrl="https://i.pravatar.cc/150?u=novabyte"
        ></lib-detail-card>
        <lib-detail-card
          title="Gala Primavera 2026"
          subtitle="Eventos del Sur"
          badgeText="Confirmado"
          description="Evento corporativo con montaje AV, catering y coordinación logística en Sevilla."
          [data]="['Sevilla']"
          [tags]="['Corporativo', 'AV', 'Catering']"
          customColor="#635BFF"
        ></lib-detail-card>
        <lib-detail-card
          title="Soporte Técnico"
          subtitle="Departamento interno"
          badgeText="SLA 99.9%"
          description="Equipo de infraestructura y mantenimiento de servidores críticos."
          [data]="['24/7']"
          [tags]="['IT', 'Soporte']"
          imageUrl="https://i.pravatar.cc/150?u=tech"
        ></lib-detail-card>
      </div>
    `,
  }),
};
