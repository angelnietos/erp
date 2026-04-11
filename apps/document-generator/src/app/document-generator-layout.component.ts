import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-document-generator-layout',
  standalone: true,
  imports: [RouterModule, CommonModule, LucideAngularModule],
  template: `
    <div
      class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
    >
      <!-- Header -->
      <header
        class="bg-white/80 backdrop-blur-lg shadow-lg border-b border-slate-200/50 sticky top-0 z-50"
      >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-20">
            <div class="flex items-center space-x-4">
              <div
                class="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg"
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
                  class="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent"
                >
                  Generador de Documentos
                </h1>
                <p class="text-xs text-slate-500 font-medium">
                  Crea documentos profesionales con IA
                </p>
              </div>
            </div>
            <nav class="flex space-x-2">
              <a
                routerLink="/documents/list"
                routerLinkActive="bg-blue-100 text-blue-700 shadow-md"
                class="flex items-center space-x-2 px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 font-medium text-sm"
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
                routerLinkActive="bg-blue-100 text-blue-700 shadow-md"
                class="flex items-center space-x-2 px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 font-medium text-sm"
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
                routerLinkActive="bg-blue-100 text-blue-700 shadow-md"
                class="flex items-center space-x-2 px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 font-medium text-sm"
              >
                <lucide-angular name="bot" class="w-4 h-4"></lucide-angular>
                <span>Asistente</span>
              </a>
              <a
                routerLink="/documents/analysis"
                routerLinkActive="bg-blue-100 text-blue-700 shadow-md"
                class="flex items-center space-x-2 px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 font-medium text-sm"
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
            </nav>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class DocumentGeneratorLayoutComponent {}
