import { moduleMetadata } from '@storybook/angular';
import { RouterModule } from '@angular/router';
import { APP_BASE_HREF, CommonModule } from '@angular/common';
import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
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
        Cambia <strong>isOpen</strong> para validar anchos 36px / 132px y contraste de iconos con Atmósfera + Marca.
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

export const UseCases: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Shell de aplicación: sidebar expandida vs colapsada con área de contenido representativa.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="grid gap-6 p-4 lg:grid-cols-2" style="background: var(--josanz-bg);">
        <div class="flex h-[520px] overflow-hidden rounded-3xl border border-solid" style="border-color: var(--josanz-border);">
          <josanz-sidebar userName="Lucía Martín" userRole="Operaciones" [isOpen]="true"></josanz-sidebar>
          <div class="flex-1 p-6">
            <p class="m-0 text-[10px] font-black uppercase tracking-[0.18em]" style="color: var(--josanz-text-muted);">Expandida · 132px</p>
            <h3 class="m-0 mt-2 text-xl font-black" style="color: var(--josanz-text);">Inicio</h3>
            <p class="mt-2 text-sm" style="color: var(--josanz-text-muted);">Navegación con etiquetas visibles.</p>
          </div>
        </div>
        <div class="flex h-[520px] overflow-hidden rounded-3xl border border-solid" style="border-color: var(--josanz-border);">
          <josanz-sidebar userName="Lucía Martín" userRole="Operaciones" [isOpen]="false"></josanz-sidebar>
          <div class="flex-1 p-6">
            <p class="m-0 text-[10px] font-black uppercase tracking-[0.18em]" style="color: var(--josanz-text-muted);">Colapsada · 36px</p>
            <h3 class="m-0 mt-2 text-xl font-black" style="color: var(--josanz-text);">Listado de clientes</h3>
            <p class="mt-2 text-sm" style="color: var(--josanz-text-muted);">Más espacio para tablas y tarjetas.</p>
          </div>
        </div>
      </div>
    `,
  }),
};

export const InteractiveToggle: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Pulsa el botón de expandir/contraer y valida el cambio de ancho de la sidebar.',
      },
    },
  },
  args: {
    userName: 'Admin Josanz',
    userRole: 'Administrador',
    isOpen: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="flex h-[640px] w-full overflow-hidden rounded-3xl border border-solid" style="background: var(--josanz-bg); border-color: var(--josanz-border);">
        <josanz-sidebar
          [userName]="userName"
          [userRole]="userRole"
          [isOpen]="isOpen"
          (logoutClick)="logoutClick($event)"
        ></josanz-sidebar>
        <div class="flex-1 p-8">
          <p class="m-0 text-sm font-bold" style="color: var(--josanz-text);">Sidebar interactiva</p>
          <p class="mt-2 text-sm" style="color: var(--josanz-text-muted);">Pulsa el chevron para expandir o contraer el menú.</p>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: /expandir menú/i });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(toggle);
    await expect(canvas.getByRole('button', { name: /contraer menú/i })).toHaveAttribute('aria-expanded', 'true');
  },
};

export const InteractiveLogout: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Pulsa la acción de salir y valida que la sidebar emite `logoutClick`.',
      },
    },
  },
  args: {
    userName: 'Admin Josanz',
    userRole: 'Administrador',
    isOpen: true,
    logoutClick: fn(),
  },
  render: (args) => ({ props: args, template: shellTemplate }),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Salir' }));
    await expect(args.logoutClick).toHaveBeenCalledTimes(1);
  },
};
