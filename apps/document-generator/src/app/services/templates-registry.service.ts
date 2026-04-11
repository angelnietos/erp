import { Injectable, signal } from '@angular/core';

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'business' | 'hr' | 'technical' | 'legal';
  content: string;
  tags: string[];
  aiEnabled?: boolean;
  autoFillFields?: string[];
}

@Injectable({ providedIn: 'root' })
export class TemplatesRegistryService {
  private readonly templates = signal<DocumentTemplate[]>([
    {
      id: 'empty',
      name: 'Vacío',
      description: 'Documento en blanco',
      icon: '📄',
      category: 'business',
      content: '',
      tags: ['básico'],
    },
    {
      id: 'basic-structure',
      name: 'Estructura básica',
      description: 'Esquema básico de documento',
      icon: '📋',
      category: 'business',
      content:
        '# Título del Documento\n\n## Resumen Ejecutivo\n\nEscribe aquí un resumen de máximo 3 párrafos...\n\n## Objetivos\n\n- Objetivo 1\n- Objetivo 2\n- Objetivo 3\n\n## Contenido Principal\n\n## Conclusiones',
      tags: ['general'],
    },
    {
      id: 'resume-standard',
      name: 'Currículum Vitae Estándar',
      description: 'CV profesional optimizado para ATS',
      icon: '👤',
      category: 'hr',
      content: `# Nombre Apellidos
Puesto / Perfil Profesional

📧 correo@ejemplo.com | 📱 +34 600 000 000 | 🔗 linkedin.com/in/usuario | 📍 Ciudad, País

---

## Perfil Profesional

Profesional con X años de experiencia en...

## Experiencia Laboral

### Puesto | Empresa
**Fecha Inicio - Fecha Fin**

- Logro cuantificable 1
- Logro cuantificable 2
- Responsabilidad principal

### Puesto Anterior | Empresa Anterior
**Fecha Inicio - Fecha Fin**

## Formación Académica

### Título | Universidad
**Año**

## Habilidades Técnicas

| Categoría | Habilidades |
|-----------|-------------|
| Lenguajes | TypeScript, Python, Java |
| Frameworks | Angular, NestJS, React |
| Herramientas | Git, Docker, AWS |

## Certificaciones

- Certificación 1 (Año)
- Certificación 2 (Año)

## Idiomas

- Español: Nativo
- Inglés: C1
`,
      tags: ['candidatos', 'rrhh', 'empleo'],
      aiEnabled: true,
      autoFillFields: ['nombre', 'puesto', 'empresa'],
    },
    {
      id: 'resume-developer',
      name: 'Currículum Desarrollador',
      description: 'CV optimizado para puestos técnicos',
      icon: '💻',
      category: 'hr',
      content: `# Nombre Apellidos
Ingeniero de Software / Full Stack Developer

📧 correo@ejemplo.com | 📱 +34 600 000 000 | 🔗 github.com/usuario | 📍 Remoto

---

## Perfil

Desarrollador con experiencia construyendo sistemas escalables...

## Stack Tecnológico

**Frontend**: Angular, React, TypeScript, Tailwind
**Backend**: Node.js, NestJS, PostgreSQL, Redis
**DevOps**: Docker, Kubernetes, AWS, CI/CD
**Otros**: Git, GraphQL, Microservicios

## Proyectos Destacados

### Nombre Proyecto
Descripción técnica del proyecto. Resultados cuantificables.

Tecnologías: Angular 17, NestJS, PostgreSQL

## Experiencia

### Senior Developer | Empresa
2022 - Actualidad

- Diseñé e implementé X funcionalidad reduciendo tiempo en un 40%
- Lideré migración de arquitectura monolítica a microservicios

## Educación

### Grado en Ingeniería Informática
Universidad | 2016 - 2020
`,
      tags: ['desarrollador', 'técnico', 'software'],
      aiEnabled: true,
    },
    {
      id: 'technical-interview',
      name: 'Prueba Técnica Entrevista',
      description: 'Plantilla estandarizada para evaluar candidatos',
      icon: '✍️',
      category: 'hr',
      content: `# Evaluación Técnica Candidato

## Datos Generales

| Campo | Valor |
|-------|-------|
| Candidato | |
| Puesto | |
| Fecha Entrevista | ${new Date().toLocaleDateString()} |
| Evaluador | |

---

## Criterios de Evaluación

| Área | Puntuación (1-10) | Comentarios |
|------|--------------------|-------------|
| Conocimientos Técnicos | | |
| Resolución de Problemas | | |
| Comunicación Técnica | | |
| Cultura y Ajuste | | |
| Motivación | | |

---

## Preguntas Técnicas

### 1. Conceptos Básicos

- [ ] Pregunta 1:
- [ ] Pregunta 2:
- [ ] Pregunta 3:

### 2. Ejercicio Práctico

**Enunciado:**

**Solución del candidato:**

**Evaluación:**

### 3. Arquitectura y Diseño

Pregunta sobre diseño de sistemas.

---

## Ejercicio de Código

\`\`\`typescript
// Ejercicio propuesto al candidato

\`\`\`

---

## Conclusión y Recomendación

✅ Recomiendo contratación
⚠️ Recomiendo segunda entrevista
❌ No recomendado

**Comentarios finales:**
`,
      tags: ['entrevista', 'evaluación', 'rrhh'],
      aiEnabled: true,
    },
    {
      id: 'interview-scorecard',
      name: 'Tarjeta de Evaluación Entrevista',
      description: 'Scorecard estandarizado para todos los entrevistadores',
      icon: '📊',
      category: 'hr',
      content: `# Scorecard Entrevista

## Información
Candidato:
Puesto:
Fecha:
Entrevistador:

---

## Competencias Core

| Competencia | Nivel | Justificación |
|-------------|-------|---------------|
| Resolución de problemas | 1 2 3 4 5 | |
| Comunicación | 1 2 3 4 5 | |
| Aprendizaje | 1 2 3 4 5 | |
| Trabajo en equipo | 1 2 3 4 5 | |
| Motivación | 1 2 3 4 5 | |

---

## Competencias Específicas

| Competencia | Nivel | Justificación |
|-------------|-------|---------------|
| Conocimientos técnicos | 1 2 3 4 5 | |
| Experiencia relevante | 1 2 3 4 5 | |
| Visión técnica | 1 2 3 4 5 | |

---

## Señales Rojas 🚩

- [ ] Falta de preparación
- [ ] Explicaciones vagas
- [ ] Culpa a terceros
- [ ] No sabe decir "no sé"
- [ ] Otras:

---

## Señales Verdes ✅

- [ ] Hace preguntas inteligentes
- [ ] Admite errores
- [ ] Ejemplos concretos
- [ ] Entiende el negocio
- [ ] Otras:

---

## Decisión Final

[ ] Contratar
[ ] Segunda entrevista
[ ] Rechazar

**Comentario final:**

---
*Firmado: _________________________*
`,
      tags: ['scorecard', 'estandarizado', 'evaluación'],
      aiEnabled: true,
    },
    {
      id: 'technical-report',
      name: 'Informe Técnico',
      description: 'Plantilla para informes y documentación',
      icon: '📖',
      category: 'technical',
      content:
        '# Informe Técnico\n\n## Datos Generales\n\n| Campo | Valor |\n|-------|-------|\n| Título | |\n| Fecha | ' +
        new Date().toLocaleDateString() +
        ' |\n| Autor | |\n| Versión | 1.0 |\n\n## Resumen Ejecutivo\n\n## Contexto\n\n## Análisis\n\n## Conclusiones\n\n## Recomendaciones\n\n## Anexos',
      tags: ['informe', 'documentación'],
    },
    {
      id: 'offer-letter',
      name: 'Carta de Oferta',
      description: 'Carta oficial de oferta de empleo',
      icon: '📧',
      category: 'hr',
      content: `# Carta de Oferta de Empleo

**Fecha:** ${new Date().toLocaleDateString()}

Estimado/a [Nombre Candidato],

Nos complace ofrecerte el puesto de [Puesto] en [Empresa] con fecha de incorporación el [Fecha].

## Condiciones del Contrato

| Concepto | Detalle |
|----------|---------|
| Salario anual bruto | |
| Periodo de prueba | 3 meses |
| Vacaciones | 23 días + festivos |
| Horario | Flexible 40h |
| Modalidad | Remoto / Híbrido / Presencial |

## Beneficios

- Seguro médico privado
- Formación continua
- Bonos por objetivos
- Stock options

A la espera de tu confirmación.

Atentamente,

[Nombre Responsable]
[Puesto]
[Empresa]
`,
      tags: ['oferta', 'contratación', 'rrhh'],
    },
  ]);

  readonly all = this.templates.asReadonly();

  getById(id: string): DocumentTemplate | undefined {
    return this.templates().find((t) => t.id === id);
  }

  getByCategory(category: DocumentTemplate['category']): DocumentTemplate[] {
    return this.templates().filter((t) => t.category === category);
  }

  getCategories(): {
    id: DocumentTemplate['category'];
    name: string;
    icon: string;
  }[] {
    return [
      { id: 'business', name: 'Negocio', icon: '💼' },
      { id: 'hr', name: 'Recursos Humanos', icon: '👥' },
      { id: 'technical', name: 'Técnico', icon: '⚙️' },
      { id: 'legal', name: 'Legal', icon: '⚖️' },
    ];
  }

  search(query: string): DocumentTemplate[] {
    const q = query.toLowerCase();
    return this.templates().filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q)),
    );
  }

  addTemplate(template: Omit<DocumentTemplate, 'id'>): void {
    const newTemplate = { ...template, id: crypto.randomUUID() };
    this.templates.update((t) => [...t, newTemplate as DocumentTemplate]);
  }
}
