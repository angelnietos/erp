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
    docs: { description: { story: 'Ficha mínima sin imagen para entidades de negocio sin avatar: proveedor, activo o contrato.' } },
  },
  args: {
    title: 'Proveedor · Recambios Norte',
    subtitle: 'Cuenta logística',
    description: 'Suministro de filtros, pastillas de freno y piezas de alta rotación con SLA de 24h.',
    badgeText: 'Homologado',
    data: ['Madrid · 98 pedidos/año'],
    tags: ['Proveedor', 'SLA 24h', 'Stock crítico'],
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
          title="Vehículo VH-204"
          subtitle="Flota logística"
          badgeText="Incidencia"
          description="Furgón asignado a ruta sur con revisión pendiente de neumáticos."
          [data]="['Sevilla · 128.400 km']"
          [tags]="['Flota', 'Mantenimiento', 'Urgente']"
          customColor="var(--josanz-danger)"
        ></lib-detail-card>
      </div>
    `,
  }),
};

export const CrmRecordDense: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Ficha CRM densa para lateral de detalle: mezcla estado, metadatos y etiquetas operativas sin depender de una imagen.',
      },
    },
  },
  render: () => ({
    template: `
      <section class="max-w-xl rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <lib-detail-card
          title="Auralux Retail"
          subtitle="Cliente · Delegación Barcelona"
          badgeText="Riesgo medio"
          description="Cuenta con dos presupuestos abiertos, una factura vencida y contrato marco pendiente de renovar."
          [data]="['CIF B-77889900', 'Facturación YTD 42.300 EUR', 'Responsable: Laura Vidal']"
          [tags]="['Retail', 'Contrato marco', 'Factura vencida', 'Próxima llamada']"
          customColor="var(--josanz-warning)"
        ></lib-detail-card>
      </section>
    `,
  }),
};
