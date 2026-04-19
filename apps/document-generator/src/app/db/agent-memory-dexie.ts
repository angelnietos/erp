/* eslint-disable @nx/enforce-module-boundaries -- paquete npm `dexie`, no un proyecto Nx */
import Dexie, { type Table } from 'dexie';

/** Perfil local del “usuario” del agente (este navegador). */
export interface AgentProfileRow {
  id: string;
  displayName: string;
  /** Preferencias libres (JSON stringificado opcional). */
  preferencesJson: string;
  updatedAt: string;
}

/** Skill configurable por el usuario (además de las genéricas en código). */
export interface UserSkillRow {
  id: string;
  title: string;
  body: string;
  enabled: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/** Nota de memoria a largo plazo (local; sincronización servidor opcional). */
export interface AgentMemoryNoteRow {
  id: string;
  text: string;
  /** Etiquetas opcionales separadas por comas. */
  tags: string;
  createdAt: string;
}

/**
 * Base IndexedDB dedicada al agente del generador (skills + memoria).
 * Nombre distinto de `josanz-document-generator` para no mezclar con PDFs.
 */
export class AgentMemoryDexie extends Dexie {
  profiles!: Table<AgentProfileRow, string>;
  userSkills!: Table<UserSkillRow, string>;
  memoryNotes!: Table<AgentMemoryNoteRow, string>;

  constructor() {
    super('josanz-document-agent');
    this.version(1).stores({
      profiles: 'id, updatedAt',
      userSkills: 'id, enabled, sortOrder, updatedAt',
      memoryNotes: 'id, createdAt',
    });
  }
}

export const agentMemoryDexie = new AgentMemoryDexie();
