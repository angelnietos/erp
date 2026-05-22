import type { Meta, StoryObj } from '@storybook/angular';
import { BabooniSidebarComponent } from './babooni-sidebar.component';
import { PluginStore } from '@josanz-erp/shared-data-access';
import { AuthStore } from '@josanz-erp/identity-data-access';
import { of } from 'rxjs';

const meta: Meta<BabooniSidebarComponent> = {
  component: BabooniSidebarComponent,
  title: 'Babooni UI / Sidebar',
  tags: ['autodocs'],
  decorators: [
    (story) => ({
      standalone: true,
      imports: [BabooniSidebarComponent],
      providers: [
        {
          provide: AuthStore,
          useValue: {
            user: () => ({ firstName: 'Juan', lastName: 'Pérez', email: 'juan@ejemplo.com', roles: ['admin'] }),
            logout: () => {}
          }
        },
        {
          provide: PluginStore,
          useValue: {
            enabledPlugins: () => ['dashboard', 'ai-insights', 'sales', 'inventory', 'hr', 'settings'],
            highPerformanceMode: () => false
          }
        }
      ],
      template: `
        <div style="background: var(--bg-primary); min-height: 100vh; display: flex;">
          <div style="width: 280px; background: var(--bg-secondary); border-right: 1px solid var(--border-soft);">
            <story />
          </div>
          <div style="flex: 1; padding: 2rem; color: var(--text-primary);">
            <p>Contenido principal (el sidebar está colapsado/expandido según el estado)</p>
          </div>
        </div>
      `
    })
  ],
};
export default meta;
type Story = StoryObj<BabooniSidebarComponent>;

export const Default: Story = {
  args: {}
};

export const Collapsed: Story = {
  args: {},
  decorators: [
    (story) => ({
      standalone: true,
      imports: [BabooniSidebarComponent],
      providers: [
        {
          provide: AuthStore,
          useValue: {
            user: () => ({ firstName: 'Juan', lastName: 'Pérez', email: 'juan@ejemplo.com', roles: ['admin'] }),
            logout: () => {}
          }
        },
        {
          provide: PluginStore,
          useValue: {
            enabledPlugins: () => ['dashboard', 'ai-insights', 'sales', 'inventory', 'hr', 'settings'],
            highPerformanceMode: () => false
          }
        }
      ],
      template: `
        <div style="background: var(--bg-primary); min-height: 100vh; display: flex;">
          <div style="width: 80px; background: var(--bg-secondary); border-right: 1px solid var(--border-soft);">
            <story />
          </div>
          <div style="flex: 1; padding: 2rem; color: var(--text-primary);">
            <p>Sidebar colapsado - solo iconos visibles</p>
          </div>
        </div>
      `
    })
  ]
};

export const LimitedPlugins: Story = {
  args: {},
  decorators: [
    (story) => ({
      standalone: true,
      imports: [BabooniSidebarComponent],
      providers: [
        {
          provide: AuthStore,
          useValue: {
            user: () => ({ firstName: 'Usuario', lastName: 'Normal', email: 'user@ejemplo.com', roles: ['user'] }),
            logout: () => {}
          }
        },
        {
          provide: PluginStore,
          useValue: {
            enabledPlugins: () => ['dashboard'],
            highPerformanceMode: () => false
          }
        }
      ],
      template: `
        <div style="background: var(--bg-primary); min-height: 100vh; display: flex;">
          <div style="width: 280px; background: var(--bg-secondary); border-right: 1px solid var(--border-soft);">
            <story />
          </div>
          <div style="flex: 1; padding: 2rem; color: var(--text-primary);">
            <p>Usuario con acceso limitado - solo plugin dashboard habilitado</p>
          </div>
        </div>
      `
    })
  ]
};

export const LightTheme: Story = {
  args: {},
  decorators: [
    (story) => ({
      standalone: true,
      imports: [BabooniSidebarComponent],
      providers: [
        {
          provide: AuthStore,
          useValue: {
            user: () => ({ firstName: 'María', lastName: 'García', email: 'maria@ejemplo.com', roles: ['user'] }),
            logout: () => {}
          }
        },
        {
          provide: PluginStore,
          useValue: {
            enabledPlugins: () => ['dashboard', 'sales', 'inventory'],
            highPerformanceMode: () => false
          }
        }
      ],
      template: `
        <div style="background: #f5f5f5; min-height: 100vh; display: flex;">
          <div style="width: 280px; background: white; border-right: 1px solid #e0e0e0;">
            <story />
          </div>
          <div style="flex: 1; padding: 2rem; color: #333;">
            <p>Sidebar en tema claro</p>
          </div>
        </div>
      `
    })
  ]
};