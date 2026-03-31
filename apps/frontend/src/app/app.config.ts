import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { appRoutes } from './app.routes';
import { authInterceptor, tenantInterceptor } from '@josanz-erp/identity-data-access';
import { apiOriginInterceptor } from './api-origin.interceptor';
import { 
  User, Lock, ArrowRight, LucideAngularModule, 
  Search, Building2, Bell, LayoutDashboard, 
  Users, Package, Receipt, Truck, Car, Key, 
  History, Menu, ChevronLeft, Settings, LogOut,
  Pencil, Trash2, Eye, Play, CheckCircle, XCircle,
  Plus, FileText, FileCheck, Download, Sun, Moon,
  Send, ShieldCheck, QrCode, Save, AlertTriangle,
  Mail, Slash, TrendingUp, AlertCircle, BellOff,
  X, Clock, RefreshCw, Construction, ArrowLeft,
  SearchX, FilePlus, UserPlus, Hash, Calendar,
  CalendarClock, Euro, ChevronRight, ChevronDown,
  ChevronUp, MoreVertical, MoreHorizontal,
  PlayCircle, CalendarCheck, Box, Briefcase, 
  PieChart, CheckSquare, PenTool, RotateCcw, 
  DollarSign, Archive, Shield, AlertOctagon, 
  BarChart3, Layers, Wrench, Activity, Camera, Clapperboard, Info, Tag
} from 'lucide-angular';
import { VERIFACTU_API_BASE_URL } from '@josanz-erp/verifactu-api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(
      withInterceptors([apiOriginInterceptor, tenantInterceptor, authInterceptor]),
    ),
    importProvidersFrom(LucideAngularModule.pick({ 
      User, Lock, ArrowRight, Search, Building2, 
      Bell, LayoutDashboard, Users, Package, 
      Receipt, Truck, Car, Key, History, 
      Menu, ChevronLeft, Settings, LogOut,
      Pencil, Trash2, Eye, Play, CheckCircle, XCircle,
      Plus, FileText, FileCheck, Download, Sun, Moon,
      Send, ShieldCheck, QrCode, Save, AlertTriangle,
      Mail, Slash, TrendingUp, AlertCircle, BellOff,
      X, Clock, RefreshCw, Construction, ArrowLeft,
      SearchX, FilePlus, UserPlus, Hash, Calendar,
      CalendarClock, Euro, ChevronRight, ChevronDown,
      ChevronUp, MoreVertical, MoreHorizontal,
      PlayCircle, CalendarCheck, Box, Briefcase, 
      PieChart, CheckSquare, PenTool, RotateCcw, 
      DollarSign, Archive, Shield, AlertOctagon, 
      BarChart3, Layers, Wrench, Activity, Camera, Clapperboard, Info, Tag
    })),
    { provide: VERIFACTU_API_BASE_URL, useValue: 'http://localhost:3110/api' },
  ],
};
