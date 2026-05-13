import type { Meta, StoryObj } from '@storybook/angular';
import { sbRadio } from '../../../.storybook/story-arg-types';
import { UserAvatarComponent } from './user-avatar';

const meta: Meta<UserAvatarComponent> = {
  component: UserAvatarComponent,
  title: 'Josanz UI / User Avatar',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Avatar circular con icono de usuario. `sm` (40px, barra superior) y `lg` (64px, placeholders más grandes).',
      },
    },
    layout: 'centered',
  },
  argTypes: {
    size: sbRadio(['sm', 'lg'] as const, 'Tamaño del avatar'),
  },
};

export default meta;
type Story = StoryObj<UserAvatarComponent>;

export const Playground: Story = {
  args: {
    size: 'lg',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="p-10 bg-slate-100 rounded-2xl inline-block">
        <josanz-user-avatar [size]="size"></josanz-user-avatar>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  parameters: {
    docs: { description: { story: 'Comparación directa `sm` vs `lg`.' } },
  },
  render: () => ({
    template: `
      <div class="flex items-center gap-12 p-10 bg-slate-50 rounded-3xl max-w-xl">
        <div class="flex flex-col items-center gap-4">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Large (lg)</span>
          <josanz-user-avatar size="lg"></josanz-user-avatar>
        </div>
        <div class="flex flex-col items-center gap-4">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Small (sm)</span>
          <josanz-user-avatar size="sm"></josanz-user-avatar>
        </div>
      </div>
    `,
  }),
};
