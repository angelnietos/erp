import type { Meta, StoryObj } from '@storybook/angular';
import { UiCardComponent } from './card.component';

const meta: Meta<UiCardComponent> = {
  component: UiCardComponent,
  title: 'UiCardComponent',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<UiCardComponent>;

export const Default: Story = {
  args: {
    title: 'Card Title',
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-card [title]="title">
        <p>This is the card content.</p>
      </ui-card>
    `,
  }),
};

export const WithFooter: Story = {
  args: {
    title: 'Card with Footer',
    footer: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-card [title]="title" [footer]="footer">
        <p>This card has a footer.</p>
        <div footer>
          <button>Action</button>
        </div>
      </ui-card>
    `,
  }),
};

export const Interactive: Story = {
  args: {
    title: 'Interactive Card',
    interactive: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-card [title]="title" [interactive]="interactive">
        <p>Click me!</p>
      </ui-card>
    `,
  }),
};

export const PrimaryColor: Story = {
  args: {
    title: 'Primary Card',
    color: 'primary',
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-card [title]="title" [color]="color">
        <p>Primary colored card.</p>
      </ui-card>
    `,
  }),
};

export const GlassShape: Story = {
  args: {
    title: 'Glass Card',
    shape: 'glass',
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-card [title]="title" [shape]="shape">
        <p>Glass shaped card.</p>
      </ui-card>
    `,
  }),
};

export const MinimalShape: Story = {
  args: {
    title: 'Minimal Card',
    shape: 'minimal',
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-card [title]="title" [shape]="shape">
        <p>Minimal card.</p>
      </ui-card>
    `,
  }),
};
