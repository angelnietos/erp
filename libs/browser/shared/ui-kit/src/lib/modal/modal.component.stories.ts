import type { Meta, StoryObj } from '@storybook/angular';
import { UiModalComponent } from './modal.component';

const meta: Meta<UiModalComponent> = {
  component: UiModalComponent,
  title: 'UiModalComponent',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<UiModalComponent>;

export const Default: Story = {
  args: {
    isOpen: true,
    title: 'Modal Title',
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-modal [isOpen]="isOpen" [title]="title" (closed)="onClosed()">
        <p>This is the modal content.</p>
        <div modal-footer>
          <button (click)="onClosed()">Close</button>
        </div>
      </ui-modal>
    `,
  }),
};

export const WithoutFooter: Story = {
  args: {
    isOpen: true,
    title: 'No Footer Modal',
    showFooter: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-modal [isOpen]="isOpen" [title]="title" [showFooter]="showFooter" (closed)="onClosed()">
        <p>This modal has no footer.</p>
      </ui-modal>
    `,
  }),
};

export const DangerColor: Story = {
  args: {
    isOpen: true,
    title: 'Danger Modal',
    color: 'danger',
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-modal [isOpen]="isOpen" [title]="title" [color]="color" (closed)="onClosed()">
        <p>Danger modal content.</p>
        <div modal-footer>
          <button (click)="onClosed()">OK</button>
        </div>
      </ui-modal>
    `,
  }),
};

export const GlassShape: Story = {
  args: {
    isOpen: true,
    title: 'Glass Modal',
    shape: 'glass',
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-modal [isOpen]="isOpen" [title]="title" [shape]="shape" (closed)="onClosed()">
        <p>Glass shaped modal.</p>
        <div modal-footer>
          <button (click)="onClosed()">Close</button>
        </div>
      </ui-modal>
    `,
  }),
};

export const MinimalShape: Story = {
  args: {
    isOpen: true,
    title: 'Minimal Modal',
    shape: 'minimal',
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-modal [isOpen]="isOpen" [title]="title" [shape]="shape" (closed)="onClosed()">
        <p>Minimal modal.</p>
        <div modal-footer>
          <button (click)="onClosed()">OK</button>
        </div>
      </ui-modal>
    `,
  }),
};
