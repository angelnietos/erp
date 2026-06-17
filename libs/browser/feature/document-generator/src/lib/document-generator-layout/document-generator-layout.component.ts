import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { AuthStore } from '@josanz-erp/identity-data-access';
import { FloatingAssistantComponent } from '../floating-assistant/floating-assistant.component';
import { ThemeSelectorComponent } from '../theme-selector/theme-selector.component';
import { ThemeManagerService } from '../services/theme-manager.service';

@Component({
  selector: 'lib-document-generator-layout',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    LucideAngularModule,
    FloatingAssistantComponent,
    ThemeSelectorComponent,
  ],
  styles: [
    `
      .nav-scroll {
        -webkit-overflow-scrolling: touch;
        scrollbar-width: thin;
        overflow-x: auto;
      }

      .doc-gen-main {
        scroll-padding-bottom: 6rem;
      }
    `,
  ],
  template: `
    <div class="min-h-screen" style="background: var(--bg-primary)">
      <!-- Header -->
      <header class="dg-app-header sticky top-0 z-50 shadow-md">
        <div class="max-w-7xl mx-auto w-full flex flex-wrap justify-between items-center gap-3 px-4 sm:px-6 lg:px-8">
          <a routerLink="/documents/list" class="dg-app-header__brand">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center shadow-md shrink-0"
              style="background: var(--brand, var(--primary))"
            >
              <svg
                class="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <span>
              <span class="block leading-tight">Generador de Documentos</span>
              <span
                class="block text-[0.65rem] font-medium opacity-75"
                style="color: var(--text-secondary)"
              >
                IA en el editor y burbuja de ayuda
              </span>
            </span>
          </a>
          <nav
            class="dg-app-header__nav nav-scroll"
            aria-label="Navegación principal"
          >
            <a
              routerLink="/documents/list"
              routerLinkActive="dg-nav-link--active"
              class="dg-nav-link"
            >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <span>Documentos</span>
              </a>
              <a
                routerLink="/documents/create"
                routerLinkActive="dg-nav-link--active"
                class="dg-nav-link"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Crear</span>
              </a>
              <a
                routerLink="/documents/analysis"
                routerLinkActive="dg-nav-link--active"
                class="dg-nav-link"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Análisis</span>
              </a>
              <a
                routerLink="/documents/settings/agent"
                routerLinkActive="dg-nav-link--active"
                class="dg-nav-link"
                title="Skills y memoria del agente"
              >
                <lucide-angular
                  name="sparkles"
                  class="w-4 h-4"
                ></lucide-angular>
                <span class="hidden sm:inline">Agente</span>
              </a>
              <a
                routerLink="/documents/settings/ai"
                routerLinkActive="dg-nav-link--active"
                class="dg-nav-link"
                title="Clave API, modelo y Ollama"
              >
                <lucide-angular name="cpu" class="w-4 h-4"></lucide-angular>
                <span class="hidden sm:inline">Config. IA</span>
                <span class="sm:hidden">IA</span>
              </a>
              @if (authStore) {
                <button
                  type="button"
                  class="dg-nav-link"
                  (click)="authStore.logout()"
                  title="Cerrar sesión ERP"
                >
                  <lucide-angular name="log-out" class="w-4 h-4"></lucide-angular>
                  <span class="hidden sm:inline">Salir</span>
                </button>
              }
            </nav>
        </div>
      </header>

      <!-- Main Content -->
      <main class="doc-gen-main max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8 pb-28">
        <router-outlet></router-outlet>
      </main>

      <!-- Theme Selector -->
      <app-theme-selector />

      <!-- Floating Global Assistant -->
      <lib-floating-assistant />
    </div>
  `,
})
export class DocumentGeneratorLayoutComponent implements OnInit {
  /** Presente cuando la feature corre dentro de apps/frontend (:4200). */
  readonly authStore = inject(AuthStore, { optional: true });
  private readonly themeManager = inject(ThemeManagerService);

  ngOnInit(): void {
    this.themeManager.reapplyCurrentTheme();
  }
}