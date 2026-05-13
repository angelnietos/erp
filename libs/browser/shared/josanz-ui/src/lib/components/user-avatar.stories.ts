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
          'Avatar con icono. `shape` (`rounded` / `pill` / `square`) y `customColor` (fondo + icono) alinean con `josanz-button`.',
      },
    },
    layout: 'centered',
  },
  argTypes: {
    size: sbRadio(['sm', 'lg'] as const, 'Tamaño del avatar'),
    shape: sbRadio(['rounded', 'pill', 'square'] as const, 'Forma exterior'),
    customColor: { control: 'color', description: 'Color de fondo (el icono usa el mismo tono vía currentColor)' },
  },
};

export default meta;
type Story = StoryObj<UserAvatarComponent>;

export const Playground: Story = {
  args: {
    size: 'lg',
    shape: 'rounded',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="p-10 bg-slate-100 rounded-2xl inline-block">
        <josanz-user-avatar [size]="size" [shape]="shape" [customColor]="customColor"></josanz-user-avatar>
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
