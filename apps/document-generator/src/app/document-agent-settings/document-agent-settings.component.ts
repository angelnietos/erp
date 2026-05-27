import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  AgentPersonaService,
  type BuiltinSkill,
} from '../services/agent-persona.service';
import type {
  AgentMemoryNoteRow,
  UserSkillRow,
} from '../db/agent-memory-dexie';

/** Borrador de formulario con campos siempre definidos (evita null en plantilla). */
interface SkillDraft {
  id?: string;
  title: string;
  body: string;
  enabled: boolean;
  sortOrder: number;
}

@Component({
  selector: 'app-document-agent-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-8">
      <nav
        class="flex items-center space-x-2 text-sm text-secondary"
        aria-label="Migas de pan"
      >
        <a routerLink="/documents/list" class="hover:text-primary">Documentos</a>
        <span aria-hidden="true">/</span>
        <a routerLink="/documents/settings/ai" class="hover:text-primary"
          >Config. IA</a
        >
        <span aria-hidden="true">/</span>
        <span class="text-primary font-medium">Agente y memoria</span>
      </nav>

      <div class="bg-surface rounded-2xl shadow-xl border border-soft p-8">
        <h1 class="text-2xl font-bold text-primary mb-2">
          Agente de redacción y memoria
        </h1>
        <p class="text-secondary max-w-3xl">
          Las <strong class="text-primary">skills genéricas</strong> alinean el tono y el formato para
          todos los usuarios. Las <strong class="text-primary">skills personales</strong> y la
          <strong class="text-primary">memoria</strong> se guardan en este navegador (IndexedDB
          <code class="text-xs bg-secondary border border-soft px-1.5 py-0.5 rounded text-primary">josanz-document-agent</code>).
          Para memoria compartida entre equipos, puedes levantar Postgres con el
          compose descrito en <code class="text-xs text-secondary">deploy/document-agent/</code>.
        </p>
      </div>

      <div class="bg-surface rounded-2xl shadow border border-soft p-6">
        <h2 class="text-lg font-semibold text-primary mb-4">Tu nombre (contexto)</h2>
        <div class="flex flex-wrap gap-3 items-end">
          <label class="flex flex-col gap-1">
            <span class="text-sm text-secondary">Cómo debe recordarte el agente</span>
            <input
              type="text"
              [(ngModel)]="displayName"
              class="px-4 py-2 rounded-xl border border-soft bg-secondary text-primary min-w-[16rem] focus:outline-none focus:ring-2 focus:ring-brand"
              maxlength="120"
            />
          </label>
          <button
            type="button"
            (click)="saveDisplayName()"
            class="px-4 py-2 rounded-xl bg-brand text-white font-medium hover:opacity-90 transition-opacity"
          >
            Guardar
          </button>
        </div>
      </div>

      <div class="bg-surface rounded-2xl shadow border border-soft p-6">
        <h2 class="text-lg font-semibold text-primary mb-2">
          Skills genéricas (empresa)
        </h2>
        <p class="text-sm text-secondary mb-4">
          Activas para todos; puedes <strong class="text-primary">desactivar</strong> las que <span class="text-brand font-medium">no</span> apliquen a tu sesión.
        </p>
        <ul class="space-y-3">
          @for (s of builtinSkills; track s.id) {
            <li
              class="flex gap-3 items-start p-4 rounded-xl border border-soft bg-secondary"
            >
              <input
                type="checkbox"
                [checked]="agentPersona.isBuiltinEnabled(s.id)"
                (change)="toggleBuiltin(s.id, $any($event.target).checked)"
                class="mt-1 w-4 h-4 accent-[var(--brand)] cursor-pointer"
              />
              <div class="flex-1 min-w-0">
                <div class="font-semibold text-primary">{{ s.title }}</div>
                <p class="text-sm text-secondary mt-1">{{ s.body }}</p>
              </div>
            </li>
          }
        </ul>
      </div>

      <div class="bg-surface rounded-2xl shadow border border-soft p-6">
        <div class="flex flex-wrap justify-between gap-3 mb-4">
          <h2 class="text-lg font-semibold text-primary">Skills personales</h2>
          <button
            type="button"
            (click)="startNewSkill()"
            class="text-sm px-3 py-2 rounded-lg border border-soft bg-secondary text-primary hover:bg-tertiary transition-colors"
          >
            + Nueva skill
          </button>
        </div>
        @if (userSkills.length === 0 && !skillDraft) {
          <p class="text-sm text-secondary">Aún no has añadido instrucciones propias.</p>
        }
        @for (u of userSkills; track u.id) {
          <div class="skill-card">
            @if (skillDraft && skillDraft.id === u.id) {
              <input
                [(ngModel)]="skillDraft.title"
                class="w-full px-3 py-2 rounded-lg border border-soft bg-tertiary text-primary font-medium focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="Título"
              />
              <textarea
                [(ngModel)]="skillDraft.body"
                rows="4"
                class="w-full px-3 py-2 rounded-lg border border-soft bg-tertiary text-primary font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="Instrucciones que el modelo debe seguir al redactar…"
              ></textarea>
              <div class="flex gap-2 flex-wrap items-center">
                <label class="inline-flex items-center gap-2 text-sm text-primary cursor-pointer">
                  <input
                    type="checkbox"
                    [(ngModel)]="skillDraft.enabled"
                    class="w-4 h-4 accent-[var(--brand)]"
                  />
                  Activa
                </label>
                <button
                  type="button"
                  (click)="saveSkillDraft()"
                  class="btn-action bg-success text-white text-sm hover:opacity-90"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  (click)="cancelEdit()"
                  class="btn-action border border-soft bg-tertiary text-primary text-sm hover:opacity-80"
                >
                  Cancelar
                </button>
              </div>
            } @else {
              <div class="flex justify-between gap-2 flex-wrap">
                <span class="font-semibold text-primary">{{ u.title }}</span>
                <div class="flex gap-3">
                  <button
                    type="button"
                    (click)="editSkill(u)"
                    class="text-sm text-brand hover:underline font-medium"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    (click)="deleteSkill(u.id)"
                    class="text-sm text-danger hover:underline font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
              <p class="text-sm text-secondary whitespace-pre-wrap">
                {{ u.body }}
              </p>
              <span class="text-xs text-muted"
                >{{ u.enabled ? 'Activa' : 'Desactivada' }} · orden
                {{ u.sortOrder }}</span
              >
            }
          </div>
        }
        @if (skillDraft && skillDraft.id === undefined) {
          <div class="p-4 rounded-xl border border-dashed border-soft bg-secondary space-y-2">
            <input
              [(ngModel)]="skillDraft.title"
              class="w-full px-3 py-2 rounded-lg border border-soft bg-tertiary text-primary focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder="Título"
            />
            <textarea
              [(ngModel)]="skillDraft.body"
              rows="4"
              class="w-full px-3 py-2 rounded-lg border border-soft bg-tertiary text-primary font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder="Instrucciones que el modelo debe seguir al redactar…"
            ></textarea>
            <div class="flex gap-2 flex-wrap">
              <button
                type="button"
                (click)="saveSkillDraft()"
                class="btn-action bg-success text-white text-sm hover:opacity-90"
              >
                Crear
              </button>
              <button
                type="button"
                (click)="cancelEdit()"
                class="btn-action border border-soft bg-tertiary text-primary text-sm hover:opacity-80"
              >
                Cancelar
              </button>
            </div>
          </div>
        }
      </div>

      <div class="bg-surface rounded-2xl shadow border border-soft p-6">
        <h2 class="text-lg font-semibold text-primary mb-2">Memoria a largo plazo</h2>
        <p class="text-sm text-secondary mb-4">
          Notas que el agente incluirá en el system prompt (últimas entradas). Útil
          para preferencias estables ("siempre firmar como…", sectores, etc.).
        </p>
        <div class="flex flex-col sm:flex-row gap-2 mb-4">
          <textarea
            [(ngModel)]="newMemoryText"
            rows="3"
            class="flex-1 px-3 py-2 rounded-xl border border-soft bg-secondary text-primary focus:outline-none focus:ring-2 focus:ring-brand"
            placeholder="Nueva nota para el agente…"
          ></textarea>
          <button
            type="button"
            (click)="addMemory()"
            class="px-4 py-2 rounded-xl bg-brand text-white self-start hover:opacity-90 transition-opacity"
          >
            Añadir
          </button>
        </div>
        <ul class="space-y-2">
          @for (m of memories; track m.id) {
            <li class="memory-item">
              <span class="whitespace-pre-wrap flex-1 text-primary">{{ m.text }}</span>
              <button
                type="button"
                (click)="removeMemory(m.id)"
                class="text-danger shrink-0 hover:underline font-medium"
              >
                Quitar
              </button>
            </li>
          }
        </ul>
      </div>
    </div>
  `,
})
export class DocumentAgentSettingsComponent implements OnInit {
  readonly agentPersona = inject(AgentPersonaService);

  builtinSkills: BuiltinSkill[] = [];
  userSkills: UserSkillRow[] = [];
  memories: AgentMemoryNoteRow[] = [];
  displayName = '';

  newMemoryText = '';
  skillDraft: SkillDraft | null = null;

  async ngOnInit(): Promise<void> {
    this.builtinSkills = this.agentPersona.getBuiltinSkills();
    await this.reloadAll();
  }

  private async reloadAll(): Promise<void> {
    await this.agentPersona.whenReady();
    const p = await this.agentPersona.getProfile();
    this.displayName = p.displayName;
    this.userSkills = await this.agentPersona.listUserSkills();
    this.memories = await this.agentPersona.listMemoryNotes(50);
  }

  async saveDisplayName(): Promise<void> {
    await this.agentPersona.updateDisplayName(this.displayName);
    await this.reloadAll();
  }

  toggleBuiltin(id: string, enabled: boolean): void {
    this.agentPersona.setBuiltinEnabled(id, enabled);
  }

  startNewSkill(): void {
    this.skillDraft = {
      title: '',
      body: '',
      enabled: true,
      sortOrder: this.userSkills.length,
    };
  }

  editSkill(u: UserSkillRow): void {
    this.skillDraft = {
      id: u.id,
      title: u.title,
      body: u.body,
      enabled: u.enabled,
      sortOrder: u.sortOrder,
    };
  }

  cancelEdit(): void {
    this.skillDraft = null;
  }

  async saveSkillDraft(): Promise<void> {
    const d = this.skillDraft;
    if (!d?.title?.trim() || !d.body?.trim()) {
      return;
    }
    const id = d.id ?? crypto.randomUUID();
    await this.agentPersona.saveUserSkill({
      id,
      title: d.title.trim(),
      body: d.body.trim(),
      enabled: d.enabled !== false,
      sortOrder: d.sortOrder ?? this.userSkills.length,
    });
    this.skillDraft = null;
    await this.reloadAll();
  }

  async deleteSkill(id: string): Promise<void> {
    if (!confirm('¿Eliminar esta skill?')) return;
    await this.agentPersona.deleteUserSkill(id);
    await this.reloadAll();
  }

  async addMemory(): Promise<void> {
    const t = this.newMemoryText.trim();
    if (!t) return;
    await this.agentPersona.addMemoryNote(t);
    this.newMemoryText = '';
    await this.reloadAll();
  }

  async removeMemory(id: string): Promise<void> {
    await this.agentPersona.deleteMemoryNote(id);
    await this.reloadAll();
  }
}
