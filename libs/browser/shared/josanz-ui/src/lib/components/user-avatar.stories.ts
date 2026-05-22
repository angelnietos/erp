import { moduleMetadata } from '@storybook/angular';
import { RouterModule } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';
import type { Meta, StoryObj } from '@storybook/angular';
import { sbRadio, sbShapeArgTypes, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { UserAvatarComponent } from './user-avatar';

const meta: Meta<UserAvatarComponent> = {
  component: UserAvatarComponent,
  title: 'Josanz UI / User Avatar',
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [RouterModule.forRoot([])],
      providers: [{ provide: APP_BASE_HREF, useValue: '/' }],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Avatar con icono. Por defecto el fondo mezcla el color de marca con `surface`; borde e icono siguen la atmósfera. Con `link` navega a ajustes. `shape` y `customColor` alinean con `josanz-button`.',
        ),
      },
    },
    layout: 'centered',
  },
  argTypes: {
    size: sbRadio(['sm', 'lg'] as const, 'Tamaño del avatar'),
    link: { control: 'text', description: 'Ruta interna (vacío = decorativo)' },
    ariaLabel: { control: 'text', description: 'Etiqueta accesible cuando hay enlace' },
    ...sbShapeArgTypes,
  },
};

export default meta;
type Story = StoryObj<UserAvatarComponent>;

const avatarTemplate = `
  <div class="inline-block rounded-2xl border border-solid p-10" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
    <josanz-user-avatar
      [size]="size"
      [link]="link"
      [ariaLabel]="ariaLabel"
      [shape]="shape"
      [customColor]="customColor"
    ></josanz-user-avatar>
  </div>
`;

export const Playground: Story = {
  args: {
    size: 'lg',
    link: '',
    ariaLabel: 'Cuenta y ajustes',
    shape: 'rounded',
  },
  render: (args) => ({ props: args, template: avatarTemplate }),
};

export const LinkedToSettings: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Avatar navegable hacia `/settings`, como en la barra superior de la app.',
      },
    },
  },
  args: {
    size: 'sm',
    link: '/settings',
    ariaLabel: 'Abrir ajustes de cuenta',
    shape: 'pill',
  },
  render: (args) => ({ props: args, template: avatarTemplate }),
};

export const BrandAccent: Story = {
  args: {
    size: 'lg',
    shape: 'pill',
    customColor: '#635BFF',
    link: '',
    ariaLabel: 'Cuenta',
  },
  render: (args) => ({ props: args, template: avatarTemplate }),
};

export const Sizes: Story = {
  parameters: {
    controls: { disable: true },
    docs: { description: { story: 'Comparación directa `sm` vs `lg`.' } },
  },
  render: () => ({
    template: `
      <div class="flex max-w-xl items-center gap-12 rounded-3xl border border-solid p-10" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <div class="flex flex-col items-center gap-4">
          <span class="text-[10px] font-bold uppercase tracking-widest" style="color: var(--josanz-text-muted);">Large (lg)</span>
          <josanz-user-avatar size="lg"></josanz-user-avatar>
        </div>
        <div class="flex flex-col items-center gap-4">
          <span class="text-[10px] font-bold uppercase tracking-widest" style="color: var(--josanz-text-muted);">Small (sm)</span>
          <josanz-user-avatar size="sm" link="/settings"></josanz-user-avatar>
        </div>
      </div>
    `,
  }),
};
