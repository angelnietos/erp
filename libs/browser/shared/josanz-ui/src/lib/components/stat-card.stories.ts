import type { Meta, StoryObj } from '@storybook/angular';
import { sbRadio, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import {
  StatCardComponent,
  type JosanzStatIcon,
  type JosanzStatTone,
  type JosanzTrendDirection,
} from './stat-card';

const meta: Meta<StatCardComponent> = {
  component: StatCardComponent,
  title: 'Josanz UI / Stat Card',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Tarjeta KPI reutilizable para dashboards, módulos de negocio y paneles resumen. Usa tokens de tema, `shape`, tonos semánticos e iconografía común.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    eyebrow: { control: 'text', description: 'Contexto superior' },
    title: { control: 'text', description: 'Nombre del indicador' },
    value: { control: 'text', description: 'Valor principal' },
    caption: { control: 'text', description: 'Texto auxiliar inferior' },
    trendLabel: { control: 'text', description: 'Texto de variación' },
    trendDirection: sbRadio(['up', 'down', 'flat'] as readonly JosanzTrendDirection[], 'Dirección de tendencia'),
    tone: sbRadio(['primary', 'success', 'warning', 'danger', 'neutral', 'custom'] as readonly JosanzStatTone[], 'Tono semántico'),
    icon: sbRadio(['users', 'calendar', 'invoice', 'truck', 'trend', 'document'] as readonly JosanzStatIcon[], 'Icono'),
    shape: sbRadio(['rounded', 'pill', 'square'] as const, 'Override de shape'),
    customColor: { control: 'color', description: 'Color custom cuando `tone=custom` o para override visual' },
    ariaLabel: { control: 'text', description: 'Etiqueta accesible' },
  },
};

export default meta;
type Story = StoryObj<StatCardComponent>;

export const Playground: Story = {
  args: {
    eyebrow: 'Facturación',
    title: 'Pendiente de cobro',
    value: '24.500 EUR',
    caption: '8 facturas abiertas',
    trendLabel: '12%',
    trendDirection: 'up',
    tone: 'primary',
    icon: 'invoice',
    shape: 'rounded',
    customColor: '',
    ariaLabel: '',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="max-w-sm p-4" style="background: var(--josanz-bg);">
        <josanz-stat-card
          [eyebrow]="eyebrow"
          [title]="title"
          [value]="value"
          [caption]="caption"
          [trendLabel]="trendLabel"
          [trendDirection]="trendDirection"
          [tone]="tone"
          [icon]="icon"
          [shape]="shape"
          [customColor]="customColor"
          [ariaLabel]="ariaLabel"
        ></josanz-stat-card>
      </div>
    `,
  }),
};

export const UseCases: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'KPIs reales para dashboard multi-módulo: clientes, eventos, facturación y logística.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="grid max-w-6xl grid-cols-1 gap-5 p-4 sm:grid-cols-2 xl:grid-cols-4" style="background: var(--josanz-bg);">
        <josanz-stat-card
          eyebrow="Clientes"
          title="Activos"
          value="128"
          caption="12 nuevos este mes"
          trendLabel="9%"
          trendDirection="up"
          tone="success"
          icon="users"
        ></josanz-stat-card>
        <josanz-stat-card
          eyebrow="Eventos"
          title="Esta semana"
          value="12"
          caption="3 pendientes de equipo"
          trendLabel="2"
          trendDirection="flat"
          tone="primary"
          icon="calendar"
          customColor="#635BFF"
        ></josanz-stat-card>
        <josanz-stat-card
          eyebrow="Facturación"
          title="Vencidas"
          value="4.200 EUR"
          caption="2 facturas requieren revisión"
          trendLabel="18%"
          trendDirection="down"
          tone="danger"
          icon="invoice"
        ></josanz-stat-card>
        <josanz-stat-card
          eyebrow="Logística"
          title="Vehículos"
          value="7/9"
          caption="Disponibilidad operativa"
          trendLabel="OK"
          trendDirection="flat"
          tone="warning"
          icon="truck"
          shape="pill"
        ></josanz-stat-card>
      </div>
    `,
  }),
};

export const ShapeMatrix: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Comparativa de shapes para validar consistencia con el resto de controles.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="grid max-w-5xl grid-cols-1 gap-5 p-4 md:grid-cols-3" style="background: var(--josanz-bg);">
        <josanz-stat-card title="Rounded" value="36" caption="Shape por defecto" icon="trend" shape="rounded"></josanz-stat-card>
        <josanz-stat-card title="Pill" value="24" caption="Dashboards suaves" icon="document" shape="pill" customColor="#635BFF"></josanz-stat-card>
        <josanz-stat-card title="Square" value="12" caption="Backoffice denso" icon="invoice" shape="square" tone="neutral"></josanz-stat-card>
      </div>
    `,
  }),
};
