import {
  Component,
  inject,
  HostListener,
  ElementRef,
  ViewChild,
  OnInit,
} from '@angular/core';
import {
  AIInferenceService,
  type AIRequestAttachment,
} from '@josanz-erp/shared-data-access';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  AssistantContextService,
  AssistantPetConfig,
} from '../services/assistant-context.service';
import { AgentPersonaService } from '../services/agent-persona.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { escapeHtml } from '../utils/html-escape';
import type { ConversationRow } from '../db/agent-memory-dexie';
import type { MarkedGlobal } from '../types/cdn-script-globals';

declare const marked: MarkedGlobal;

interface AssistantReferenceAttachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  kind: 'image' | 'pdf' | 'text' | 'other';
  base64?: string;
  dataUrl?: string;
  textPreview?: string;
}

@Component({
  selector: 'lib-floating-assistant',
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
        z-index: 10610;
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
        background:
          radial-gradient(
              circle at 20px 20px,
              rgba(255, 255, 255, 0.65) 0 2px,
              transparent 3px
            )
            0 0 / 18px 18px,
          linear-gradient(180deg, #fff7ed 0%, #fffaf2 42%, #eef6ff 100%);
        border-radius: 24px;
        z-index: 10620;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        max-width: calc(100vw - 8px);
        max-height: calc(100vh - 8px);
        color: #182230;
        font-family:
          Inter,
          system-ui,
          -apple-system,
          BlinkMacSystemFont,
          'Segoe UI',
          sans-serif;
      }

      .assistant-window:not(.minimized) {
        border: 3px solid #1f2937;
        box-shadow:
          0 0 0 5px rgba(255, 255, 255, 0.82),
          0 24px 0 -12px rgba(31, 41, 55, 0.28),
          0 28px 55px rgba(15, 23, 42, 0.35);
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
        background:
          radial-gradient(
            circle at 16px 16px,
            rgba(255, 255, 255, 0.22) 0 4px,
            transparent 5px
          ),
          linear-gradient(135deg, #22c55e 0%, #16a34a 36%, #7c3aed 100%);
        color: white;
        padding: 11px 13px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow:
          inset 0 -3px 0 rgba(15, 23, 42, 0.22),
          0 2px 0 rgba(255, 255, 255, 0.3);
        cursor: grab;
        border-bottom: 3px solid #1f2937;
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
        padding: 14px;
        background:
          linear-gradient(90deg, rgba(15, 23, 42, 0.04) 1px, transparent 1px),
          linear-gradient(180deg, #fffdf7 0%, #f0f9ff 100%);
        background-size:
          18px 18px,
          auto;
        scroll-behavior: smooth;
        min-height: 0;
      }

      .section-caption {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 7px 13px;
        border-top: 3px solid #1f2937;
        border-bottom: 2px solid rgba(31, 41, 55, 0.35);
        background: linear-gradient(180deg, #111827 0%, #1f2937 100%);
        color: #fef3c7;
        font-size: 11px;
        font-weight: 900;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .section-caption span:last-child {
        color: #cbd5e1;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: normal;
        text-transform: none;
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
        background: linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%);
        color: white;
        border: 2px solid #172554;
        border-bottom-right-radius: 7px;
        box-shadow: 0 4px 0 rgba(30, 64, 175, 0.3);
      }

      .message.assistant {
        margin-right: auto;
        background: #ffffff;
        border: 2px solid #1f2937;
        border-bottom-left-radius: 7px;
        color: #0f172a;
        word-break: break-word;
        box-shadow: 0 4px 0 rgba(15, 23, 42, 0.12);
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
        background: #fff7ed;
        color: #9a3412;
        border: 1px dashed #fdba74;
        font-size: 12px;
        text-align: center;
        padding: 6px 12px;
      }

      .input-area {
        padding: 12px;
        border-top: 0;
        background: linear-gradient(180deg, #ffffff 0%, #fff7ed 100%);
        align-items: center;
      }

      .input-area input {
        border: 2px solid #1f2937 !important;
        border-radius: 15px !important;
        background: #fffdf7 !important;
        min-height: 42px;
        box-shadow: inset 0 2px 0 rgba(15, 23, 42, 0.05);
      }

      .input-area input:focus {
        box-shadow:
          0 0 0 3px rgba(251, 191, 36, 0.35),
          inset 0 2px 0 rgba(15, 23, 42, 0.05) !important;
      }

      .input-area button {
        border: 2px solid #1f2937;
        border-radius: 15px !important;
        background: linear-gradient(
          180deg,
          #ef4444 0%,
          #b91c1c 100%
        ) !important;
        box-shadow: 0 4px 0 rgba(127, 29, 29, 0.55);
      }

      .input-area button:hover {
        transform: translateY(-1px);
      }

      .attachment-tray {
        padding: 8px 11px 0;
        background: linear-gradient(180deg, #fffdf7 0%, #ffffff 100%);
        border-top: 3px solid #1f2937;
      }

      .attachment-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        max-width: 180px;
        border: 2px solid #1f2937;
        border-radius: 999px;
        background: linear-gradient(180deg, #ffffff 0%, #e0f2fe 100%);
        color: #0f172a;
        font-size: 11px;
        font-weight: 800;
        padding: 5px 8px;
        box-shadow: 0 2px 0 rgba(15, 23, 42, 0.16);
      }

      .attachment-chip__name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .attachment-chip button {
        border: none;
        background: transparent;
        color: #991b1b;
        cursor: pointer;
        font-weight: 900;
        line-height: 1;
      }

      .attach-btn {
        width: 42px;
        height: 42px;
        flex: 0 0 auto;
        border: 2px solid #1f2937;
        border-radius: 15px;
        background: linear-gradient(180deg, #fef3c7 0%, #f59e0b 100%);
        color: #111827;
        font-weight: 900;
        box-shadow: 0 4px 0 rgba(120, 53, 15, 0.45);
      }

      .context-badge {
        font-size: 10px;
        padding: 3px 7px;
        background: rgba(255, 255, 255, 0.24);
        border: 1px solid rgba(255, 255, 255, 0.35);
        border-radius: 999px;
        font-weight: 800;
      }

      .workspace-actions {
        background:
          radial-gradient(
            circle at top right,
            rgba(239, 68, 68, 0.12),
            transparent 38%
          ),
          linear-gradient(180deg, #fffaf0 0%, #ffffff 100%);
        border-bottom: 3px solid #1f2937;
        padding: 9px 11px;
      }

      .collapsible-toggle {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        border: none;
        background: transparent;
        padding: 0;
        text-align: left;
        cursor: pointer;
      }

      .collapse-pill {
        border: 2px solid #1f2937;
        background: linear-gradient(180deg, #fef3c7 0%, #f59e0b 100%);
        border-radius: 999px;
        color: #111827;
        font-size: 11px;
        font-weight: 900;
        padding: 4px 9px;
        box-shadow: 0 3px 0 rgba(120, 53, 15, 0.35);
        white-space: nowrap;
      }

      .workspace-actions__title {
        color: #111827;
        font-size: 12px;
        font-weight: 900;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }

      .workspace-actions__subtitle {
        color: #64748b;
        font-size: 11px;
        line-height: 1.35;
        margin-top: 2px;
      }

      .action-stage {
        margin-top: 10px;
        display: grid;
        gap: 8px;
        max-height: min(42vh, 360px);
        overflow-y: auto;
        padding-right: 2px;
      }

      .action-group {
        background: rgba(255, 255, 255, 0.86);
        border: 2px solid rgba(31, 41, 55, 0.12);
        border-radius: 16px;
        padding: 8px;
        box-shadow: inset 0 -2px 0 rgba(15, 23, 42, 0.04);
      }

      .action-group__label {
        color: #475569;
        font-size: 10px;
        font-weight: 900;
        letter-spacing: 0.08em;
        margin-bottom: 6px;
        text-transform: uppercase;
      }

      .agent-action-btn {
        border: 2px solid #1f2937;
        background: linear-gradient(180deg, #ffffff 0%, #dbeafe 100%);
        color: #1e3a8a;
        border-radius: 14px;
        font-size: 11px;
        font-weight: 900;
        padding: 7px 10px;
        box-shadow: 0 3px 0 rgba(30, 64, 175, 0.25);
        transition:
          transform 0.12s ease,
          box-shadow 0.12s ease,
          background-color 0.15s ease,
          border-color 0.15s ease,
          color 0.15s ease;
      }

      .agent-action-btn:hover {
        transform: translateY(-1px);
        background: linear-gradient(180deg, #eff6ff 0%, #bfdbfe 100%);
        color: #1e40af;
        box-shadow: 0 5px 0 rgba(30, 64, 175, 0.22);
      }

      .agent-action-btn:active {
        transform: translateY(2px);
        box-shadow: 0 1px 0 rgba(30, 64, 175, 0.2);
      }

      .agent-action-btn.secondary {
        background: linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%);
        color: #334155;
        box-shadow: 0 3px 0 rgba(71, 85, 105, 0.18);
      }

      .agent-action-btn.accent {
        background: linear-gradient(180deg, #fff7ed 0%, #fecaca 100%);
        color: #991b1b;
        box-shadow: 0 3px 0 rgba(153, 27, 27, 0.22);
      }

      .dock-btn {
        border: 2px solid rgba(31, 41, 55, 0.65);
        background: rgba(255, 255, 255, 0.24);
        color: white;
        border-radius: 10px;
        padding: 2px 6px;
        font-size: 11px;
        font-weight: 900;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3);
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

      .view-tabs {
        display: flex;
        gap: 8px;
        background: #111827;
        border-bottom: 3px solid #1f2937;
        padding: 8px;
      }

      .view-tab {
        flex: 1;
        padding: 8px 12px;
        border: 2px solid rgba(255, 255, 255, 0.12);
        border-radius: 13px;
        background: rgba(255, 255, 255, 0.08);
        cursor: pointer;
        font-size: 12px;
        font-weight: 900;
        text-align: center;
        color: #d1d5db;
        transition: all 0.2s;
      }

      .view-tab:hover {
        background: rgba(255, 255, 255, 0.16);
      }

      .view-tab.active {
        color: #111827;
        background: linear-gradient(180deg, #fef3c7 0%, #fbbf24 100%);
        border-color: #fef9c3;
        box-shadow: 0 3px 0 rgba(120, 53, 15, 0.45);
      }

      .history-container {
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        background: #f8fafc;
      }

      .history-list {
        padding: 8px;
        flex: 1;
        overflow-y: auto;
      }

      .history-item {
        padding: 12px;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        margin-bottom: 8px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .history-item:hover {
        border-color: #2563eb;
        box-shadow: 0 2px 8px rgba(37, 99, 235, 0.1);
      }

      .history-item.selected {
        background: #dbeafe;
        border-color: #2563eb;
      }

      .history-item-title {
        font-weight: 500;
        font-size: 13px;
        color: #1e293b;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .history-item-time {
        font-size: 11px;
        color: #94a3b8;
        margin-bottom: 8px;
      }

      .history-item-actions {
        display: flex;
        gap: 6px;
      }

      .history-btn {
        padding: 4px 8px;
        border: none;
        background: #e2e8f0;
        border-radius: 4px;
        font-size: 11px;
        cursor: pointer;
        transition: all 0.2s;
        color: #475569;
      }

      .history-btn:hover {
        background: #cbd5e1;
      }

      .history-btn.delete {
        background: #fee2e2;
        color: #dc2626;
      }

      .history-btn.delete:hover {
        background: #fecaca;
      }

      .history-empty {
        padding: 32px 16px;
        text-align: center;
        color: #94a3b8;
        font-size: 12px;
      }

      .save-conversation-btn {
        padding: 6px 12px;
        background: #10b981;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 11px;
        cursor: pointer;
        transition: all 0.2s;
        margin: 0 2px;
      }

      .save-conversation-btn:hover {
        background: #059669;
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
        [style.width.px]="
          isMinimized ? undefined : assistantService.panelSize$().width
        "
        [style.height.px]="
          isMinimized ? undefined : assistantService.panelSize$().height
        "
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
          </div>
          <div class="flex items-center space-x-1 shrink-0">
            <button
              type="button"
              (click)="$event.stopPropagation(); dockPanel('left')"
              class="dock-btn"
              title="Anclar a la izquierda"
              aria-label="Anclar asistente a la izquierda"
            >
              ◀
            </button>
            <button
              type="button"
              (click)="$event.stopPropagation(); dockPanel('right')"
              class="dock-btn"
              title="Anclar a la derecha"
              aria-label="Anclar asistente a la derecha"
            >
              ▶
            </button>
            <button
              type="button"
              (click)="$event.stopPropagation(); dockPanel('bottom')"
              class="dock-btn"
              title="Anclar abajo"
              aria-label="Anclar asistente abajo"
            >
              ▾
            </button>
            <button
              type="button"
              (click)="$event.stopPropagation(); togglePanelExpanded()"
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
                  aria-hidden="true"
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
                  aria-hidden="true"
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
                aria-hidden="true"
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
              (click)="
                $event.stopPropagation(); assistantService.toggleAssistant()
              "
              class="text-white/80 hover:text-white p-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-white/90"
              title="Cerrar"
              aria-label="Cerrar asistente"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        @if (!isMinimized) {
          <!-- View Tabs -->
          <div class="view-tabs">
            <button
              type="button"
              class="view-tab"
              [class.active]="currentView === 'chat'"
              (click)="switchToChatView()"
            >
              💬 Conversación
            </button>
            <button
              type="button"
              class="view-tab"
              [class.active]="currentView === 'history'"
              (click)="switchToHistoryView()"
            >
              📚 Chats guardados
            </button>
          </div>

          <!-- Config Panel -->
          @if (showConfig) {
            <div class="workspace-actions">
              <button
                type="button"
                class="collapsible-toggle"
                (click)="showConfigContent = !showConfigContent"
                [attr.aria-expanded]="showConfigContent"
              >
                <span>
                  <span class="workspace-actions__title">
                    <span aria-hidden="true">⚙</span>
                    Ajustes
                  </span>
                  <span class="workspace-actions__subtitle block">
                    Apariencia, personalidad y motor de IA.
                  </span>
                </span>
                <span class="collapse-pill">
                  {{ showConfigContent ? 'Cerrar' : 'Abrir' }}
                </span>
              </button>
            </div>
          }

          @if (showConfig && showConfigContent) {
            <div class="config-panel">
              <div class="config-row">
                <label for="assistant-name" class="text-sm text-secondary"
                  >Nombre</label
                >
                <input
                  id="assistant-name"
                  type="text"
                  [value]="assistantService.petConfig$().name"
                  (change)="onAssistantNameChange($event)"
                  maxlength="64"
                  placeholder="Ej: Pepe, Kilo, Lola..."
                  class="px-2 py-1 border border-slate-300 rounded text-sm w-40"
                />
              </div>

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
                      type="button"
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

          @if (currentView === 'chat') {
            <div class="workspace-actions">
              <button
                type="button"
                class="collapsible-toggle"
                (click)="showPowerCenter = !showPowerCenter"
                [attr.aria-expanded]="showPowerCenter"
              >
                <span>
                  <div class="workspace-actions__title">
                    <span aria-hidden="true">✦</span>
                    Herramientas del documento
                  </div>
                  <div class="workspace-actions__subtitle">
                    No es otro chat: son acciones que modifican el documento o
                    sus estilos.
                  </div>
                </span>
                <span class="collapse-pill">
                  {{ showPowerCenter ? 'Cerrar' : 'Abrir' }}
                </span>
              </button>
              @if (showPowerCenter) {
                <div class="action-stage">
                  <div class="action-group">
                    <div class="action-group__label">Estilo</div>
                    <div class="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        class="agent-action-btn"
                        (click)="applyStyleRecipe('readable')"
                      >
                        Lectura +
                      </button>
                      <button
                        type="button"
                        class="agent-action-btn accent"
                        (click)="applyStyleRecipe('corporate')"
                      >
                        Corporativo
                      </button>
                      <button
                        type="button"
                        class="agent-action-btn"
                        (click)="applyStyleRecipe('print')"
                      >
                        PDF Pro
                      </button>
                    </div>
                  </div>
                  <div class="action-group">
                    <div class="action-group__label">IA al documento</div>
                    <div class="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        class="agent-action-btn accent"
                        (click)="transformMarkdownToVisualHtml()"
                        [disabled]="isAiReplyLoading"
                      >
                        Markdown → HTML visual
                      </button>
                      <button
                        type="button"
                        class="agent-action-btn secondary"
                        (click)="applyLastCssBlock()"
                      >
                        Aplicar CSS IA
                      </button>
                      <button
                        type="button"
                        class="agent-action-btn secondary"
                        (click)="insertLastAssistantText()"
                      >
                        Insertar texto IA
                      </button>
                    </div>
                  </div>
                  <div class="action-group">
                    <div class="action-group__label">Modo editor</div>
                    <div class="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        class="agent-action-btn secondary"
                        (click)="setDocumentEditorMode('html')"
                      >
                        HTML
                      </button>
                      <button
                        type="button"
                        class="agent-action-btn secondary"
                        (click)="setDocumentEditorMode('markdown')"
                      >
                        Markdown
                      </button>
                    </div>
                  </div>
                  <div class="action-group">
                    <div class="action-group__label">Preguntar al agente</div>
                    <div class="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        (click)="saveCurrentConversation()"
                        class="agent-action-btn secondary"
                        [disabled]="isAiReplyLoading"
                      >
                        Guardar chat
                      </button>
                      @for (action of quickActionsPrimary; track action) {
                        <button
                          type="button"
                          (click)="sendQuickAction(action)"
                          [disabled]="isAiReplyLoading"
                          class="agent-action-btn secondary"
                        >
                          {{ action }}
                        </button>
                      }
                      <button
                        type="button"
                        class="agent-action-btn secondary"
                        (click)="showExtraQuick = !showExtraQuick"
                      >
                        {{ showExtraQuick ? 'Menos' : 'Más' }}
                      </button>
                    </div>
                    @if (showExtraQuick) {
                      <div class="mt-2 flex flex-wrap gap-1.5">
                        @for (action of quickActionsExtra; track action) {
                          <button
                            type="button"
                            (click)="sendQuickAction(action)"
                            [disabled]="isAiReplyLoading"
                            class="agent-action-btn secondary"
                          >
                            {{ action }}
                          </button>
                        }
                      </div>
                    }
                    <div
                      class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px]"
                    >
                      <a
                        routerLink="/documents/analysis"
                        class="text-slate-600 hover:text-blue-700 font-bold"
                        >Análisis</a
                      >
                      <a
                        routerLink="/documents/list"
                        class="text-slate-600 hover:text-blue-700 font-bold"
                        >Documentos</a
                      >
                      <a
                        routerLink="/documents/settings/ai"
                        class="text-slate-600 hover:text-blue-700 font-bold"
                        >Motor IA</a
                      >
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        }

        @if (!isMinimized) {
          <!-- CHAT VIEW -->
          @if (currentView === 'chat') {
            <div class="section-caption">
              <span>Mensajes de la conversación</span>
              <span>Lee aquí las respuestas de Kilo</span>
            </div>
            <div
              class="messages-container"
              #messagesContainer
              role="log"
              aria-live="polite"
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
                      <span class="block whitespace-pre-wrap">{{
                        msg.content
                      }}</span>
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

            @if (referenceAttachments.length > 0) {
              <div class="attachment-tray">
                <div class="flex flex-wrap gap-1.5">
                  @for (
                    attachment of referenceAttachments;
                    track attachment.id
                  ) {
                    <span class="attachment-chip" [title]="attachment.name">
                      <span aria-hidden="true">{{
                        attachmentIcon(attachment)
                      }}</span>
                      <span class="attachment-chip__name">{{
                        attachment.name
                      }}</span>
                      <button
                        type="button"
                        (click)="removeReferenceAttachment(attachment.id)"
                        [attr.aria-label]="'Quitar adjunto ' + attachment.name"
                      >
                        ×
                      </button>
                    </span>
                  }
                  <button
                    type="button"
                    class="attachment-chip"
                    (click)="clearReferenceAttachments()"
                  >
                    Limpiar
                  </button>
                </div>
              </div>
            }

            <div class="section-caption">
              <span>Escribe a Kilo</span>
              <span>Único campo para preguntar o pedir cambios</span>
            </div>
            <div class="input-area flex space-x-2">
              <input
                #referenceFileInput
                type="file"
                hidden
                multiple
                accept="image/*,.pdf,.html,.htm,.css,.md,.markdown,.txt,.json"
                (change)="onReferenceFilesSelected($event)"
              />
              <button
                type="button"
                class="attach-btn"
                (click)="referenceFileInput.click()"
                title="Adjuntar referencias: imágenes, PDF, HTML, CSS, Markdown o texto"
                aria-label="Adjuntar referencias"
              >
                📎
              </button>
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
                }} o pídele cambios de estilo..."
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
                  aria-hidden="true"
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
          }

          <!-- HISTORY VIEW -->
          @if (currentView === 'history') {
            <div class="history-container">
              <div
                class="px-4 py-3 border-b border-slate-200 bg-white flex items-center justify-between gap-3"
              >
                <div>
                  <div class="text-sm font-semibold text-slate-900">
                    Historial de conversaciones
                  </div>
                  <div class="text-xs text-slate-500">
                    {{ conversations.length }} conversación(es) guardada(s)
                  </div>
                </div>
                <button
                  type="button"
                  class="save-conversation-btn"
                  (click)="switchToChatView()"
                >
                  Volver al chat
                </button>
              </div>

              @if (loadingConversations) {
                <div class="flex items-center justify-center h-full">
                  <span class="text-slate-500 text-sm"
                    >Cargando historial…</span
                  >
                </div>
              } @else if (conversations.length === 0) {
                <div class="history-empty">
                  <p>📭 No hay conversaciones guardadas</p>
                  <p class="mt-2 text-xs">
                    Vuelve al chat y guarda una conversación para verla aquí.
                  </p>
                </div>
              } @else {
                <div class="history-list">
                  @for (conv of conversations; track conv.id) {
                    <div
                      class="history-item"
                      [class.selected]="selectedConversationId === conv.id"
                    >
                      <div class="history-item-title">{{ conv.title }}</div>
                      <div class="history-item-time">
                        {{ conv.createdAt | date: 'dd/MM HH:mm' }}
                      </div>
                      <div class="history-item-actions">
                        <button
                          type="button"
                          class="history-btn"
                          (click)="loadConversation(conv.id)"
                        >
                          Cargar
                        </button>
                        <button
                          type="button"
                          class="history-btn delete"
                          (click)="deleteConversation(conv.id)"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          }
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
  private readonly persona = inject(AgentPersonaService);
  private readonly sanitizer = inject(DomSanitizer);
  readonly messageInput = new FormControl('');

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  isDragging = false;
  isResizing = false;
  showConfig = false;
  showConfigContent = false;
  showPowerCenter = false;
  isMinimized = false;
  showExtraQuick = false;
  /** Respuesta del modelo en curso (Gemini, OpenAI, Ollama…). */
  isAiReplyLoading = false;

  /* Conversation history management */
  currentView: 'chat' | 'history' = 'chat';
  conversations: ConversationRow[] = [];
  loadingConversations = false;
  selectedConversationId: string | null = null;
  referenceAttachments: AssistantReferenceAttachment[] = [];
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
    'Sugerencias de estilo',
    'Genera CSS para este documento',
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
    void this.loadConversations();
  }

  dockPanel(position: 'left' | 'right' | 'bottom'): void {
    const size = this.assistantService.panelSize$();
    const margin = 16;
    if (position === 'left') {
      this.assistantService.setPosition(margin, margin + 64);
      return;
    }
    if (position === 'right') {
      this.assistantService.setPosition(
        Math.max(margin, window.innerWidth - size.width - margin),
        margin + 64,
      );
      return;
    }
    this.assistantService.setPosition(
      Math.max(margin, Math.round((window.innerWidth - size.width) / 2)),
      Math.max(margin, window.innerHeight - size.height - margin),
    );
  }

  setDocumentEditorMode(mode: 'markdown' | 'html' | 'plain'): void {
    this.assistantService.runDocumentCommand({
      type: 'set-editor-mode',
      value: mode,
      description: `Editor cambiado a ${mode}.`,
    });
  }

  applyStyleRecipe(recipe: 'readable' | 'corporate' | 'print'): void {
    const cssRecipes: Record<'readable' | 'corporate' | 'print', string> = {
      readable: `
/* Ajuste aplicado por el agente: lectura cómoda */
.markdown-preview,
.document-preview-render {
  --markdown-font-size: 1.08rem;
  --markdown-line-height: 1.78;
  max-width: 920px;
}

.markdown-preview p,
.markdown-preview li,
.document-preview-render p,
.document-preview-render li {
  line-height: 1.78;
}

.markdown-preview h2,
.document-preview-render h2 {
  margin-top: 2.4rem;
  padding-bottom: 0.45rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.35);
}
`.trim(),
      corporate: `
/* Ajuste aplicado por el agente: identidad Josanz */
:root {
  --brand-primary: #7a0000;
  --brand-accent: #ff3131;
}

.markdown-preview h1,
.document-preview-render h1 {
  color: #111827;
  border-bottom: 3px solid var(--brand-accent);
}

.markdown-preview h2,
.document-preview-render h2 {
  border-left: 5px solid var(--brand-accent);
  padding-left: 0.85rem;
}

.markdown-preview th,
.document-preview-render th {
  background: #7a0000;
  color: #ffffff;
}

.markdown-preview blockquote,
.document-preview-render blockquote {
  border-left-color: var(--brand-accent);
  background: #fff1f1;
}
`.trim(),
      print: `
/* Ajuste aplicado por el agente: exportación PDF */
.markdown-preview h1,
.markdown-preview h2,
.markdown-preview h3,
.document-preview-render h1,
.document-preview-render h2,
.document-preview-render h3 {
  page-break-after: avoid;
}

.markdown-preview table,
.markdown-preview pre,
.markdown-preview blockquote,
.document-preview-render table,
.document-preview-render pre,
.document-preview-render blockquote {
  page-break-inside: avoid;
}

.markdown-preview img,
.document-preview-render img {
  max-width: 100%;
  height: auto;
}
`.trim(),
    };

    this.assistantService.runDocumentCommand({
      type: 'append-css',
      value: cssRecipes[recipe],
      description: 'CSS aplicado al documento desde el agente.',
    });
  }

  applyLastCssBlock(): void {
    const css = this.extractLastAssistantCodeBlock('css');
    if (!css) {
      this.assistantService.addMessage(
        'No encuentro un bloque ```css en mi última respuesta. Pídeme “genera CSS para este documento” y luego pulsa “Aplicar CSS último”.',
        'assistant',
      );
      return;
    }

    this.assistantService.runDocumentCommand({
      type: 'append-css',
      value: css,
      description: 'CSS de la última respuesta aplicado al documento.',
    });
  }

  async transformMarkdownToVisualHtml(): Promise<void> {
    if (this.isAiReplyLoading) return;

    const ctx = this.assistantService.context$();
    const markdown = (ctx.documentContent || '').trim();
    const mode = String(ctx.formData?.['contentEditorMode'] ?? 'markdown');

    if (!markdown) {
      this.assistantService.addMessage(
        'No hay contenido en el editor para convertir a HTML.',
        'assistant',
      );
      return;
    }

    const instruction = [
      'Convierte el contenido actual del editor a un documento HTML visual, moderno y autocontenido.',
      'Devuelve SOLO un bloque ```html con el documento completo.',
      'Incluye <!doctype html>, <html lang="es">, <head>, <meta charset="utf-8"> y un <style> interno.',
      'Respeta todo el contenido y la estructura semántica del Markdown: títulos, secciones, listas, tablas, llamadas de atención y firmas.',
      'No dejes marcadores Markdown visibles si se pueden representar mejor en HTML.',
      'Crea clases útiles y semánticas para las secciones: .hero, .section, .card, .metadata-grid, .table-wrap, .callout, .signature-grid, etc.',
      'Diseña una versión más bonita que el Markdown base: buena jerarquía, espaciado, colores coherentes, tablas limpias y portada/cabecera si encaja.',
      'No inventes datos: conserva placeholders como [rellenar] o [Fecha actual] cuando falten datos.',
      mode !== 'markdown'
        ? `Nota: el editor está en modo ${mode}, pero debes convertir el contenido actual a HTML autocontenido.`
        : '',
    ]
      .filter(Boolean)
      .join('\n');

    this.assistantService.addMessage(
      'Convertir Markdown actual a HTML visual',
      'user',
    );
    this.isAiReplyLoading = true;
    this.scrollToBottom();

    try {
      const system = `${this.buildFloatingSystemPrompt()}\n\nMODO ACCIÓN: conversión de Markdown a HTML visual autocontenido. La respuesta debe ser únicamente un bloque \`\`\`html completo.`;
      const reply = await this.inference.generateResponse(instruction, system, {
        maxOutputTokens: 8192,
        attachments: this.aiReferenceAttachments(),
      });
      const text = (reply || '').trim();
      const appliedOrWarning = this.applyAssistantReplyToPage(
        text,
        'reemplaza todo: convertir markdown a html visual autocontenido',
      );
      this.assistantService.addMessage(
        appliedOrWarning ||
          this.compactAssistantReplyForChat(text) ||
          '(Sin respuesta del modelo.)',
        'assistant',
      );
    } catch (err: unknown) {
      const hint =
        err instanceof Error
          ? err.message
          : 'Error al contactar con el modelo.';
      this.assistantService.addMessage(
        `No he podido convertir el Markdown a HTML visual.\n\n${hint}`,
        'assistant',
      );
    } finally {
      this.isAiReplyLoading = false;
      setTimeout(() => this.scrollToBottom(), 80);
    }
  }

  insertLastAssistantText(): void {
    const text = this.latestAssistantMessageContent();
    if (!text) {
      return;
    }

    this.assistantService.runDocumentCommand({
      type: 'append-content',
      value: this.stripFencedCodeBlocks(text).trim() || text,
      description: 'Respuesta del agente insertada en el documento.',
    });
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
        Math.max(
          0,
          Math.min(window.innerWidth - w, event.clientX - this.dragOffset.x),
        ),
        Math.max(
          0,
          Math.min(window.innerHeight - h, event.clientY - this.dragOffset.y),
        ),
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
    if (this.showConfig) {
      this.showConfigContent = true;
    }
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
      const local = this.getResponse(message);
      this.assistantService.addMessage(
        this.applyAssistantReplyToPage(local, message) ?? local,
        'assistant',
      );
      this.scrollToBottom();
      return;
    }

    this.isAiReplyLoading = true;
    try {
      const system = this.buildFloatingSystemPrompt();
      const reply = await this.inference.generateResponse(message, system, {
        maxOutputTokens: 8192,
        attachments: this.aiReferenceAttachments(),
      });
      const text = (reply || '').trim();
      const appliedOrWarning = this.applyAssistantReplyToPage(text, message);
      this.assistantService.addMessage(
        appliedOrWarning ||
          this.compactAssistantReplyForChat(text) ||
          '(Sin respuesta del modelo.)',
        'assistant',
      );
    } catch (err: unknown) {
      const local = this.getResponse(message);
      const hint =
        err instanceof Error
          ? err.message
          : 'Error al contactar con el modelo.';
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

  private applyAssistantReplyToPage(
    reply: string,
    userMessage: string,
  ): string | null {
    if (
      this.hasUnclosedCodeFence(reply) ||
      reply.includes('[RESPUESTA_CORTADA_POR_MAX_TOKENS]')
    ) {
      return 'La respuesta llegó cortada por el límite del modelo y no la he aplicado para no romper el documento. He aumentado el límite para los próximos intentos. Pídeme de nuevo el cambio, idealmente como CSS o HTML final.';
    }

    const codeBlocks = this.extractCodeBlocks(reply);
    const applied: string[] = [];

    // If the reply is essentially only a CSS block (no meaningful surrounding text),
    // replace the existing CSS to avoid stacking broken or duplicate styles.
    const replyWithoutFences = this.stripFencedCodeBlocks(reply).trim();
    const isCssOnlyReply =
      codeBlocks.length === 1 &&
      (codeBlocks[0].language === 'css' || codeBlocks[0].language === 'scss') &&
      replyWithoutFences.length < 80;

    const cssCommandType = isCssOnlyReply ? 'replace-css' : 'append-css';

    for (const block of codeBlocks) {
      if (block.language === 'css' || block.language === 'scss') {
        this.assistantService.runDocumentCommand({
          type: cssCommandType,
          value: block.code,
          description: isCssOnlyReply
            ? 'Estilos CSS reemplazados por IA.'
            : 'CSS generado por IA aplicado al documento.',
        });
        applied.push('estilos CSS');
        continue;
      }

      if (block.language === 'html') {
        if (this.shouldReplaceDocument(userMessage)) {
          this.assistantService.runDocumentCommand({
            type: 'replace-css',
            value: '',
            description:
              'CSS externo limpiado para usar los estilos internos del HTML.',
          });
        }
        this.assistantService.runDocumentCommand({
          type: 'set-editor-mode',
          value: 'html',
          description:
            'Editor cambiado a HTML para aplicar contenido generado.',
        });
        this.assistantService.runDocumentCommand({
          type: 'replace-content',
          value: block.code,
          description: 'HTML generado por IA aplicado al documento.',
        });
        applied.push('HTML del documento');
        continue;
      }

      if (block.language === 'markdown' || block.language === 'md') {
        this.assistantService.runDocumentCommand({
          type: 'set-editor-mode',
          value: 'markdown',
          description:
            'Editor cambiado a Markdown para aplicar contenido generado.',
        });
        this.assistantService.runDocumentCommand({
          type: this.shouldReplaceDocument(userMessage)
            ? 'replace-content'
            : 'append-content',
          value: block.code,
          description: 'Markdown generado por IA aplicado al documento.',
        });
        applied.push('contenido Markdown');
      }
    }

    if (applied.length === 0) {
      const css = this.extractLooseCss(reply);
      if (css) {
        this.assistantService.runDocumentCommand({
          type: 'append-css',
          value: css,
          description: 'CSS generado por IA aplicado al documento.',
        });
        applied.push('estilos CSS');
      }
    }

    if (applied.length === 0) {
      return null;
    }

    const unique = [...new Set(applied)];
    return `Listo. He aplicado ${unique.join(' y ')} directamente en la página. Revisa el editor y la vista previa.`;
  }

  private compactAssistantReplyForChat(reply: string): string {
    const withoutCode = this.stripFencedCodeBlocks(reply).trim();
    if (!withoutCode) {
      return '';
    }
    return withoutCode.length > 1200
      ? `${withoutCode.slice(0, 1200).trim()}…`
      : withoutCode;
  }

  private extractCodeBlocks(reply: string): Array<{
    language: string;
    code: string;
  }> {
    const blocks: Array<{ language: string; code: string }> = [];
    const regex = /```([\w-]*)\s*([\s\S]*?)```/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(reply)) !== null) {
      const language = (match[1] || '').trim().toLowerCase();
      const code = (match[2] || '').trim();
      if (code) {
        blocks.push({ language, code });
      }
    }
    return blocks;
  }

  private hasUnclosedCodeFence(reply: string): boolean {
    const fenceCount = reply.match(/```/g)?.length ?? 0;
    return fenceCount % 2 === 1;
  }

  private extractLooseCss(reply: string): string {
    const trimmed = reply.trim();
    const looksLikeCss =
      /(^|\n)\s*(?:@media|@page|:root|body|\.markdown-preview|\.document-preview-render|[.#][\w-]+|h[1-6]|p|table|th|td)\b[\s\S]*\{[\s\S]*\}/.test(
        trimmed,
      ) && !/<\/?[a-z][\s\S]*>/i.test(trimmed);
    return looksLikeCss ? trimmed : '';
  }

  private shouldReplaceDocument(userMessage: string): boolean {
    return /\b(reemplaza|sustituye|reescribe|cambia todo|nuevo documento|desde cero|replace|rewrite)\b/i.test(
      userMessage,
    );
  }

  async onReferenceFilesSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    if (files.length === 0) {
      return;
    }

    const nextAttachments: AssistantReferenceAttachment[] = [];
    for (const file of files.slice(0, 6)) {
      try {
        nextAttachments.push(await this.fileToReferenceAttachment(file));
      } catch (error) {
        console.warn('No se pudo adjuntar referencia', file.name, error);
        this.assistantService.addMessage(
          `No he podido leer "${file.name}". Prueba con una imagen, PDF, HTML, CSS, Markdown o texto.`,
          'assistant',
        );
      }
    }

    this.referenceAttachments = [
      ...this.referenceAttachments,
      ...nextAttachments,
    ].slice(-8);

    if (nextAttachments.length > 0) {
      this.assistantService.addMessage(
        `Adjunto(s) como referencia: ${nextAttachments.map((file) => file.name).join(', ')}. Puedes pedirme “crea CSS basado en estos adjuntos”.`,
        'system',
      );
    }
  }

  removeReferenceAttachment(id: string): void {
    this.referenceAttachments = this.referenceAttachments.filter(
      (attachment) => attachment.id !== id,
    );
  }

  clearReferenceAttachments(): void {
    this.referenceAttachments = [];
  }

  attachmentIcon(attachment: AssistantReferenceAttachment): string {
    switch (attachment.kind) {
      case 'image':
        return '🖼';
      case 'pdf':
        return 'PDF';
      case 'text':
        return 'TXT';
      default:
        return 'DOC';
    }
  }

  /* Conversation Management Methods */

  async loadConversations(): Promise<void> {
    this.loadingConversations = true;
    try {
      this.conversations = await this.persona.listConversations(50);
    } catch (err: unknown) {
      console.error('Error loading conversations:', err);
      this.conversations = [];
    } finally {
      this.loadingConversations = false;
    }
  }

  async saveCurrentConversation(): Promise<void> {
    const messages = this.assistantService.messages$();
    if (!messages || messages.length === 0) {
      console.warn('No messages to save');
      return;
    }

    try {
      const conversationTitle = `Chat ${new Date().toLocaleString()}`;
      const conversationId = await this.persona.saveConversation(
        messages.map((m) => ({
          type: m.type,
          content: m.content,
          id: m.id,
          timestamp: m.timestamp,
          context: m.context,
        })),
        conversationTitle,
      );
      console.log('Conversation saved with ID:', conversationId);
      // Reload conversations list
      await this.loadConversations();
    } catch (err: unknown) {
      console.error('Error saving conversation:', err);
    }
  }

  async loadConversation(id: string): Promise<void> {
    if (this.loadingConversations) return;

    this.loadingConversations = true;
    try {
      const conversation = await this.persona.getConversation(id);
      if (!conversation) {
        console.warn('Conversation not found');
        return;
      }

      // Parse messages from the conversation
      const messages = JSON.parse(conversation.messagesJson || '[]');

      // Clear current chat and load the conversation
      this.assistantService.resetChatToWelcome();
      for (const msg of messages) {
        this.assistantService.addMessage(msg.content, msg.type);
      }

      this.selectedConversationId = id;
      this.scrollToBottom();
    } catch (err: unknown) {
      console.error('Error loading conversation:', err);
    } finally {
      this.loadingConversations = false;
    }
  }

  async deleteConversation(id: string): Promise<void> {
    try {
      await this.persona.deleteConversation(id);
      if (this.selectedConversationId === id) {
        this.selectedConversationId = null;
      }
      // Reload conversations list
      await this.loadConversations();
    } catch (err: unknown) {
      console.error('Error deleting conversation:', err);
    }
  }

  switchToChatView(): void {
    this.currentView = 'chat';
    this.selectedConversationId = null;
  }

  switchToHistoryView(): void {
    this.currentView = 'history';
    void this.loadConversations();
  }

  /** Contexto de sistema: personalidad del pet + fragmento de documento. */
  private buildFloatingSystemPrompt(): string {
    const ctx = this.assistantService.context$();
    const pet = this.assistantService.petConfig$();
    const formData = (ctx.formData ?? {}) as Record<string, unknown>;
    const currentCss =
      typeof formData['customCss'] === 'string'
        ? formData['customCss'].trim()
        : '';
    const editorMode =
      typeof formData['contentEditorMode'] === 'string'
        ? formData['contentEditorMode']
        : 'markdown';
    const personalityHints: Record<string, string> = {
      friendly: 'Tono cercano y claro, puedes usar emojis con moderación.',
      professional:
        'Tono formal y directo, sin emojis salvo que el usuario los use.',
      humorous: 'Tono ligero y ingenioso, sin perder utilidad.',
      minimal: 'Respuestas muy breves, viñetas si ayudan.',
    };
    const snippet = (ctx.documentContent || '').slice(0, 8000);
    const attachmentContext = this.referenceAttachmentPromptContext();
    const tone =
      personalityHints[pet.personality] ?? personalityHints['friendly'];

    const hasTextAttachments = this.referenceAttachments.some(
      (a) => a.kind === 'text' && !!a.textPreview,
    );
    const hasVisualAttachments = this.referenceAttachments.some(
      (a) => a.kind === 'image' || a.kind === 'pdf',
    );

    return [
      `Eres "${pet.name}", asistente del Generador de Documentos Josanz ERP.`,
      tone,
      `Pestaña o vista: ${ctx.activeTab}. Tipo de documento: ${ctx.documentType || 'no indicado'}. Modo del editor: ${editorMode}.`,
      snippet
        ? `Contenido actual del documento (recortado):\n---\n${snippet}\n---`
        : 'Aún no hay texto de documento en contexto.',
      currentCss
        ? `CSS personalizado ya aplicado al documento:\n---\n${currentCss.slice(0, 3000)}\n---`
        : '',
      attachmentContext,
      hasTextAttachments
        ? 'Los adjuntos de texto (HTML/CSS/Markdown) contienen el documento de referencia completo. Úsalos activamente: extrae su estructura, contenido real, secciones, títulos y datos para generar o mejorar el documento actual. Si el usuario pide "crear un documento similar" o "mejorar el contenido", usa ese texto como base.'
        : '',
      hasVisualAttachments
        ? 'Los adjuntos visuales (imágenes/PDF) son referencias de estilo. Analiza colores, tipografías, espaciados y jerarquía visual para proponer CSS que replique ese estilo en el documento.'
        : '',
      [
        'REGLAS CSS (síguelas siempre que generes CSS):',
        '- Responde con un único bloque ```css que la app aplicará directamente, sin instrucciones de copia.',
        '- SIEMPRE usa selectores completos. NUNCA empieces el bloque con propiedades sueltas sin selector.',
        '- Escribe CSS normal de documento: h1, h2, p, table, th, td, blockquote, body, :root, etc. La app lo acota automáticamente a la preview cuando el editor está en Markdown.',
        '- En Markdown también puedes usar clases semánticas generadas por la app: .doc-title, .doc-section-title, .doc-subsection-title, .doc-lead, .doc-paragraph, .doc-list, .doc-list-item, .doc-callout, .doc-table, .doc-table-header, .doc-table-cell, .doc-divider, .doc-code-block, .doc-image.',
        '- En HTML usa CSS normal del documento, sin .markdown-preview, porque se inyecta dentro del iframe de la vista previa HTML.',
        '- Variables CSS disponibles: --markdown-font-size, --markdown-line-height, --markdown-color, --markdown-bg, --markdown-border, --markdown-radius, --brand-primary (#7a0000), --brand-accent (#ff3131).',
        '- NO uses variables inventadas como var(--text), var(--bg), var(--muted). Usa valores concretos (#hex, rgb()) o las variables listadas.',
        '- Para redefinir variables, usa :root { --markdown-color: #111; } (no usar body o html para variables).',
      ].join('\n'),
      'IMPORTANTE: No reescribas un HTML completo si el usuario solo pide estilos o mejoras visuales. En ese caso devuelve solo CSS. Solo devuelve ```html si el usuario pide explícitamente reemplazar todo el documento.',
      'IMPORTANTE: Si el usuario pide crear o mejorar contenido (no estilos), responde con un único bloque ```markdown (o ```html si el modo es html). La app lo insertará automáticamente.',
      'Responde en español. Ayuda con redacción, estructura y revisión. No inventes datos numéricos ni legales concretos: usa [rellenar] si faltan.',
    ]
      .filter(Boolean)
      .join('\n');
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

  onAssistantNameChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim();
    this.updateConfig('name', value || 'Asistente');
  }

  onPetColorChange(event: Event): void {
    this.updateConfig('color', (event.target as HTMLInputElement).value);
  }

  onPetPersonalityChange(event: Event): void {
    const v = (event.target as HTMLSelectElement).value;
    this.updateConfig('personality', v as AssistantPetConfig['personality']);
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

  private latestAssistantMessageContent(): string {
    return (
      [...this.assistantService.messages$()]
        .reverse()
        .find((message) => message.type === 'assistant')?.content ?? ''
    );
  }

  private extractLastAssistantCodeBlock(language: string): string {
    const content = this.latestAssistantMessageContent();
    const regex = new RegExp('```' + language + '\\s*([\\s\\S]*?)\\s*```', 'i');
    const match = regex.exec(content);
    return match?.[1]?.trim() ?? '';
  }

  private stripFencedCodeBlocks(content: string): string {
    return content.replace(/```[\w-]*\s*[\s\S]*?\s*```/g, '').trim();
  }

  private async fileToReferenceAttachment(
    file: File,
  ): Promise<AssistantReferenceAttachment> {
    const kind = this.referenceAttachmentKind(file);
    const base64 = await this.readFileAsBase64(file);
    const dataUrl = `data:${file.type || 'application/octet-stream'};base64,${base64}`;
    const textPreview =
      kind === 'text' ? (await file.text()).slice(0, 12_000) : undefined;

    return {
      id: crypto.randomUUID(),
      name: file.name,
      mimeType: file.type || this.mimeTypeFromName(file.name),
      size: file.size,
      kind,
      base64,
      dataUrl: kind === 'image' ? dataUrl : undefined,
      textPreview,
    };
  }

  private referenceAttachmentKind(
    file: File,
  ): AssistantReferenceAttachment['kind'] {
    const name = file.name.toLowerCase();
    if (file.type.startsWith('image/')) {
      return 'image';
    }
    if (file.type === 'application/pdf' || name.endsWith('.pdf')) {
      return 'pdf';
    }
    if (
      file.type.startsWith('text/') ||
      /\.(html?|css|md|markdown|txt|json)$/i.test(name)
    ) {
      return 'text';
    }
    return 'other';
  }

  private mimeTypeFromName(fileName: string): string {
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.pdf')) return 'application/pdf';
    if (lower.endsWith('.html') || lower.endsWith('.htm')) return 'text/html';
    if (lower.endsWith('.css')) return 'text/css';
    if (lower.endsWith('.md') || lower.endsWith('.markdown'))
      return 'text/markdown';
    if (lower.endsWith('.json')) return 'application/json';
    if (lower.endsWith('.txt')) return 'text/plain';
    return 'application/octet-stream';
  }

  private readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result ?? '');
        resolve(result.includes(',') ? result.split(',')[1] : result);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  private aiReferenceAttachments(): AIRequestAttachment[] {
    return this.referenceAttachments
      .filter(
        (attachment) =>
          (attachment.kind === 'image' || attachment.kind === 'pdf') &&
          !!attachment.base64,
      )
      .map((attachment) => ({
        name: attachment.name,
        mimeType: attachment.mimeType,
        base64: attachment.base64 ?? '',
      }));
  }

  private referenceAttachmentPromptContext(): string {
    if (this.referenceAttachments.length === 0) {
      return '';
    }

    return [
      'Adjuntos de referencia activos:',
      ...this.referenceAttachments.map((attachment, index) => {
        const base = `${index + 1}. ${attachment.name} (${attachment.mimeType}, ${this.formatFileSize(attachment.size)}, tipo ${attachment.kind})`;
        if (attachment.textPreview) {
          return `${base}\nContenido extraído:\n${attachment.textPreview}`;
        }
        if (attachment.kind === 'image') {
          return `${base}\nImagen adjunta para análisis visual.`;
        }
        if (attachment.kind === 'pdf') {
          return `${base}\nPDF adjunto como referencia visual/documental.`;
        }
        return base;
      }),
    ].join('\n\n');
  }

  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
