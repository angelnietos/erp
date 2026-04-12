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
      content: ``,
      tags: ['básico'],
    },
    {
      id: 'basic-structure',
      name: 'Estructura básica',
      description: 'Esquema básico de documento',
      icon: '📋',
      category: 'business',
      content: `# Título del Documento

## Resumen Ejecutivo

En este documento se presenta un análisis detallado de [tema principal], incluyendo [aspectos clave]. El objetivo principal es [objetivo general] mediante [metodología o enfoque].

Los resultados obtenidos demuestran [conclusión principal], lo que permitirá [beneficios esperados].

## Introducción

### Contexto

[Describa el contexto y antecedentes del documento]

### Alcance

Este documento abarca los siguientes aspectos:
- [Ámbito 1]
- [Ámbito 2]
- [Ámbito 3]

## Desarrollo

### Sección Principal

[Contenido detallado de la sección principal]

#### Subsección 1

[Desarrollo de la subsección 1]

#### Subsección 2

[Desarrollo de la subsección 2]

### Análisis y Resultados

| Aspecto | Descripción | Resultado |
|---------|-------------|-----------|
| Aspecto 1 | [Descripción] | [Resultado] |
| Aspecto 2 | [Descripción] | [Resultado] |
| Aspecto 3 | [Descripción] | [Resultado] |

## Conclusiones y Recomendaciones

### Conclusiones

Basándonos en el análisis realizado, podemos concluir que:

1. [Conclusión 1]
2. [Conclusión 2]
3. [Conclusión 3]

### Recomendaciones

Se recomienda implementar las siguientes acciones:

- **Recomendación 1**: [Descripción detallada]
- **Recomendación 2**: [Descripción detallada]
- **Recomendación 3**: [Descripción detallada]

## Anexos

- [Anexo 1: Documentos de referencia]
- [Anexo 2: Datos adicionales]
- [Anexo 3: Gráficos y diagramas]`,
      tags: ['general'],
    },
    {
      id: 'resume-standard',
      name: 'Currículum Vitae Ejecutivo',
      description: 'CV profesional para posiciones ejecutivas y directivas',
      icon: '👔',
      category: 'hr',
      content: `# [TU NOMBRE COMPLETO]

## Información Personal

| | |
|---|---|
| **Dirección** | [Ciudad, País] |
| **Teléfono** | [+34] XXX XXX XXX |
| **Email** | [tu.email@ejemplo.com] |
| **LinkedIn** | [linkedin.com/in/tu-perfil] |
| **Nacionalidad** | [Española] |
| **Fecha de nacimiento** | [DD/MM/AAAA] |

---

## Perfil Ejecutivo

Profesional con [X años] de experiencia en [sector/industria], especializado en [especialización principal]. Experto en [área de expertise 1], [área de expertise 2] y [área de expertise 3]. He liderado equipos de [tamaño del equipo] personas, gestionando presupuestos de [€XXX.XXX] y logrando [logros principales].

Busco oportunidades en [tipo de posición] donde pueda aportar mi experiencia en [áreas clave] para contribuir al crecimiento sostenible de organizaciones [tipo de empresa].

---

## Experiencia Profesional

### [Puesto Actual] | [Empresa Actual]
**[Fecha Inicio - Actualidad]** | *[Ciudad, País]*

**Responsabilidades principales:**
- Liderazgo y gestión de [equipo/departamento/área]
- Desarrollo e implementación de [estrategias/procesos/sistemas]
- Gestión de presupuestos y optimización de recursos
- Coordinación con stakeholders internos y externos

**Logros cuantificables:**
- [Logro 1 con métricas específicas]
- [Logro 2 con métricas específicas]
- [Logro 3 con métricas específicas]

**Tecnologías/Herramientas:** [Lista relevante]

---

### [Puesto Anterior] | [Empresa Anterior]
**[Fecha Inicio - Fecha Fin]** | *[Ciudad, País]*

**Responsabilidades principales:**
- [Responsabilidad 1]
- [Responsabilidad 2]
- [Responsabilidad 3]

**Logros destacados:**
- [Logro 1]
- [Logro 2]
- [Logro 3]

---

### [Primer Puesto Relevante] | [Empresa]
**[Fecha Inicio - Fecha Fin]** | *[Ciudad, País]*

**Responsabilidades principales:**
- [Responsabilidad 1]
- [Responsabilidad 2]
- [Responsabilidad 3]

---

## Formación Académica

### [Título Superior] | [Universidad/Centro]
**[Año Inicio - Año Fin]** | *[Ciudad, País]*

- Especialización en [área de especialización]
- Proyecto final: [Título del proyecto] - [Calificación]
- [Menciones honoríficas o reconocimientos]

### [Título Secundario] | [Instituto/Centro]
**[Año Inicio - Año Fin]** | *[Ciudad, País]*

- [Especialización o rama]
- [Calificación obtenida]

---

## Habilidades y Competencias

### Habilidades Técnicas
- **[Categoría 1]**: [Habilidad 1], [Habilidad 2], [Habilidad 3] *(Nivel: Avanzado/Experto)*
- **[Categoría 2]**: [Habilidad 1], [Habilidad 2], [Habilidad 3] *(Nivel: Avanzado/Experto)*
- **[Categoría 3]**: [Habilidad 1], [Habilidad 2], [Habilidad 3] *(Nivel: Intermedio/Avanzado)*

### Habilidades Blandas
- Liderazgo y gestión de equipos
- Comunicación efectiva y presentación
- Resolución de problemas y toma de decisiones
- Trabajo en equipo y colaboración
- Adaptabilidad y aprendizaje continuo

---

## Certificaciones y Cursos

- **[Certificación 1]** - [Organismo emisor] ([Año])
- **[Certificación 2]** - [Organismo emisor] ([Año])
- **[Certificación 3]** - [Organismo emisor] ([Año])

---

## Idiomas

| Idioma | Nivel | Certificación |
|--------|-------|---------------|
| Español | Nativo | - |
| Inglés | C1/C2 | [Título del certificado] ([Año]) |
| [Otro idioma] | [Nivel] | [Certificación] ([Año]) |

---

## Premios y Reconocimientos

- **[Premio/Reconocimiento 1]** - [Institución/Organización] ([Año])
- **[Premio/Reconocimiento 2]** - [Institución/Organización] ([Año])
- **[Premio/Reconocimiento 3]** - [Institución/Organización] ([Año])

---

## Intereses Profesionales

- [Interés 1 relacionado con la profesión]
- [Interés 2 relacionado con la profesión]
- [Interés 3 relacionado con la profesión]

---

## Referencias

Disponibles bajo petición.

## Perfil Profesional

Profesional del marketing digital con más de 8 años de experiencia liderando estrategias omnicanal en empresas B2B y B2C. Especializada en transformación digital, growth hacking y optimización de conversiones. He dirigido equipos multidisciplinares logrando incrementos de ROI del 300% y expansiones internacionales en mercados LATAM y Europa.

Apasionada por la innovación tecnológica y el análisis de datos, combino creatividad estratégica con métricas accionables para impulsar el crecimiento sostenible de las organizaciones.

## Experiencia Laboral

### Directora de Marketing Digital | TechSolutions España
**Marzo 2022 - Actualidad**

- Lideré la transformación digital completa de la compañía, incrementando las ventas online en un 180% en 18 meses
- Desarrollé e implementé estrategias de inbound marketing que generaron 50.000 leads cualificados mensualmente
- Gestioné un presupuesto de €2.5M anual, optimizando el CAC en un 40% mediante automatización de procesos
- Dirigí equipos de 12 personas en Madrid y México, implementando metodologías ágiles y cultura data-driven
- Lancé productos digitales que generaron €15M en ingresos adicionales durante 2023

### Senior Marketing Manager | GlobalTech Corporation
**Enero 2019 - Febrero 2022**

- Diseñé y ejecuté campañas multicanal que aumentaron el engagement del 25% al 85% en redes sociales
- Implementé sistemas de CRM avanzados, mejorando la retención de clientes en un 35%
- Coordiné proyectos de rebranding internacional en 8 países, manteniendo consistencia de marca
- Analicé y optimicé funnels de conversión, reduciendo el bounce rate del 60% al 25%
- Formé y mentoré a 8 profesionales junior, desarrollando sus habilidades en marketing automation

### Marketing Specialist | Innovate Corp
**Junio 2016 - Diciembre 2018**

- Gestioné campañas SEM/PPC con presupuesto de €500K, logrando ROAS de 4.2x
- Desarrollé contenido SEO que posicionó 200+ keywords en primeras posiciones
- Creé dashboards de analytics en Google Data Studio para reporting ejecutivo
- Colaboré en el lanzamiento de 3 nuevos productos, generando 100.000 usuarios en el primer trimestre

## Formación Académica

### Máster en Marketing Digital | Universidad Complutense de Madrid
**2015 - 2016**

- Especialización en Digital Analytics y E-commerce
- Proyecto final: Estrategia digital para empresa familiar (Nota: 9.2/10)
- Certificación Google Analytics y Google Ads

### Grado en Publicidad y RRPP | Universidad de Sevilla
**2011 - 2015**

- Especialización en Marketing Estratégico
- Erasmus en University of London (2014)
- Trabajo fin de grado sobre Social Media Marketing (Nota: 8.8/10)

## Habilidades Técnicas

| Categoría | Habilidades | Nivel |
|-----------|-------------|-------|
| **Plataformas Publicidad** | Google Ads, Facebook Ads, LinkedIn Ads, TikTok Ads | Experto |
| **Analytics & BI** | Google Analytics 4, Adobe Analytics, Tableau, Power BI | Avanzado |
| **Marketing Automation** | HubSpot, Marketo, ActiveCampaign, Klaviyo | Experto |
| **SEO/SEM** | Ahrefs, SEMrush, Screaming Frog, Google Search Console | Avanzado |
| **Desarrollo Web** | HTML/CSS, WordPress, Shopify, Squarespace | Intermedio |
| **Herramientas** | Slack, Trello, Jira, Figma, Canva | Experto |

## Certificaciones

- **Google Ads Professional** (2023) - Google
- **HubSpot Inbound Marketing** (2022) - HubSpot Academy
- **Facebook Blueprint Professional** (2021) - Meta
- **Google Analytics Individual Qualification** (2020) - Google
- **Advanced Google Ads** (2019) - Google
- **Agile Scrum Master** (2018) - Scrum Alliance

## Idiomas

- **Español**: Nativo
- **Inglés**: C2 - Proficiency (Cambridge Certificate)
- **Francés**: B2 - Upper Intermediate (DELF)
- **Portugués**: B1 - Intermediate (Autoaprendizaje)

## Premios y Reconocimientos

- **Premio Nacional de Marketing Digital 2023** - Mejor Estrategia B2B
- **Top 50 Mujeres en Tecnología 2022** - Forbes España
- **Certificación Elite Partner 2021** - Google Partner Program

## Voluntariado e Intereses

- Mentora en programas de emprendimiento femenino
- Conferencista en eventos de marketing digital
- Colaboradora en proyectos open source de marketing automation
- Apasionada por el running y el yoga
- Miembro activo de la comunidad tech en Madrid
`,
      tags: ['candidatos', 'rrhh', 'empleo'],
      aiEnabled: true,
      autoFillFields: ['nombre', 'puesto', 'empresa'],
    },
    {
      id: 'resume-developer',
      name: 'Currículum Vitae Técnico',
      description: 'CV especializado para desarrolladores y perfiles técnicos',
      icon: '💻',
      category: 'hr',
      content: `# [TU NOMBRE COMPLETO]

## 👨‍💻 Desarrollador Full Stack | [Especialización]

**[Ciudad, País]** | **[Email]** | **[GitHub]** | **[LinkedIn]** | **[Portafolio]**

---

## 🚀 Perfil Técnico

Desarrollador [especialización: Full Stack / Frontend / Backend / Mobile] con [X años] de experiencia en el desarrollo de aplicaciones web y móviles escalables. Experto en [tecnologías principales], con sólida formación en [áreas de expertise]. Apasionado por escribir código limpio, implementando las mejores prácticas de la industria y contribuyendo a proyectos de alto impacto.

**Stack Principal:** [Tecnología 1] • [Tecnología 2] • [Tecnología 3] • [Tecnología 4]

---

## 💼 Experiencia Profesional

### **Senior [Puesto] | [Empresa Tech]** ⭐
**[Fecha Inicio - Actualidad]** | *[Modalidad: Remoto/Híbrido/Presencial]*

**Proyecto Principal:** [Nombre del proyecto] - [Breve descripción]

**Tecnologías:** [Lista de tecnologías usadas]
**Equipo:** [Tamaño del equipo] desarrolladores
**Metodología:** [Agile/Scrum/Kanban]

**Responsabilidades:**
- Desarrollo e implementación de [tipo de funcionalidades]
- Arquitectura y diseño de [componentes/sistemas]
- Optimización de performance y escalabilidad
- Code reviews y mentoría técnica
- Integración con APIs y servicios externos

**Logros:**
- ✅ [Logro técnico cuantificable 1]
- ✅ [Logro técnico cuantificable 2]
- ✅ [Logro técnico cuantificable 3]
- ✅ [Logro técnico cuantificable 4]

---

### **Mid-Level [Puesto] | [Empresa Tech]** ⭐
**[Fecha Inicio - Fecha Fin]** | *[Ciudad, País]*

**Tecnologías:** [Stack tecnológico usado]

**Responsabilidades:**
- Desarrollo de features end-to-end
- Mantenimiento y debugging de aplicaciones
- Implementación de tests automatizados
- Documentación técnica y procedimientos

**Logros:**
- ✅ [Logro 1]
- ✅ [Logro 2]
- ✅ [Logro 3]

---

### **Junior [Puesto] | [Empresa Tech/Startup]** ⭐
**[Fecha Inicio - Fecha Fin]** | *[Ciudad, País]*

**Tecnologías:** [Stack de aprendizaje]

**Responsabilidades:**
- Desarrollo de componentes y funcionalidades
- Aprendizaje de nuevas tecnologías
- Participación en code reviews
- Colaboración con equipos multidisciplinares

---

## 🎓 Formación Académica

### **[Título Principal] en [Especialidad]**
**[Universidad/Centro Educativo]** | *[Ciudad, País]*
**[Año Inicio - Año Fin]**

- **Proyecto Final:** [Nombre del proyecto] - [Tecnologías usadas]
- **Calificación:** [Nota obtenida]
- **Honores/ Menciones:** [Reconocimientos académicos]

### **[Título Secundario]**
**[Instituto/Centro]** | *[Ciudad, País]*
**[Año Inicio - Año Fin]**

---

## 🛠️ Tecnologías & Herramientas

### **Lenguajes de Programación**
- **[Lenguaje 1]**: [Nivel] - [Años de experiencia]
- **[Lenguaje 2]**: [Nivel] - [Años de experiencia]
- **[Lenguaje 3]**: [Nivel] - [Años de experiencia]

### **Frontend**
- **Frameworks/Librerías:** [Framework 1], [Framework 2], [Framework 3]
- **Styling:** [CSS/Sass], [Tailwind], [Styled Components]
- **State Management:** [Redux], [Zustand], [Context API]
- **Testing:** [Jest], [Cypress], [Playwright]

### **Backend**
- **Runtimes:** [Node.js], [Python], [Go]
- **Frameworks:** [Express], [NestJS], [FastAPI]
- **Databases:** [PostgreSQL], [MongoDB], [Redis]
- **ORMs:** [Prisma], [TypeORM], [Mongoose]

### **DevOps & Cloud**
- **Cloud:** [AWS], [Vercel], [Railway]
- **Containers:** [Docker], [Kubernetes]
- **CI/CD:** [GitHub Actions], [GitLab CI]
- **Monitoring:** [Sentry], [DataDog]

### **Herramientas de Desarrollo**
- **Control de Versiones:** Git, GitHub, GitLab
- **IDE/Editores:** VS Code, WebStorm, Vim
- **API Tools:** Postman, Insomnia, Thunder Client
- **Design:** Figma, Adobe XD

---

## 🏆 Proyectos Personales

### **[Nombre del Proyecto]** | [GitHub Link]
**Descripción:** [Breve descripción del proyecto y su propósito]

**Tecnologías:** [Stack usado]
**Características:**
- ⭐ [Feature 1]
- ⭐ [Feature 2]
- ⭐ [Feature 3]

---

### **[Nombre del Proyecto 2]** | [GitHub Link]
**Descripción:** [Breve descripción]

**Tecnologías:** [Stack usado]
**Características:**
- ⭐ [Feature 1]
- ⭐ [Feature 2]

---

## 📊 Estadísticas GitHub

\`\`\`text
🌞 Contribuciones este año: XXX
📚 Lenguajes más usados: JavaScript, TypeScript, Python
⭐ Repositorios destacados: XX
👥 Colaboradores: XX
\`\`\`

---

## 🏅 Certificaciones

- **[Certificación 1]** - [Proveedor] ([Año])
- **[Certificación 2]** - [Proveedor] ([Año])
- **[Certificación 3]** - [Proveedor] ([Año])

---

## 🌍 Idiomas

- **Español**: Nativo
- **Inglés**: [Nivel] - [Certificación si aplica]
- **[Otro idioma]**: [Nivel]

---

## 🤝 Comunidad & Open Source

- **Contribuciones:** [Número] PRs en proyectos open source
- **Speaker:** Charlas en [eventos/comunidades]
- **Mentoría:** [Experiencia como mentor]
- **Blog/Podcast:** [Plataformas donde comparto conocimiento]

---

## 📈 Métricas Personales

- **Líneas de código:** [XXX.XXX+] escritas
- **Proyectos completados:** [XX+]
- **Bugs resueltos:** [XXX+]
- **Features implementadas:** [XX+]

---

## 🎯 Objetivos Profesionales

Busco oportunidades como [tipo de puesto] donde pueda:
- Contribuir a proyectos de alto impacto
- Aprender nuevas tecnologías emergentes
- Liderar equipos técnicos
- Compartir conocimientos con la comunidad

---

*"Código limpio siempre gana. La calidad importa más que la velocidad."*

**[Tu Nombre]** | **[Email]** | **[GitHub]** | **[LinkedIn]**
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
      content: `# 🎯 ENTREVISTA TÉCNICA - [POSICIÓN SOLICITADA]

**Fecha:** [DD/MM/AAAA] | **Duración:** [X horas] | **Modalidad:** [Presencial/Virtual]

---

## 👤 INFORMACIÓN DEL CANDIDATO

| Información | Detalles |
|-------------|----------|
| **Nombre Completo** | [Nombre del candidato] |
| **Posición Solicitada** | [Puesto específico] |
| **Experiencia** | [X años] |
| **Ubicación** | [Ciudad, País] |
| **Disponibilidad** | [Inmediata / En X semanas] |
| **Pretensión Salarial** | [€XX.XXX - €XX.XXX] |

**Perfil LinkedIn/GitHub:** [Enlaces]
**Referencias:** [Si aplica]

---

## 🎯 EVALUACIÓN POR COMPETENCIAS TÉCNICAS

### 1. **PROGRAMACIÓN Y ALGORITMOS** (Puntuación: ___/5)

**Preguntas Evaluadas:**
- Complejidad algorítmica (Big O)
- Estructuras de datos
- Patrones de diseño
- Programación orientada a objetos

**Ejercicios Realizados:**
1. **[Problema 1]**: [Descripción breve]
   - ✅ Correcto | ❌ Incorrecto | ⚠️ Parcial
   - **Comentarios:** [Evaluación detallada]

2. **[Problema 2]**: [Descripción breve]
   - ✅ Correcto | ❌ Incorrecto | ⚠️ Parcial
   - **Comentarios:** [Evaluación detallada]

**Fortalezas:** [Aspectos positivos destacados]
**Áreas de Mejora:** [Aspectos a desarrollar]

---

### 2. **TECNOLOGÍAS ESPECÍFICAS** (Puntuación: ___/5)

**Stack Declarado por el Candidato:**
- **Frontend:** [Tecnologías mencionadas]
- **Backend:** [Tecnologías mencionadas]
- **Bases de Datos:** [Tecnologías mencionadas]
- **DevOps/Cloud:** [Tecnologías mencionadas]

**Evaluación por Tecnología:**

| Tecnología | Nivel Declarado | Nivel Evaluado | Comentarios |
|------------|-----------------|----------------|-------------|
| [Tech 1] | [Nivel] | [1-5] | [Comentarios] |
| [Tech 2] | [Nivel] | [1-5] | [Comentarios] |
| [Tech 3] | [Nivel] | [1-5] | [Comentarios] |
| [Tech 4] | [Nivel] | [1-5] | [Comentarios] |

---

### 3. **ARQUITECTURA Y SISTEMAS** (Puntuación: ___/5)

**Conceptos Evaluados:**
- Diseño de sistemas escalables
- Microservicios vs Monolitos
- Patrones de arquitectura
- Seguridad y performance

**Preguntas Clave:**
1. **"Diseña un sistema para [escenario]"**
   - **Respuesta:** [Resumen de la solución propuesta]
   - **Evaluación:** [Fortalezas y debilidades]

2. **"Cómo manejarías [problema técnico común]"**
   - **Respuesta:** [Enfoque propuesto]
   - **Evaluación:** [Calidad de la solución]

---

### 4. **RESOLUCIÓN DE PROBLEMAS** (Puntuación: ___/5)

**Enfoque Sistemático:**
- [ ] Descomposición del problema
- [ ] Consideración de casos edge
- [ ] Validación de soluciones
- [ ] Comunicación clara del razonamiento

**Ejemplo de Problema Resuelto:**
\`\`\`
Problema: [Descripción del problema técnico]

Solución del Candidato:
// [Código o pseudocódigo propuesto]

Evaluación:
✅ Correcto | ❌ Incorrecto | ⚠️ Solución válida pero mejorable
\`\`\`

---

## 🧠 EVALUACIÓN DE HABILIDADES BLANDAS

### 1. **COMUNICACIÓN TÉCNICA** (Puntuación: ___/5)

- **Claridad en explicaciones:** [Excelente / Buena / Regular / Mejorable]
- **Vocabulario técnico:** [Adecuado / Limitado / Inapropiado]
- **Capacidad de síntesis:** [Excelente / Buena / Regular / Mejorable]

**Comentarios:** [Evaluación detallada]

### 2. **PENSAMIENTO CRÍTICO** (Puntuación: ___/5)

- **Análisis de problemas:** [Excelente / Bueno / Regular]
- **Evaluación de trade-offs:** [Excelente / Bueno / Regular]
- **Toma de decisiones:** [Excelente / Bueno / Regular]

**Comentarios:** [Evaluación detallada]

### 3. **APRENDIZAJE Y ADAPTABILIDAD** (Puntuación: ___/5)

- **Curiosidad técnica:** [Alta / Media / Baja]
- **Actualización tecnológica:** [Excelente / Buena / Limitada]
- **Respuesta a feedback:** [Excelente / Buena / Mejorable]

**Comentarios:** [Evaluación detallada]

---

## 💻 EJERCICIO DE CODIFICACIÓN PRÁCTICO

### **Plataforma Utilizada:** [LeetCode / HackerRank / CodePen / Otro]

### **Ejercicio 1: [Nombre del Problema]**
**Dificultad:** [Easy / Medium / Hard]
**Tiempo Estimado:** [X minutos]
**Tiempo Real:** [X minutos]

**Descripción:**
[Descripción detallada del problema]

**Solución Implementada:**
\`\`\`[lenguaje]
// Código del candidato
function solution([parámetros]) {
  // Implementación
  return [resultado];
}
\`\`\`

**Evaluación Técnica:**
- **Correctitud:** ✅ ❌
- **Eficiencia:** [Big O analysis]
- **Legibilidad:** [1-5]
- **Mejores prácticas:** [Comentarios específicos]

**Comentarios:** [Feedback constructivo]

---

### **Ejercicio 2: [Nombre del Problema]**
**Dificultad:** [Easy / Medium / Hard]

[Solución y evaluación similar al ejercicio 1]

---

## 📊 EVALUACIÓN FINAL

### **Puntuación Global por Categorías**

| Categoría | Puntuación | Peso | Total Ponderado |
|-----------|------------|------|-----------------|
| Conocimientos Técnicos | __/5 | 30% | ___ |
| Habilidades de Programación | __/5 | 25% | ___ |
| Arquitectura y Sistemas | __/5 | 20% | ___ |
| Comunicación | __/5 | 15% | ___ |
| Ajuste Cultural | __/5 | 10% | ___ |
| **TOTAL** | | **100%** | **__/5** |

### **Decisión de Contratación**

- [ ] **APROBADO** - Proceder con oferta
- [ ] **APROBADO CON RESERVAS** - Evaluar más candidatos
- [ ] **RECHAZADO** - No cumple requisitos mínimos
- [ ] **HOLD** - Reevaluar en [X] meses

### **Justificación de la Decisión**

[Análisis detallado de fortalezas y debilidades que llevaron a esta decisión]

---

## 🎯 RECOMENDACIONES DE DESARROLLO

### **Puntos Fuertes a Mantener:**
- [Fortaleza 1]
- [Fortaleza 2]
- [Fortaleza 3]

### **Áreas de Mejora Prioritarias:**
1. **[Área 1]**: [Plan de desarrollo específico]
2. **[Área 2]**: [Plan de desarrollo específico]
3. **[Área 3]**: [Plan de desarrollo específico]

### **Recursos Recomendados:**
- **Libros:** [Títulos recomendados]
- **Cursos:** [Plataformas y cursos específicos]
- **Proyectos:** [Ejercicios prácticos sugeridos]

---

## 📝 NOTAS ADICIONALES

### **Observaciones del Entrevistador:**
[Comentarios generales, actitud del candidato, aspectos no técnicos relevantes]

### **Preguntas del Candidato:**
[Lista de preguntas realizadas por el candidato y respuestas proporcionadas]

### **Próximos Pasos:**
- [ ] Compartir feedback con RRHH
- [ ] Coordinar segunda entrevista técnica
- [ ] Preparar oferta si aprobado
- [ ] Enviar email de rechazo si rechazado

---

## 👥 EQUIPO DE EVALUACIÓN

**Entrevistador Principal:** [Nombre] - [Puesto]
**Entrevistador Técnico:** [Nombre] - [Puesto] (si aplica)
**Observador:** [Nombre] - [Puesto] (si aplica)

**Fecha de Evaluación:** [DD/MM/AAAA]
**Próxima Revisión:** [DD/MM/AAAA]

---

*Esta evaluación sigue las directrices estándar de entrevistas técnicas de [Empresa]*`,
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
      content: `# Informe Técnico

## Datos Generales

| Campo | Valor |
|-------|-------|
| **Título** | [Título del informe] |
| **Fecha** | [Fecha actual] |
| **Autor** | [Nombre del autor] |
| **Versión** | 1.0 |

## Resumen Ejecutivo

[Breve resumen del contenido del informe y objetivos principales]

## Introducción

### Contexto
[Descripción del contexto y antecedentes]

### Objetivos
[Objetivos específicos del informe]

## Análisis Técnico

### Arquitectura Actual
[Descripción de la arquitectura o sistema actual]

### Problemas Identificados
- [Problema 1]
- [Problema 2]
- [Problema 3]

### Soluciones Propuestas
[Descripción de las soluciones técnicas propuestas]

## Implementación

### Plan de Acción
1. [Paso 1]
2. [Paso 2]
3. [Paso 3]

### Tecnologías
[Lista de tecnologías y herramientas recomendadas]

## Conclusiones

[Conclusiones principales del análisis]

### Recomendaciones
[Recomendaciones específicas basadas en el análisis]`,
      tags: ['informe', 'documentación'],
    },
    {
      id: 'offer-letter',
      name: 'Carta de Oferta',
      description: 'Carta oficial de oferta de empleo',
      icon: '📧',
      category: 'hr',
      content: `# 📋 OFERTA DE EMPLEO FORMAL

**[Ciudad], [Fecha actual]**

**Referencia:** [OE-2024-XXXX]

---

## 👤 DESTINATARIO

**Sr./Sra. [Nombre Completo del Candidato]**  
**[Dirección completa del candidato]**  
**[Código Postal, Ciudad, Provincia]**  

---

## 🏢 INFORMACIÓN DE LA EMPRESA

**[NOMBRE DE LA EMPRESA, S.L.]**  
**CIF:** [BXXXXXXXX]  
**[Dirección completa de la empresa]**  
**[Código Postal, Ciudad, Provincia]**  

**Representante Legal:** [Nombre del representante]  
**Cargo:** [Director/a de Recursos Humanos / CEO]  

---

## 🎯 PROPUESTA DE CONTRATACIÓN

### **Objeto de la Oferta**

Nos complace extenderle una **oferta formal de empleo** para el puesto de **[PUESTO ESPECÍFICO]** dentro de nuestro equipo. Tras evaluar su candidatura, perfil profesional y el resultado de las entrevistas realizadas, estamos convencidos de que su experiencia y capacidades representan un valioso aporte para **[Nombre de la Empresa]**.

### **Detalles del Puesto**

| **Aspecto** | **Detalle** |
|-------------|-------------|
| **Denominación del Puesto** | [Puesto específico y nivel] |
| **Departamento/Area** | [Departamento de adscripción] |
| **Centro de Trabajo** | [Ciudad principal de trabajo] |
| **Modalidad de Trabajo** | [Presencial / Híbrido / Teletrabajo] |
| **Fecha Prevista de Incorporación** | [Fecha de inicio prevista] |
| **Tipo de Contrato** | [Indefinido / Temporal / Obra y servicio] |
| **Jornada Laboral** | [Completa / Parcial: X horas/semana] |
| **Horario de Trabajo** | [Flexible / Establecido de X a Y] |
| **Superior Jerárquico** | [Nombre del responsable directo] |

---

## 💰 CONDICIONES ECONÓMICAS

### **Remuneración Anual Bruta**

| **Concepto** | **Importe Anual** | **Importe Mensual (12 pagas)** |
|--------------|------------------|-------------------------------|
| **Salario Base** | €[XX.XXX,XX] | €[X.XXX,XX] |
| **Complemento de Puesto** | €[XX.XXX,XX] | €[X.XXX,XX] |
| **Complemento Personal** | €[XX.XXX,XX] | €[X.XXX,XX] |
| **Antigüedad Consolidada** | €[XX.XXX,XX] | €[X.XXX,XX] |
| **TOTAL BRUTO ANUAL** | **€[XXX.XXX,XX]** | **€[XX.XXX,XX]** |

### **Complementos Variables y Beneficios**

#### **Bonus y Compensaciones Variables**
- **Bonus Anual por Objetivos:** Hasta [X]% del salario bruto anual
- **Periodo de devengo:** Del 1 de enero al 31 de diciembre
- **Criterios de evaluación:** [Objetivos individuales + objetivos de equipo]
- **Fecha de pago:** [Marzo del año siguiente]

#### **Beneficios Sociales**
- **Seguro Médico Privado:** [Compañía aseguradora] - Cobertura [Individual/Familiar]
- **Formación Continua:** Hasta €[X.XXX] anuales para cursos, congresos y certificaciones
- **Equipo de Trabajo:** [Portátil, móvil, tablet, etc.]
- **Ayuda de Transporte:** [X€ mensuales] o [transporte público gratuito]

#### **Otros Beneficios**
- **Vacaciones:** [X] días laborables anuales + [X] días festivos locales
- **Flexibilidad Horaria:** [Detalles de política de flexibilidad]
- **Trabajo Remoto:** [X días/semana] con acuerdo formal
- **Participación en Beneficios:** [Detalles si aplica]

---

## 📅 CONDICIONES LABORALES

### **Horario y Jornada**
- **Jornada semanal:** [X] horas
- **Horario habitual:** De [X:XX] a [X:XX] horas
- **Días laborables:** De lunes a viernes
- **Política de flexibilidad:** [Detalles específicos]

### **Vacaciones y Permisos**
- **Vacaciones anuales:** [X] días laborables
- **Festivos locales:** [X] días adicionales
- **Permisos retribuidos:** Según convenio colectivo aplicable
- **Política de conciliación:** [Detalles de medidas de conciliación]

---

## 📋 RESPONSABILIDADES Y FUNCIONES

### **Funciones Principales**
1. **[Función principal 1]**
2. **[Función principal 2]**
3. **[Función principal 3]**
4. **[Función principal 4]**

### **Objetivos del Primer Año**
- **[Objetivo 1]**: [Descripción cuantificable]
- **[Objetivo 2]**: [Descripción cuantificable]
- **[Objetivo 3]**: [Descripción cuantificable]

## Periodo de Prueba

Se establece un periodo de prueba de **[Número] meses** desde la fecha de incorporación. Durante este periodo, cualquiera de las partes podrá resolver el contrato sin preaviso ni indemnización.

## Confidencialidad y Propiedad Intelectual

Al aceptar esta oferta, se compromete a mantener la confidencialidad de toda información sensible de la empresa y respetar los acuerdos de propiedad intelectual vigentes.

## Aceptación de la Oferta

Para aceptar esta oferta, por favor firme y devuelva esta carta antes del **[Fecha Límite]**. La oferta quedará sin efecto pasado esta fecha.

Entiendo y acepto los términos y condiciones descritos en esta carta de oferta:

**Fecha:** ____________________  
**Firma:** _________________________  
**[Nombre Completo del Candidato]**

Quedamos a la espera de su respuesta positiva y le damos la bienvenida a **[Nombre de la Empresa]**.

Atentamente,

**[Nombre del Responsable de RRHH]**  
**Director/a de Recursos Humanos**  
**[Nombre de la Empresa], S.L.**  
**[Dirección Completa]**  
**Teléfono: [+34] XXX XXX XXX**  
**Email: [contacto@empresa.com]**  

---

*Esta oferta está sujeta a verificación de referencias laborales, comprobación de antecedentes penales (si aplica) y superación satisfactoria del periodo de prueba.*
`,
      tags: ['contrato', 'servicios', 'legal'],
    },
    {
      id: 'professional-invoice',
      name: 'Factura Profesional Servicios',
      description:
        'Factura detallada para servicios profesionales con desglose IVA',
      icon: '💰',
      category: 'business',
      content: `# 🧾 FACTURA PROFESIONAL

**Nº Factura:** [FV-2024-XXXX]  
**Fecha Emisión:** [Fecha actual]  
**Fecha Vencimiento:** [Fecha +30 días]  
**Estado:** [Pendiente / Pagada / Vencida]

---

## 📤 DATOS DEL EMISOR

### [NOMBRE DE LA EMPRESA, S.L.]
**[Dirección completa]**  
**[Código Postal, Ciudad, Provincia]**  
**CIF:** [BXXXXXXXX]  
**Régimen Fiscal:** [Autónomos / Sociedad]  

**📞 Teléfono:** [+34] XXX XXX XXX  
**✉️ Email:** [facturacion@empresa.com]  
**🌐 Web:** [www.empresa.com]  

**📋 Registro Mercantil:** [Tomo X, Folio Y, Hoja Z]  
**🏛️ Banco:** [Nombre del banco]  
**💳 IBAN:** [ESXX XXXX XXXX XXXX XXXX XXXX]  

---

## 📥 DATOS DEL CLIENTE

### [NOMBRE DEL CLIENTE]
**[Dirección completa]**  
**[Código Postal, Ciudad, Provincia]**  
**CIF/NIF:** [XXXXXXXXX]  
**Persona de Contacto:** [Nombre del contacto]  

**📞 Teléfono:** [+34] XXX XXX XXX  
**✉️ Email:** [contacto@cliente.com]  

---

## 📋 DESCRIPCIÓN DE SERVICIOS

### **Período Facturado:** [Desde DD/MM/AAAA - Hasta DD/MM/AAAA]

| **Concepto** | **Descripción** | **Cantidad** | **Precio Unit.** | **Subtotal** |
|---------------|-----------------|--------------|------------------|--------------|
| **[Servicio 1]** | [Descripción detallada del servicio prestado] | [X] horas | €[XXX.XX] | €[XXX.XX] |
| **[Servicio 2]** | [Descripción detallada del servicio prestado] | [X] unidades | €[XXX.XX] | €[XXX.XX] |
| **[Servicio 3]** | [Descripción detallada del servicio prestado] | [X] proyecto | €[XXX.XX] | €[XXX.XX] |
| **Subtotal Servicios** | | | | €[XXX.XX] |

### **Desglose Detallado de Servicios:**

1. **Desarrollo Web Frontend**
   - Tecnologías: React, TypeScript, Tailwind CSS
   - Alcance: [Descripción específica del trabajo realizado]
   - Tiempo invertido: [X horas]

2. **Consultoría Técnica**
   - Área: [Arquitectura / DevOps / Seguridad]
   - Deliverables: [Documentos / Implementaciones]
   - Tiempo invertido: [X horas]

3. **Mantenimiento y Soporte**
   - Tipo: [Correctivo / Evolutivo / Preventivo]
   - Alcance: [Descripción de incidencias resueltas]
   - Tiempo invertido: [X horas]

---

## 💰 DESGLOSE ECONÓMICO

### **Base Imponible por Tipo de Servicio**

| **Categoría** | **Base Imponible** | **IVA** | **Cuota IVA** | **Total** |
|----------------|-------------------|---------|---------------|-----------|
| **Servicios Profesionales** | €[XXX.XX] | 21% | €[XX.XX] | €[XXX.XX] |
| **Productos/Suministros** | €[XXX.XX] | 21% | €[XX.XX] | €[XXX.XX] |
| **Desplazamientos** | €[XXX.XX] | 0% | €0.00 | €[XXX.XX] |
| **Subtotal** | €[XXX.XX] | | €[XX.XX] | €[XXX.XX] |

### **Cálculos de Retenciones (si aplica)**

| **Concepto** | **Base** | **Tipo** | **Retención** |
|--------------|----------|----------|---------------|
| **IRPF Profesional** | €[XXX.XX] | 15% | €[XX.XX] |
| **Total Retenciones** | | | **€[XX.XX]** |

---

## 💳 FORMA DE PAGO

### **Método de Pago Aceptado:**
- [ ] Transferencia bancaria
- [ ] Domiciliación bancaria
- [ ] Tarjeta de crédito/débito
- [ ] Bizum
- [ ] Efectivo

### **Datos Bancarios para Transferencia:**
**Beneficiario:** [Nombre de la empresa, S.L.]  
**IBAN:** [ESXX XXXX XXXX XX XX XXXXXXXX]  
**SWIFT/BIC:** [XXXXESMMXXX]  
**Banco:** [Nombre completo del banco]  
**Referencia:** [FV-2024-XXXX]  

### **Condiciones de Pago:**
- **Plazo:** [30/60/90] días desde fecha de emisión
- **Penalización por mora:** [Interés legal + X]% anual
- **Descuentos por pronto pago:** [X]% si pago en [X] días

---

## 📊 RESUMEN FACTURA

| **Concepto** | **Importe** |
|---------------|-------------|
| **Base Imponible** | €[XXX.XX] |
| **IVA 21%** | €[XX.XX] |
| **Retenciones** | -€[XX.XX] |
| **TOTAL FACTURA** | **€[XXX.XX]** |

---

## 📝 CONDICIONES GENERALES

### **Ley Aplicable:**
Esta factura se rige por la legislación española, concretamente por la Ley 37/1992 del IVA y la Ley 58/2003 General Tributaria.

### **Plazos y Condiciones:**
- El plazo de pago comienza a contar desde la fecha de emisión
- Los servicios facturados han sido completamente prestados
- Esta factura sirve como justificante de pago válido

### **Reclamaciones:**
Cualquier reclamación debe presentarse por escrito en un plazo máximo de 30 días desde la fecha de emisión.

### **Protección de Datos:**
Los datos personales se tratan conforme al RGPD (Reglamento UE 2016/679).

---

## ✅ CONFORMIDAD Y ACEPTACIÓN

**Factura emitida por:**  
_______________________________  
**[Nombre y Apellidos]**  
**Administrador/a**  
**[Nombre de la Empresa, S.L.]**  

**Fecha de emisión:** [Fecha actual]  

**Conforme con la Ley 37/1992, de 28 de diciembre, del Impuesto sobre el Valor Añadido**  
**Factura electrónica generada automáticamente - Original en formato PDF**

---

## 📞 CONTACTO PARA CONSULTAS

**Departamento de Administración:**  
✉️ [admin@empresa.com]  
📞 [+34] XXX XXX XXX  
🕒 Lunes a Viernes, 9:00 - 18:00

**Para cualquier consulta sobre esta factura, por favor cite el número de referencia: [FV-2024-XXXX]**

`,
      tags: ['contrato', 'servicios', 'legal'],
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
