import { Component } from '@angular/core';

@Component({
  selector: 'app-documents-bot',
  standalone: true,
  template: `
    <div class="max-w-5xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-slate-900 mb-2">
          Asistente de Documentos IA
        </h1>
        <p class="text-slate-600">
          Escribe cualquier texto Markdown y te ayudo a mejorarlo, formatearlo,
          generar contenido o convertirlo directamente a PDF
        </p>
      </div>

      <div
        class="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 min-h-[600px]"
      >
        <div class="text-center py-16">
          <div
            class="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <svg
              class="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-slate-900 mb-3">Asistente IA</h2>
          <p class="text-slate-600 max-w-md mx-auto mb-8">
            Este componente se encuentra activo. Puedes pegar tu Markdown
            directamente en el editor de Crear Documento para convertirlo a PDF
            profesional.
          </p>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div class="text-lg font-semibold text-slate-900">
                📄 Convertir MD
              </div>
              <div class="text-sm text-slate-500">
                Markdown a PDF profesional
              </div>
            </div>
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div class="text-lg font-semibold text-slate-900">
                ✨ Vista previa LIVE
              </div>
              <div class="text-sm text-slate-500">
                Ver cambios en tiempo real
              </div>
            </div>
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div class="text-lg font-semibold text-slate-900">
                📋 Formato perfecto
              </div>
              <div class="text-sm text-slate-500">
                Estilos profesionales listos
              </div>
            </div>
          </div>

          <div class="mt-8">
            <a
              routerLink="/documents/create"
              class="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg
                class="w-5 h-5 mr-2"
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
              Ir al Editor de Documentos
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DocumentsBotComponent {}
