import type { Meta, StoryObj } from '@storybook/angular';
import { UiFeatureGridComponent } from './feature-grid.component';

const meta: Meta<UiFeatureGridComponent> = {
  component: UiFeatureGridComponent,
  title: 'UiFeatureGridComponent',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<UiFeatureGridComponent>;

export const Default: Story = {
  args: {
    columns: 'repeat(auto-fill, minmax(300px, 1fr))',
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-feature-grid [columns]="columns">
        <div style="background: var(--surface); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-soft);">
          <h4>Item 1</h4>
          <p>Content for item 1</p>
        </div>
        <div style="background: var(--surface); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-soft);">
          <h4>Item 2</h4>
          <p>Content for item 2</p>
        </div>
        <div style="background: var(--surface); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-soft);">
          <h4>Item 3</h4>
          <p>Content for item 3</p>
        </div>
      </ui-feature-grid>
    `,
  }),
};

export const TwoColumns: Story = {
  args: {
    columns: 'repeat(2, 1fr)',
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-feature-grid [columns]="columns">
        <div style="background: var(--surface); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-soft);">
          <h4>Left Item</h4>
          <p>Content on the left</p>
        </div>
        <div style="background: var(--surface); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-soft);">
          <h4>Right Item</h4>
          <p>Content on the right</p>
        </div>
      </ui-feature-grid>
    `,
  }),
};
