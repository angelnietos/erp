import { Injectable } from '@angular/core';
import {
  agentMemoryDexie,
  type AgentMemoryNoteRow,
  type AgentProfileRow,
  type UserSkillRow,
} from '../db/agent-memory-dexie';

const PROFILE_ID = 'local';

/** Skills genéricas de empresa: mismo comportamiento base para todos los usuarios. */
export interface BuiltinSkill {
  id: string;
  title: string;
  body: string;
  /** El usuario puede desactivarlas en UI (persistido en localStorage). */
  defaultEnabled: boolean;
}

const BUILTIN_SKILLS: BuiltinSkill[] = [
  {
    id: 'josanz-md-structure',
    title: 'Estructura Markdown estándar',
    defaultEnabled: true,
    body: `Usa siempre títulos ## numerados para secciones principales y ### para subsecciones.
Incluye una línea en blanco entre párrafos. Las tablas solo cuando aporten claridad.`,
  },
  {
    id: 'josanz-tone',
    title: 'Tono Josanz',
    defaultEnabled: true,
    body: `Tono profesional en español de España o neutro según el contexto; evita jerga vacía y superlativos comerciales.
Prioriza hechos, alcance, plazos y responsabilidades.`,
  },
  {
    id: 'josanz-placeholders',
    title: 'Datos faltantes',
    defaultEnabled: true,
    body: `Donde falte información concreta, inserta [rellenar: descripción breve] en lugar de inventar cifras o nombres.`,
  },
  {
    id: 'josanz-consistency',
    title: 'Coherencia entre secciones',
    defaultEnabled: true,
    body: `El resumen ejecutivo, objetivos, alcance y precios deben ser coherentes entre sí; señala contradicciones si las detectas al redactar.`,
  },
];

const LS_BUILTIN_DISABLED = 'josanz_agent_builtin_disabled';

@Injectable({ providedIn: 'root' })
export class AgentPersonaService {
  private initPromise: Promise<void> | null = null;

  whenReady(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = this.runInit();
    }
    return this.initPromise;
  }

  private async runInit(): Promise<void> {
    await agentMemoryDexie.open();
    const row = await agentMemoryDexie.profiles.get(PROFILE_ID);
    if (!row) {
      const now = new Date().toISOString();
      await agentMemoryDexie.profiles.put({
        id: PROFILE_ID,
        displayName: 'Usuario',
        preferencesJson: '{}',
        updatedAt: now,
      });
    }
  }

  getBuiltinSkills(): BuiltinSkill[] {
    return [...BUILTIN_SKILLS];
  }

  isBuiltinEnabled(skillId: string): boolean {
    try {
      const raw = localStorage.getItem(LS_BUILTIN_DISABLED);
      const disabled = raw ? (JSON.parse(raw) as string[]) : [];
      const skill = BUILTIN_SKILLS.find((s) => s.id === skillId);
      if (!skill) return true;
      if (disabled.includes(skillId)) return false;
      return skill.defaultEnabled;
    } catch {
      return true;
    }
  }

  setBuiltinEnabled(skillId: string, enabled: boolean): void {
    let disabled: string[] = [];
    try {
      const raw = localStorage.getItem(LS_BUILTIN_DISABLED);
      disabled = raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      disabled = [];
    }
    if (enabled) {
      disabled = disabled.filter((id) => id !== skillId);
    } else if (!disabled.includes(skillId)) {
      disabled.push(skillId);
    }
    localStorage.setItem(LS_BUILTIN_DISABLED, JSON.stringify(disabled));
  }

  async listUserSkills(): Promise<UserSkillRow[]> {
    await this.whenReady();
    return agentMemoryDexie.userSkills.orderBy('sortOrder').toArray();
  }

  async saveUserSkill(row: Omit<UserSkillRow, 'createdAt' | 'updatedAt'> & { id: string }): Promise<void> {
    await this.whenReady();
    const now = new Date().toISOString();
    const existing = await agentMemoryDexie.userSkills.get(row.id);
    await agentMemoryDexie.userSkills.put({
      ...row,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });
  }

  async deleteUserSkill(id: string): Promise<void> {
    await this.whenReady();
    await agentMemoryDexie.userSkills.delete(id);
  }

  async getProfile(): Promise<AgentProfileRow> {
    await this.whenReady();
    const p = await agentMemoryDexie.profiles.get(PROFILE_ID);
    if (p) return p;
    await this.runInit();
    return (await agentMemoryDexie.profiles.get(PROFILE_ID)) as AgentProfileRow;
  }

  async updateDisplayName(displayName: string): Promise<void> {
    await this.whenReady();
    const prev = await this.getProfile();
    await agentMemoryDexie.profiles.put({
      ...prev,
      displayName: displayName.trim() || 'Usuario',
      updatedAt: new Date().toISOString(),
    });
  }

  async listMemoryNotes(limit = 40): Promise<AgentMemoryNoteRow[]> {
    await this.whenReady();
    return agentMemoryDexie.memoryNotes
      .orderBy('createdAt')
      .reverse()
      .limit(limit)
      .toArray();
  }

  async addMemoryNote(text: string, tags = ''): Promise<void> {
    await this.whenReady();
    const t = text.trim();
    if (!t) return;
    await agentMemoryDexie.memoryNotes.put({
      id: crypto.randomUUID(),
      text: t,
      tags: tags.trim(),
      createdAt: new Date().toISOString(),
    });
  }

  async deleteMemoryNote(id: string): Promise<void> {
    await this.whenReady();
    await agentMemoryDexie.memoryNotes.delete(id);
  }

  /**
   * Fragmento añadido al system prompt del redactor IA (skills activas + memoria reciente).
   */
  async getPromptAugmentation(): Promise<string> {
    await this.whenReady();
    const parts: string[] = [];

    const profile = await this.getProfile();
    parts.push(`Perfil del redactor (referencia): ${profile.displayName}.`);

    for (const s of BUILTIN_SKILLS) {
      if (this.isBuiltinEnabled(s.id)) {
        parts.push(`[${s.title}] ${s.body}`);
      }
    }

    const userSkills = await agentMemoryDexie.userSkills
      .filter((r) => r.enabled)
      .toArray();
    userSkills.sort((a, b) => a.sortOrder - b.sortOrder);
    for (const u of userSkills) {
      parts.push(`[Skill personalizada: ${u.title}] ${u.body}`);
    }

    const notes = await this.listMemoryNotes(12);
    if (notes.length > 0) {
      const block = notes
        .map((n) => `- (${n.createdAt.slice(0, 10)}) ${n.text}`)
        .join('\n');
      parts.push(
        'Memoria de contexto (preferencias y hechos recordados por el usuario):\n' +
          block,
      );
    }

    return parts.join('\n\n');
  }
}
