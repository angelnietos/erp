import type { Meta, StoryObj } from '@storybook/angular';
import { bindStoryProps } from '../../../../.storybook/bind-story-props';
import { sbSelect, sbHideData } from '../../../../.storybook/story-arg-types';
import { UiFeatureCardComponent } from './feature-card.component';

const meta: Meta<UiFeatureCardComponent> = {
  component: UiFeatureCardComponent,
  title: 'UiFeatureCardComponent',
  tags: ['autodocs'],
  argTypes: {
    status: sbSelect(['active', 'warning', 'danger', 'offline'] as const, 'Estado avatar'),
    badgeVariant: sbSelect(
      ['primary', 'secondary', 'success', 'warning', 'danger', 'info'] as const,
      'Badge',
    ),
    isFavorite: { control: 'boolean' },
    showEdit: { control: 'boolean' },
    showDelete: { control: 'boolean' },
    showDuplicate: { control: 'boolean' },
    footerItems: sbHideData,
  },
};
export default meta;
type Story = StoryObj<UiFeatureCardComponent>;

export const Default: Story = {
  args: {
    name: 'Project Alpha',
    subtitle: 'Active Project',
    avatarInitials: 'PA',
  },
  render: (args) => ({
    props: bindStoryProps(args),
    template: `
      <ui-feature-card
        [name]="name"
        [subtitle]="subtitle"
        [avatarInitials]="avatarInitials"
        (cardClicked)="onCardClicked()"
      >
        <p>This is the card content for Project Alpha.</p>
      </ui-feature-card>
    `,
  }),
};

export const WithBadge: Story = {
  args: {
    name: 'Client Beta',
    subtitle: 'Premium Client',
    avatarInitials: 'CB',
    badgeLabel: 'Premium',
    badgeVariant: 'primary',
  },
  render: (args) => ({
    props: bindStoryProps(args),
    template: `
      <ui-feature-card
        [name]="name"
        [subtitle]="subtitle"
        [avatarInitials]="avatarInitials"
        [badgeLabel]="badgeLabel"
        [badgeVariant]="badgeVariant"
        (cardClicked)="onCardClicked()"
      >
        <p>Premium client with special features.</p>
      </ui-feature-card>
    `,
  }),
};

export const WithFooter: Story = {
  args: {
    name: 'Task Gamma',
    subtitle: 'In Progress',
    avatarInitials: 'TG',
    footerItems: [
      { icon: 'calendar', label: 'Due: Tomorrow' },
      { icon: 'user', label: 'Assigned to: John' },
    ],
    showEdit: true,
    showDelete: true,
  },
  render: (args) => ({
    props: bindStoryProps(args),
    template: `
      <ui-feature-card
        [name]="name"
        [subtitle]="subtitle"
        [avatarInitials]="avatarInitials"
        [footerItems]="footerItems"
        [showEdit]="showEdit"
        [showDelete]="showDelete"
        (cardClicked)="onCardClicked()"
        (editClicked)="onEditClicked()"
        (deleteClicked)="onDeleteClicked()"
      >
        <p>Task description goes here.</p>
      </ui-feature-card>
    `,
  }),
};

export const Favorite: Story = {
  args: {
    name: 'Favorite Item',
    subtitle: 'Marked as favorite',
    avatarInitials: 'FI',
    isFavorite: true,
  },
  render: (args) => ({
    props: bindStoryProps(args),
    template: `
      <ui-feature-card
        [name]="name"
        [subtitle]="subtitle"
        [avatarInitials]="avatarInitials"
        [isFavorite]="isFavorite"
        (cardClicked)="onCardClicked()"
      >
        <p>This item is marked as favorite.</p>
      </ui-feature-card>
    `,
  }),
};
