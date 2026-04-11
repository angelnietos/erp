import type { Meta, StoryObj } from '@storybook/angular';
import { UIMascotComponent } from './mascot.component';

const meta: Meta<UIMascotComponent> = {
  component: UIMascotComponent,
  title: 'UIMascotComponent',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<UIMascotComponent>;

export const Default: Story = {
  args: {
    type: 'universal',
    personality: 'happy',
  },
  render: (args) => ({
    props: args,
    template: `<ui-mascot [type]="type" [personality]="personality" style="width: 120px; height: 120px;"></ui-mascot>`,
  }),
};

export const DashboardType: Story = {
  args: {
    type: 'dashboard',
    personality: 'happy',
    bodyShape: 'mushroom-cap',
  },
  render: (args) => ({
    props: args,
    template: `<ui-mascot [type]="type" [personality]="personality" [bodyShape]="bodyShape" style="width: 120px; height: 120px;"></ui-mascot>`,
  }),
};

export const InventoryType: Story = {
  args: {
    type: 'inventory',
    personality: 'tech',
    bodyShape: 'square',
  },
  render: (args) => ({
    props: args,
    template: `<ui-mascot [type]="type" [personality]="personality" [bodyShape]="bodyShape" style="width: 120px; height: 120px;"></ui-mascot>`,
  }),
};

export const ClientsType: Story = {
  args: {
    type: 'clients',
    personality: 'queen',
    bodyShape: 'round',
  },
  render: (args) => ({
    props: args,
    template: `<ui-mascot [type]="type" [personality]="personality" [bodyShape]="bodyShape" style="width: 120px; height: 120px;"></ui-mascot>`,
  }),
};

export const RageMode: Story = {
  args: {
    type: 'audit',
    personality: 'ninja',
    rageMode: true,
    rageStyle: 'terror',
  },
  render: (args) => ({
    props: args,
    template: `<ui-mascot [type]="type" [personality]="personality" [rageMode]="rageMode" [rageStyle]="rageStyle" style="width: 120px; height: 120px;"></ui-mascot>`,
  }),
};
