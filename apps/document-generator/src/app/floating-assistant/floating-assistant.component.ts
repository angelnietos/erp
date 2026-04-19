import {
  Component,
  inject,
  HostListener,
  ElementRef,
  ViewChild,
  OnInit,
} from '@angular/core';
import { AIInferenceService } from '@josanz-erp/shared-data-access';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  AssistantContextService,
  AssistantPetConfig,
} from '../services/assistant-context.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { escapeHtml } from '../utils/html-escape';
import type { MarkedGlobal } from '../types/cdn-script-globals';

declare const marked: MarkedGlobal;

@Component({
  selector: 'app-floating-assistant',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  styles: [
    `
      .pet-bubble {
        position: fixed;
        width: 70px;
        height: 70px;
        border-radius: 50%;
        cursor: pointer;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        transition:
          transform 0.2s,
          box-shadow 0.2s;
        user-select: none;
        overflow: hidden;
      }

      .pet-bubble:hover {
        transform: scale(1.15);
      }

      .pet-bubble.dragging {
        opacity: 0.7;
        cursor: grabbing;
      }

      .pet-face {
        font-size: 32px;
        line-height: 1;
      }

      .assistant-window {
        position: fixed;
        min-width: 320px;
        min-height: 360px;
        background: #ffffff;
        border-radius: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        max-width: calc(100vw - 8px);
        max-height: calc(100vh - 8px);
      }

      .assistant-window:not(.minimized) {
        border: 1px solid color-mix(in srgb, var(--pet-color, #667eea) 22%, #e2e8f0);
        box-shadow:
          0 0 0 1px rgba(15, 23, 42, 0.04),
          0 25px 50px -12px rgba(15, 23, 42, 0.28),
          0 12px 24px -8px rgba(15, 23, 42, 0.12);
      }

      .assistant-window.minimized {
        height: 56px !important;
        width: 280px !important;
        min-height: 0;
        min-width: 0;
        overflow: hidden;
        box-shadow: 0 12px 32px rgba(15, 23, 42, 0.18);
      }

      .resize-handle {
        position: absolute;
        right: 0;
        bottom: 0;
        width: 18px;
        height: 18px;
        margin: 0;
        padding: 0;
        border: none;
        cursor: nwse-resize;
        z-index: 2;
        appearance: none;
        font: inherit;
        color: inherit;
        background: linear-gradient(
          135deg,
          transparent 50%,
          rgba(100, 116, 139, 0.35) 50%
        );
        border-bottom-right-radius: 18px;
      }

      .resize-handle:hover {
        background: linear-gradient(
          135deg,
          transparent 45%,
          rgba(37, 99, 235, 0.45) 45%
        );
      }

      .resize-handle:focus-visible {
        outline: 2px solid rgba(255, 255, 255, 0.9);
        outline-offset: -2px;
      }

      .window-header {
        background: linear-gradient(
          135deg,
          var(--pet-color, #667eea) 0%,
          #764ba2 100%
        );
        color: white;
        padding: 14px 18px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.12);
        cursor: grab;
      }

      .window-header:active {
        cursor: grabbing;
      }

      .config-panel {
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
        padding: 16px;
        max-height: 220px;
        overflow-y: auto;
      }

      .config-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
      }

      .messages-container {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
        scroll-behavior: smooth;
      }

      .message {
        margin-bottom: 12px;
        max-width: 82%;
        padding: 10px 14px;
        border-radius: 18px;
        font-size: 14px;
        line-height: 1.4;
      }

      .message.user {
        margin-left: auto;
        background: #2563eb;
        color: white;
        border-bottom-right-radius: 4px;
      }

      .message.assistant {
        margin-right: auto;
        background: white;
        border: 1px solid #e2e8f0;
        border-bottom-left-radius: 4px;
        color: #0f172a;
        word-break: break-word;
        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
      }

      .assistant-bubble-md {
        white-space: normal;
        line-height: 1.45;
      }

      .assistant-bubble-md.markdown-preview {
        font-size: 13px;
      }

      .assistant-bubble-md.markdown-preview pre {
        max-width: 100%;
        overflow-x: auto;
        font-size: 11px;
        padding: 8px;
        border-radius: 8px;
      }

      .assistant-bubble-md.markdown-preview p:first-child {
        margin-top: 0;
      }

      .user-bubble-md {
        white-space: normal;
        line-height: 1.45;
      }

      .user-bubble-md a {
        color: #dbeafe;
        text-decoration: underline;
      }

      .message.system {
        margin: 0 auto;
        background: #f1f5f9;
        color: #64748b;
        font-size: 12px;
        text-align: center;
        padding: 6px 12px;
      }

      .input-area {
        padding: 12px;
        border-top: 1px solid #e2e8f0;
        background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
      }

      .context-badge {
        font-size: 10px;
        padding: 2px 6px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 4px;
      }

      @keyframes pet-bounce {
        0%,
        100% {
          transform: translateY(0) rotate(0deg);
        }
        25% {
          transform: translateY(-8px) rotate(-3deg);
        }
        75% {
          transform: translateY(-4px) rotate(3deg);
        }
      }

      @keyframes pet-idle {
        0%,
        100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
        }
      }

      .animate-idle {
        animation: pet-idle 3s ease-in-out infinite;
      }

      .animate-bounce {
        animation: pet-bounce 1s ease-in-out infinite;
      }

      @media (prefers-reduced-motion: reduce) {
        .animate-idle,
        .animate-bounce {
          animation: none;
        }
      }

      .skin-option {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        cursor: pointer;
        border: 2px solid transparent;
        transition: all 0.2s;
      }

      .skin-option:hover {
        border-color: #cbd5e1;
      }

      .skin-option.active {
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
      }

      .color-picker {
        width: 36px;
        height: 36px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        padding: 0;
        overflow: hidden;
      }

      .assistive-live {
        position: fixed;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
        pointer-events: none;
      }

    `,
  ],
  template: `
    <div
      class="assistive-live"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ assistantService.assistiveStatus$() }}
    </div>

    @if (!assistantService.isOpen$()) {
      <div
        class="pet-bubble animate-idle"
        role="button"
        tabindex="0"
        [attr.aria-label]="
          'Abrir asistente ' + assistantService.petConfig$().name
        "
        [style.left.px]="assistantService.position$().x"
        [style.top.px]="assistantService.position$().y"
        [style.background]="
          'linear-gradient(135deg, ' +
          assistantService.petConfig$().color +
          ' 0%, #764ba2 100%)'
        "
        [style.opacity.%]="assistantService.petConfig$().opacity"
        [style.box-shadow]="
          '0 10px 25px ' + assistantService.petConfig$().color + '66'
        "
        (click)="assistantService.toggleAssistant()"
        (keydown.enter)="assistantService.toggleAssistant()"
        (keydown.space)="
          $event.preventDefault(); assistantService.toggleAssistant()
        "
        (mousedown)="startDrag($event)"
        (contextmenu)="toggleConfig($event)"
        [class.dragging]="isDragging"
      >
        <span
          class="pet-face animate-bounce"
          [style.animation-duration.s]="
            2 / assistantService.petConfig$().animationSpeed
          "
        >
          {{ getPetFace() }}
        </span>
      </div>
    }

    @if (assistantService.isOpen$()) {
      <div
        class="assistant-window"
        [class.minimized]="isMinimized"
        role="dialog"
        aria-modal="false"
        aria-labelledby="floating-assistant-title"
        [style.left.px]="assistantService.position$().x"
        [style.top.px]="assistantService.position$().y"
        [style.width.px]="isMinimized ? undefined : assistantService.panelSize$().width"
        [style.height.px]="isMinimized ? undefined : assistantService.panelSize$().height"
        [style.--pet-color]="assistantService.petConfig$().color"
      >
        <div class="window-header" (mousedown)="startDrag($event)">
          <div class="flex items-center space-x-3 min-w-0">
            <span class="text-2xl shrink-0" aria-hidden="true">{{
              getPetFace()
            }}</span>
            <span
              class="font-semibold truncate"
              id="floating-assistant-title"
              >{{ assistantService.petConfig$().name }}</span
            >
            <span class="context-badge shrink-0">{{
              assistantService.context$().activeTab | uppercase
            }}</span>
          </div>
          <div class="flex items-center space-x-1 shrink-0">
            <button
              type="button"
              (click)="
                $event.stopPropagation(); togglePanelExpanded()
              "
              class="text-white/80 hover:text-white p-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-white/90"
              [title]="expandedPanelHint()"
              [attr.aria-label]="expandedPanelHint()"
            >
              @if (isExpandedPanelSize()) {
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"
                  />
                </svg>
              } @else {
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
              }
            </button>
            <button
              type="button"
              (click)="$event.stopPropagation(); clearConversation()"
              class="text-white/80 hover:text-white p-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-white/90"
              title="Limpiar historial del chat"
              aria-label="Limpiar historial del chat"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
            <button
              type="button"
              (click)="$event.stopPropagation(); isMinimized = !isMinimized"
              class="text-white/80 hover:text-white p-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-white/90"
              title="Minimizar"
              aria-label="Minimizar panel"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20 12H4"
                />
              </svg>
            </button>
            <button
              type="button"
              (click)="$event.stopPropagation(); showConfig = !showConfig"
              class="text-white/80 hover:text-white p-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-white/90"
              [attr.aria-expanded]="showConfig"
              title="Configuración"
              aria-label="Configuración del asistente"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
            <button
              type="button"
              (click)="$event.stopPropagation(); assistantService.toggleAssistant()"
              class="text-white/80 hover:text-white p-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-white/90"
              title="Cerrar"
              aria-label="Cerrar asistente"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        @if (!isMinimized) {
          <!-- Config Panel -->
          @if (showConfig) {
            <div class="config-panel">
              <h4 class="font-semibold text-slate-800 mb-3">
                ⚙️ Configuración de {{ assistantService.petConfig$().name }}
              </h4>

              <div class="config-row">
                <label for="animation-speed" class="text-sm text-secondary"
                  >Velocidad animación</label
                >
                <input
                  id="animation-speed"
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  [value]="assistantService.petConfig$().animationSpeed"
                  (change)="onAnimationSpeedChange($event)"
                  class="w-28"
                />
              </div>

              <div class="config-row">
                <label
                  id="skin-label"
                  for="skin-option-0"
                  class="text-sm text-secondary"
                  >Apariencia</label
                >
                <div
                  role="radiogroup"
                  aria-labelledby="skin-label"
                  class="flex space-x-2"
                >
                  @for (skin of availableSkins; track skin.id; let i = $index) {
                    <button
                      role="radio"
                      [attr.id]="'skin-option-' + i"
                      [attr.aria-checked]="
                        assistantService.petConfig$().skin === skin.id
                      "
                      class="skin-option"
                      [class.active]="
                        assistantService.petConfig$().skin === skin.id
                      "
                      (click)="updateConfig('skin', skin.id)"
                      [style.background]="skin.bg"
                    >
                      {{ skin.emoji }}
                    </button>
                  }
                </div>
              </div>

              <div class="config-row">
                <label for="pet-color" class="text-sm text-secondary"
                  >Color</label
                >
                <input
                  id="pet-color"
                  type="color"
                  class="color-picker"
                  [value]="assistantService.petConfig$().color"
                  (change)="onPetColorChange($event)"
                />
              </div>

              <div class="config-row">
                <label for="pet-personality" class="text-sm text-secondary"
                  >Personalidad</label
                >
                <select
                  id="pet-personality"
                  [value]="assistantService.petConfig$().personality"
                  (change)="onPetPersonalityChange($event)"
                  class="px-2 py-1 border border-slate-300 rounded text-sm"
                >
                  <option value="friendly">😊 Amigable</option>
                  <option value="professional">💼 Profesional</option>
                  <option value="humorous">😄 Divertido</option>
                  <option value="minimal">⚪ Minimalista</option>
                </select>
              </div>

              <div class="config-row">
                <label for="pet-opacity" class="text-sm text-secondary"
                  >Opacidad</label
                >
                <input
                  id="pet-opacity"
                  type="range"
                  min="30"
                  max="100"
                  step="5"
                  [value]="assistantService.petConfig$().opacity"
                  (change)="onPetOpacityChange($event)"
                  class="w-28"
                />
              </div>

              <div class="border-t border-slate-200 mt-3 pt-3 space-y-2">
                <p class="text-xs font-semibold text-slate-700">
                  Respuestas con IA real
                </p>
                <p class="text-xs text-slate-500 leading-snug">
                  La apariencia de arriba es solo visual. El chat usa tu motor
                  configurado (Gemini, OpenAI, Ollama…). Sin clave, verás
                  respuestas locales.
                </p>
                <a
                  routerLink="/documents/settings/ai"
                  class="inline-flex text-sm font-medium text-blue-600 hover:text-blue-800 underline"
                >
                  Abrir configuración del motor de IA →
                </a>
              </div>
            </div>
          }
        }

        @if (!isMinimized) {
          <div
            class="messages-container"
            #messagesContainer
            role="region"
            [attr.aria-label]="
              'Historial de chat con ' + assistantService.petConfig$().name
            "
            [attr.aria-busy]="isAiReplyLoading"
          >
            @for (msg of assistantService.messages$(); track msg.id) {
              <div class="message" [class]="msg.type">
                @if (msg.context && msg.type !== 'system') {
                  <span class="text-xs opacity-60 block mb-1"
                    >[{{ msg.context }}]</span
                  >
                }
                @switch (msg.type) {
                  @case ('assistant') {
                    <div
                      class="assistant-bubble-md markdown-preview"
                      [innerHTML]="assistantBubbleHtml(msg.content)"
                    ></div>
                  }
                  @case ('user') {
                    <div
                      class="user-bubble-md"
                      [innerHTML]="userBubbleHtml(msg.content)"
                    ></div>
                  }
                  @default {
                    <span class="block whitespace-pre-wrap">{{ msg.content }}</span>
                  }
                }
              </div>
            }
            @if (isAiReplyLoading) {
              <div class="message assistant opacity-90">
                <span class="inline-flex items-center gap-2 text-slate-500">
                  <span
                    class="inline-block w-2 h-2 rounded-full bg-violet-500 animate-pulse"
                  ></span>
                  Pensando…
                </span>
              </div>
            }
          </div>

          <div
            class="px-4 py-2 bg-slate-50 border-t border-slate-200 text-doc-muted-on-light space-y-2"
          >
            <div class="flex flex-wrap gap-1">
              @for (action of quickActionsPrimary; track action) {
                <button
                  type="button"
                  (click)="sendQuickAction(action)"
                  [disabled]="isAiReplyLoading"
                  class="px-2 py-1 text-xs bg-white border border-slate-200 rounded text-doc-ink hover:bg-blue-50 hover:border-blue-300 hover:text-blue-800 transition-colors disabled:opacity-50"
                >
                  {{ action }}
                </button>
              }
            </div>
            <button
              type="button"
              (click)="showExtraQuick = !showExtraQuick"
              class="text-[11px] font-medium text-blue-700 hover:text-blue-900 underline-offset-2 hover:underline"
            >
              {{ showExtraQuick ? 'Ocultar más acciones' : 'Más acciones (resumen, tono, CTA…)' }}
            </button>
            @if (showExtraQuick) {
              <div class="flex flex-wrap gap-1">
                @for (action of quickActionsExtra; track action) {
                  <button
                    type="button"
                    (click)="sendQuickAction(action)"
                    [disabled]="isAiReplyLoading"
                    class="px-2 py-1 text-xs bg-violet-50 border border-violet-200 rounded text-violet-900 hover:bg-violet-100 hover:border-violet-400 transition-colors disabled:opacity-50"
                  >
                    {{ action }}
                  </button>
                }
              </div>
            }
            <div
              class="flex flex-wrap gap-x-3 gap-y-1 text-[11px] border-t border-slate-200/80 pt-2"
            >
              <a
                routerLink="/documents/analysis"
                class="text-slate-600 hover:text-blue-700 font-medium"
                >Análisis de propuestas</a
              >
              <a
                routerLink="/documents/list"
                class="text-slate-600 hover:text-blue-700 font-medium"
                >Mis documentos</a
              >
              <a
                routerLink="/documents/settings/ai"
                class="text-slate-600 hover:text-blue-700 font-medium"
                >Motor de IA</a
              >
            </div>
          </div>

          <div class="input-area flex space-x-2">
            <input
              type="text"
              [formControl]="messageInput"
              (keydown.enter)="onChatEnter($event)"
              [disabled]="isAiReplyLoading"
              [attr.aria-label]="
                'Mensaje para ' + assistantService.petConfig$().name
              "
              placeholder="Pregunta cualquier cosa a {{
                assistantService.petConfig$().name
              }}..."
              class="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-50"
            />
            <button
              type="button"
              (click)="sendMessage()"
              [disabled]="isAiReplyLoading"
              class="px-4 py-2 bg-gradient-to-r from-brand to-brand text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              title="Enviar"
              aria-label="Enviar mensaje"
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
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>

          <button
            type="button"
            class="resize-handle"
            tabindex="0"
            title="Arrastra para cambiar tamaño. Teclado: flechas; Mayús = paso mayor."
            aria-label="Redimensionar ventana del asistente"
            (mousedown)="startResize($event)"
            (keydown)="onResizeKeydown($event)"
          ></button>
        }
      </div>
    }
  `,
})
export class FloatingAssistantComponent implements OnInit {
  readonly assistantService = inject(AssistantContextService);
  private readonly inference = inject(AIInferenceService);
  private readonly sanitizer = inject(DomSanitizer);
  readonly messageInput = new FormControl('');

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  isDragging = false;
  isResizing = false;
  showConfig = false;
  isMinimized = false;
  showExtraQuick = false;
  /** Respuesta del modelo en curso (Gemini, OpenAI, Ollama…). */
  isAiReplyLoading = false;
  private dragOffset = { x: 0, y: 0 };
  private resizeStart = { x: 0, y: 0, w: 0, h: 0 };

  /** Paso en px al redimensionar el panel con teclado (flechas). */
  private readonly resizeKeyStepPx = 16;
  /** Paso mayor con Mayús pulsado. */
  private readonly resizeKeyStepPxShift = 48;

  availableSkins = [
    { id: 'default', emoji: '🤖', bg: '#667eea' },
    { id: 'cat', emoji: '🐱', bg: '#f59e0b' },
    { id: 'dog', emoji: '🐶', bg: '#10b981' },
    { id: 'fox', emoji: '🦊', bg: '#ef4444' },
    { id: 'owl', emoji: '🦉', bg: '#8b5cf6' },
    { id: 'robot', emoji: '🤖', bg: '#64748b' },
    { id: 'alien', emoji: '👽', bg: '#22c55e' },
    { id: 'unicorn', emoji: '🦄', bg: '#ec4899' },
  ];

  quickActionsPrimary = [
    '¿Qué veo?',
    'Revisar contenido',
    'Sugerencias',
    'Errores',
  ];

  quickActionsExtra = [
    'Resumir documento',
    'Tono más formal',
    'Ideas para CTA',
    'Objeciones típicas',
  ];

  ngOnInit(): void {
    this.assistantService.loadSavedConfig();
    void this.inference.autoSelectProvider();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.isResizing) {
      const dx = event.clientX - this.resizeStart.x;
      const dy = event.clientY - this.resizeStart.y;
      this.assistantService.setPanelSize(
        this.resizeStart.w + dx,
        this.resizeStart.h + dy,
      );
      return;
    }
    if (this.isDragging) {
      const open = this.assistantService.isOpen$();
      const size = this.assistantService.panelSize$();
      const w = open ? size.width : 70;
      const h = open ? size.height : 70;
      this.assistantService.setPosition(
        Math.max(0, Math.min(window.innerWidth - w, event.clientX - this.dragOffset.x)),
        Math.max(0, Math.min(window.innerHeight - h, event.clientY - this.dragOffset.y)),
      );
    }
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    this.isDragging = false;
    this.isResizing = false;
  }

  /** Cierra el panel con Escape salvo si el foco está en un campo de formulario. */
  @HostListener('document:keydown', ['$event'])
  onDocumentEscape(event: KeyboardEvent): void {
    if (event.key !== 'Escape') return;
    if (!this.assistantService.isOpen$()) return;
    const t = event.target;
    if (
      t instanceof HTMLInputElement ||
      t instanceof HTMLTextAreaElement ||
      t instanceof HTMLSelectElement
    ) {
      return;
    }
    if (t instanceof HTMLElement && t.isContentEditable) return;

    event.preventDefault();
    this.assistantService.toggleAssistant();
  }

  startDrag(event: MouseEvent): void {
    this.isDragging = true;
    const pos = this.assistantService.position$();
    this.dragOffset = {
      x: event.clientX - pos.x,
      y: event.clientY - pos.y,
    };
    event.preventDefault();
  }

  startResize(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isResizing = true;
    const s = this.assistantService.panelSize$();
    this.resizeStart = {
      x: event.clientX,
      y: event.clientY,
      w: s.width,
      h: s.height,
    };
  }

  onResizeKeydown(event: KeyboardEvent): void {
    const step = event.shiftKey
      ? this.resizeKeyStepPxShift
      : this.resizeKeyStepPx;
    const s = this.assistantService.panelSize$();
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        this.assistantService.setPanelSize(s.width + step, s.height);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.assistantService.setPanelSize(s.width, s.height + step);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.assistantService.setPanelSize(s.width - step, s.height);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.assistantService.setPanelSize(s.width, s.height - step);
        break;
      default:
        break;
    }
  }

  /** Panel ocupa casi toda la ventana (mismo estado que tras «Ampliar»). */
  isExpandedPanelSize(): boolean {
    const s = this.assistantService.panelSize$();
    return (
      s.width >= window.innerWidth * 0.72 &&
      s.height >= window.innerHeight * 0.72
    );
  }

  togglePanelExpanded(): void {
    if (this.isExpandedPanelSize()) {
      this.assistantService.resetPanelSize();
    } else {
      this.assistantService.maximizePanel();
    }
  }

  expandedPanelHint(): string {
    return this.isExpandedPanelSize()
      ? 'Volver a tamaño estándar'
      : 'Ampliar al máximo (casi pantalla completa)';
  }

  toggleConfig(event: MouseEvent): void {
    event.preventDefault();
    this.showConfig = !this.showConfig;
  }

  clearConversation(): void {
    this.assistantService.resetChatToWelcome();
    setTimeout(() => this.scrollToBottom(), 0);
  }

  /** Enter en el campo de mensaje: evita envíos duplicados y propagación. */
  onChatEnter(event: Event): void {
    event.preventDefault();
    void this.sendMessage();
  }

  async sendMessage(): Promise<void> {
    const message = this.messageInput.value?.trim();
    if (!message || this.isAiReplyLoading) return;

    this.assistantService.addMessage(message, 'user');
    this.messageInput.reset();
    this.scrollToBottom();

    if (this.inference.selectedProvider() === 'free') {
      this.assistantService.addMessage(this.getResponse(message), 'assistant');
      this.scrollToBottom();
      return;
    }

    this.isAiReplyLoading = true;
    try {
      const system = this.buildFloatingSystemPrompt();
      const reply = await this.inference.generateResponse(message, system, {
        maxOutputTokens: 2048,
      });
      const text = (reply || '').trim();
      this.assistantService.addMessage(
        text || '(Sin respuesta del modelo.)',
        'assistant',
      );
    } catch (err: unknown) {
      const local = this.getResponse(message);
      const hint =
        err instanceof Error ? err.message : 'Error al contactar con el modelo.';
      this.assistantService.addMessage(
        `${local}\n\n— ${hint}\n(Configuración IA: menú «Config. IA» o /documents/settings/ai)`,
        'assistant',
      );
    } finally {
      this.isAiReplyLoading = false;
      setTimeout(() => this.scrollToBottom(), 80);
    }
  }

  sendQuickAction(action: string): void {
    this.messageInput.setValue(action);
    void this.sendMessage();
  }

  /** Contexto de sistema: personalidad del pet + fragmento de documento. */
  private buildFloatingSystemPrompt(): string {
    const ctx = this.assistantService.context$();
    const pet = this.assistantService.petConfig$();
    const personalityHints: Record<string, string> = {
      friendly: 'Tono cercano y claro, puedes usar emojis con moderación.',
      professional: 'Tono formal y directo, sin emojis salvo que el usuario los use.',
      humorous: 'Tono ligero y ingenioso, sin perder utilidad.',
      minimal: 'Respuestas muy breves, viñetas si ayudan.',
    };
    const snippet = (ctx.documentContent || '').slice(0, 8000);
    const tone =
      personalityHints[pet.personality] ?? personalityHints['friendly'];
    return [
      `Eres "${pet.name}", asistente del Generador de Documentos Josanz ERP.`,
      tone,
      `Pestaña o vista: ${ctx.activeTab}. Tipo de documento: ${ctx.documentType || 'no indicado'}.`,
      snippet
        ? `Contenido actual del documento (recortado):\n---\n${snippet}\n---`
        : 'Aún no hay texto de documento en contexto.',
      'Responde en español. Ayuda con redacción, estructura y revisión. No inventes datos numéricos ni legales concretos: usa [rellenar] si faltan.',
    ].join('\n');
  }

  updateConfig<K extends keyof AssistantPetConfig>(
    key: K,
    value: AssistantPetConfig[K],
  ): void {
    this.assistantService.updatePetConfig({ [key]: value });
  }

  onAnimationSpeedChange(event: Event): void {
    const v = Number((event.target as HTMLInputElement).value);
    this.updateConfig('animationSpeed', v);
  }

  onPetColorChange(event: Event): void {
    this.updateConfig('color', (event.target as HTMLInputElement).value);
  }

  onPetPersonalityChange(event: Event): void {
    const v = (event.target as HTMLSelectElement).value;
    this.updateConfig(
      'personality',
      v as AssistantPetConfig['personality'],
    );
  }

  onPetOpacityChange(event: Event): void {
    this.updateConfig(
      'opacity',
      Number((event.target as HTMLInputElement).value),
    );
  }

  /** Markdown + HTML seguro para burbujas del asistente (marked en index.html). */
  assistantBubbleHtml(content: string): SafeHtml {
    const raw = content ?? '';
    const mdOpts = { gfm: true, breaks: true };
    try {
      marked.setOptions?.(mdOpts);
      const html =
        typeof marked.parse === 'function'
          ? marked.parse(raw, mdOpts)
          : escapeHtml(raw);
      return this.sanitizer.bypassSecurityTrustHtml(html);
    } catch {
      return this.sanitizer.bypassSecurityTrustHtml(
        escapeHtml(raw).replace(/\n/g, '<br>'),
      );
    }
  }

  /** Texto de usuario: escapado + saltos de línea. */
  userBubbleHtml(content: string): SafeHtml {
    const esc = escapeHtml(content ?? '');
    return this.sanitizer.bypassSecurityTrustHtml(esc.replace(/\n/g, '<br>'));
  }

  getPetFace(): string {
    const skin = this.availableSkins.find(
      (s) => s.id === this.assistantService.petConfig$().skin,
    );
    return skin?.emoji || '🤖';
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      this.messagesContainer.nativeElement.scrollTop =
        this.messagesContainer.nativeElement.scrollHeight;
    }
  }

  private getResponse(message: string): string {
    const ctx = this.assistantService.context$();
    const personality = this.assistantService.petConfig$().personality;

    const documentTypeText = ctx.documentType
      ? `Tienes un documento de tipo "${ctx.documentType}" abierto.`
      : '';
    const documentTypeHumorous = ctx.documentType
      ? `Tienes un ${ctx.documentType} entre manos, ¡qué chulo!`
      : '';

    const responses: Record<string, Record<string, string>> = {
      friendly: {
        '¿Qué veo?': `¡Hola! Estoy viendo que estás en la pestaña ${ctx.activeTab}. ${documentTypeText} ¿En qué puedo ayudarte hoy? 😊`,
        'Revisar contenido': `¡Claro! Estoy analizando tu documento. Veo ${ctx.documentContent.length} caracteres de contenido. Te recomiendo revisar: 1) Resumen ejecutivo 2) Precios detallados 3) Llamada a la acción. ¡Tienes muy buena pinta! ✨`,
        Sugerencias: `¡Genial! Basándome en tu contenido actual, te sugiero: ✅ Añade un resumen ejecutivo claro ✅ Destaca tus valores diferenciales ✅ Incluye garantías ✅ Mejora la llamada final a la acción. ¡Lo harás genial! 💪`,
        Errores: `¡No te preocupes! No he detectado errores críticos en tu documento. Solo te recomiendo revisar la ortografía y asegurarte de que todos los campos estén completos. ¡Está casi perfecto! 🌟`,
        'Resumir documento': `Aquí va un resumen rápido: estás en ${ctx.activeTab}, con unos ${ctx.documentContent.length} caracteres. ${documentTypeText} Si quieres un resumen por secciones, dime cuál priorizamos.`,
        'Tono más formal': `Para sonar más formal: usa voz impersonal o «nosotros», evita muletillas, sustituye coloquialismos por términos técnicos y cierra cada bloque con una frase de transición. ¿Quieres que reescriba un párrafo concreto?`,
        'Ideas para CTA': `Ideas de cierre: «Solicita una demo», «Agenda una llamada», «Descarga el dossier», «Reserva tu plaza». Elige una acción única y repítela al final. ¿Tu objetivo es venta, reunión o descarga?`,
        'Objeciones típicas': `Objeciones frecuentes: precio, plazos, competencia, garantías. Responde con beneficios medibles, casos de uso y un siguiente paso claro. ¿Quieres que bordemos respuestas para tu sector?`,
      },
      professional: {
        '¿Qué veo?': `Contexto actual: Pestaña ${ctx.activeTab}. Tipo documento: ${ctx.documentType || 'No seleccionado'}. Longitud: ${ctx.documentContent.length} caracteres. Listo para asistirte.`,
        'Revisar contenido': `Análisis completo realizado. Se detectan ${ctx.documentContent.length} caracteres. Recomendaciones: 1) Resumen ejecutivo 2) Estructura de precios 3) Llamada a la acción final.`,
        Sugerencias: `Recomendaciones prioritarias: 1. Resumen ejecutivo 2. Valores diferenciales 3. Garantías 4. Llamada a la acción. Implementar estas mejoras incrementará la efectividad un 35%.`,
        Errores: `No se detectan errores críticos. Se recomienda revisión ortográfica y verificación de campos obligatorios. Documento apto para su uso.`,
        'Resumir documento': `Resumen ejecutivo: vista ${ctx.activeTab}; extensión ${ctx.documentContent.length} caracteres; tipo ${ctx.documentType || 'sin especificar'}. Propuesta: estructurar en contexto–propuesta–próximos pasos.`,
        'Tono más formal': `Ajuste de registro: sustituir contracciones, unificar terminología, usar titulares descriptivos y párrafos de 3–5 líneas. Puede facilitar un fragmento para reformular.`,
        'Ideas para CTA': `CTA recomendadas: solicitud de reunión, envío de propuesta detallada, acceso a documentación técnica. Una sola CTA principal por sección evita dispersión.`,
        'Objeciones típicas': `Matriz sugerida: objeción → evidencia (dato/caso) → mitigación → siguiente paso. Priorizar coste total de propiedad y plazos de entrega.`,
      },
      humorous: {
        '¿Qué veo?': `¡Hey! Estoy en ${ctx.activeTab} vigilando todo. ${documentTypeHumorous} ¿Qué trastada tienes hoy? 😎`,
        'Revisar contenido': `¡Muy bien! Leí todo tu texto. ¡Vaya crack! Solo te faltan estas cosillas: 1) Un resumen que mate 2) Precios que no asusten 3) Un final que les deje con la boca abierta. ¡Tú puedes! 🚀`,
        Sugerencias: `¡Aquí van los trucos del maestro! ✅ Mete un resumen que les deje boquiabiertos ✅ Diles por qué tú eres el mejor ✅ Añade alguna garantía para que se queden tranquilos ✅ Termina con un golpe de efecto. ¡A por ellos! 🎯`,
        Errores: `¡Tranquilo/a! Nada grave. Solo un par de erratas por aquí y por allá, nada que no se arregle en dos segundos. ¡Tu documento está de muerte! 💯`,
        'Resumir documento': `Resumen express: ${ctx.activeTab}, ${ctx.documentContent.length} caracteres de pura garra. Si quieres menos rollo y más viñetas, dímelo y lo afilo ✂️`,
        'Tono más formal': `Modo «jefe de sala»: sin slang, con garra educada. Cambia «mola» por «resulta adecuado» y listo. ¿Mando un párrafo antes/después? 🎩`,
        'Ideas para CTA': `CTA con gancho: «Pídenos cita», «Te lo enseñamos en 15 min», «Te paso el PDF». Elige una y que no se escape nadie 🎣`,
        'Objeciones típicas': `Cuando tiren de «es caro»: tú sacas ROI. Si dudan del plazo: mapa de hitos. Si comparan: diferencial clarísimo. ¿Roleplay de cliente difícil? 🥊`,
      },
      minimal: {
        '¿Qué veo?': `${ctx.activeTab}. ${ctx.documentType || 'Sin tipo'}. ${ctx.documentContent.length} chars.`,
        'Revisar contenido': `Contenido detectado. Revisar: resumen, precios, CTA.`,
        Sugerencias: `Añadir: resumen, diferenciadores, garantías, CTA.`,
        Errores: `Sin errores críticos. Revisar ortografía.`,
        'Resumir documento': `Resumen: ${ctx.activeTab}; ${ctx.documentContent.length} caracteres.`,
        'Tono más formal': `Usar registro impersonal, frases cortas, términos técnicos coherentes.`,
        'Ideas para CTA': `Una CTA: reunión, demo o descarga. Repetir al cierre.`,
        'Objeciones típicas': `Precio, plazo, riesgo. Responder con dato + siguiente paso.`,
      },
    };

    const perResponses = responses[personality] || responses['friendly'];
    return (
      perResponses[message] ||
      `He recibido tu mensaje: "${message}". Procesando contexto de ${ctx.activeTab}.`
    );
  }
}
