import type { Meta, StoryObj } from '@storybook/angular';
import { UiResourceMonitorComponent } from './resource-monitor.component';

const meta: Meta<UiResourceMonitorComponent> = {
  component: UiResourceMonitorComponent,
  title: 'UiResourceMonitorComponent',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<UiResourceMonitorComponent>;

const sampleItems = [
  {
    id: 'cpu',
    name: 'CPU',
    status: 'ok' as const,
    value: 45,
    label: '45%',
    icon: 'cpu',
  },
  {
    id: 'memory',
    name: 'Memory',
    status: 'warning' as const,
    value: 78,
    label: '78%',
    icon: 'hard-drive',
  },
  {
    id: 'disk',
    name: 'Disk',
    status: 'ok' as const,
    value: 32,
    label: '32%',
    icon: 'database',
  },
  {
    id: 'network',
    name: 'Network',
    status: 'error' as const,
    value: 95,
    label: '95%',
    icon: 'wifi',
  },
];

export const Default: Story = {
  args: {
    title: 'System Monitor',
    items: sampleItems,
  },
  render: (args) => ({
    props: args,
    template: `<ui-resource-monitor [title]="title" [items]="items"></ui-resource-monitor>`,
  }),
};

export const AllOk: Story = {
  args: {
    title: 'All Systems OK',
    items: [
      {
        id: 'cpu',
        name: 'CPU',
        status: 'ok' as const,
        value: 25,
        label: '25%',
        icon: 'cpu',
      },
      {
        id: 'memory',
        name: 'Memory',
        status: 'ok' as const,
        value: 60,
        label: '60%',
        icon: 'hard-drive',
      },
      {
        id: 'disk',
        name: 'Disk',
        status: 'ok' as const,
        value: 40,
        label: '40%',
        icon: 'database',
      },
    ],
  },
  render: (args) => ({
    props: args,
    template: `<ui-resource-monitor [title]="title" [items]="items"></ui-resource-monitor>`,
  }),
};

export const Critical: Story = {
  args: {
    title: 'Critical Alert',
    items: [
      {
        id: 'cpu',
        name: 'CPU',
        status: 'error' as const,
        value: 98,
        label: '98%',
        icon: 'cpu',
      },
      {
        id: 'memory',
        name: 'Memory',
        status: 'error' as const,
        value: 92,
        label: '92%',
        icon: 'hard-drive',
      },
    ],
  },
  render: (args) => ({
    props: args,
    template: `<ui-resource-monitor [title]="title" [items]="items"></ui-resource-monitor>`,
  }),
};
