import type { Meta, StoryObj } from '@storybook/angular';
import { UiFeatureHeaderComponent } from './feature-header.component';

const meta: Meta<UiFeatureHeaderComponent> = {
  component: UiFeatureHeaderComponent,
  title: 'UI Kit / Feature Header',
  tags: ['autodocs'],
  argTypes: {
    layout: { control: { type: 'select', options: ['card', 'pageHero'] }, description: 'Diseño del header' },
    breadcrumbLead: { control: 'text', description: 'Texto principal del breadcrumb' },
    breadcrumbTail: { control: 'text', description: 'Texto secundario del breadcrumb' },
    title: { control: 'text', description: 'Título principal' },
    subtitle: { control: 'text', description: 'Subtítulo' },
    icon: { control: 'text', description: 'Icono (lucide)' },
    iconBackground: { control: 'text', description: 'Fondo del icono' },
    actionLabel: { control: 'text', description: 'Texto del botón de acción' },
    actionIcon: { control: 'text', description: 'Icono del botón de acción' },
  },
};
export default meta;
type Story = StoryObj<UiFeatureHeaderComponent>;

export const PageHero: Story = {
  args: {
    layout: 'pageHero',
    breadcrumbLead: 'Dashboard',
    breadcrumbTail: 'Reportes',
    title: 'Reportes de Ventas',
    subtitle: 'Analítica avanzada y métricas de rendimiento en tiempo real',
    actionLabel: 'Nuevo Reporte',
    actionIcon: 'CirclePlus',
  },
};

export const PageHeroNoBreadcrumb: Story = {
  args: {
    layout: 'pageHero',
    title: 'Panel de Control',
    subtitle: 'Bienvenido de nuevo, aquí tienes un resumen de tu actividad reciente',
    actionLabel: 'Configurar',
    actionIcon: 'Settings',
  },
};

export const PageHeroNoAction: Story = {
  args: {
    layout: 'pageHero',
    breadcrumbLead: 'Módulos',
    breadcrumbTail: 'Ventas',
    title: 'Gestión de Ventas',
    subtitle: 'Administra todas las transacciones y pedidos del sistema',
  },
};

export const Card: Story = {
  args: {
    layout: 'card',
    title: 'Ventas del Mes',
    subtitle: 'Resumen de transacciones completadas',
    icon: 'dollar-sign',
    iconBackground: 'linear-gradient(135deg, #10b981, #059669)',
    actionLabel: 'Ver Detalles',
    actionIcon: 'ArrowRight',
  },
};

export const CardNoAction: Story = {
  args: {
    layout: 'card',
    title: 'Estadísticas',
    subtitle: 'Métricas generales del sistema',
    icon: 'bar-chart-2',
    iconBackground: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
  },
};

export const CardUsers: Story = {
  args: {
    layout: 'card',
    title: 'Usuarios Activos',
    subtitle: '1,284 usuarios conectados este mes',
    icon: 'users',
    iconBackground: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    actionLabel: 'Gestionar',
    actionIcon: 'UserPlus',
  },
};

export const CardAlerts: Story = {
  args: {
    layout: 'card',
    title: 'Alertas del Sistema',
    subtitle: '3 alertas críticas requieren atención inmediata',
    icon: 'alert-triangle',
    iconBackground: 'linear-gradient(135deg, #ef4444, #dc2626)',
    actionLabel: 'Revisar',
    actionIcon: 'AlertCircle',
  },
};

export const CardInventory: Story = {
  args: {
    layout: 'card',
    title: 'Inventario',
    subtitle: '45 productos con stock bajo requieren reposición',
    icon: 'package',
    iconBackground: 'linear-gradient(135deg, #f59e0b, #d97706)',
    actionLabel: 'Reponer',
    actionIcon: 'Plus',
  },
};

export const CardWithCustomActions: Story = {
  args: {
    layout: 'card',
    title: 'Proyectos Recientes',
    subtitle: '5 proyectos en desarrollo activo',
    icon: 'folder',
    iconBackground: 'linear-gradient(135deg, #06b6d4, #0891b2)',
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-feature-header
        [layout]="layout"
        [title]="title"
        [subtitle]="subtitle"
        [icon]="icon"
        [iconBackground]="iconBackground"
      >
        <div actions>
          <button style="padding: 0.5rem 1rem; background: var(--border-soft); border: none; border-radius: 6px; cursor: pointer;">Exportar</button>
          <button style="padding: 0.5rem 1rem; background: var(--brand); color: white; border: none; border-radius: 6px; cursor: pointer;">Nuevo</button>
        </div>
      </ui-feature-header>
    `,
  }),
};