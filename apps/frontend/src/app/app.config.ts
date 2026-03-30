import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { appRoutes } from './app.routes';
import { authInterceptor, tenantInterceptor } from '@josanz-erp/identity-data-access';
import { 
  User, Lock, ArrowRight, LucideAngularModule, 
  Search, Building2, Bell, LayoutDashboard, 
  Users, Package, Receipt, Truck, Car, Key, 
  History, Menu, ChevronLeft, Settings, LogOut,
  Pencil, Trash2, Eye, Play, CheckCircle, XCircle,
  Plus, FileText, Download, Sun, Moon,
  Send, ShieldCheck, QrCode,
} from 'lucide-angular';
import { VERIFACTU_API_BASE_URL } from '@josanz-erp/verifactu-api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([tenantInterceptor, authInterceptor])),
    importProvidersFrom(LucideAngularModule.pick({ 
      User, Lock, ArrowRight, Search, Building2, 
      Bell, LayoutDashboard, Users, Package, 
      Receipt, Truck, Car, Key, History, 
      Menu, ChevronLeft, Settings, LogOut,
      Pencil, Trash2, Eye, Play, CheckCircle, XCircle,
      Plus, FileText, Download, Sun, Moon,
      Send, ShieldCheck, QrCode,
    })),
    { provide: VERIFACTU_API_BASE_URL, useValue: 'http://localhost:3100/api' },
  ],
};
