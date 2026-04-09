import { 
  UiButtonComponent, 
  UiSearchComponent, 
  UiLoaderComponent,
  UiBadgeComponent,
  UiStatCardComponent,
  UiFeatureHeaderComponent,
  UiFeatureStatsComponent,
  UiFeatureGridComponent,
  UiFeatureCardComponent,
} from '@josanz-erp/shared-ui-kit';
import { UsersService } from '@josanz-erp/identity-data-access';
import { User } from '@josanz-erp/identity-api';
import { Observable, of } from 'rxjs';
import { ThemeService, MasterFilterService, FilterableService } from '@josanz-erp/shared-data-access';

@Component({
  selector: 'lib-users-list',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    UiSearchComponent,
    UiLoaderComponent,
    UiButtonComponent,
    UiBadgeComponent,
    UiStatCardComponent,
    UiFeatureHeaderComponent,
    UiFeatureStatsComponent,
    UiFeatureGridComponent,
    UiFeatureCardComponent,
  ],
  template: `
    <div class="users-container">
      <ui-feature-header
        title="Usuarios"
        subtitle="Gestión de identidades y control de acceso"
        icon="users"
        actionLabel="NUEVO USUARIO"
      ></ui-feature-header>

      <ui-feature-stats>
        <ui-stat-card 
          label="Total Usuarios" 
          [value]="users().length.toString()" 
          icon="user-group" 
          [accent]="true">
        </ui-stat-card>
        <ui-stat-card 
          label="Activos Ahora" 
          [value]="activeUsersCount().toString()" 
          icon="zap" 
          [trend]="2">
        </ui-stat-card>
        <ui-stat-card 
          label="Roles Definidos" 
          [value]="rolesCount().toString()" 
          icon="shield">
        </ui-stat-card>
        <ui-stat-card
          label="Seguridad"
          value="A+"
          icon="lock"
          [accent]="false"
        ></ui-stat-card>
      </ui-feature-stats>

      <div class="navigation-bar">
        <ui-search 
          variant="glass"
          placeholder="BUSCAR POR NOMBRE, EMAIL O ROL..." 
          (searchChange)="onSearch($event)"
          class="flex-1"
        ></ui-search>
      </div>

      @if (isLoading()) {
        <div class="loader-container">
          <ui-loader message="SINCRONIZANDO IDENTIDADES..."></ui-loader>
        </div>
      } @else {
        <ui-feature-grid>
          @for (user of filteredUsers(); track user.id) {
            <ui-feature-card
              [name]="(user.firstName || '') + ' ' + (user.lastName || '')"
              [subtitle]="user.email"
              [avatarInitials]="getInitials(user.firstName, user.lastName)"
              [avatarBackground]="getStatusGradient(user.isActive)"
              [status]="user.isActive ? 'active' : 'offline'"
              [badgeLabel]="user.roles[0] || 'SIN ROL'"
              [badgeVariant]="user.isActive ? 'primary' : 'default'"
              (cardClicked)="onRowClick(user)"
              [footerItems]="[
                { icon: 'shield', label: (user.category || 'ESTÁNDAR') | uppercase },
                { icon: 'key', label: user.roles.length + ' permisos' }
              ]"
            >
               <div footer-extra class="card-actions">
                  <ui-button variant="ghost" size="sm" icon="pencil"></ui-button>
                  <ui-button variant="ghost" size="sm" icon="shield-alert" class="text-warning"></ui-button>
               </div>
            </ui-feature-card>
          } @empty {
            <div class="empty-state">
              <lucide-icon name="users" size="64" class="empty-icon"></lucide-icon>
              <h3>No hay usuarios</h3>
              <p>El directorio está vacío. Comienza invitando a un nuevo colaborador.</p>
              <ui-button variant="solid" icon="UserPlus">Invitar usuario</ui-button>
            </div>
          }
        </ui-feature-grid>
      }
    </div>
  `,
  styles: [`
    .users-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    .navigation-bar {
      margin-bottom: 2rem;
      background: var(--surface);
      padding: 0.75rem 1.5rem;
      border-radius: 16px;
      border: 1px solid var(--border-soft);
      display: flex;
    }

    .flex-1 { flex: 1; }

    .loader-container { display: flex; justify-content: center; padding: 5rem; }

    .card-actions { display: flex; gap: 0.25rem; }
    .text-warning { color: var(--warning) !important; }

    .empty-state {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 5rem;
      text-align: center;
      background: var(--surface);
      border-radius: 20px;
      border: 2px dashed var(--border-soft);
    }
    .empty-icon { color: var(--text-muted); opacity: 0.3; margin-bottom: 1.5rem; }

    @media (max-width: 900px) {
       .navigation-bar { padding: 1rem; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersListComponent implements OnInit, OnDestroy, FilterableService<User> {
  private readonly usersService = inject(UsersService);
  private readonly themeService = inject(ThemeService);
  private readonly masterFilter = inject(MasterFilterService);

  currentTheme = this.themeService.currentThemeData;
  users = signal<User[]>([]);
  isLoading = signal(true);

  activeUsersCount = computed(() => this.users().filter(u => u.isActive).length);
  rolesCount = computed(() => new Set(this.users().flatMap(u => u.roles)).size);

  filteredUsers = computed(() => {
    const list = this.users();
    const t = this.masterFilter.query().trim().toLowerCase();
    if (!t) return list;
    return list.filter(u => 
      u.email.toLowerCase().includes(t) || 
      (u.firstName ?? '').toLowerCase().includes(t) || 
      (u.lastName ?? '').toLowerCase().includes(t) ||
      u.roles.some(r => r.toLowerCase().includes(t))
    );
  });

  onRowClick(user: User) {
    // Navigate
  }

  getInitials(first: string | undefined, last: string | undefined): string {
    return ((first?.charAt(0) || '') + (last?.charAt(0) || '')).toUpperCase() || 'U';
  }

  getStatusGradient(isActive: boolean): string {
    return isActive 
      ? 'linear-gradient(135deg, #10b981, #059669)' 
      : 'linear-gradient(135deg, #6b7280, #374151)';
  }

  ngOnInit() {
    this.masterFilter.registerProvider(this);
    this.loadUsers();
  }

  ngOnDestroy() {
    this.masterFilter.unregisterProvider();
  }

  onSearch(term: string) {
    this.masterFilter.search(term);
  }

  filter(query: string): Observable<User[]> {
    const term = query.toLowerCase();
    const matches = this.users().filter(u => 
      u.email.toLowerCase().includes(term) || 
      (u.firstName ?? '').toLowerCase().includes(term) || 
      (u.lastName ?? '').toLowerCase().includes(term)
    );
    return of(matches);
  }

  private loadUsers() {
    this.isLoading.set(true);
    this.usersService.findAll().subscribe({
      next: (list) => {
        this.users.set(list);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }
}
