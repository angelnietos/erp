import type { Meta, StoryObj } from '@storybook/angular';
import { bindStoryProps } from '../../../.storybook/bind-story-props';
import { sbSelect } from '../../../.storybook/story-arg-types';
import { UiPaginationComponent } from './pagination.component';

const meta: Meta<UiPaginationComponent> = {
  component: UiPaginationComponent,
  title: 'UiPaginationComponent',
  tags: ['autodocs'],
  argTypes: {
    variant: sbSelect(['default', 'minimal', 'glass'] as const, 'Estilo'),
    currentPage: { control: { type: 'number', min: 1 } },
    totalPages: { control: { type: 'number', min: 1 } },
  },
};
export default meta;
type Story = StoryObj<UiPaginationComponent>;

export const Default: Story = {
  args: {
    currentPage: 1,
    totalPages: 10,
  },
  render: (args) => ({
    props: bindStoryProps(args),
    template: `<ui-pagination [currentPage]="currentPage" [totalPages]="totalPages" (pageChange)="onPageChange($event)"></ui-pagination>`,
  }),
};

export const MiddlePage: Story = {
  args: {
    currentPage: 5,
    totalPages: 10,
  },
  render: (args) => ({
    props: bindStoryProps(args),
    template: `<ui-pagination [currentPage]="currentPage" [totalPages]="totalPages" (pageChange)="onPageChange($event)"></ui-pagination>`,
  }),
};

export const LastPage: Story = {
  args: {
    currentPage: 10,
    totalPages: 10,
  },
  render: (args) => ({
    props: bindStoryProps(args),
    template: `<ui-pagination [currentPage]="currentPage" [totalPages]="totalPages" (pageChange)="onPageChange($event)"></ui-pagination>`,
  }),
};

export const MinimalVariant: Story = {
  args: {
    currentPage: 3,
    totalPages: 8,
    variant: 'minimal',
  },
  render: (args) => ({
    props: bindStoryProps(args),
    template: `<ui-pagination [currentPage]="currentPage" [totalPages]="totalPages" [variant]="variant" (pageChange)="onPageChange($event)"></ui-pagination>`,
  }),
};

export const GlassVariant: Story = {
  args: {
    currentPage: 2,
    totalPages: 7,
    variant: 'glass',
  },
  render: (args) => ({
    props: bindStoryProps(args),
    template: `<ui-pagination [currentPage]="currentPage" [totalPages]="totalPages" [variant]="variant" (pageChange)="onPageChange($event)"></ui-pagination>`,
  }),
};
