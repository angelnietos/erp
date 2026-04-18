import type { Meta, StoryObj } from '@storybook/angular';
import { bindStoryProps } from '../../../../.storybook/bind-story-props';
import { UiFeatureHeaderComponent } from './feature-header.component';

const meta: Meta<UiFeatureHeaderComponent> = {
  component: UiFeatureHeaderComponent,
  title: 'UiFeatureHeaderComponent',
  tags: ['autodocs'],
  argTypes: {
    icon: { control: 'text', description: 'Nombre de icono Lucide' },
    actionIcon: { control: 'text' },
  },
};
export default meta;
type Story = StoryObj<UiFeatureHeaderComponent>;

export const Default: Story = {
  args: {
    layout: 'card',
    title: 'Dashboard',
    subtitle: 'Overview of your system',
    icon: 'layout',
  },
  render: (args) => ({
    props: bindStoryProps(args),
    template: `<ui-feature-header [layout]="layout" [title]="title" [subtitle]="subtitle" [icon]="icon" (actionClicked)="onActionClicked()"></ui-feature-header>`,
  }),
};

export const WithAction: Story = {
  args: {
    layout: 'card',
    title: 'Projects',
    subtitle: 'Manage your projects',
    icon: 'folder',
    actionLabel: 'New Project',
    actionIcon: 'plus',
  },
  render: (args) => ({
    props: bindStoryProps(args),
    template: `<ui-feature-header [layout]="layout" [title]="title" [subtitle]="subtitle" [icon]="icon" [actionLabel]="actionLabel" [actionIcon]="actionIcon" (actionClicked)="onActionClicked()"></ui-feature-header>`,
  }),
};

export const Clients: Story = {
  args: {
    layout: 'card',
    title: 'Clients',
    subtitle: 'Client management',
    icon: 'users',
    actionLabel: 'Add Client',
    actionIcon: 'user-plus',
  },
  render: (args) => ({
    props: bindStoryProps(args),
    template: `<ui-feature-header [layout]="layout" [title]="title" [subtitle]="subtitle" [icon]="icon" [actionLabel]="actionLabel" [actionIcon]="actionIcon" (actionClicked)="onActionClicked()"></ui-feature-header>`,
  }),
};

export const PageHero: Story = {
  args: {
    layout: 'pageHero',
    title: 'Sistema de Reportes',
    breadcrumbLead: 'ANÁLISIS Y REPORTING',
    breadcrumbTail: 'INFORMES EJECUTIVOS',
  },
  render: (args) => ({
    props: bindStoryProps(args),
    template: `<ui-feature-header
      [layout]="layout"
      [title]="title"
      [breadcrumbLead]="breadcrumbLead"
      [breadcrumbTail]="breadcrumbTail"
    ></ui-feature-header>`,
  }),
};
