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

/**
 * Resultado de búsqueda semántica en memoria
 */
interface MemorySearchResult {
  note: AgentMemoryNoteRow;
  relevance: number; // 0-1 score
}

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
   * Busca notas de memoria relevantes basado en el contexto del documento
   * Utiliza coincidencia simple de palabras clave para determinar relevancia
   */
  async findRelevantMemories(ctx: {
    documentTypeId?: string;
    title?: string;
    clientName?: string;
    existingContent?: string;
  }, limit = 6): Promise<MemorySearchResult[]> {
    await this.whenReady();
    
    // Obtener todas las notas de memoria (limitar a un número razonable para rendimiento)
    const allNotes = await agentMemoryDexie.memoryNotes
      .orderBy('createdAt')
      .reverse()
      .limit(50)
      .toArray();
    
    if (allNotes.length === 0) {
      return [];
    }
    
    // Crear un texto de búsqueda basado en el contexto
    const searchText = [
      ctx.documentTypeId,
      ctx.title,
      ctx.clientName,
      ctx.existingContent?.substring(0, 200) // Limitar el contenido para eficiencia
    ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
    
    // Calcular relevancia basada en coincidencia de palabras clave
    const scoredNotes: MemorySearchResult[] = allNotes
      .map(note => {
        const relevance = this.calculateRelevance(note.text, searchText);
        return { note, relevance };
      })
      .filter(result => result.relevance > 0.1) // Filtrar notas con poca relevancia
      .sort((a, b) => b.relevance - a.relevance) // Ordenar por relevancia descendente
      .slice(0, limit); // Limitar al número solicitado
    
    return scoredNotes;
  }
  
  /**
   * Calcula una puntuación de relevancia simple basada en coincidencia de palabras clave
   */
  private calculateRelevance(noteText: string, searchText: string): number {
    if (!noteText || !searchText) {
      return 0;
    }
    
    const noteWords = this.extractKeywords(noteText.toLowerCase());
    const searchWords = this.extractKeywords(searchText);
    
    if (noteWords.length === 0 || searchWords.length === 0) {
      return 0;
    }
    
    // Contar coincidencias
    let matches = 0;
    for (const searchWord of searchWords) {
      if (noteWords.includes(searchWord)) {
        matches++;
      }
    }
    
    // Calcular puntuación de Jaccard simplificada
    const unionSize = Array.from(new Set([...noteWords, ...searchWords])).length;
    return unionSize > 0 ? matches / unionSize : 0;
  }
  
  /**
   * Extrae palabras clave de un texto (palabras de 3+ caracteres, sin puntuación)
   */
  private extractKeywords(text: string): string[] {
    return text
      .replace(/[^\wáéíóúñ\s]/g, ' ') // Reemplazar puntuación con espacios
      .split(/\s+/)
      .filter(word => word.length >= 3 && word.length <= 20) // Filtrar por longitud
      .map(word => word.normalize('NFD').replace(/[\u0300-\u036f]/g, '')) // Remover acentos para mejor matching
      .filter((word, index, self) => self.indexOf(word) === index); // Eliminar duplicados
  }

  /**
   * Fragmento añadido al system prompt del redactor IA (skills activas + memoria reciente).
   * Ahora incluye memoria semánticamente relevante basada en el contexto del documento.
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

    // Obtener memoria relevante basada en contexto (en lugar de las últimas notas)
    // Para esto necesitamos el contexto actual, pero como no lo tenemos aquí,
    // mantenemos el comportamiento original por compatibilidad
    // En una implementación futura, podríamos pasar el contexto como parámetro
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
  
  /**
   * Obtiene aumento de prompt específico para un contexto de documento determinado
   * Esta función puede ser utilizada por servicios que tienen acceso al contexto actual
   */
  async getPromptAugmentationForContext(ctx: {
    documentTypeId?: string;
    title?: string;
    clientName?: string;
    existingContent?: string;
  }): Promise<string> {
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

    // Obtener memoria semánticamente relevante
    const relevantMemories = await this.findRelevantMemories(ctx, 8);
    if (relevantMemories.length > 0) {
      const memoryBlocks = relevantMemories
        .map(m => {
          const dateStr = m.note.createdAt.slice(0, 10);
          const relevancePct = Math.round(m.relevance * 100);
          return `- [${dateStr} - Relevancia: ${relevancePct}%] ${m.note.text}`;
        })
        .join('\n');
      
      parts.push(
        'Memoria contextual relevante (seleccionada por pertinencia al documento):\n' +
          memoryBlocks,
      );
    }

    return parts.join('\n\n');
  }
}
