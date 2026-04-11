import type { Meta, StoryObj } from '@storybook/angular';
import { UiPaginationComponent } from './pagination.component';

const meta: Meta<UiPaginationComponent> = {
  component: UiPaginationComponent,
  title: 'UiPaginationComponent',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<UiPaginationComponent>;

export const Default: Story = {
  args: {
    currentPage: 1,
    totalPages: 10,
  },
  render: (args) => ({
    props: args,
    template: `<ui-pagination [currentPage]="currentPage" [totalPages]="totalPages" (pageChange)="onPageChange($event)"></ui-pagination>`,
  }),
};

export const MiddlePage: Story = {
  args: {
    currentPage: 5,
    totalPages: 10,
  },
  render: (args) => ({
    props: args,
    template: `<ui-pagination [currentPage]="currentPage" [totalPages]="totalPages" (pageChange)="onPageChange($event)"></ui-pagination>`,
  }),
};

export const LastPage: Story = {
  args: {
    currentPage: 10,
    totalPages: 10,
  },
  render: (args) => ({
    props: args,
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
    props: args,
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
    props: args,
    template: `<ui-pagination [currentPage]="currentPage" [totalPages]="totalPages" [variant]="variant" (pageChange)="onPageChange($event)"></ui-pagination>`,
  }),
};
