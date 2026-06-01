import { Injectable } from '@angular/core';
import {
  agentMemoryDexie,
  type AgentMemoryNoteRow,
  type AgentProfileRow,
  type UserSkillRow,
  type ConversationRow,
} from '../db/agent-memory-dexie';
import {
  AssistantMessage,
  AssistantContextService,
} from '../services/assistant-context.service';

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
  {
    id: 'josanz-design-styles',
    title: 'Estilos de diseño corporativo',
    defaultEnabled: true,
    body: `Sé capaz de crear documentos con estilos inspirados en marcas como Nintendo Switch (neón, vibrante), Ubisoft (moderno, premium), Tokyostar (japonés, limpio) o GameOver (gaming, oscuro).
Usa clases CSS como .hero, .section, .card, .callout, .metadata-grid, .table-wrap, .signature-grid, .footer, .doc-block.
Para HTML: usa inline styles para colores (#RRGGBB) y clases semánticas. Los elementos de diseño: tarjetas con sombra, divisores degradados, iconos emoji, tipografía moderna.`,
  },
  {
    id: 'josanz-html-cards',
    title: 'Diseño de tarjetas y componentes HTML',
    defaultEnabled: true,
    body: `Cuando generes HTML visual, usa estructuras de tarjetas (.card) con fondo blanco y sombra suave.
Las secciones (.section) deben tener títulos con estilo y contenido bien espaciado.
Las tablas (.doc-table) usan bordes suaves y alternancia de filas.
Los bloques de llamada de atención (.callout, aside) usan borde izquierdo coloreado.
El pie de página (.footer) tiene borde superior y texto secundario.`,
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

  /** Conversation management methods */
  async saveConversation(
    messages: AssistantMessage[],
    title?: string
  ): Promise<string> {
    await this.whenReady();
    const now = new Date().toISOString();
    const conversationId = title ? `${title}-${now}` : crypto.randomUUID();
    const conversationTitle = title || `Conversación ${new Date().toLocaleString()}`;
    
    await agentMemoryDexie.conversations.put({
      id: conversationId,
      title: conversationTitle,
      messagesJson: JSON.stringify(messages),
      createdAt: now,
      updatedAt: now,
    });
    
    return conversationId;
  }

  async getConversation(id: string): Promise<ConversationRow | undefined> {
    await this.whenReady();
    return agentMemoryDexie.conversations.get(id);
  }

  async listConversations(limit = 20): Promise<ConversationRow[]> {
    await this.whenReady();
    return agentMemoryDexie.conversations
      .orderBy('updatedAt')
      .reverse()
      .limit(limit)
      .toArray();
  }

  async deleteConversation(id: string): Promise<void> {
    await this.whenReady();
    await agentMemoryDexie.conversations.delete(id);
  }

  async updateConversationTitle(id: string, title: string): Promise<void> {
    await this.whenReady();
    const conversation = await agentMemoryDexie.conversations.get(id);
    if (conversation) {
      await agentMemoryDexie.conversations.put({
        ...conversation,
        title,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  async getPromptAugmentationForContext(ctx: {
    documentTypeId: string;
    title?: string;
    clientName?: string;
    existingContent?: string;
  }): Promise<string> {
    const contextParts: string[] = [
      `Tipo de documento: ${ctx.documentTypeId}.`,
    ];

    if (ctx.title?.trim()) {
      contextParts.push(`Título: ${ctx.title.trim()}.`);
    }

    if (ctx.clientName?.trim()) {
      contextParts.push(`Cliente: ${ctx.clientName.trim()}.`);
    }

    if (ctx.existingContent?.trim()) {
      contextParts.push(
        'Contenido previo relevante:\n' +
          ctx.existingContent.trim().slice(0, 120_000),
      );
    }

    const augmentation = await this.getPromptAugmentation();
    return [contextParts.join('\n'), augmentation].filter(Boolean).join('\n\n');
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