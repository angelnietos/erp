import type { Meta, StoryObj } from '@storybook/angular';
import { bindStoryProps } from '../../../../.storybook/bind-story-props';
import { UiFeatureHeaderComponent } from './feature-header.component';

const meta: Meta<UiFeatureHeaderComponent> = {
  component: UiFeatureHeaderComponent,
  title: 'UiFeatureHeaderComponent',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<UiFeatureHeaderComponent>;

export const Default: Story = {
  args: {
    title: 'Dashboard',
    subtitle: 'Overview of your system',
    icon: 'layout',
  },
  render: (args) => ({
    props: bindStoryProps(args),
    template: `<ui-feature-header [title]="title" [subtitle]="subtitle" [icon]="icon" (actionClicked)="onActionClicked()"></ui-feature-header>`,
  }),
};

export const WithAction: Story = {
  args: {
    title: 'Projects',
    subtitle: 'Manage your projects',
    icon: 'folder',
    actionLabel: 'New Project',
    actionIcon: 'plus',
  },
  render: (args) => ({
    props: bindStoryProps(args),
    template: `<ui-feature-header [title]="title" [subtitle]="subtitle" [icon]="icon" [actionLabel]="actionLabel" [actionIcon]="actionIcon" (actionClicked)="onActionClicked()"></ui-feature-header>`,
  }),
};

export const Clients: Story = {
  args: {
    title: 'Clients',
    subtitle: 'Client management',
    icon: 'users',
    actionLabel: 'Add Client',
    actionIcon: 'user-plus',
  },
  render: (args) => ({
    props: bindStoryProps(args),
    template: `<ui-feature-header [title]="title" [subtitle]="subtitle" [icon]="icon" [actionLabel]="actionLabel" [actionIcon]="actionIcon" (actionClicked)="onActionClicked()"></ui-feature-header>`,
  }),
};
