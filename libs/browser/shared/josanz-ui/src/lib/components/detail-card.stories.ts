import type { Meta, StoryObj } from '@storybook/angular';
import { DetailCardComponent } from './detail-card';
import { expect, within } from '@storybook/test';

const meta: Meta<DetailCardComponent> = {
  component: DetailCardComponent,
  title: 'DetailCardComponent',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<DetailCardComponent>;

export const ClientCard: Story = {
  args: {
    title: 'Juan Pérez',
    subtitle: 'Cliente Premium',
    description: 'Empresa de transportes especializada en logística nacional.',
    badgeText: 'Activo',
    tags: ['Logística', 'Nacional', 'VIP'],
    imageUrl: 'https://i.pravatar.cc/150?u=juan',
  },
};

export const ProjectCard: Story = {
  args: {
    title: 'Proyecto Alpha',
    subtitle: 'Departamento de Innovación',
    description: 'Desarrollo de nueva plataforma SaaS para gestión de flotas.',
    badgeText: 'En progreso',
    tags: ['SaaS', 'Innovación'],
  },
};

export const MinimalCard: Story = {
  args: {
    title: 'Título Simple',
    subtitle: 'Subtítulo Opcional',
  },
};
