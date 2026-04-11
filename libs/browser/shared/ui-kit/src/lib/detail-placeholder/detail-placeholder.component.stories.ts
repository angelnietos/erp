import type { Meta, StoryObj } from '@storybook/angular';
import { DetailPlaceholderComponent } from './detail-placeholder.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

const meta: Meta<DetailPlaceholderComponent> = {
  component: DetailPlaceholderComponent,
  title: 'DetailPlaceholderComponent',
  tags: ['autodocs'],
  providers: [
    {
      provide: ActivatedRoute,
      useValue: {
        params: of({ id: '12345' }),
      },
    },
  ],
};
export default meta;
type Story = StoryObj<DetailPlaceholderComponent>;

export const Default: Story = {
  args: {},
  render: (args) => ({
    props: args,
    template: `<ui-detail-placeholder></ui-detail-placeholder>`,
  }),
};
