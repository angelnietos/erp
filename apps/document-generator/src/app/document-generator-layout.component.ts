import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { FloatingAssistantComponent } from './floating-assistant/floating-assistant.component';

@Component({
  selector: 'app-document-generator-layout',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    LucideAngularModule,
    FloatingAssistantComponent,
  ],
  styles: [
    `
      .nav-link:hover {
        background: var(--surface-hover);
      }

      .nav-link.active-link {
        background: var(--primary-light);
        border: 1px solid color-mix(in srgb, var(--primary) 35%, transparent);
      }

      .nav-scroll {
        -webkit-overflow-scrolling: touch;
        scrollbar-width: thin;
      }
    `,
  ],
  template: `
    <div class="min-h-screen" style="background: var(--bg-primary)">
      <!-- Header -->
      <header
        class="backdrop-blur-lg shadow-lg sticky top-0 z-50"
        style="background: var(--surface); border-bottom: 1px solid var(--border)"
      >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-20">
            <div class="flex items-center space-x-4">
              <div
                class="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                style="background: var(--primary)"
              >
                <svg
                  class="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h1
                  class="text-2xl font-bold"
                  style="color: var(--text-primary);"
                >
                  Generador de Documentos
                </h1>
                <p
                  class="text-xs font-medium"
                  style="color: var(--text-secondary)"
                >
                  Crea documentos profesionales con IA
                </p>
              </div>
            </div>
            <nav
              class="nav-scroll flex flex-wrap gap-2 items-center sm:justify-end w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0"
              aria-label="Navegación principal"
            >
              <a
                routerLink="/documents/list"
                routerLinkActive="active-link shadow-md"
                class="nav-link flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 font-medium text-sm"
                style="color: var(--text-primary)"
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
                routerLinkActive="active-link shadow-md"
                class="nav-link flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 font-medium text-sm"
                style="color: var(--text-primary)"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Crear Nuevo</span>
              </a>
              <a
                routerLink="/documents/bot"
                routerLinkActive="active-link shadow-md"
                class="nav-link flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 font-medium text-sm"
                style="color: var(--text-primary)"
              >
                <lucide-angular name="bot" class="w-4 h-4"></lucide-angular>
                <span>Asistente</span>
              </a>
              <a
                routerLink="/documents/analysis"
                routerLinkActive="active-link shadow-md"
                class="nav-link flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 font-medium text-sm"
                style="color: var(--text-primary)"
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Análisis</span>
              </a>
              <a
                routerLink="/documents/settings/ai"
                routerLinkActive="active-link shadow-md"
                class="nav-link flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 font-medium text-sm"
                style="color: var(--text-primary)"
                title="Clave API, modelo y Ollama"
              >
                <lucide-angular name="cpu" class="w-4 h-4"></lucide-angular>
                <span class="hidden sm:inline">Config. IA</span>
                <span class="sm:hidden">IA</span>
              </a>
            </nav>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <router-outlet></router-outlet>
      </main>

      <!-- Floating Global Assistant -->
      <app-floating-assistant />
    </div>
  `,
})
export class DocumentGeneratorLayoutComponent {}
