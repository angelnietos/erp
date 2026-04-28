import type { Meta, StoryObj } from '@storybook/angular';
import { BabooniAppLayoutComponent } from './babooni-app-layout.component';
import { ThemeService } from '@josanz-erp/shared-data-access';
import { of } from 'rxjs';

const meta: Meta<BabooniAppLayoutComponent> = {
  component: BabooniAppLayoutComponent,
  title: 'Babooni UI / App Layout',
  tags: ['autodocs'],
  decorators: [
    (story) => {
      const themeServiceMock = {
        currentTheme: of('dark'),
        currentThemeData: () => ({ primary: '#3b82f6' }),
        themeMenuSections: [
          {
            id: 'light',
            label: 'Claro',
            keys: ['light', 'cupcake', 'bumblebee']
          },
          {
            id: 'dark',
            label: 'Oscuro',
            keys: ['dark', 'night', 'forest']
          }
        ],
        setTheme: () => {},
        themes: {
          light: { name: 'Claro', primary: '#3b82f6' },
          dark: { name: 'Oscuro', primary: '#60a5fa' },
          night: { name: 'Noche', primary: '#818cf8' }
        }
      } as any;

      return {
        standalone: true,
        imports: [BabooniAppLayoutComponent],
        providers: [
          { provide: ThemeService, useValue: themeServiceMock },
          {
            provide: 'AuthStore',
            useValue: {
              user: () => ({ firstName: 'Juan', lastName: 'Pérez', email: 'juan@ejemplo.com', roles: ['admin'] })
            }
          },
          {
            provide: 'PluginStore',
            useValue: {
              enabledPlugins: () => ['dashboard', 'ai-insights', 'sales', 'inventory', 'hr'],
              highPerformanceMode: () => false
            }
          },
          {
            provide: 'AIBotStore',
            useValue: {
              activeBotFeature: () => 'ai-insights'
            }
          }
        ],
        template: `
          <div style="background: var(--bg-primary); min-height: 100vh;">
            <story />
          </div>
        `
      };
    }
  ],
};
export default meta;
type Story = StoryObj<BabooniAppLayoutComponent>;

export const Default: Story = {
  args: {
    tenantName: 'Babooni ERP'
  }
};

export const LightTheme: Story = {
  args: {
    tenantName: 'Babooni ERP'
  },
  decorators: [
    (story) => {
      const themeServiceMock = {
        currentTheme: of('light'),
        currentThemeData: () => ({ primary: '#3b82f6' }),
        themeMenuSections: [
          {
            id: 'light',
            label: 'Claro',
            keys: ['light', 'cupcake', 'bumblebee']
          },
          {
            id: 'dark',
            label: 'Oscuro',
            keys: ['dark', 'night', 'forest']
          }
        ],
        setTheme: () => {},
        themes: {
          light: { name: 'Claro', primary: '#3b82f6' },
          dark: { name: 'Oscuro', primary: '#60a5fa' }
        }
      } as any;

      return {
        standalone: true,
        imports: [BabooniAppLayoutComponent],
        providers: [
          { provide: ThemeService, useValue: themeServiceMock },
          {
            provide: 'AuthStore',
            useValue: {
              user: () => ({ firstName: 'María', lastName: 'García', email: 'maria@ejemplo.com', roles: ['user'] })
            }
          },
          {
            provide: 'PluginStore',
            useValue: {
              enabledPlugins: () => ['dashboard', 'sales'],
              highPerformanceMode: () => false
            }
          },
          {
            provide: 'AIBotStore',
            useValue: {
              activeBotFeature: () => 'sales'
            }
          }
        ],
        template: `
          <div style="background: var(--bg-primary); min-height: 100vh;">
            <story />
          </div>
        `
      };
    }
  ]
};

export const WithoutTenant: Story = {
  args: {
    tenantName: ''
  }
};

export const HighPerformanceMode: Story = {
  args: {
    tenantName: 'Babooni ERP'
  },
  decorators: [
    (story) => {
      const themeServiceMock = {
        currentTheme: of('dark'),
        currentThemeData: () => ({ primary: '#3b82f6' }),
        themeMenuSections: [
          {
            id: 'light',
            label: 'Claro',
            keys: ['light', 'cupcake', 'bumblebee']
          },
          {
            id: 'dark',
            label: 'Oscuro',
            keys: ['dark', 'night', 'forest']
          }
        ],
        setTheme: () => {},
        themes: {
          light: { name: 'Claro', primary: '#3b82f6' },
          dark: { name: 'Oscuro', primary: '#60a5fa' }
        }
      } as any;

      return {
        standalone: true,
        imports: [BabooniAppLayoutComponent],
        providers: [
          { provide: ThemeService, useValue: themeServiceMock },
          {
            provide: 'AuthStore',
            useValue: {
              user: () => ({ firstName: 'Admin', lastName: 'User', email: 'admin@ejemplo.com', roles: ['admin'] })
            }
          },
          {
            provide: 'PluginStore',
            useValue: {
              enabledPlugins: () => ['dashboard'],
              highPerformanceMode: () => true
            }
          },
          {
            provide: 'AIBotStore',
            useValue: {
              activeBotFeature: () => null
            }
          }
        ],
        template: `
          <div style="background: var(--bg-primary); min-height: 100vh;">
            <story />
          </div>
        `
      };
    }
  ]
};