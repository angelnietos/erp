import type { Meta, StoryObj } from '@storybook/angular';
import { UiTableComponent } from './table.component';

const meta: Meta<UiTableComponent> = {
  component: UiTableComponent,
  title: 'UiTableComponent',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<UiTableComponent>;

const sampleColumns = [
  { key: 'id', header: 'ID', width: '80px' },
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  { key: 'status', header: 'Status' },
];

const sampleData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Active' },
];

export const Default: Story = {
  args: {
    columns: sampleColumns,
    data: sampleData,
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-table [columns]="columns" [data]="data">
        <ng-template #cellTemplate let-item let-key="key">
          {{ item[key] }}
        </ng-template>
      </ui-table>
    `,
  }),
};

export const StripedVariant: Story = {
  args: {
    columns: sampleColumns,
    data: sampleData,
    variant: 'striped',
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-table [columns]="columns" [data]="data" [variant]="variant">
        <ng-template #cellTemplate let-item let-key="key">
          {{ item[key] }}
        </ng-template>
      </ui-table>
    `,
  }),
};

export const GlassVariant: Story = {
  args: {
    columns: sampleColumns,
    data: sampleData,
    variant: 'glass',
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-table [columns]="columns" [data]="data" [variant]="variant">
        <ng-template #cellTemplate let-item let-key="key">
          {{ item[key] }}
        </ng-template>
      </ui-table>
    `,
  }),
};

export const Empty: Story = {
  args: {
    columns: sampleColumns,
    data: [],
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-table [columns]="columns" [data]="data">
        <ng-template #cellTemplate let-item let-key="key">
          {{ item[key] }}
        </ng-template>
      </ui-table>
    `,
  }),
};
