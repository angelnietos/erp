import {
  ApplicationConfig,
  provideZoneChangeDetection,
  importProvidersFrom,
  APP_INITIALIZER,
  inject,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, HttpErrorResponse } from '@angular/common/http';
import { appRoutes } from './app.routes';
import {
  authInterceptor,
  tenantInterceptor,
  sessionExpiryInterceptor,
  provideBffSessionKeepalive,
  AuthService,
  AuthStore,
  AUTH_KEYCLOAK_CONFIG,
  ERP_BFF_AUTH,
  ERP_AUTH_SESSION_MODE,
  TenantModulesApiService,
  TenantModulesRealtimeService,
  TENANT_MODULES_REALTIME_API_ORIGIN,
  getStoredTenantId,
  syncErpTenantHtmlTheme,
  syncErpRoutePhaseFromPath,
  getErpTenantSlug,
  isJosanzFigmaUiShell,
  resolveTenantSlugFromId,
  setErpTenantSlug,
} from '@josanz-erp/identity-data-access';
import {
  bffAuthInterceptor,
  provideEnterpriseAuth,
  BffAuthClient,
} from '@josanz-erp/shared-auth-keycloak';
import { GlobalAuthStore, PluginStore, ThemeService } from '@josanz-erp/shared-data-access';
import { JosanzThemeService } from '@josanz-erp/josanz-ui';
import { firstValueFrom, catchError, of, tap, map } from 'rxjs';
import { apiOriginInterceptor } from './api-origin.interceptor';
import { verifactuApiKeyInterceptor } from './verifactu-api-key.interceptor';
import {
  User,
  Lock,
  ArrowRight,
  LucideAngularModule,
  Search,
  Building2,
  Bell,
  LayoutDashboard,
  Layout,
  Users,
  Package,
  Receipt,
  Truck,
  Car,
  Key,
  History,
  Menu,
  ChevronLeft,
  Settings,
  LogOut,
  Pencil,
  Trash2,
  Eye,
  Play,
  Check,
  X,
  CirclePlus,
  ArrowUp,
  FileText,
  FileCheck,
  Download,
  EyeOff,
  Eraser,
  ScrollText,
  Sun,
  Moon,
  Send,
  ShieldCheck,
  QrCode,
  Save,
  TriangleAlert,
  Mail,
  Slash,
  TrendingUp,
  CircleAlert,
  BellOff,
  Clock,
  RefreshCw,
  Construction,
  Cog,
  ArrowLeft,
  SearchX,
  FilePlus,
  UserPlus,
  Hash,
  IdCard,
  Calendar,
  CalendarClock,
  CalendarPlus,
  Euro,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  EllipsisVertical,
  MoreHorizontal,
  CirclePlay,
  CalendarCheck,
  Box,
  Briefcase,
  ChartPie,
  SquareCheck,
  PenTool,
  RotateCcw,
  DollarSign,
  Archive,
  Shield,
  OctagonAlert,
  BarChart3,
  BarChart2,
  Layers,
  Wrench,
  Activity,
  Camera,
  Clapperboard,
  Fingerprint,
  Banana,
  LayoutGrid,
  MemoryStick,
  Landmark,
  LeafyGreen,
  Info,
  Tag,
  Puzzle,
  SlidersHorizontal,
  Sliders,
  Settings2,
  FileX,
  CloudUpload,
  Printer,
  Timer,
  FileUp,
  Wallet,
  HelpCircle,
  Keyboard,
  Phone,
  Smartphone,
  MapPin,
  Sparkles,
  Inbox,
  Gauge,
  UserCheck,
  Filter,
  Copy,
  Star,
  CreditCard,
  ChartLine,
  PartyPopper,
  Presentation,
  ExternalLink,
  Bot,
  CircleCheck,
  Cpu,
  GripVertical,
  Mic,
  MicOff,
  Smile,
  Zap,
  Minus,
  FlaskConical,
  Globe,
  Volume2,
  BarChart,
  CheckCircle,
  Banknote,
  CheckCheck,
  UploadCloud,
  RotateCw,
  AlertTriangle,
  Navigation,
  AlertCircle,
  CheckSquare,
  AlertOctagon,
  StickyNote,
  Palette,
  ShieldOff,
  UserX,
  ClipboardList,
  Plus,
  ShieldAlert,
  Calculator,
  WifiOff,
  CloudOff,
  CalendarDays,
  CircleUser,
  CircleX,
  CircleCheckBig,
  BrainCircuit,
  Shrink,
  Maximize2,
  Expand,
  LoaderCircle,
  Table,
  UserCircle,
} from 'lucide-angular';
import { VERIFACTU_API_BASE_URL } from '@josanz-erp/verifactu-api';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    /** Antes de cualquier tema: marca `data-erp-tenant` desde session (babooni → Biosstel). */
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => () => {
        syncErpRoutePhaseFromPath(
          typeof window !== 'undefined' ? window.location.pathname : '/',
        );
        const slugFromId = resolveTenantSlugFromId(getStoredTenantId());
        if (slugFromId) {
          setErpTenantSlug(slugFromId);
        } else {
          syncErpTenantHtmlTheme();
        }
        if (isJosanzFigmaUiShell(getErpTenantSlug())) {
          inject(JosanzThemeService).setTheme('luxe-rounded');
        }
      },
    },
    {
      provide: TENANT_MODULES_REALTIME_API_ORIGIN,
      useFactory: () => environment.apiOrigin?.replace(/\/$/, '') ?? '',
    },
    {
      provide: AUTH_KEYCLOAK_CONFIG,
      useValue: environment.keycloak || { enabled: false, url: '', realm: '', clientId: '' },
    },
    provideEnterpriseAuth({
      mode: environment.auth?.mode ?? 'legacy',
      apiPrefix: '/api',
      defaultTenantSlug: 'josanz',
    }),
    provideBffSessionKeepalive(),
    { provide: ERP_BFF_AUTH, useExisting: BffAuthClient },
    {
      provide: ERP_AUTH_SESSION_MODE,
      useValue: { mode: environment.auth?.mode ?? 'legacy' },
    },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(
      withInterceptors([
        apiOriginInterceptor,
        verifactuApiKeyInterceptor,
        bffAuthInterceptor,
        tenantInterceptor,
        authInterceptor,
        sessionExpiryInterceptor,
      ]),
    ),
    {
      provide: APP_INITIALIZER,
      useFactory: () => {
        const authService = inject(AuthService);
        const globalAuthStore = inject(GlobalAuthStore);
        const tenantModulesApi = inject(TenantModulesApiService);
        const tenantModulesRealtime = inject(TenantModulesRealtimeService);
        const authStore = inject(AuthStore);
        const pluginStore = inject(PluginStore);
        const themeService = inject(ThemeService);
        tenantModulesRealtime.registerIdentityRefresh(() => {
          authStore.refreshSession();
        });
        return async () => {
          if (!authService.isBffMode() && !localStorage.getItem('auth_token')) {
            pluginStore.loadFromStorage();
            return;
          }
          try {
            const outcome = await firstValueFrom(
              authService.refreshSession().pipe(
                map((response) => ({ kind: 'ok' as const, response })),
                catchError((err) => {
                  const status = err instanceof HttpErrorResponse ? err.status : 0;
                  if (status === 401 || status === 403) {
                    return of({ kind: 'auth-failed' as const });
                  }
                  return of({ kind: 'transient' as const });
                }),
              ),
            );

            if (outcome.kind === 'ok') {
              const { response } = outcome;
              if (response.accessToken?.trim()) {
                authService.setToken(response.accessToken);
              }
              if (response.tenantId) {
                authService.setTenantId(response.tenantId);
              }
              if (response.tenantSlug) {
                setErpTenantSlug(response.tenantSlug);
                themeService.reapplyTheme();
                if (isJosanzFigmaUiShell(response.tenantSlug)) {
                  inject(JosanzThemeService).setTheme('luxe-rounded');
                }
              } else {
                const slugFromId = resolveTenantSlugFromId(
                  response.tenantId ?? getStoredTenantId(),
                );
                if (slugFromId) {
                  setErpTenantSlug(slugFromId);
                  themeService.reapplyTheme();
                  if (isJosanzFigmaUiShell(slugFromId)) {
                    inject(JosanzThemeService).setTheme('luxe-rounded');
                  }
                }
              }
              const u = response.user;
              const displayName = [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.email;
              globalAuthStore.setUser({
                id: u.id,
                email: u.email,
                name: displayName,
                tenantId: response.tenantId || getStoredTenantId() || '',
                permissions: u.permissions,
              });
              // Only fetch tenant modules if we have a tenant context
              const currentTenantId = response.tenantId || getStoredTenantId() || undefined;
              if (currentTenantId) {
                await firstValueFrom(
                  tenantModulesApi.fetchEnabledModules(currentTenantId).pipe(
                    tap((r) => pluginStore.setPlugins(r.enabledModuleIds)),
                    catchError(() => {
                      pluginStore.loadFromStorage();
                      return of(null);
                    })
                  )
                );
              } else {
                pluginStore.loadFromStorage();
              }
              tenantModulesRealtime.connect(
                environment.apiOrigin?.replace(/\/$/, '') ?? '',
              );
            } else if (outcome.kind === 'auth-failed') {
              globalAuthStore.logout();
              pluginStore.loadFromStorage();
            } else {
              pluginStore.loadFromStorage();
            }
          } catch {
            pluginStore.loadFromStorage();
          }
        };
      },
      multi: true,
    },
    importProvidersFrom(
      LucideAngularModule.pick({
        User,
        Lock,
        ArrowRight,
        Search,
        Building2,
        Bell,
        LayoutDashboard,
        Layout,
        Users,
        Package,
        Receipt,
        Truck,
        Car,
        Key,
        History,
        Menu,
        ChevronLeft,
        Settings,
        LogOut,
        Pencil,
        Trash2,
        Eye,
        Play,
        Check,
        X,
        CirclePlus,
        ArrowUp,
        FileText,
        FileCheck,
        Download,
        EyeOff,
        Eraser,
        ScrollText,
        Sun,
        Moon,
        Send,
        ShieldCheck,
        QrCode,
        Save,
        TriangleAlert,
        Mail,
        Slash,
        TrendingUp,
        CircleAlert,
        BellOff,
        Clock,
        RefreshCw,
        Construction,
        Cog,
        ArrowLeft,
        SearchX,
        FilePlus,
        UserPlus,
        Hash,
        IdCard,
        Calendar,
        CalendarClock,
        CalendarPlus,
        Euro,
        ChevronRight,
        ChevronDown,
        ChevronUp,
        EllipsisVertical,
        MoreHorizontal,
        CirclePlay,
        CalendarCheck,
        Box,
        Briefcase,
        ChartPie,
        SquareCheck,
        PenTool,
        RotateCcw,
        DollarSign,
        Archive,
        Shield,
        OctagonAlert,
        BarChart3,
        BarChart2,
        Layers,
        Wrench,
        Activity,
        Camera,
        Clapperboard,
        Fingerprint,
        Banana,
        LayoutGrid,
        MemoryStick,
        Landmark,
        LeafyGreen,
        Info,
        Tag,
        Puzzle,
        SlidersHorizontal,
        Sliders,
        Settings2,
        FileX,
        CloudUpload,
        Printer,
        Timer,
        FileUp,
        Wallet,
        HelpCircle,
        Keyboard,
        Phone,
        Smartphone,
        MapPin,
        Sparkles,
        Inbox,
        Gauge,
        UserCheck,
        Filter,
        Copy,
        Star,
        CreditCard,
        ChartLine,
        PartyPopper,
        Presentation,
        ExternalLink,
        Bot,
        CircleCheck,
        Cpu,
        GripVertical,
        Mic,
        MicOff,
        Smile,
        Zap,
        Minus,
        FlaskConical,
        Globe,
        Volume2,
        BarChart,
        CheckCircle,
        Banknote,
        CheckCheck,
        UploadCloud,
        RotateCw,
        AlertTriangle,
        Navigation,
        AlertCircle,
        CheckSquare,
        AlertOctagon,
        StickyNote,
        Palette,
        ShieldOff,
        UserX,
        ClipboardList,
        Plus,
        ShieldAlert,
        Calculator,
        WifiOff,
        CloudOff,
        CalendarDays,
        CircleUser,
        CircleX,
        CircleCheckBig,
        BrainCircuit,
        Shrink,
        Maximize2,
        Expand,
        LoaderCircle,
        Table,
        UserCircle,
      }),
    ),
    { provide: VERIFACTU_API_BASE_URL, useValue: 'http://localhost:3110/api' },
  ],
};
