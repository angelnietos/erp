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
        '# Título del Documento\n\n## Resumen Ejecutivo\n\nEn este documento se presenta un análisis detallado de [tema principal], incluyendo [aspectos clave]. El objetivo principal es [objetivo general] mediante [metodología o enfoque].\n\nLos resultados obtenidos demuestran [conclusión principal], lo que permitirá [beneficios esperados].\n\n## Introducción\n\n### Contexto\n\n[Describa el contexto y antecedentes del documento]\n\n### Alcance\n\nEste documento abarca los siguientes aspectos:\n- [Ámbito 1]\n- [Ámbito 2]\n- [Ámbito 3]\n\n## Desarrollo\n\n### Sección Principal\n\n[Contenido detallado de la sección principal]\n\n#### Subsección 1\n\n[Desarrollo de la subsección 1]\n\n#### Subsección 2\n\n[Desarrollo de la subsección 2]\n\n### Análisis y Resultados\n\n| Aspecto | Descripción | Resultado |\n|---------|-------------|-----------|\n| Aspecto 1 | [Descripción] | [Resultado] |\n| Aspecto 2 | [Descripción] | [Resultado] |\n| Aspecto 3 | [Descripción] | [Resultado] |\n\n## Conclusiones y Recomendaciones\n\n### Conclusiones\n\nBasándonos en el análisis realizado, podemos concluir que:\n\n1. [Conclusión 1]\n2. [Conclusión 2]\n3. [Conclusión 3]\n\n### Recomendaciones\n\nSe recomienda implementar las siguientes acciones:\n\n- **Recomendación 1**: [Descripción detallada]\n- **Recomendación 2**: [Descripción detallada]\n- **Recomendación 3**: [Descripción detallada]\n\n## Anexos\n\n- [Anexo 1: Documentos de referencia]\n- [Anexo 2: Datos adicionales]\n- [Anexo 3: Gráficos y diagramas]',
      tags: ['general'],
    },
    {
      id: 'resume-standard',
      name: 'Currículum Vitae Estándar',
      description: 'CV profesional optimizado para ATS',
      icon: '👤',
      category: 'hr',
      content: `# María González López
Directora de Marketing Digital

📧 maria.gonzalez@email.com | 📱 +34 600 123 456 | 🔗 linkedin.com/in/mariagonzalez | 📍 Madrid, España | 🌐 mariagonzalez.com

---

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
      name: 'Currículum Desarrollador',
      description: 'CV optimizado para puestos técnicos',
      icon: '💻',
      category: 'hr',
      content: `# Carlos Rodríguez Martín
Senior Full Stack Developer & Tech Lead

📧 carlos.rodriguez@email.com | 📱 +34 611 234 567 | 🔗 github.com/carlos-dev | 📍 Barcelona, España | 💼 carlosdev.com

---

## Perfil

Senior Full Stack Developer con 7+ años de experiencia construyendo aplicaciones web escalables y de alto rendimiento. Especializado en arquitecturas de microservicios, cloud-native solutions y liderazgo técnico. He dirigido equipos de desarrollo en proyectos críticos que manejan millones de usuarios diarios.

Apasionado por el código limpio, las mejores prácticas de desarrollo y la mentoría. Me enfoco en crear soluciones técnicas que impulsen el crecimiento del negocio mientras mantengo altos estándares de calidad y mantenibilidad.

## Stack Tecnológico

### **Frontend**
- **Frameworks**: React 18+, Next.js 13+, Angular 16+, Vue.js 3+
- **Lenguajes**: TypeScript, JavaScript (ES2022+)
- **Styling**: Tailwind CSS, Styled Components, CSS-in-JS, Sass
- **State Management**: Zustand, Redux Toolkit, Pinia, NgRx
- **Testing**: Jest, Cypress, Playwright, Vitest

### **Backend**
- **Runtime**: Node.js 18+, Deno, Bun
- **Frameworks**: NestJS, Express.js, Fastify, Next.js API Routes
- **Lenguajes**: TypeScript, JavaScript, Python (FastAPI), Go
- **Databases**: PostgreSQL, MongoDB, Redis, Elasticsearch
- **ORMs**: Prisma, TypeORM, Mongoose, SQLAlchemy

### **DevOps & Cloud**
- **Cloud**: AWS (ECS, Lambda, S3, CloudFront), Vercel, Railway
- **Containers**: Docker, Kubernetes, Podman
- **CI/CD**: GitHub Actions, GitLab CI, CircleCI
- **Monitoring**: DataDog, New Relic, Sentry, Grafana

### **Otros**
- **Control de Versiones**: Git, GitHub, GitLab
- **APIs**: REST, GraphQL, tRPC, OpenAPI
- **Arquitectura**: Microservicios, Serverless, Monolitos modulares
- **Metodologías**: Agile, Scrum, Kanban, TDD, BDD

## Proyectos Destacados

### 🏗️ **E-Commerce Platform** | TechCorp (2023-2024)
Arquitectura completa de plataforma de e-commerce B2B que procesa €50M+ anuales.

**Impacto**: Reducción del tiempo de carga en un 60%, aumento de conversiones del 35%, escalabilidad a 1M+ usuarios concurrentes.

**Tecnologías**: Next.js 14, NestJS, PostgreSQL, Redis, AWS ECS, TypeScript, Tailwind CSS.

**Logros**:
- Implementé arquitectura de microservicios con 15 servicios desacoplados
- Diseñé sistema de caching multinivel que redujo latencia de 2.3s a 0.3s
- Lideré migración a serverless functions, reduciendo costos operativos en 40%
- Implementé sistema de recomendaciones ML que aumentó ventas cruzadas en 25%

### 🚀 **Real-Time Analytics Dashboard** | DataFlow Inc (2022-2023)
Dashboard de analytics en tiempo real para 500K+ usuarios empresariales.

**Impacto**: Procesamiento de 100M+ eventos diarios con latencia <100ms.

**Tecnologías**: React, Node.js, WebSockets, TimescaleDB, Grafana, Docker.

**Logros**:
- Arquitecturé sistema de streaming con Apache Kafka y WebSockets
- Optimizé consultas SQL complejas, mejorando rendimiento en 10x
- Implementé autenticación JWT con refresh tokens y RBAC
- Creé API GraphQL que redujo overfetching en un 70%

### 📱 **Mobile Banking App** | FinTech Solutions (2021-2022)
Aplicación móvil de banca digital con 2M+ usuarios activos.

**Impacto**: 4.8★ en app stores, 98.5% uptime, procesamiento seguro de €2B+ transacciones.

**Tecnologías**: React Native, Node.js, MongoDB, AWS Lambda, Stripe API.

**Logros**:
- Desarrollé arquitectura segura con encriptación end-to-end
- Implementé biometría y autenticación de dos factores
- Creé sistema de notificaciones push segmentadas
- Optimizé performance, reduciendo crashes en un 80%

## Experiencia Profesional

### **Senior Full Stack Developer & Tech Lead** | TechCorp
**Enero 2023 - Actualidad** | Barcelona

- **Liderazgo Técnico**: Dirijo equipo de 8 developers, mentorizando juniors y estableciendo estándares de código
- **Arquitectura**: Diseñé arquitectura de microservicios que escala horizontalmente en AWS ECS
- **Performance**: Optimizé APIs críticas, reduciendo response time de 800ms a 120ms
- **Mentoría**: Formé 3 developers junior que ascendieron a mid-level en 12 meses
- **Innovación**: Introduje TDD y CI/CD avanzado, reduciendo bugs en producción en 60%

### **Full Stack Developer** | DataFlow Inc
**Marzo 2021 - Diciembre 2022** | Madrid

- **Desarrollo Full-Stack**: Construí dashboards interactivos con React y Node.js
- **Base de Datos**: Diseñé esquema PostgreSQL optimizado para consultas analíticas complejas
- **APIs**: Desarrollé APIs REST y GraphQL que manejan 10M+ requests diarios
- **DevOps**: Implementé pipelines CI/CD que redujeron deployment time de 2 horas a 15 minutos
- **Colaboración**: Trabajé cross-functional con equipos de producto y diseño

### **Frontend Developer** | StartupXYZ
**Junio 2019 - Febrero 2021** | Valencia

- **React Ecosystem**: Desarrollé SPAs complejas con React, Redux y TypeScript
- **Performance**: Optimizé bundle size en 40% mediante code splitting y lazy loading
- **Testing**: Implementé suite de tests con Jest y Cypress, alcanzando 85% coverage
- **UI/UX**: Colaboré estrechamente con diseñadores para implementar pixel-perfect UIs

## Educación

### **Máster en Ingeniería del Software** | Universidad Politécnica de Catalunya (UPC)
**2017 - 2019** | Barcelona

- Especialización en Arquitecturas Distribuidas y Cloud Computing
- Proyecto final: Plataforma IoT escalable (Nota: 9.1/10)
- Tesis: "Microservicios en la Era del Cloud Native"

### **Grado en Ingeniería Informática** | Universidad de Valencia
**2013 - 2017** | Valencia

- Especialización en Desarrollo de Software y Sistemas de Información
- Erasmus en Politecnico di Milano (2016)
- Trabajo fin de grado: Sistema de gestión documental (Nota: 8.7/10)

## Certificaciones & Cursos

- **AWS Solutions Architect Professional** (2023) - Amazon Web Services
- **Google Cloud Professional Developer** (2022) - Google Cloud
- **Certified Kubernetes Administrator** (2021) - Cloud Native Computing Foundation
- **MongoDB Certified Developer** (2020) - MongoDB Inc.
- **Scrum Master Certification** (2019) - Scrum Alliance

## Open Source & Comunidad

- **Contribuciones**: Autor de 15+ PRs en proyectos populares de React y Node.js
- **Speaker**: Conferencias en React Summit, JSWorld Conference, Codemotion
- **Mentoría**: Mentor en programas de Google Summer of Code y Microsoft Learn
- **Blog**: Mantengo blog técnico con 50K+ visitas mensuales

## Idiomas & Soft Skills

- **Español**: Nativo
- **Inglés**: C2 - Fluent (TOEFL iBT 110/120)
- **Catalán**: C1 - Advanced
- **Italiano**: B2 - Upper Intermediate

**Soft Skills**: Liderazgo, Comunicación Técnica, Resolución de Problemas, Trabajo en Equipo, Adaptabilidad

---

*"El código no solo resuelve problemas, crea oportunidades para que otros innoven."*
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
      content: `# Informe Técnico

## Datos Generales

| Campo | Valor |
|-------|-------|
| **Título** | [Título del informe] |
| **Fecha** | ${new Date().toLocaleDateString('es-ES')} |
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
      content: `# Carta de Oferta de Empleo

**Madrid, ${new Date().toLocaleDateString('es-ES')}**

Estimado/a Sr./Sra. [Nombre Completo del Candidato],

**Asunto: Oferta de Empleo - Puesto de [Puesto Específico]**

Nos complace extenderle una oferta formal de empleo para el puesto de **[Puesto Específico]** en **[Nombre de la Empresa]**, S.L. Tras revisar su candidatura y mantener las entrevistas correspondientes, estamos convencidos de que su experiencia y habilidades serán un valioso aporte a nuestro equipo.

## Detalles del Puesto

| Aspecto | Detalle |
|---------|---------|
| **Puesto** | [Puesto Específico] |
| **Departamento** | [Departamento] |
| **Ubicación** | [Ciudad, País] |
| **Modalidad** | [Presencial / Híbrido / Remoto] |
| **Fecha de Incorporación** | [Fecha de Inicio] |
| **Jornada** | [Tiempo Completo / Parcial] |
| **Reporta a** | [Nombre del Supervisor Directo] |

## Condiciones Económicas

### Remuneración
| Concepto | Importe Anual | Importe Mensual |
|----------|---------------|-----------------|
| **Salario Bruto** | €[Salario Anual] | €[Salario Mensual] |
| **Pago en Especie** | €[Importe] | €[Importe Mensual] |
| **Total Bruto** | **€[Total Anual]** | **€[Total Mensual]** |

*Los importes indicados son brutos anuales y están sujetos a las retenciones fiscales correspondientes según la legislación vigente.*

### Bonus y Compensaciones Variables
- **Bonus Anual por Objetivos**: Hasta [Porcentaje]% del salario bruto anual, sujeto al cumplimiento de objetivos individuales y de equipo.
- **Participación en Beneficios**: [Detalles de participación en beneficios si aplica].

## Beneficios y Condiciones Laborales

### Tiempo de Trabajo y Vacaciones
- **Jornada Laboral**: [Número] horas semanales
- **Horario**: [Horario flexible / Horario establecido]
- **Vacaciones**: [Número] días laborables al año + [Número] días festivos locales
- **Permisos**: Según convenio colectivo aplicable

### Beneficios Sociales
- **Seguro Médico Privado**: Cobertura completa para empleado y [familiares]
- **Formación Continua**: Hasta €[Importe] anuales para cursos, conferencias y certificaciones
- **Equipo de Trabajo**: Portátil, monitor adicional y [otros equipos necesarios]
- **Desarrollo Profesional**: Planes de carrera individualizados y oportunidades de promoción interna

### Otros Beneficios
- **Stock Options / Participación**: [Detalles si aplica]
- **Gastos de Desplazamiento**: [Política de reembolso]
- **Trabajo Remoto**: [Días permitidos por semana/mes]
- **Flexibilidad Horaria**: [Detalles de flexibilidad]

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
**Teléfono:** [Número] | **Email:** [Email]  

---

*Esta oferta está sujeta a verificación de referencias, comprobación de antecedentes y superación del periodo de prueba.*
`,
      tags: ['contrato', 'servicios', 'legal'],
    },
    {
      id: 'professional-invoice',
      name: 'Factura Profesional',
      description: 'Factura comercial con IVA incluido',
      icon: '💰',
      category: 'business',
      content: `# FACTURA

| | |
|-|-|
| **Nº Factura:** | [Número de Factura] |
| **Fecha:** | ${new Date().toLocaleDateString('es-ES')} |
| **Fecha Vencimiento:** | [Fecha de vencimiento - 30 días] |

---

## DATOS DEL EMISOR

**[Nombre de la Empresa]**  
**[Dirección Completa]**  
**[Ciudad, Código Postal]**  
**CIF:** [CIF de la empresa]  
**Teléfono:** [Número de teléfono]  
**Email:** [Email de contacto]  
**Web:** [Sitio web]  

---

## DATOS DEL CLIENTE

**[Nombre del Cliente]**  
**[Dirección Completa]**  
**[Ciudad, Código Postal]**  
**CIF/NIF:** [CIF/NIF del cliente]  
**Teléfono:** [Número de teléfono]  
**Email:** [Email de contacto]  

---

## CONCEPTO

| Descripción | Cantidad | Precio Unit. | Subtotal |
|-------------|----------|--------------|----------|
| [Descripción detallada del servicio 1] | [Cantidad] | €[Precio] | €[Subtotal] |
| [Descripción detallada del servicio 2] | [Cantidad] | €[Precio] | €[Subtotal] |
| [Descripción detallada del servicio 3] | [Cantidad] | €[Precio] | €[Subtotal] |
| **Descuento** | - | - | -€[Descuento] |
| **Subtotal** | | | €[Subtotal] |

---

## IMPUESTOS

| Concepto | Base Imponible | Tipo | Cuota |
|----------|----------------|------|-------|
| **IVA** | €[Base imponible] | [Tipo]% | €[Cuota IVA] |
| **IRPF** | €[Base imponible] | [Tipo]% | €[Cuota IRPF] |
| **TOTAL IMPUESTOS** | | | €[Total impuestos] |

---

## TOTAL FACTURA

| Concepto | Importe |
|----------|---------|
| **Subtotal** | €[Subtotal] |
| **IVA ([Tipo]%)** | €[Cuota IVA] |
| **IRPF ([Tipo]%)** | €[Cuota IRPF] |
| **TOTAL** | **€[Total]** |

---

## FORMA DE PAGO

- **Método:** Transferencia bancaria
- **Cuenta:** [IBAN completo]
- **SWIFT/BIC:** [Código SWIFT]
- **Banco:** [Nombre del banco]
- **Titular:** [Nombre del titular de la cuenta]

**Plazo de pago:** [Número] días desde la fecha de emisión

---

## NOTAS

- Factura emitida conforme a la Ley 37/1992 del IVA
- Bienes y servicios sujetos a IVA según artículo 20 de la Ley 37/1992
- En caso de retraso en el pago, se aplicará un interés de demora del [Porcentaje]% mensual
- Para cualquier consulta, contacte con nuestro departamento de administración

---

**Emitida por:** _______________________________  
**[Nombre del Responsable]**  
**[Cargo]**  
**[Fecha de emisión]**

---

*Factura generada electrónicamente - Original en formato PDF*
`,
      tags: ['factura', 'financiero', 'business'],
    },
    {
      id: 'service-contract',
      name: 'Contrato de Servicios',
      description: 'Contrato profesional de prestación de servicios',
      icon: '📋',
      category: 'legal',
      content: `# CONTRATO DE PRESTACIÓN DE SERVICIOS PROFESIONALES

**Nº de Contrato:** [Número de Contrato]  
**Fecha:** ${new Date().toLocaleDateString('es-ES')}  
**Lugar:** Madrid, España  

## PARTES CONTRATANTES

### PRIMERA.- EL CONTRATISTA
**[Nombre de la Empresa Contratista]**, S.L., con CIF **[CIF]** y domicilio en **[Dirección completa]**, en adelante "**EL CONTRATISTA**", representada por **[Nombre del Representante Legal]**, en su condición de **[Cargo]**, mayor de edad, con DNI **[DNI]**.

### SEGUNDA.- EL CLIENTE
**[Nombre del Cliente]**, con CIF/NIF **[CIF/NIF]** y domicilio en **[Dirección completa]**, en adelante "**EL CLIENTE**", representado por **[Nombre del Representante Legal]**, en su condición de **[Cargo]**, mayor de edad, con DNI **[DNI]**.

Las partes se reconocen mutuamente capacidad legal suficiente para celebrar el presente contrato y, a tal efecto,

## EXPONEN

I. Que **EL CONTRATISTA** es una empresa especializada en [descripción de servicios], con amplia experiencia en el sector.

II. Que **EL CLIENTE** requiere los servicios profesionales de **EL CONTRATISTA** para [descripción del proyecto/objetivo].

III. Que ambas partes han acordado formalizar por escrito los términos y condiciones bajo los cuales se regirá la prestación de dichos servicios.

Por lo expuesto, las partes formalizan el presente contrato de prestación de servicios profesionales (**"EL CONTRATO"**) que se regirá por las siguientes

## CLÁUSULAS

### CLÁUSULA PRIMERA.- OBJETO DEL CONTRATO

**EL CONTRATISTA** se obliga a prestar a **EL CLIENTE** los siguientes servicios profesionales:

1. **[Servicio 1]**: [Descripción detallada del servicio 1]
2. **[Servicio 2]**: [Descripción detallada del servicio 2]
3. **[Servicio 3]**: [Descripción detallada del servicio 3]

Los servicios se prestarán de acuerdo con las especificaciones técnicas detalladas en el Anexo I (**"Especificaciones Técnicas"**) del presente contrato.

### CLÁUSULA SEGUNDA.- PLAZO DE EJECUCIÓN

El plazo de ejecución de los servicios contratados será de **[Número] meses/días** contados a partir de la fecha de firma del presente contrato, prorrogable por mutuo acuerdo de las partes.

**Fecha de Inicio:** [Fecha]  
**Fecha de Finalización:** [Fecha]

### CLÁUSULA TERCERA.- PRECIO Y FORMA DE PAGO

#### Precio Total
El precio total de los servicios contratados asciende a la cantidad de **€[Importe en letras] (€[Importe en números])**, IVA incluido al [Tipo]% ([**€[Importe IVA]**]).

#### Forma de Pago
El pago se realizará de la siguiente forma:
- **40%** del importe total (**€[Importe]**) a la firma del contrato
- **30%** del importe total (**€[Importe]**) a la finalización de la fase 1
- **30%** del importe total (**€[Importe]**) a la entrega final y aceptación por parte del cliente

Los pagos se realizarán mediante transferencia bancaria a la cuenta **[IBAN]** de **EL CONTRATISTA**, dentro de los 30 días siguientes a la emisión de la correspondiente factura.

#### Penalizaciones
En caso de retraso en el pago superior a 30 días, se aplicará un interés de demora del [Porcentaje]% mensual sobre el importe pendiente.

### CLÁUSULA CUARTA.- OBLIGACIONES DE EL CONTRATISTA

**EL CONTRATISTA** se obliga a:

1. **Ejecutar los servicios** con la diligencia y profesionalidad exigibles en el sector.
2. **Cumplir los plazos** establecidos, informando inmediatamente de cualquier circunstancia que pueda afectar al cumplimiento.
3. **Mantener confidencialidad** sobre toda información técnica o comercial de **EL CLIENTE**.
4. **Respetar la propiedad intelectual** de **EL CLIENTE** y no utilizar información obtenida para otros fines.
5. **Disponer de personal cualificado** para la prestación de los servicios.
6. **Contratar seguros** de responsabilidad civil profesional por importe mínimo de €[Importe].
7. **Entregar deliverables** que cumplan con las especificaciones acordadas.

### CLÁUSULA QUINTA.- OBLIGACIONES DE EL CLIENTE

**EL CLIENTE** se obliga a:

1. **Proporcionar información** necesaria para la correcta ejecución de los servicios.
2. **Facilitar acceso** a sistemas, instalaciones o recursos necesarios.
3. **Efectuar los pagos** en los términos establecidos en la cláusula tercera.
4. **Designar interlocutor** para coordinar con **EL CONTRATISTA**.
5. **Revisar y aprobar** deliverables en un plazo máximo de [Número] días.
6. **Colaborar activamente** en la ejecución del proyecto.

### CLÁUSULA SEXTA.- PROPIEDAD INTELECTUAL E INDUSTRIAL

1. **EL CONTRATISTA** cede a **EL CLIENTE** todos los derechos de propiedad intelectual sobre los trabajos realizados específicamente para este contrato.
2. **EL CONTRATISTA** mantiene los derechos sobre metodologías, herramientas y componentes reutilizables desarrollados con carácter general.
3. Los derechos se cederán una vez producido el pago total del contrato.

### CLÁUSULA SÉPTIMA.- CONFIDENCIALIDAD

Las partes se comprometen a mantener estricta confidencialidad sobre:
- Información técnica y comercial
- Datos de clientes y proveedores
- Estrategias y planes de negocio
- Cualquier información calificada como confidencial

Esta obligación subsistirá durante [Número] años tras la finalización del contrato.

### CLÁUSULA OCTAVA.- RESPONSABILIDAD

1. **EL CONTRATISTA** responderá por los daños y perjuicios causados por negligencia o incumplimiento de sus obligaciones.
2. La responsabilidad máxima se limita al importe total del contrato.
3. Quedan excluidas responsabilidades por fuerza mayor.

### CLÁUSULA NOVENA.- MODIFICACIONES

Cualquier modificación del contrato requerirá acuerdo escrito de ambas partes mediante adenda contractual.

### CLÁUSULA DÉCIMA.- RESOLUCIÓN

El contrato podrá resolverse anticipadamente por:
- Mutuo acuerdo de las partes
- Incumplimiento grave de cualquiera de las partes
- Imposibilidad de ejecución por fuerza mayor

### CLÁUSULA UNDÉCIMA.- JURISDICCIÓN Y LEGISLACIÓN APLICABLE

El presente contrato se rige por la legislación española. Para cualquier controversia derivada del mismo, las partes se someten expresamente a los Juzgados y Tribunales de Madrid capital, renunciando a cualquier otro fuero que pudiera corresponderles.

Y en prueba de conformidad, firman el presente contrato en el lugar y fecha indicados en el encabezamiento.

**EL CONTRATISTA**  
**[Nombre de la Empresa Contratista], S.L.**  

_______________________________  
**[Nombre del Representante Legal]**  
**[Cargo]**  

**EL CLIENTE**  
**[Nombre del Cliente]**  

_______________________________  
**[Nombre del Representante Legal]**  
**[Cargo]**

---

## ANEXOS

### Anexo I: Especificaciones Técnicas
[Detalles técnicos del proyecto]

### Anexo II: Cronograma de Ejecución
[Fechas y hitos del proyecto]

### Anexo III: Presupuesto Desglosado
[Desglose detallado de costos]
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
