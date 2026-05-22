import { moduleMetadata } from '@storybook/angular';
import { RouterModule } from '@angular/router';
import { APP_BASE_HREF, CommonModule } from '@angular/common';
import type { Meta, StoryObj } from '@storybook/angular';
import { sbEmit, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { SidebarComponent } from './sidebar';

const shellTemplate = `
  <div class="flex h-[640px] w-full overflow-hidden rounded-3xl border border-solid" style="background: var(--josanz-bg); border-color: var(--josanz-border);">
    <josanz-sidebar
      [userName]="userName"
      [userRole]="userRole"
      [isOpen]="isOpen"
      (logoutClick)="logoutClick($event)"
    ></josanz-sidebar>
    <div class="flex-1 p-8">
      <h3 class="m-0 text-lg font-black" style="color: var(--josanz-text);">Área de contenido</h3>
      <p class="mt-2 text-sm" style="color: var(--josanz-text-muted);">
        Cambia <strong>isOpen</strong> para validar anchos 36px / 103px y contraste de iconos con Atmósfera + Marca.
      </p>
    </div>
  </div>
`;

const meta: Meta<SidebarComponent> = {
  component: SidebarComponent,
  title: 'Josanz UI / Sidebar',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Barra lateral con navegación principal, expand/collapse (`isOpen`) y logout. Superficie y bordes del tema; iconos en `textMuted`.',
        ),
      },
    },
    layout: 'fullscreen',
  },
  decorators: [
    moduleMetadata({
      imports: [CommonModule, RouterModule.forRoot([])],
      providers: [{ provide: APP_BASE_HREF, useValue: '/' }],
    }),
  ],
  argTypes: {
    userName: { control: 'text', description: 'Nombre mostrado' },
    userRole: { control: 'text', description: 'Rol o cargo' },
    isOpen: { control: 'boolean', description: 'Sidebar expandida (true) o colapsada (false)' },
    logoutClick: sbEmit('logoutClick', 'Cierre de sesión'),
  },
};

export default meta;
type Story = StoryObj<SidebarComponent>;

export const Playground: Story = {
  args: {
    userName: 'Juan Pérez',
    userRole: 'Administrador de Flota',
    isOpen: true,
  },
  render: (args) => ({ props: args, template: shellTemplate }),
};

export const Collapsed: Story = {
  parameters: {
    docs: { description: { story: 'Sidebar colapsada (36px) para más espacio de contenido.' } },
  },
  args: {
    userName: 'María García',
    userRole: 'Finanzas',
    isOpen: false,
  },
  render: (args) => ({ props: args, template: shellTemplate }),
};

export const NeutralWhite: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Combinación recomendada con atmósfera neutral y marca Josanz Negro (toolbar).',
      },
    },
    globals: {
      josanzAtmosphere: 'neutral',
      theme: 'light',
    },
  },
  args: {
    userName: 'Equipo Josanz',
    userRole: 'Operaciones',
    isOpen: true,
  },
  render: (args) => ({ props: args, template: shellTemplate }),
};
