import { moduleMetadata } from '@storybook/angular';
import { RouterModule } from '@angular/router';
import { APP_BASE_HREF, CommonModule } from '@angular/common';
import type { Meta, StoryObj } from '@storybook/angular';
import { SidebarComponent } from './sidebar';

const meta: Meta<SidebarComponent> = {
  component: SidebarComponent,
  title: 'Josanz UI / Sidebar',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Barra lateral de navegación con enlaces de router, nombre de usuario y rol. `isOpen` controla el ancho colapsado; el método `toggle()` alterna el estado (puedes enlazarlo desde el padre en la app).',
      },
    },
    layout: 'fullscreen',
  },
  decorators: [
    moduleMetadata({
      imports: [CommonModule, RouterModule],
      providers: [{ provide: APP_BASE_HREF, useValue: '/' }],
    }),
  ],
  argTypes: {
    userName: { control: 'text', description: 'Nombre mostrado' },
    userRole: { control: 'text', description: 'Rol o cargo' },
    isOpen: { control: 'boolean', description: 'Sidebar expandida (true) o colapsada (false)' },
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
  render: (args) => ({
    props: args,
    template: `
      <div class="h-[600px] w-full bg-slate-100 flex overflow-hidden rounded-3xl">
        <josanz-sidebar [userName]="userName" [userRole]="userRole" [isOpen]="isOpen"></josanz-sidebar>
        <div class="flex-1 p-8 text-slate-400 font-medium">
          Área de contenido (dashboard, listas, etc.)
        </div>
      </div>
    `,
  }),
};

export const Collapsed: Story = {
  parameters: {
    docs: { description: { story: 'Sidebar colapsada para más espacio de contenido.' } },
  },
  args: {
    userName: 'María García',
    userRole: 'Finanzas',
    isOpen: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="h-[600px] w-full bg-slate-100 flex overflow-hidden rounded-3xl">
        <josanz-sidebar [userName]="userName" [userRole]="userRole" [isOpen]="isOpen"></josanz-sidebar>
        <div class="flex-1 p-8 text-slate-500 text-sm">Contenido con sidebar estrecha.</div>
      </div>
    `,
  }),
};
