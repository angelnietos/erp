
en un primer momento enviamos esto y el cliente aprovo el flujo



y ahora el cliente me dice esto 



en un primer momento yo envie un mermaid del que se quitaron muchas cosas que ahora se piden o eso creo que es este y necesito que me des la solucion completa bien para cubirir quejas cliente 

flowchart LR



%% ===================== 1. FRONTEND =====================

subgraph L1["FASE 1 - FRONTEND"]

direction TB

A["0 - Upload Pack (9 Docs)"] --> B["1 - API Gateway"]

end



%% ===================== 2. API =====================

subgraph L2["FASE 2 - EDGE SECURE GATEWAY"]

direction TB

B --> B1["2 - Auth (JWT) + Rate Limit"]

B1 --> B2{"3 - Valid Request?"}

B2 -- No --> ERR["4 - Reject + UX Error"]

B2 -- Yes --> ID["5 - Generate Expedition ID"]

end



%% ===================== 3. IDENTITY =====================

subgraph L3["FASE 3 - CONTEXTO E IDEMPOTENCIA"]

direction TB

ID --> ID2["6 - Idempotency Check"]

ID2 --> ID3{"7 - Already processed?"}

ID3 -- Yes --> CACHED_RES["8 - Return Cached Result"]

ID3 -- No --> SEC["9 - Security Context (Tenant/Enc)"]

end



%% ===================== 4. STORAGE =====================

subgraph L4["FASE 4 - PERSISTENCIA INICIAL"]

direction TB

SEC --> RAW["10 - Blob Storage RAW (Immutable PDFs)"]

RAW --> FP0["11 - Pre-Fingerprint (Hash/Embeddings)"]

FP0 --> FP1{"12 - Duplicate?"}

FP1 -- Yes --> DUP["13 - Stop (Duplicate Detected)"]

FP1 -- No --> EVT["14 - Event Router"]

end



%% ===================== 5. EVENT BACKBONE =====================

subgraph L5["FASE 5 - EVENT BACKBONE"]

direction TB

EVT --> RQ["15 - Redis Queue (Fast Path)"]

EVT --> SB["16 - Service Bus (Reliable Path)"]



SB --> DLQ["17 - Dead Letter Queue"]

SB --> RETRY["18 - Retry Manager"]



RQ --> ORCH["19 - Orchestrator"]

SB --> ORCH

end



%% ===================== 6. ORCHESTRATION =====================

subgraph L6["FASE 6 - MÁQUINA DE ESTADOS"]

direction TB

ORCH --> STATE["20 - Redis Live State + FSM"]

ORCH --> AUDIT["21 - Audit Log / Observability"]

end



%% ===================== 7. WORKERS =====================

subgraph L7["FASE 7 - FAN-OUT WORKER POOL"]

direction TB

ORCH --> W1["22 - Fan-Out Doc Workers (x9)"]

W1 --> PIPE["23 - Sub-Runtime Trigger"]

end



%% ===================== 8. PIPELINE DOCUMENTAL =====================

subgraph L8["FASE 8 - PIPELINE ATÓMICO (Por Documento)"]

direction TB

PIPE --> SPLIT["24 - PDF Parser + Splitter"]

SPLIT --> T{"25 - Content Type"}



T -- Text --> TXT["26 - Text Extraction"]

T -- Image --> IMG["27 - Image Preprocess"]



IMG --> PRE["28 - Vision Preprocessing"]

PRE --> OCR["29 - OCR Engine"]



OCR --> CONF{"30 - Confidence Score"}



CONF -- Low --> VLM["31 - Multimodal LLM Fallback"]

CONF -- High --> TXT2["32 - Text Fusion"]



VLM --> TXT2

TXT --> TXT2



TXT2 --> NORM["33 - Normalization"]

NORM --> NER["34 - NER Extraction"]

NER --> CLASS{"35 - Document Classifier"}



CLASS --> D1["36 - DNI Agent"]

CLASS --> D2["37 - Invoice Agent"]

CLASS --> D3["38 - Contract Agent"]

CLASS --> D4["39 - Insurance Agent"]

CLASS --> D5["40 - Fiscal Agent"]

CLASS --> D6["41 - Legal Agent"]

CLASS --> D7["42 - Generic Agent"]



D1 & D2 & D3 & D4 & D5 & D6 & D7 --> JOUT["43 - Extracted JSON"]

end



%% ===================== 9. FAN-IN =====================

subgraph L9["FASE 9 - AGREGACIÓN"]

direction TB

JOUT --> AGG["44 - Async Aggregator"]

AGG --> UNIFIED["45 - Unified Expedition JSON"]

end



%% ===================== 10. VALIDATION =====================

subgraph L10["FASE 10 - VALIDACIÓN CAE"]

direction TB

UNIFIED --> FP2["46 - Global Fingerprint"]

FP2 --> SIM{"47 - Similarity Check"}



SIM -- Duplicate --> DUP2["48 - Blocked Duplicate"]

SIM -- New --> RULES["49 - Business Rules Engine"]



RULES --> SCORE["50 - Scoring Engine"]

SCORE --> DEC{"51 - Final Decision"}



DEC -- OK --> OK["52 - Approved"]

DEC -- Review --> REV["53 - Human Review"]

DEC -- Reject --> REJ["54 - Rejected"]

end



%% ===================== 11. OUTPUT =====================

subgraph L11["FASE 11 - OUTPUT UX"]

direction TB

OK & REV & REJ & DUP2 & CACHED_RES --> UX["55 - Auto-fill UI / Feedback"]

end



%% ===================== 12. MLOPS =====================

subgraph L12["FASE 12 - MLOPS LOOP"]

direction TB

REV --> HUMAN["56 - Supervisor UI"]

HUMAN --> LABEL["57 - Labeling"]



LABEL --> DATASET["58 - Dataset Builder"]

DATASET --> FINE["59 - Fine-Tuning Pipeline"]

FINE --> REG["60 - Model Registry"]



LABEL --> FPDB["61 - Vector DB Update"]

end



%% ===================== 13. OBSERVABILITY =====================

subgraph L13["FASE 13 - OBSERVABILITY"]

direction TB

AUDIT --> MON["62 - Monitoring / Tracing"]

STATE --> MON

DLQ --> MON

end







%% Estilos para legibilidad visual

style L1 fill:#f9f9f9,stroke:#333

style L2 fill:#f8eaef,stroke:#d81b60

style L3 fill:#e3f2fd,stroke:#1565c0

style L4 fill:#e8f5e9,stroke:#2e7d32

style L5 fill:#fff3e0,stroke:#e65100

style L6 fill:#c5cae9,stroke:#283593

style L7 fill:#b2ebf2,stroke:#00838f

style L8 fill:#e1f5fe,stroke:#0277bd,stroke-width:2px

style L9 fill:#f3e5f5,stroke:#4a148c

style L10 fill:#e8eaf6,stroke:#1a237e,stroke-width:2px

style L12 fill:#fffde7,stroke:#fbc02d,stroke-dasharray: 5 5

style L13 fill:#eceff1,stroke:#37474f







graph TD



A["Documento CAE entrada"] --> B{"Gateway validación"}



B -->|Inválido| B1["Rechazo inmediato"]

B -->|Válido| C["Guardar RAW en Blob Storage"]



C --> D{"Selección cola"}

D -->|Tiempo real| D1["Redis"]

D -->|Batch| D2["Service Bus"]



D1 --> E["Orquestador"]

D2 --> E



E --> F["Normalización formato"]



F --> G{"Tipo archivo"}



G -->|HEIC/JPG| H1["Convertir a PNG"]

G -->|PDF Imagen| H2["PDF → PNG"]

G -->|PDF Texto| H3["Detectar texto embebido"]



H1 --> I["Preprocesado imagen"]

H2 --> I

H3 --> J{"¿Texto suficiente?"}



J -->|Sí| K1["PDF Parser"]

J -->|No| I



I --> K2["OCR Document Intelligence"]



K1 --> L["Texto bruto"]

K2 --> L



L --> M{"Calidad OCR"}



M -->|Alta| N["Texto fiable"]

M -->|Baja| O["Fallback GPT-4o Vision"]



O --> N



N --> P{"Clasificador documento"}



P -->|ITV| Q1["Extractor ITV"]

P -->|Seguro| Q2["Extractor Seguro"]

P -->|Permiso| Q3["Extractor Permiso"]

P -->|PRL| Q4["Extractor PRL"]

P -->|Acceso| Q5["Extractor Acceso"]

P -->|Empresa| Q6["Extractor Empresa"]

P -->|Ficha técnica| Q7["Extractor Técnica"]

P -->|Carnet| Q8["Extractor Carnet"]

P -->|ADR| Q9["Extractor ADR"]



Q1 --> R["JSON estructurado"]

Q2 --> R

Q3 --> R

Q4 --> R

Q5 --> R

Q6 --> R

Q7 --> R

Q8 --> R

Q9 --> R



%% VALIDACIÓN CONTINUA

R --> S["Actualizar expediente CAE"]



S --> T["Motor de reglas CAE"]



T --> T1["Validar fechas y vigencias"]

T --> T2["Validar seguros"]

T --> T3["Validar actividad"]

T --> T4["Validar empresa-trabajador"]

T --> T5["Validar vehículo-documentación"]

T --> T6["Validar documentación obligatoria"]



T1 --> U

T2 --> U

T3 --> U

T4 --> U

T5 --> U

T6 --> U



U["Cruce entre documentos"] --> V["Validador semántico"]



V --> W["Scoring del expediente"]



W --> X{"¿Expediente completo?"}



X -->|No| Y["Informar incidencias al usuario"]



Y --> Z["Esperar nuevos documentos"]



Z --> S



X -->|Sí| AA{"Resultado"}



AA -->|Aprobado| AB["Aprobación automática"]



AA -->|Revisión| AC["Cola revisión humana"]



AA -->|Rechazado| AD["Rechazo automático"]



AC --> AE["Supervisor CAE"]



AE --> AF["Dataset validado"]



AF --> AG["Mejora extractores IA"]

AF --> AH["Mejora reglas CAE"]



AB --> AI["Audit Log"]

AC --> AI

AD --> AI



AI --> AJ["Optimización imágenes"]

AJ --> AK["AVIF / WebP"]

AK --> AL["Storage optimizado"]

AL --> AM["Frontend / Thumbnails"]Buenos días, 



Tras revisar el documento de definición funcional de la propuesta "Plataforma CAE v2.0 Desarrollo IA", me  preocupa bastante que, después de más de un año de colaboración en el proyecto, la solución planteada parezca abordar el problema principalmente desde una perspectiva de extracción documental (OCR + IA), sin reflejar suficientemente el conocimiento funcional del proceso CAE ni de los flujos operativos reales de la plataforma.



Según se desprende del documento, el foco principal se sitúa en la identificación documental, extracción de datos, cálculo de niveles de confianza y posterior revisión por parte de Ideauto.



Sin embargo, el valor diferencial del proceso CAE no reside únicamente en la captura automática de datos, sino en la validación continua de la información, la aplicación de reglas de negocio y la detección temprana de incidencias durante la construcción del expediente.



No encontramos reflejado en la propuesta un modelo de validación progresiva que permita:



Validar el expediente conforme se van incorporando documentos y datos.

Cruzar información entre los distintos documentos aportados.

Detectar incoherencias en tiempo real.

Informar al usuario de errores o ausencias de documentación antes del envío a revisión.

Reducir de forma efectiva la carga operativa del equipo de revisión de Ideauto.

Por el contrario, el flujo descrito parece concentrar gran parte de las validaciones en la fase de extracción documental y mantiene posteriormente una revisión funcional completa por parte de Ideauto.



Me preocupa especialmente que aspectos fundamentales del negocio CAE, conocidos y tratados durante el proyecto, no aparezcan reflejados con el nivel de detalle esperado en la definición funcional. La sensación que transmite el documento es la de una solución documental genérica aplicable a cualquier sistema de gestión, más que una solución diseñada específicamente para los procesos y necesidades de la plataforma CAE.



Antes de avanzar, considero necesario aclarar cómo se contempla realmente la validación funcional continua del expediente, qué reglas de negocio específicas del proceso CAE se pretenden implementar y de qué manera se espera reducir la intervención manual actualmente realizada por el equipo de Jesus.



Quedamos a la espera de vuestros comentarios.



Antonio



 



 



 



Antonio Antón Dí­az

Responsable de sistemas e infraestructuras







Instituto de Estudios de Automoción - IDEAUTO



C/ Oquendo 23, 3ª‚ 1 Bis

28006 - Madrid

web  www.ideauto.com



phone +34.91.343.13.42



email aanton@ideauto.com



 



 



 



De: Florina Mahalean <florina.mahalean@babooni.com>

Enviado el: martes, 9 de junio de 2026 12:32

Para: Antonio Antón Díaz <AAnton@ideauto.com>

CC: Jesús M. Méndez Martínez <jesus.mendez@ideauto.com>; Alejandro Ballesteros <alejandro@babooni.com>; Álvaro <alvaro@babooni.com>; Bruno Brito <bruno.brito@ideauto.com>

Asunto: Re: Flujo para proyecto IA



 



ATENCIÓN: Este correo electrónico se envió desde fuera de la organización. No haga clic en enlaces ni abra archivos adjuntos a menos que reconozca al remitente y sepa que el contenido es seguro.



 



Buenas Antonio, 



Disculpa el retraso, te adjunto el documento con el análisis  de la IA para que lo puedas revisar y ver si se adapta a todo lo que necesitáis. 

Si tenéis cualquier duda podemos tener una reunión para clarificar cualquier duda.



Saludos, 



Florina Mahalean

Project Manager 

+34 634573589



florina.mahalean@babooni.com



www.babooni.com







 



 



El lun, 11 may 2026 a las 15:55, Antonio Antón Díaz (<AAnton@ideauto.com>) escribió:



Hola Florina de nuevo,



 



He revisado el flujo propuesto para la incorporación de IA en CAE v2 y os voy a cobrar el oftalmólogo….



 



A nivel general, el planteamiento es correcto y cubre el objetivo que buscamos, que es automatizar la captura de información a partir de documentos y reducir la carga manual en la cumplimentación de formularios, manteniendo al mismo tiempo un control sobre la validez de los documentos.



 



Si se simplifica el flujo a nivel funcional (más allá del detalle del diagrama), el comportamiento real de la IA se puede resumir en los siguientes pasos:



 



El cliente sube un documento (PDF)

La IA identifica el tipo de documento.

La IA extrae la información relevante.

La IA prepara esos datos para que puedan ser utilizados por el sistema.

La IA evalúa si el documento es válido, legible y completo.

El sistema rellena automáticamente los campos del formulario.

El usuario revisa y valida la información antes de continuar.

 



En este sentido, el flujo encaja bien con lo que necesitamos:



 



Automatización de lectura de documentos

Pre-rellenado de datos

Validación asistida con intervención final del usuario

 



Como comentario, el diagrama presenta un nivel de descomposición bastante detallado, lo que puede dar sensación de mayor complejidad. No obstante, esa complejidad está principalmente en cómo se ha desglosado el proceso, más que en la funcionalidad real que se persigue.



 



A nivel conceptual, la lógica es clara y coherente con el objetivo que pretendemos.



 



Seguimos avanzando sobre esta base, el siguiente paso es el análisis.



 



Antonio. 





mi equipo envio esto



DISEÑO TÉCNICO DE REFERENCIA

SISTEMA DE ASISTENCIA INTELIGENTE PARA

PLATAFORMA CAE v2.0



Pág. 1 de 11



HISTÓRICO DE REVISIONES

REVISIÓN FECHA NATURALEZA DEL CAMBIO

0 27-06-2026 Primera versión del documento (Borrador)



ÍNDICE DE CONTENIDOS

1 OBJETIVO TÉCNICO...................................................................................................... 3

2 PRINCIPIOS DE ARQUITECTURA................................................................................... 3

2.1 PA-01 API FIRST ......................................................................................................... 3

2.2 PA-02 DESACOPLAMIENTO ............................................................................................ 3

2.3 PA-03 STATELESS......................................................................................................... 3

2.4 PA-04 HUMAN IN THE LOOP ......................................................................................... 3

2.5 PA-05 OBSERVABILIDAD................................................................................................ 3

3 ARQUITECTURA GENERAL ........................................................................................... 4

4 COMPONENTES PRINCIPALES...................................................................................... 5

4.1 AI ORCHESTRATOR................................................................................................... 5

4.2 AZURE DOCUMENT INTELLIGENCE .......................................................................... 5

4.3 AZURE AI FOUNDRY ................................................................................................. 6

4.4 KNOWLEDGE BASE CAE............................................................................................ 6

4.4.1 FUENTES ..................................................................................................................................... 6

4.5 VALIDATION ENGINE................................................................................................ 7

4.6 FEEDBACK ENGINE................................................................................................... 7

5 FLUJOS TÉCNICOS ........................................................................................................ 8

5.1 FT-01 CREACIÓN EXPEDIENTE.................................................................................. 8

5.2 FT-02 ENVÍO A REVISIÓN.......................................................................................... 8

5.3 FT-03 REVISIÓN OPERACIONES................................................................................ 9

5.4 FT-04 FEEDBACK ...................................................................................................... 9

6 MODELO DE IA............................................................................................................. 9

6.1 FASE INICIAL ................................................................................................................ 9

6.2 FASE AVANZADA........................................................................................................... 9



DISEÑO TÉCNICO DE REFERENCIA

SISTEMA DE ASISTENCIA INTELIGENTE PARA

PLATAFORMA CAE v2.0



Pág. 2 de 11



7 SEGURIDAD................................................................................................................ 10

7.1 IDENTIDAD................................................................................................................. 10

7.2 COMUNICACIONES ...................................................................................................... 10

7.3 DATOS...................................................................................................................... 10

7.4 AUDITORÍA ................................................................................................................ 10

8 OBSERVABILIDAD....................................................................................................... 10

8.1 MÉTRICAS TÉCNICAS.................................................................................................... 10

8.2 MÉTRICAS FUNCIONALES .............................................................................................. 10

9 KPI TÉCNICOS OBJETIVO............................................................................................ 11

10 VISIÓN FINAL ............................................................................................................. 11



DISEÑO TÉCNICO DE REFERENCIA

SISTEMA DE ASISTENCIA INTELIGENTE PARA

PLATAFORMA CAE v2.0



Pág. 3 de 11



1 OBJETIVO TÉCNICO

Definir la arquitectura tecnológica de referencia para la incorporación de capacidades de

Inteligencia Artificial dentro de la plataforma CAE v2.0.

La arquitectura deberá:

• Ser escalable.

• Desacoplar completamente las capacidades IA del núcleo CAE.

• Mantener la trazabilidad completa del expediente.

• Permitir la evolución independiente de modelos IA.

• Garantizar explicabilidad y supervisión humana.

• Minimizar el vendor lock-in.



2 PRINCIPIOS DE ARQUITECTURA

2.1 PA-01 API First

Toda funcionalidad IA deberá ser consumible mediante APIs.

No se permitirá acceso directo a bases de datos desde componentes IA.



2.2 PA-02 Desacoplamiento

La plataforma CAE seguirá siendo propietaria del expediente.

Los servicios IA actuarán exclusivamente como servicios auxiliares.



2.3 PA-03 Stateless

Los componentes de inferencia deberán ser stateless.

Toda persistencia deberá almacenarse en sistemas especializados.



2.4 PA-04 Human In The Loop

Las recomendaciones generadas por la IA no tendrán capacidad de aprobación automática.

Todas las decisiones finales deberán ser realizadas por usuarios autorizados.



2.5 PA-05 Observabilidad

Todos los procesos deberán generar:

• Logs.

• Telemetría.

• Métricas.

• Trazabilidad.



DISEÑO TÉCNICO DE REFERENCIA

SISTEMA DE ASISTENCIA INTELIGENTE PARA

PLATAFORMA CAE v2.0



Pág. 4 de 11



3 ARQUITECTURA GENERAL



+--------------------+

| Plataforma CAE v2 |

+---------+----------+

|

|

v

+--------------------+

| AI Orchestrator |

+---------+----------+

|

|

+--------+--------+

| |

v v

Document Azure AI

Intelligence Foundry

| |

v v

Documentos Razonamiento

Extraídos IA

|

|

v

+--------------------+

| Validation Engine |

+---------+----------+

|

v

+--------------------+

| Feedback Engine |

+--------------------+



DISEÑO TÉCNICO DE REFERENCIA

SISTEMA DE ASISTENCIA INTELIGENTE PARA

PLATAFORMA CAE v2.0



Pág. 5 de 11



4 COMPONENTES PRINCIPALES



4.1 AI ORCHESTRATOR

Componente responsable de coordinar todas las interacciones entre CAE y los servicios IA.

• Funciones

• Orquestación de procesos.

• Gestión de prompts.

• Coordinación de validaciones.

• Normalización de respuestas.

• Gestión de errores.

Entradas

JSON

{

"expedienteId": "123",

"documentos": []

}

Salidas

JSON

{

"estado": "VALIDATED",

"incidencias": [],

"recomendaciones": []

}



4.2 AZURE DOCUMENT INTELLIGENCE

Responsable de:

• OCR.

• Clasificación documental.

• Extracción estructurada.

Casos de uso

• DNI

• NIE

• Facturas

• Permiso circulación

• Ficha técnica

•

Datos generados

JSON

{

"vin": "VF1AAAA........",



DISEÑO TÉCNICO DE REFERENCIA

SISTEMA DE ASISTENCIA INTELIGENTE PARA

PLATAFORMA CAE v2.0



Pág. 6 de 11



"matricula": "1234ABC",

"confidence": 0.97

}



4.3 AZURE AI FOUNDRY

Componente central del razonamiento IA.

No se utilizará únicamente para extracción documental.

Su función principal será analizar el expediente completo.

• Capacidades

• Asistencia al usuario

Ejemplo:

Falta documentación obligatoria.

• Detección de incidencias

Ejemplo:

El titular de la factura no coincide con el titular identificado.

• Resumen de expediente

Ejemplo:

Expediente completo.

Nivel de riesgo: Bajo.

Pendiente revisión final.



• Explicabilidad

Ejemplo:

La incidencia se genera porque el VIN detectado no coincide entre la factura y la

ficha técnica.



4.4 KNOWLEDGE BASE CAE

Repositorio documental utilizado por Foundry mediante RAG.

Contendrá conocimiento específico del negocio.



4.4.1 Fuentes

Operación CAE

• Procedimientos internos.

• Manuales operativos.

• Checklists revisión.



DISEÑO TÉCNICO DE REFERENCIA

SISTEMA DE ASISTENCIA INTELIGENTE PARA

PLATAFORMA CAE v2.0



Pág. 7 de 11



Normativa

• Requisitos regulatorios.

• Guías de gestión.

Casuísticas

• Incidencias frecuentes.

• Errores recurrentes.

• Resoluciones históricas.

FAQ

Conocimiento generado por Operaciones.



4.5 VALIDATION ENGINE

Motor determinista de reglas.

Responsable de aplicar validaciones objetivas.

Ejemplos

• DNI

Regex.

Checksum.

• VIN

17 caracteres.

Sin I,O,Q.

• Matrículas

Formato válido.

• Reglas CA

Documentación obligatoria.

Coherencia documental.

Duplicidades.



4.6 FEEDBACK ENGINE

Sistema de captura de correcciones humanas.

Registra

• Operaciones

Dato corregido.

Motivo.

Usuario.



DISEÑO TÉCNICO DE REFERENCIA

SISTEMA DE ASISTENCIA INTELIGENTE PARA

PLATAFORMA CAE v2.0



Pág. 8 de 11



Fecha.

• Cliente

Dato modificado.

Motivo.

Objetivo

Generar datasets para:

• métricas

• precisión

• mejora continua

• evaluaciones Foundry



5 FLUJOS TÉCNICOS



5.1 FT-01 CREACIÓN EXPEDIENTE

Usuario

↓

Sube Documento

↓



Document Intelligence



↓

Extracción

↓

Orchestrator

↓



Validation Engine



↓

Foundry

↓



Asistencia usuario



5.2 FT-02 ENVÍO A REVISIÓN



Cliente

↓



Enviar Expediente



↓

Foundry

↓

Análisis Global

↓



DISEÑO TÉCNICO DE REFERENCIA

SISTEMA DE ASISTENCIA INTELIGENTE PARA

PLATAFORMA CAE v2.0



Pág. 9 de 11



Resumen Operaciones



↓

Cola Revisión



5.3 FT-03 REVISIÓN OPERACIONES

Operador

↓



Consulta expediente



↓

Resumen IA

↓

Incidencias

↓



Validación humana



5.4 FT-04 FEEDBACK



Corrección Humana



↓

Feedback Engine

↓

Dataset

↓

Evaluación



6 MODELO DE IA



6.1 Fase Inicial

No se contempla entrenamiento de modelos propios.

Se utilizarán:

• Azure AI Foundry

• GPT-4o

• Document Intelligence

• Prompt Engineering

• RAG



6.2 Fase Avanzada

Opcional.

Podrá evaluarse:

• Fine Tuning.

• Modelos especializados.

• Modelos internos.



DISEÑO TÉCNICO DE REFERENCIA

SISTEMA DE ASISTENCIA INTELIGENTE PARA

PLATAFORMA CAE v2.0



Pág. 10 de 11



7 SEGURIDAD



7.1 Identidad

• Microsoft Entra ID.(API Key)

• JWT.



7.2 Comunicaciones

• HTTPS/TLS.

• APIs securizadas.



7.3 Datos

• Cifrado en tránsito.

• Cifrado en reposo.



7.4 Auditoría

Registro completo de:

• prompts

• respuestas

• correcciones

• decisiones



8 OBSERVABILIDAD

8.1 Métricas técnicas

• Tiempo OCR.

• Tiempo inferencia.

• Coste por expediente.

• Coste por documento.



8.2 Métricas funcionales

• Precisión extracción.

• Expedientes corregidos.

• Expedientes devueltos.

• Incidencias detectadas.



DISEÑO TÉCNICO DE REFERENCIA

SISTEMA DE ASISTENCIA INTELIGENTE PARA

PLATAFORMA CAE v2.0



Pág. 11 de 11



9 KPI TÉCNICOS OBJETIVO

KPI Objetivo

Disponibilidad >99,5%

Tiempo análisis documento <10 segundos

Tiempo análisis expediente <30 segundos

Precisión OCR >95%

Trazabilidad 100%

Expedientes auditables 100%



10 VISIÓN FINAL

La IA no debe limitarse a extraer información de documentos.

La arquitectura deberá utilizar Azure AI Foundry como núcleo de razonamiento para asistir

activamente a usuarios y operadores durante todo el ciclo de vida del expediente,

apoyándose en Document Intelligence para la captura documental y en una base de

conocimiento específica del negocio CAE para proporcionar recomendaciones, validaciones

y análisis contextualizados.



ESPECIFICACIÓN FUNCIONAL

SISTEMA DE ASISTENCIA INTELIGENTE PARA LA

PLATAFORMA CAE v2.0



Pág. 1 de 15



HISTÓRICO DE REVISIONES

REVISIÓN FECHA NATURALEZA DEL CAMBIO

0 27-06-2026 Primera versión del documento (Borrador)

1 27-06-2026 Incorporación elementos de negocio (operaciones)



ÍNDICE DE CONTENIDOS

1 INTRODUCCIÓN ........................................................................................................... 4

1.1 OBJETIVO .................................................................................................................... 4

2 OBJETIVOS DE NEGOCIO.............................................................................................. 4

2.1 OBJ-01...................................................................................................................... 4

2.2 OBJ-02...................................................................................................................... 4

2.3 OBJ-03...................................................................................................................... 4

2.4 OBJ-04...................................................................................................................... 4

2.5 OBJ-05...................................................................................................................... 4

2.6 OBJ-06...................................................................................................................... 4

3 ALCANCE ...................................................................................................................... 5

3.1 INCLUIDO .................................................................................................................... 5

3.2 EXCLUIDO.................................................................................................................... 5

4 PRINCIPIOS FUNCIONALES........................................................................................... 5

4.1 PF-01 ASISTENCIA CONTINUA ......................................................................................... 5

4.2 PF-02 PREVENCIÓN DE ERRORES ..................................................................................... 5

4.3 PF-03 EXPLICABILIDAD.................................................................................................. 5

4.4 PF-04 SUPERVISIÓN HUMANA......................................................................................... 5

4.5 PF-05 TRAZABILIDAD COMPLETA..................................................................................... 5

5 ACTORES...................................................................................................................... 6

5.1 CLIENTE ...................................................................................................................... 6

5.2 OPERACIONES IDEAUTO............................................................................................... 6

5.3 SISTEMA IA.................................................................................................................. 6

6 FLUJO FUNCIONAL ....................................................................................................... 6



ESPECIFICACIÓN FUNCIONAL

SISTEMA DE ASISTENCIA INTELIGENTE PARA LA

PLATAFORMA CAE v2.0



Pág. 2 de 15



6.1 FASE 1 – CREACIÓN DEL EXPEDIENTE................................................................................. 6

6.2 FASE 2 – SUBIDA DOCUMENTAL....................................................................................... 6

6.3 FASE 3 – CONSTRUCCIÓN DEL EXPEDIENTE ......................................................................... 6

6.4 FASE 4 – VALIDACIÓN PREVIA AL ENVÍO............................................................................. 6

6.5 FASE 5 – REVISIÓN OPERACIONES.................................................................................... 7

6.6 FASE 6 – FEEDBACK....................................................................................................... 7

7 CAPACIDADES FUNCIONALES ...................................................................................... 7

7.1 CF-001 CLASIFICACIÓN DOCUMENTAL.............................................................................. 7

7.2 CF-002 EXTRACCIÓN DE INFORMACIÓN............................................................................ 7

7.3 CF-003 VALIDACIÓN DOCUMENTAL ................................................................................. 7

7.4 CF-004 VALIDACIÓN FUNCIONAL..................................................................................... 7

7.5 CF-005 DETECCIÓN DE INCOHERENCIAS............................................................................ 7

7.6 CF-006 CONTROL DE COMPLETITUD................................................................................. 8

7.7 CF-007 ASISTENTE DE REVISIÓN...................................................................................... 8

7.8 CF-008 GESTIÓN DE INCIDENCIAS.................................................................................... 8

7.9 CF-009 HISTÓRICOS..................................................................................................... 8

8 CATÁLOGO DE REGLAS FUNCIONALES ........................................................................ 8

8.1 BLOQUE A – VALIDACIONES DOCUMENTALES......................................................... 8

8.1.1 RF-001 DNI...............................................................................................................................................8

8.1.2 RF-002 FACTURA VN.................................................................................................................................8

8.1.3 RF-003 FICHA TÉCNICA VN.........................................................................................................................9

8.1.4 RF-004 DOCUMENTO SUSTITUCIÓN VO......................................................................................................9

8.1.5 RF-005 FICHA TÉCNICA VO ........................................................................................................................9

8.1.6 RF-006 PERMISO CIRCULACIÓN VO............................................................................................................9

8.1.7 RF-007 ÚLTIMO IVTM...............................................................................................................................9

8.2 BLOQUE B – VALIDACIONES DE FIRMAS................................................................. 10

8.2.1 RF-008 FIRMA MANUSCRITA....................................................................................................................10

8.2.2 RF-009 FIRMA DIGITAL.............................................................................................................................10

8.2.3 RF-010 COMPARACIÓN FIRMA DNI...........................................................................................................10

8.3 BLOQUE C – VALIDACIONES DE COHERENCIA........................................................ 10

8.3.1 RF-011 TITULAR.......................................................................................................................................10

8.3.2 RF-012 VIN.............................................................................................................................................10

8.3.3 RF-013 MATRÍCULA .................................................................................................................................10

8.3.4 RF-014 MARCA Y MODELO.......................................................................................................................10



ESPECIFICACIÓN FUNCIONAL

SISTEMA DE ASISTENCIA INTELIGENTE PARA LA

PLATAFORMA CAE v2.0



Pág. 3 de 15



8.4 BLOQUE D– VALIDACIONES CAE............................................................................ 11

8.4.1 RF-015 ANTIGÜEDAD VO.........................................................................................................................11

8.4.2 RF-016 COMBUSTIBLE VO........................................................................................................................11

8.4.3 RF-017 COMBUSTIBLE VN........................................................................................................................11

8.4.4 RF-018 CATEGORÍA HOMOLOGACIÓN.......................................................................................................11

8.4.5 RF-019 FECHAS ACTUACIÓN.....................................................................................................................11

8.4.6 RF-020 VALIDACIÓN AHORRO ENERGÉTICO...............................................................................................11

8.5 BLOQUE E – FORMULARIO..................................................................................... 11

8.5.1 RF-021 NOMBRE EXPEDIENTE...................................................................................................................11

8.5.2 RF-022 DIRECCIÓN POSTAL.......................................................................................................................11

8.5.3 RF-023 REFERENCIA CATASTRAL ...............................................................................................................12

8.5.4 RF-024 AYUDAS PÚBLICAS........................................................................................................................12

8.5.5 RF-025 DATOS BANCARIOS.......................................................................................................................12

8.6 BLOQUE F – DOCUMENTOS ANEXOS ..................................................................... 12

8.6.1 RF-026 CONVENIO CAE ...........................................................................................................................12

8.6.2 RF-027 CONTRAPRESTACIÓN CONVENIO...................................................................................................12

8.6.3 RF-028 AUTORIZACIÓN DATOS PERSONALES.............................................................................................12

8.7 BLOQUE G –CALIDAD DOCUMENTAL.................................................................... 12

8.7.1 RF-029 CALIDAD IMAGEN.........................................................................................................................12

8.7.2 RF-030 INTEGRIDAD DOCUMENTO............................................................................................................13

9 SISTEMA DE INCIDENCIAS.......................................................................................... 13

9.1 CRÍTICAS ................................................................................................................... 13

9.2 MAYORES.................................................................................................................. 13

9.3 MENORES.................................................................................................................. 13

10 10. EXPERIENCIA DE USUARIO................................................................................... 13

10.1 VISTA CLIENTE............................................................................................................ 13

10.2 VISTA OPERACIONES.................................................................................................... 14

10.3 COMUNICACIÓN DE INCIDENCIAS.................................................................................... 14

11 HISTÓRICO Y ANALÍTICA............................................................................................ 14

11.1 HISTÓRICO POR EXPEDIENTE.......................................................................................... 14

11.2 DASHBOARD DE CALIDAD.............................................................................................. 14

12 INDICADORES DE ÉXITO............................................................................................. 14

13 VISIÓN FINAL.............................................................................................................. 15



ESPECIFICACIÓN FUNCIONAL

SISTEMA DE ASISTENCIA INTELIGENTE PARA LA

PLATAFORMA CAE v2.0



Pág. 4 de 15



1 INTRODUCCIÓN



1.1 Objetivo

El objetivo de este proyecto es incorporar capacidades de Inteligencia Artificial en la

Plataforma CAE v2.0 con el fin de asistir a los usuarios durante la creación, validación y

revisión de expedientes.

La solución deberá ayudar a:

• Reducir errores.

• Mejorar la calidad de la documentación.

• Detectar incidencias de forma temprana.

• Reducir devoluciones de expedientes.

• Disminuir la carga operativa del equipo de revisión.

• Mejorar los tiempos de tramitación.

La extracción automática de información desde documentos constituye únicamente una de

las capacidades del sistema.

El objetivo principal es la validación continua y asistida del expediente durante todo su ciclo

de vida.



2 OBJETIVOS DE NEGOCIO



2.1 OBJ-01

Reducir el porcentaje de expedientes devueltos al cliente por errores documentales.

2.2 OBJ-02

Reducir el tiempo medio de creación de expedientes.

2.3 OBJ-03

Reducir el tiempo medio de revisión realizado por el equipo de Operaciones.

2.4 OBJ-04

Detectar incidencias antes del envío a revisión.

2.5 OBJ-05

Mejorar la calidad global de los expedientes generados.

2.6 OBJ-06

Disponer de métricas objetivas sobre los errores más frecuentes.



ESPECIFICACIÓN FUNCIONAL

SISTEMA DE ASISTENCIA INTELIGENTE PARA LA

PLATAFORMA CAE v2.0



Pág. 5 de 15



3 ALCANCE



3.1 Incluido

• Clasificación documental.

• OCR y extracción de datos.

• Validación documental.

• Validación funcional.

• Detección de incidencias.

• Asistencia al usuario.

• Asistencia al equipo de Operaciones.

• Históricos y métricas.

• Registro de correcciones.

3.2 Excluido

• Gestión de usuarios.

• Facturación.

• Gestión de Sujetos Delegados.

• Gestión de Lotes.

• Aprobación automática de expedientes.

La decisión final siempre corresponderá a un usuario autorizado.



4 PRINCIPIOS FUNCIONALES



4.1 PF-01 Asistencia continua

La IA debe acompañar al usuario durante toda la construcción del expediente.



4.2 PF-02 Prevención de errores

Las incidencias deben detectarse lo antes posible.



4.3 PF-03 Explicabilidad

Todas las validaciones deberán explicar el motivo del error detectado.



4.4 PF-04 Supervisión humana

La IA nunca aprobará expedientes automáticamente.



4.5 PF-05 Trazabilidad completa

Toda acción realizada por la IA deberá poder ser auditada.



ESPECIFICACIÓN FUNCIONAL

SISTEMA DE ASISTENCIA INTELIGENTE PARA LA

PLATAFORMA CAE v2.0



Pág. 6 de 15



5 ACTORES

5.1 Cliente

Responsable de crear y completar el expediente.

5.2 Operaciones IDEAUTO

Responsable de revisar y validar expedientes.

5.3 Sistema IA

Sistema de asistencia y validación.



6 FLUJO FUNCIONAL



6.1 Fase 1 – Creación del expediente

El usuario crea un expediente.

La IA permanece inactiva hasta la incorporación de documentación.



6.2 Fase 2 – Subida documental

Cada vez que se incorpora un documento:

• Identificación del documento.

• Validación del formato.

• Verificación de calidad.

• Extracción de datos.

• Validaciones específicas.



6.3 Fase 3 – Construcción del expediente

La IA debe:

• Completar campos automáticamente.

• Detectar incoherencias.

• Detectar información faltante.

• Detectar documentos incorrectos.

• Mostrar incidencias en tiempo real.



6.4 Fase 4 – Validación previa al envío

Antes del envío:

• Validación de completitud.

• Validación de coherencia.



ESPECIFICACIÓN FUNCIONAL

SISTEMA DE ASISTENCIA INTELIGENTE PARA LA

PLATAFORMA CAE v2.0



Pág. 7 de 15



• Validación funcional CAE.



6.5 Fase 5 – Revisión Operaciones

La IA genera:

• Resumen ejecutivo.

• Incidencias.

• Riesgos detectados.

• Campos modificados por usuario.



6.6 Fase 6 – Feedback

Las correcciones realizadas se almacenan para análisis y mejora continua.



7 CAPACIDADES FUNCIONALES



7.1 CF-001 Clasificación documental

El sistema deberá identificar automáticamente el tipo documental aportado.



7.2 CF-002 Extracción de información

El sistema deberá completar automáticamente los campos del expediente cuando sea

posible.

Todos los datos deberán indicar:

• Valor.

• Nivel de confianza.

• Origen.



7.3 CF-003 Validación documental

Verificación de:

• Legibilidad.

• Integridad.

• Tipo documental.

• Calidad mínima.



7.4 CF-004 Validación funcional

Aplicación de reglas de negocio CAE.



7.5 CF-005 Detección de incoherencias

Comparación de información entre documentos.



ESPECIFICACIÓN FUNCIONAL

SISTEMA DE ASISTENCIA INTELIGENTE PARA LA

PLATAFORMA CAE v2.0



Pág. 8 de 15



7.6 CF-006 Control de completitud

Indicación permanente del estado de avance del expediente.

Ejemplo:

Expediente completado al 85%.

Pendiente:

- Último IVTM

- Firma Convenio CAE



7.7 CF-007 Asistente de revisión

Generación automática de resumen para Operaciones.



7.8 CF-008 Gestión de incidencias

Registro centralizado de todas las incidencias.



7.9 CF-009 Históricos

Consulta de errores históricos.



8 CATÁLOGO DE REGLAS FUNCIONALES



8.1 BLOQUE A – VALIDACIONES DOCUMENTALES

8.1.1 RF-001 DNI

Validaciones:

• Documento DNI.

• Dos caras obligatorias.

• Legible.

• Datos extraíbles.

Severidad: Crítica.



8.1.2 RF-002 Factura VN

Validaciones:

• Factura de compra válida.

• Titular identificable.

• Matrícula o VIN.

• Marca.



ESPECIFICACIÓN FUNCIONAL

SISTEMA DE ASISTENCIA INTELIGENTE PARA LA

PLATAFORMA CAE v2.0



Pág. 9 de 15



• Modelo.

Severidad: Crítica.



8.1.3 RF-003 Ficha Técnica VN

Validaciones:

• Matrícula.

• VIN.

• Marca.

• Modelo.

• Versión.

• Energía.

Severidad: Crítica.



8.1.4 RF-004 Documento Sustitución VO

Tipos válidos:

• Baja definitiva.

• Contrato compraventa.

• Permiso circulación nuevo propietario.

Severidad: Crítica.



8.1.5 RF-005 Ficha Técnica VO

Tipos válidos:

• Ficha técnica.

• Informe DGT por extravío.

Severidad: Crítica.



8.1.6 RF-006 Permiso Circulación VO

Tipos válidos:

• Permiso circulación.

• Penúltimo IVTM por extravío.

Severidad: Crítica.



8.1.7 RF-007 Último IVTM

Validaciones: Matrícula.

• VIN.

• Ejercicio correspondiente.

Severidad: Crítica.



ESPECIFICACIÓN FUNCIONAL

SISTEMA DE ASISTENCIA INTELIGENTE PARA LA

PLATAFORMA CAE v2.0



Pág. 10 de 15



8.2 BLOQUE B – VALIDACIONES DE FIRMAS

8.2.1 RF-008 Firma Manuscrita

Documentos:

• Anexo.

• Convenio CAE.

• Autorización protección datos.

Para clientes particulares:

• Firma manuscrita obligatoria.



8.2.2 RF-009 Firma Digital

Permitida para empresas cuando proceda.



8.2.3 RF-010 Comparación firma DNI

El sistema podrá comparar similitud entre firmas aportadas y firma existente en DNI.

Severidad: Advertencia.



8.3 BLOQUE C – VALIDACIONES DE COHERENCIA

8.3.1 RF-011 Titular

El titular deberá coincidir entre:

• DNI.

• Factura.

• Contrato.

• Permiso circulación.



8.3.2 RF-012 VIN

El VIN deberá coincidir entre:

• Factura.

• Ficha técnica.

• Permiso circulación.

• Base de datos IDEAUTO.



8.3.3 RF-013 Matrícula

La matrícula deberá ser consistente entre toda la documentación.



8.3.4 RF-014 Marca y Modelo

Consistencia entre:



ESPECIFICACIÓN FUNCIONAL

SISTEMA DE ASISTENCIA INTELIGENTE PARA LA

PLATAFORMA CAE v2.0



Pág. 11 de 15



• Factura.

• Ficha técnica.

• Base de vehículos IDEAUTO.



8.4 BLOQUE D – VALIDACIONES CAE

8.4.1 RF-015 Antigüedad VO

Periodo mínimo: 365 días.

Fuente: API IDEAUTO.



8.4.2 RF-016 Combustible VO

No puede ser BEV.



8.4.3 RF-017 Combustible VN

Debe ser BEV.



8.4.4 RF-018 Categoría Homologación

La categoría de homologación deberá ser compatible entre VO y VN.



8.4.5 RF-019 Fechas Actuación

Cuando la sustitución del VO preceda a la compra del VN:

Máximo 3 meses

Cuando la compra del VN preceda a la sustitución del VO:

Máximo 6 meses



8.4.6 RF-020 Validación Ahorro Energético

El valor de ahorro deberá encontrarse dentro de los rangos establecidos para cada tipología

de vehículo.

Generará advertencia.



8.5 BLOQUE E – FORMULARIO

8.5.1 RF-021 Nombre Expediente

Formato homogéneo y numeración automática.



8.5.2 RF-022 Dirección Postal

Autocompletado desde:



ESPECIFICACIÓN FUNCIONAL

SISTEMA DE ASISTENCIA INTELIGENTE PARA LA

PLATAFORMA CAE v2.0



Pág. 12 de 15



• DNI.

• Factura.



8.5.3 RF-023 Referencia Catastral

Autocompletado mediante dirección postal.



8.5.4 RF-024 Ayudas Públicas

Si el usuario indica que ha solicitado ayudas deberá cumplimentar:

• Denominación.

• Entidad.

• Disposición reguladora.

• Año.



8.5.5 RF-025 Datos Bancarios

La plataforma deberá determinar si la contraprestación se realiza mediante transferencia o

abono.



8.6 BLOQUE F – DOCUMENTOS ANEXOS

8.6.1 RF-026 Convenio CAE

Validaciones:

• Firmado.

• Contraprestación cumplimentada.



8.6.2 RF-027 Contraprestación Convenio

Rango válido: 0,10 €/kWh ≤ valor ≤ 0,20 €/kWh



8.6.3 RF-028 Autorización Datos Personales

Obligatorio únicamente para las marcas definidas por IDEAUTO.



8.7 BLOQUE G – CALIDAD DOCUMENTAL

8.7.1 RF-029 Calidad Imagen

El sistema validará:

• Resolución.

• Contraste.

• Legibilidad.



ESPECIFICACIÓN FUNCIONAL

SISTEMA DE ASISTENCIA INTELIGENTE PARA LA

PLATAFORMA CAE v2.0



Pág. 13 de 15



8.7.2 RF-030 Integridad Documento

Detección de:

• Páginas faltantes.

• Páginas duplicadas.

• Páginas superpuestas.

• Orden incorrecto.



9 SISTEMA DE INCIDENCIAS

9.1 Críticas

Bloquean el envío.

Ejemplos:

• Documento obligatorio ausente.

• VIN inconsistente.

• Falta firma obligatoria.



9.2 Mayores

Requieren corrección.

Ejemplos:

• Información incoherente.

• Documentos incompletos.



9.3 Menores

Solo advertencia.

Ejemplos:

• Calidad mejorable.

• Confianza baja.



10 10. EXPERIENCIA DE USUARIO



10.1 Vista Cliente

Mostrar:

• Documentos pendientes.

• Errores.

• Advertencias.

• Estado de completitud.



ESPECIFICACIÓN FUNCIONAL

SISTEMA DE ASISTENCIA INTELIGENTE PARA LA

PLATAFORMA CAE v2.0



Pág. 14 de 15



10.2 Vista Operaciones

Mostrar únicamente:

• Incidencias detectadas.

• Alertas.

• Campos corregidos.

No mostrar validaciones correctas salvo consulta expresa.



10.3 Comunicación de incidencias

Operaciones podrá generar una devolución al usuario con las incidencias detectadas.



11 HISTÓRICO Y ANALÍTICA



11.1 Histórico por expediente

Mostrar:

• Errores.

• Correcciones.

• Usuarios.

• Fechas.



11.2 Dashboard de Calidad

Métricas:

• Errores por marca.

• Errores por concesionario.

• Errores por mes.

• Errores por tipo documental.

• Expedientes devueltos.

• Expedientes corregidos.



12 INDICADORES DE ÉXITO

• Reducción de expedientes devueltos.

• Reducción del tiempo de revisión.

• Reducción del tiempo de creación.

• Incremento de expedientes válidos al primer envío.

• Precisión documental superior al 95%.

• Trazabilidad completa de decisiones y correcciones.



ESPECIFICACIÓN FUNCIONAL

SISTEMA DE ASISTENCIA INTELIGENTE PARA LA

PLATAFORMA CAE v2.0



Pág. 15 de 15



13 VISIÓN FINAL

La IA deberá actuar como un asistente especializado en expedientes CAE capaz de guiar al

usuario durante la construcción del expediente, validar continuamente la documentación

aportada, aplicar reglas de negocio específicas del proceso CAE, detectar incidencias antes

de la revisión y asistir al equipo de Operaciones mediante resúmenes, alertas y

recomendaciones que permitan reducir significativamente la carga operativa y mejorar la calidad de los expedientes tramitados.



este fue el flujo que nos aprobo



hola Florina buen día , a lo que dice Antonio

en la propuesta primera que hice estaba todo eso...que dice que falta



pero como siempre se simplificó más de la cuenta

Tú, lun 8:16





Florina Mahalean, lun 9:17

pero a pesar de la simplificación

sigue significando lo mismo  no'

?


ahora he creado esa nueva imagen con la nueva arquitectura y funciona y hay que actualizar los dos enviados:

actualiza los documentos enviados
DISEÑO TÉCNICO DE REFERENCIA
SISTEMA DE ASISTENCIA INTELIGENTE PARA
PLATAFORMA CAE v2.0

Pág. 1 de 11

HISTÓRICO DE REVISIONES
REVISIÓN FECHA NATURALEZA DEL CAMBIO
0 27-06-2026 Primera versión del documento (Borrador)

ÍNDICE DE CONTENIDOS
1 OBJETIVO TÉCNICO...................................................................................................... 3
2 PRINCIPIOS DE ARQUITECTURA................................................................................... 3
2.1 PA-01 API FIRST ......................................................................................................... 3
2.2 PA-02 DESACOPLAMIENTO ............................................................................................ 3
2.3 PA-03 STATELESS......................................................................................................... 3
2.4 PA-04 HUMAN IN THE LOOP ......................................................................................... 3
2.5 PA-05 OBSERVABILIDAD................................................................................................ 3
3 ARQUITECTURA GENERAL ........................................................................................... 4
4 COMPONENTES PRINCIPALES...................................................................................... 5
4.1 AI ORCHESTRATOR................................................................................................... 5
4.2 AZURE DOCUMENT INTELLIGENCE .......................................................................... 5
4.3 AZURE AI FOUNDRY ................................................................................................. 6
4.4 KNOWLEDGE BASE CAE............................................................................................ 6
4.4.1 FUENTES ..................................................................................................................................... 6
4.5 VALIDATION ENGINE................................................................................................ 7
4.6 FEEDBACK ENGINE................................................................................................... 7
5 FLUJOS TÉCNICOS ........................................................................................................ 8
5.1 FT-01 CREACIÓN EXPEDIENTE.................................................................................. 8
5.2 FT-02 ENVÍO A REVISIÓN.......................................................................................... 8
5.3 FT-03 REVISIÓN OPERACIONES................................................................................ 9
5.4 FT-04 FEEDBACK ...................................................................................................... 9
6 MODELO DE IA............................................................................................................. 9
6.1 FASE INICIAL ................................................................................................................ 9
6.2 FASE AVANZADA........................................................................................................... 9

DISEÑO TÉCNICO DE REFERENCIA
SISTEMA DE ASISTENCIA INTELIGENTE PARA
PLATAFORMA CAE v2.0

Pág. 2 de 11

7 SEGURIDAD................................................................................................................ 10
7.1 IDENTIDAD................................................................................................................. 10
7.2 COMUNICACIONES ...................................................................................................... 10
7.3 DATOS...................................................................................................................... 10
7.4 AUDITORÍA ................................................................................................................ 10
8 OBSERVABILIDAD....................................................................................................... 10
8.1 MÉTRICAS TÉCNICAS.................................................................................................... 10
8.2 MÉTRICAS FUNCIONALES .............................................................................................. 10
9 KPI TÉCNICOS OBJETIVO............................................................................................ 11
10 VISIÓN FINAL ............................................................................................................. 11

DISEÑO TÉCNICO DE REFERENCIA
SISTEMA DE ASISTENCIA INTELIGENTE PARA
PLATAFORMA CAE v2.0

Pág. 3 de 11

1 OBJETIVO TÉCNICO
Definir la arquitectura tecnológica de referencia para la incorporación de capacidades de
Inteligencia Artificial dentro de la plataforma CAE v2.0.
La arquitectura deberá:
• Ser escalable.
• Desacoplar completamente las capacidades IA del núcleo CAE.
• Mantener la trazabilidad completa del expediente.
• Permitir la evolución independiente de modelos IA.
• Garantizar explicabilidad y supervisión humana.
• Minimizar el vendor lock-in.

2 PRINCIPIOS DE ARQUITECTURA
2.1 PA-01 API First
Toda funcionalidad IA deberá ser consumible mediante APIs.
No se permitirá acceso directo a bases de datos desde componentes IA.

2.2 PA-02 Desacoplamiento
La plataforma CAE seguirá siendo propietaria del expediente.
Los servicios IA actuarán exclusivamente como servicios auxiliares.

2.3 PA-03 Stateless
Los componentes de inferencia deberán ser stateless.
Toda persistencia deberá almacenarse en sistemas especializados.

2.4 PA-04 Human In The Loop
Las recomendaciones generadas por la IA no tendrán capacidad de aprobación automática.
Todas las decisiones finales deberán ser realizadas por usuarios autorizados.

2.5 PA-05 Observabilidad
Todos los procesos deberán generar:
• Logs.
• Telemetría.
• Métricas.
• Trazabilidad.

DISEÑO TÉCNICO DE REFERENCIA
SISTEMA DE ASISTENCIA INTELIGENTE PARA
PLATAFORMA CAE v2.0

Pág. 4 de 11

3 ARQUITECTURA GENERAL

+--------------------+
| Plataforma CAE v2 |
+---------+----------+
|
|
v
+--------------------+
| AI Orchestrator |
+---------+----------+
|
|
+--------+--------+
| |
v v
Document Azure AI
Intelligence Foundry
| |
v v
Documentos Razonamiento
Extraídos IA
|
|
v
+--------------------+
| Validation Engine |
+---------+----------+
|
v
+--------------------+
| Feedback Engine |
+--------------------+

DISEÑO TÉCNICO DE REFERENCIA
SISTEMA DE ASISTENCIA INTELIGENTE PARA
PLATAFORMA CAE v2.0

Pág. 5 de 11

4 COMPONENTES PRINCIPALES

4.1 AI ORCHESTRATOR
Componente responsable de coordinar todas las interacciones entre CAE y los servicios IA.
• Funciones
• Orquestación de procesos.
• Gestión de prompts.
• Coordinación de validaciones.
• Normalización de respuestas.
• Gestión de errores.
Entradas
JSON
{
"expedienteId": "123",
"documentos": []
}
Salidas
JSON
{
"estado": "VALIDATED",
"incidencias": [],
"recomendaciones": []
}

4.2 AZURE DOCUMENT INTELLIGENCE
Responsable de:
• OCR.
• Clasificación documental.
• Extracción estructurada.
Casos de uso
• DNI
• NIE
• Facturas
• Permiso circulación
• Ficha técnica
•
Datos generados
JSON
{
"vin": "VF1AAAA........",

DISEÑO TÉCNICO DE REFERENCIA
SISTEMA DE ASISTENCIA INTELIGENTE PARA
PLATAFORMA CAE v2.0

Pág. 6 de 11

"matricula": "1234ABC",
"confidence": 0.97
}

4.3 AZURE AI FOUNDRY
Componente central del razonamiento IA.
No se utilizará únicamente para extracción documental.
Su función principal será analizar el expediente completo.
• Capacidades
• Asistencia al usuario
Ejemplo:
Falta documentación obligatoria.
• Detección de incidencias
Ejemplo:
El titular de la factura no coincide con el titular identificado.
• Resumen de expediente
Ejemplo:
Expediente completo.
Nivel de riesgo: Bajo.
Pendiente revisión final.

• Explicabilidad
Ejemplo:
La incidencia se genera porque el VIN detectado no coincide entre la factura y la
ficha técnica.

4.4 KNOWLEDGE BASE CAE
Repositorio documental utilizado por Foundry mediante RAG.
Contendrá conocimiento específico del negocio.

4.4.1 Fuentes
Operación CAE
• Procedimientos internos.
• Manuales operativos.
• Checklists revisión.

DISEÑO TÉCNICO DE REFERENCIA
SISTEMA DE ASISTENCIA INTELIGENTE PARA
PLATAFORMA CAE v2.0

Pág. 7 de 11

Normativa
• Requisitos regulatorios.
• Guías de gestión.
Casuísticas
• Incidencias frecuentes.
• Errores recurrentes.
• Resoluciones históricas.
FAQ
Conocimiento generado por Operaciones.

4.5 VALIDATION ENGINE
Motor determinista de reglas.
Responsable de aplicar validaciones objetivas.
Ejemplos
• DNI
Regex.
Checksum.
• VIN
17 caracteres.
Sin I,O,Q.
• Matrículas
Formato válido.
• Reglas CA
Documentación obligatoria.
Coherencia documental.
Duplicidades.

4.6 FEEDBACK ENGINE
Sistema de captura de correcciones humanas.
Registra
• Operaciones
Dato corregido.
Motivo.
Usuario.

DISEÑO TÉCNICO DE REFERENCIA
SISTEMA DE ASISTENCIA INTELIGENTE PARA
PLATAFORMA CAE v2.0

Pág. 8 de 11

Fecha.
• Cliente
Dato modificado.
Motivo.
Objetivo
Generar datasets para:
• métricas
• precisión
• mejora continua
• evaluaciones Foundry

5 FLUJOS TÉCNICOS

5.1 FT-01 CREACIÓN EXPEDIENTE
Usuario
↓
Sube Documento
↓

Document Intelligence

↓
Extracción
↓
Orchestrator
↓

Validation Engine

↓
Foundry
↓

Asistencia usuario

5.2 FT-02 ENVÍO A REVISIÓN

Cliente
↓

Enviar Expediente

↓
Foundry
↓
Análisis Global
↓

DISEÑO TÉCNICO DE REFERENCIA
SISTEMA DE ASISTENCIA INTELIGENTE PARA
PLATAFORMA CAE v2.0

Pág. 9 de 11

Resumen Operaciones

↓
Cola Revisión

5.3 FT-03 REVISIÓN OPERACIONES
Operador
↓

Consulta expediente

↓
Resumen IA
↓
Incidencias
↓

Validación humana

5.4 FT-04 FEEDBACK

Corrección Humana

↓
Feedback Engine
↓
Dataset
↓
Evaluación

6 MODELO DE IA

6.1 Fase Inicial
No se contempla entrenamiento de modelos propios.
Se utilizarán:
• Azure AI Foundry
• GPT-4o
• Document Intelligence
• Prompt Engineering
• RAG

6.2 Fase Avanzada
Opcional.
Podrá evaluarse:
• Fine Tuning.
• Modelos especializados.
• Modelos internos.

DISEÑO TÉCNICO DE REFERENCIA
SISTEMA DE ASISTENCIA INTELIGENTE PARA
PLATAFORMA CAE v2.0

Pág. 10 de 11

7 SEGURIDAD

7.1 Identidad
• Microsoft Entra ID.(API Key)
• JWT.

7.2 Comunicaciones
• HTTPS/TLS.
• APIs securizadas.

7.3 Datos
• Cifrado en tránsito.
• Cifrado en reposo.

7.4 Auditoría
Registro completo de:
• prompts
• respuestas
• correcciones
• decisiones

8 OBSERVABILIDAD
8.1 Métricas técnicas
• Tiempo OCR.
• Tiempo inferencia.
• Coste por expediente.
• Coste por documento.

8.2 Métricas funcionales
• Precisión extracción.
• Expedientes corregidos.
• Expedientes devueltos.
• Incidencias detectadas.

DISEÑO TÉCNICO DE REFERENCIA
SISTEMA DE ASISTENCIA INTELIGENTE PARA
PLATAFORMA CAE v2.0

Pág. 11 de 11

9 KPI TÉCNICOS OBJETIVO
KPI Objetivo
Disponibilidad >99,5%
Tiempo análisis documento <10 segundos
Tiempo análisis expediente <30 segundos
Precisión OCR >95%
Trazabilidad 100%
Expedientes auditables 100%

10 VISIÓN FINAL
La IA no debe limitarse a extraer información de documentos.
La arquitectura deberá utilizar Azure AI Foundry como núcleo de razonamiento para asistir
activamente a usuarios y operadores durante todo el ciclo de vida del expediente,
apoyándose en Document Intelligence para la captura documental y en una base de
conocimiento específica del negocio CAE para proporcionar recomendaciones, validaciones

ESPECIFICACIÓN FUNCIONAL
SISTEMA DE ASISTENCIA INTELIGENTE PARA LA
PLATAFORMA CAE v2.0

Pág. 1 de 15

HISTÓRICO DE REVISIONES
REVISIÓN FECHA NATURALEZA DEL CAMBIO
0 27-06-2026 Primera versión del documento (Borrador)
1 27-06-2026 Incorporación elementos de negocio (operaciones)

ÍNDICE DE CONTENIDOS
1 INTRODUCCIÓN ........................................................................................................... 4
1.1 OBJETIVO .................................................................................................................... 4
2 OBJETIVOS DE NEGOCIO.............................................................................................. 4
2.1 OBJ-01...................................................................................................................... 4
2.2 OBJ-02...................................................................................................................... 4
2.3 OBJ-03...................................................................................................................... 4
2.4 OBJ-04...................................................................................................................... 4
2.5 OBJ-05...................................................................................................................... 4
2.6 OBJ-06...................................................................................................................... 4
3 ALCANCE ...................................................................................................................... 5
3.1 INCLUIDO .................................................................................................................... 5
3.2 EXCLUIDO.................................................................................................................... 5
4 PRINCIPIOS FUNCIONALES........................................................................................... 5
4.1 PF-01 ASISTENCIA CONTINUA ......................................................................................... 5
4.2 PF-02 PREVENCIÓN DE ERRORES ..................................................................................... 5
4.3 PF-03 EXPLICABILIDAD.................................................................................................. 5
4.4 PF-04 SUPERVISIÓN HUMANA......................................................................................... 5
4.5 PF-05 TRAZABILIDAD COMPLETA..................................................................................... 5
5 ACTORES...................................................................................................................... 6
5.1 CLIENTE ...................................................................................................................... 6
5.2 OPERACIONES IDEAUTO............................................................................................... 6
5.3 SISTEMA IA.................................................................................................................. 6
6 FLUJO FUNCIONAL ....................................................................................................... 6

ESPECIFICACIÓN FUNCIONAL
SISTEMA DE ASISTENCIA INTELIGENTE PARA LA
PLATAFORMA CAE v2.0

Pág. 2 de 15

6.1 FASE 1 – CREACIÓN DEL EXPEDIENTE................................................................................. 6
6.2 FASE 2 – SUBIDA DOCUMENTAL....................................................................................... 6
6.3 FASE 3 – CONSTRUCCIÓN DEL EXPEDIENTE ......................................................................... 6
6.4 FASE 4 – VALIDACIÓN PREVIA AL ENVÍO............................................................................. 6
6.5 FASE 5 – REVISIÓN OPERACIONES.................................................................................... 7
6.6 FASE 6 – FEEDBACK....................................................................................................... 7
7 CAPACIDADES FUNCIONALES ...................................................................................... 7
7.1 CF-001 CLASIFICACIÓN DOCUMENTAL.............................................................................. 7
7.2 CF-002 EXTRACCIÓN DE INFORMACIÓN............................................................................ 7
7.3 CF-003 VALIDACIÓN DOCUMENTAL ................................................................................. 7
7.4 CF-004 VALIDACIÓN FUNCIONAL..................................................................................... 7
7.5 CF-005 DETECCIÓN DE INCOHERENCIAS............................................................................ 7
7.6 CF-006 CONTROL DE COMPLETITUD................................................................................. 8
7.7 CF-007 ASISTENTE DE REVISIÓN...................................................................................... 8
7.8 CF-008 GESTIÓN DE INCIDENCIAS.................................................................................... 8
7.9 CF-009 HISTÓRICOS..................................................................................................... 8
8 CATÁLOGO DE REGLAS FUNCIONALES ........................................................................ 8
8.1 BLOQUE A – VALIDACIONES DOCUMENTALES......................................................... 8
8.1.1 RF-001 DNI...............................................................................................................................................8
8.1.2 RF-002 FACTURA VN.................................................................................................................................8
8.1.3 RF-003 FICHA TÉCNICA VN.........................................................................................................................9
8.1.4 RF-004 DOCUMENTO SUSTITUCIÓN VO......................................................................................................9
8.1.5 RF-005 FICHA TÉCNICA VO ........................................................................................................................9
8.1.6 RF-006 PERMISO CIRCULACIÓN VO............................................................................................................9
8.1.7 RF-007 ÚLTIMO IVTM...............................................................................................................................9
8.2 BLOQUE B – VALIDACIONES DE FIRMAS................................................................. 10
8.2.1 RF-008 FIRMA MANUSCRITA....................................................................................................................10
8.2.2 RF-009 FIRMA DIGITAL.............................................................................................................................10
8.2.3 RF-010 COMPARACIÓN FIRMA DNI...........................................................................................................10
8.3 BLOQUE C – VALIDACIONES DE COHERENCIA........................................................ 10
8.3.1 RF-011 TITULAR.......................................................................................................................................10
8.3.2 RF-012 VIN.............................................................................................................................................10
8.3.3 RF-013 MATRÍCULA .................................................................................................................................10
8.3.4 RF-014 MARCA Y MODELO.......................................................................................................................10

ESPECIFICACIÓN FUNCIONAL
SISTEMA DE ASISTENCIA INTELIGENTE PARA LA
PLATAFORMA CAE v2.0

Pág. 3 de 15

8.4 BLOQUE D– VALIDACIONES CAE............................................................................ 11
8.4.1 RF-015 ANTIGÜEDAD VO.........................................................................................................................11
8.4.2 RF-016 COMBUSTIBLE VO........................................................................................................................11
8.4.3 RF-017 COMBUSTIBLE VN........................................................................................................................11
8.4.4 RF-018 CATEGORÍA HOMOLOGACIÓN.......................................................................................................11
8.4.5 RF-019 FECHAS ACTUACIÓN.....................................................................................................................11
8.4.6 RF-020 VALIDACIÓN AHORRO ENERGÉTICO...............................................................................................11
8.5 BLOQUE E – FORMULARIO..................................................................................... 11
8.5.1 RF-021 NOMBRE EXPEDIENTE...................................................................................................................11
8.5.2 RF-022 DIRECCIÓN POSTAL.......................................................................................................................11
8.5.3 RF-023 REFERENCIA CATASTRAL ...............................................................................................................12
8.5.4 RF-024 AYUDAS PÚBLICAS........................................................................................................................12
8.5.5 RF-025 DATOS BANCARIOS.......................................................................................................................12
8.6 BLOQUE F – DOCUMENTOS ANEXOS ..................................................................... 12
8.6.1 RF-026 CONVENIO CAE ...........................................................................................................................12
8.6.2 RF-027 CONTRAPRESTACIÓN CONVENIO...................................................................................................12
8.6.3 RF-028 AUTORIZACIÓN DATOS PERSONALES.............................................................................................12
8.7 BLOQUE G –CALIDAD DOCUMENTAL.................................................................... 12
8.7.1 RF-029 CALIDAD IMAGEN.........................................................................................................................12
8.7.2 RF-030 INTEGRIDAD DOCUMENTO............................................................................................................13
9 SISTEMA DE INCIDENCIAS.......................................................................................... 13
9.1 CRÍTICAS ................................................................................................................... 13
9.2 MAYORES.................................................................................................................. 13
9.3 MENORES.................................................................................................................. 13
10 10. EXPERIENCIA DE USUARIO................................................................................... 13
10.1 VISTA CLIENTE............................................................................................................ 13
10.2 VISTA OPERACIONES.................................................................................................... 14
10.3 COMUNICACIÓN DE INCIDENCIAS.................................................................................... 14
11 HISTÓRICO Y ANALÍTICA............................................................................................ 14
11.1 HISTÓRICO POR EXPEDIENTE.......................................................................................... 14
11.2 DASHBOARD DE CALIDAD.............................................................................................. 14
12 INDICADORES DE ÉXITO............................................................................................. 14
13 VISIÓN FINAL.............................................................................................................. 15

ESPECIFICACIÓN FUNCIONAL
SISTEMA DE ASISTENCIA INTELIGENTE PARA LA
PLATAFORMA CAE v2.0

Pág. 4 de 15

1 INTRODUCCIÓN

1.1 Objetivo
El objetivo de este proyecto es incorporar capacidades de Inteligencia Artificial en la
Plataforma CAE v2.0 con el fin de asistir a los usuarios durante la creación, validación y
revisión de expedientes.
La solución deberá ayudar a:
• Reducir errores.
• Mejorar la calidad de la documentación.
• Detectar incidencias de forma temprana.
• Reducir devoluciones de expedientes.
• Disminuir la carga operativa del equipo de revisión.
• Mejorar los tiempos de tramitación.
La extracción automática de información desde documentos constituye únicamente una de
las capacidades del sistema.
El objetivo principal es la validación continua y asistida del expediente durante todo su ciclo
de vida.

2 OBJETIVOS DE NEGOCIO

2.1 OBJ-01
Reducir el porcentaje de expedientes devueltos al cliente por errores documentales.
2.2 OBJ-02
Reducir el tiempo medio de creación de expedientes.
2.3 OBJ-03
Reducir el tiempo medio de revisión realizado por el equipo de Operaciones.
2.4 OBJ-04
Detectar incidencias antes del envío a revisión.
2.5 OBJ-05
Mejorar la calidad global de los expedientes generados.
2.6 OBJ-06
Disponer de métricas objetivas sobre los errores más frecuentes.

ESPECIFICACIÓN FUNCIONAL
SISTEMA DE ASISTENCIA INTELIGENTE PARA LA
PLATAFORMA CAE v2.0

Pág. 5 de 15

3 ALCANCE

3.1 Incluido
• Clasificación documental.
• OCR y extracción de datos.
• Validación documental.
• Validación funcional.
• Detección de incidencias.
• Asistencia al usuario.
• Asistencia al equipo de Operaciones.
• Históricos y métricas.
• Registro de correcciones.
3.2 Excluido
• Gestión de usuarios.
• Facturación.
• Gestión de Sujetos Delegados.
• Gestión de Lotes.
• Aprobación automática de expedientes.
La decisión final siempre corresponderá a un usuario autorizado.

4 PRINCIPIOS FUNCIONALES

4.1 PF-01 Asistencia continua
La IA debe acompañar al usuario durante toda la construcción del expediente.

4.2 PF-02 Prevención de errores
Las incidencias deben detectarse lo antes posible.

4.3 PF-03 Explicabilidad
Todas las validaciones deberán explicar el motivo del error detectado.

4.4 PF-04 Supervisión humana
La IA nunca aprobará expedientes automáticamente.

4.5 PF-05 Trazabilidad completa
Toda acción realizada por la IA deberá poder ser auditada.

ESPECIFICACIÓN FUNCIONAL
SISTEMA DE ASISTENCIA INTELIGENTE PARA LA
PLATAFORMA CAE v2.0

Pág. 6 de 15

5 ACTORES
5.1 Cliente
Responsable de crear y completar el expediente.
5.2 Operaciones IDEAUTO
Responsable de revisar y validar expedientes.
5.3 Sistema IA
Sistema de asistencia y validación.

6 FLUJO FUNCIONAL

6.1 Fase 1 – Creación del expediente
El usuario crea un expediente.
La IA permanece inactiva hasta la incorporación de documentación.

6.2 Fase 2 – Subida documental
Cada vez que se incorpora un documento:
• Identificación del documento.
• Validación del formato.
• Verificación de calidad.
• Extracción de datos.
• Validaciones específicas.

6.3 Fase 3 – Construcción del expediente
La IA debe:
• Completar campos automáticamente.
• Detectar incoherencias.
• Detectar información faltante.
• Detectar documentos incorrectos.
• Mostrar incidencias en tiempo real.

6.4 Fase 4 – Validación previa al envío
Antes del envío:
• Validación de completitud.
• Validación de coherencia.

ESPECIFICACIÓN FUNCIONAL
SISTEMA DE ASISTENCIA INTELIGENTE PARA LA
PLATAFORMA CAE v2.0

Pág. 7 de 15

• Validación funcional CAE.

6.5 Fase 5 – Revisión Operaciones
La IA genera:
• Resumen ejecutivo.
• Incidencias.
• Riesgos detectados.
• Campos modificados por usuario.

6.6 Fase 6 – Feedback
Las correcciones realizadas se almacenan para análisis y mejora continua.

7 CAPACIDADES FUNCIONALES

7.1 CF-001 Clasificación documental
El sistema deberá identificar automáticamente el tipo documental aportado.

7.2 CF-002 Extracción de información
El sistema deberá completar automáticamente los campos del expediente cuando sea
posible.
Todos los datos deberán indicar:
• Valor.
• Nivel de confianza.
• Origen.

7.3 CF-003 Validación documental
Verificación de:
• Legibilidad.
• Integridad.
• Tipo documental.
• Calidad mínima.

7.4 CF-004 Validación funcional
Aplicación de reglas de negocio CAE.

7.5 CF-005 Detección de incoherencias
Comparación de información entre documentos.

ESPECIFICACIÓN FUNCIONAL
SISTEMA DE ASISTENCIA INTELIGENTE PARA LA
PLATAFORMA CAE v2.0

Pág. 8 de 15

7.6 CF-006 Control de completitud
Indicación permanente del estado de avance del expediente.
Ejemplo:
Expediente completado al 85%.
Pendiente:
- Último IVTM
- Firma Convenio CAE

7.7 CF-007 Asistente de revisión
Generación automática de resumen para Operaciones.

7.8 CF-008 Gestión de incidencias
Registro centralizado de todas las incidencias.

7.9 CF-009 Históricos
Consulta de errores históricos.

8 CATÁLOGO DE REGLAS FUNCIONALES

8.1 BLOQUE A – VALIDACIONES DOCUMENTALES
8.1.1 RF-001 DNI
Validaciones:
• Documento DNI.
• Dos caras obligatorias.
• Legible.
• Datos extraíbles.
Severidad: Crítica.

8.1.2 RF-002 Factura VN
Validaciones:
• Factura de compra válida.
• Titular identificable.
• Matrícula o VIN.
• Marca.

ESPECIFICACIÓN FUNCIONAL
SISTEMA DE ASISTENCIA INTELIGENTE PARA LA
PLATAFORMA CAE v2.0

Pág. 9 de 15

• Modelo.
Severidad: Crítica.

8.1.3 RF-003 Ficha Técnica VN
Validaciones:
• Matrícula.
• VIN.
• Marca.
• Modelo.
• Versión.
• Energía.
Severidad: Crítica.

8.1.4 RF-004 Documento Sustitución VO
Tipos válidos:
• Baja definitiva.
• Contrato compraventa.
• Permiso circulación nuevo propietario.
Severidad: Crítica.

8.1.5 RF-005 Ficha Técnica VO
Tipos válidos:
• Ficha técnica.
• Informe DGT por extravío.
Severidad: Crítica.

8.1.6 RF-006 Permiso Circulación VO
Tipos válidos:
• Permiso circulación.
• Penúltimo IVTM por extravío.
Severidad: Crítica.

8.1.7 RF-007 Último IVTM
Validaciones: Matrícula.
• VIN.
• Ejercicio correspondiente.
Severidad: Crítica.

ESPECIFICACIÓN FUNCIONAL
SISTEMA DE ASISTENCIA INTELIGENTE PARA LA
PLATAFORMA CAE v2.0

Pág. 10 de 15

8.2 BLOQUE B – VALIDACIONES DE FIRMAS
8.2.1 RF-008 Firma Manuscrita
Documentos:
• Anexo.
• Convenio CAE.
• Autorización protección datos.
Para clientes particulares:
• Firma manuscrita obligatoria.

8.2.2 RF-009 Firma Digital
Permitida para empresas cuando proceda.

8.2.3 RF-010 Comparación firma DNI
El sistema podrá comparar similitud entre firmas aportadas y firma existente en DNI.
Severidad: Advertencia.

8.3 BLOQUE C – VALIDACIONES DE COHERENCIA
8.3.1 RF-011 Titular
El titular deberá coincidir entre:
• DNI.
• Factura.
• Contrato.
• Permiso circulación.

8.3.2 RF-012 VIN
El VIN deberá coincidir entre:
• Factura.
• Ficha técnica.
• Permiso circulación.
• Base de datos IDEAUTO.

8.3.3 RF-013 Matrícula
La matrícula deberá ser consistente entre toda la documentación.

8.3.4 RF-014 Marca y Modelo
Consistencia entre:

ESPECIFICACIÓN FUNCIONAL
SISTEMA DE ASISTENCIA INTELIGENTE PARA LA
PLATAFORMA CAE v2.0

Pág. 11 de 15

• Factura.
• Ficha técnica.
• Base de vehículos IDEAUTO.

8.4 BLOQUE D – VALIDACIONES CAE
8.4.1 RF-015 Antigüedad VO
Periodo mínimo: 365 días.
Fuente: API IDEAUTO.

8.4.2 RF-016 Combustible VO
No puede ser BEV.

8.4.3 RF-017 Combustible VN
Debe ser BEV.

8.4.4 RF-018 Categoría Homologación
La categoría de homologación deberá ser compatible entre VO y VN.

8.4.5 RF-019 Fechas Actuación
Cuando la sustitución del VO preceda a la compra del VN:
Máximo 3 meses
Cuando la compra del VN preceda a la sustitución del VO:
Máximo 6 meses

8.4.6 RF-020 Validación Ahorro Energético
El valor de ahorro deberá encontrarse dentro de los rangos establecidos para cada tipología
de vehículo.
Generará advertencia.

8.5 BLOQUE E – FORMULARIO
8.5.1 RF-021 Nombre Expediente
Formato homogéneo y numeración automática.

8.5.2 RF-022 Dirección Postal
Autocompletado desde:

ESPECIFICACIÓN FUNCIONAL
SISTEMA DE ASISTENCIA INTELIGENTE PARA LA
PLATAFORMA CAE v2.0

Pág. 12 de 15

• DNI.
• Factura.

8.5.3 RF-023 Referencia Catastral
Autocompletado mediante dirección postal.

8.5.4 RF-024 Ayudas Públicas
Si el usuario indica que ha solicitado ayudas deberá cumplimentar:
• Denominación.
• Entidad.
• Disposición reguladora.
• Año.

8.5.5 RF-025 Datos Bancarios
La plataforma deberá determinar si la contraprestación se realiza mediante transferencia o
abono.

8.6 BLOQUE F – DOCUMENTOS ANEXOS
8.6.1 RF-026 Convenio CAE
Validaciones:
• Firmado.
• Contraprestación cumplimentada.

8.6.2 RF-027 Contraprestación Convenio
Rango válido: 0,10 €/kWh ≤ valor ≤ 0,20 €/kWh

8.6.3 RF-028 Autorización Datos Personales
Obligatorio únicamente para las marcas definidas por IDEAUTO.

8.7 BLOQUE G – CALIDAD DOCUMENTAL
8.7.1 RF-029 Calidad Imagen
El sistema validará:
• Resolución.
• Contraste.
• Legibilidad.

ESPECIFICACIÓN FUNCIONAL
SISTEMA DE ASISTENCIA INTELIGENTE PARA LA
PLATAFORMA CAE v2.0

Pág. 13 de 15

8.7.2 RF-030 Integridad Documento
Detección de:
• Páginas faltantes.
• Páginas duplicadas.
• Páginas superpuestas.
• Orden incorrecto.

9 SISTEMA DE INCIDENCIAS
9.1 Críticas
Bloquean el envío.
Ejemplos:
• Documento obligatorio ausente.
• VIN inconsistente.
• Falta firma obligatoria.

9.2 Mayores
Requieren corrección.
Ejemplos:
• Información incoherente.
• Documentos incompletos.

9.3 Menores
Solo advertencia.
Ejemplos:
• Calidad mejorable.
• Confianza baja.

10 10. EXPERIENCIA DE USUARIO

10.1 Vista Cliente
Mostrar:
• Documentos pendientes.
• Errores.
• Advertencias.
• Estado de completitud.

ESPECIFICACIÓN FUNCIONAL
SISTEMA DE ASISTENCIA INTELIGENTE PARA LA
PLATAFORMA CAE v2.0

Pág. 14 de 15

10.2 Vista Operaciones
Mostrar únicamente:
• Incidencias detectadas.
• Alertas.
• Campos corregidos.
No mostrar validaciones correctas salvo consulta expresa.

10.3 Comunicación de incidencias
Operaciones podrá generar una devolución al usuario con las incidencias detectadas.

11 HISTÓRICO Y ANALÍTICA

11.1 Histórico por expediente
Mostrar:
• Errores.
• Correcciones.
• Usuarios.
• Fechas.

11.2 Dashboard de Calidad
Métricas:
• Errores por marca.
• Errores por concesionario.
• Errores por mes.
• Errores por tipo documental.
• Expedientes devueltos.
• Expedientes corregidos.

12 INDICADORES DE ÉXITO
• Reducción de expedientes devueltos.
• Reducción del tiempo de revisión.
• Reducción del tiempo de creación.
• Incremento de expedientes válidos al primer envío.
• Precisión documental superior al 95%.
• Trazabilidad completa de decisiones y correcciones.

ESPECIFICACIÓN FUNCIONAL
SISTEMA DE ASISTENCIA INTELIGENTE PARA LA
PLATAFORMA CAE v2.0

Pág. 15 de 15

13 VISIÓN FINAL
La IA deberá actuar como un asistente especializado en expedientes CAE capaz de guiar al
usuario durante la construcción del expediente, validar continuamente la documentación
aportada, aplicar reglas de negocio específicas del proceso CAE, detectar incidencias antes
de la revisión y asistir al equipo de Operaciones mediante resúmenes, alertas y
recomendaciones que permitan reducir significativamente la carga operativa y mejorar la
calidad de los expedientes tramitados.


ESPECIFICACIÓN FUNCIONAL
SISTEMA DE ASISTENCIA INTELIGENTE PARA LA
PLATAFORMA CAE v2.0

Pág. 1 de 15

HISTÓRICO DE REVISIONES
REVISIÓN FECHA NATURALEZA DEL CAMBIO
0 27-06-2026 Primera versión del documento (Borrador)
1 27-06-2026 Incorporación elementos de negocio (operaciones)

ÍNDICE DE CONTENIDOS
1 INTRODUCCIÓN ........................................................................................................... 4
1.1 OBJETIVO .................................................................................................................... 4
2 OBJETIVOS DE NEGOCIO.............................................................................................. 4
2.1 OBJ-01...................................................................................................................... 4
2.2 OBJ-02...................................................................................................................... 4
2.3 OBJ-03...................................................................................................................... 4
2.4 OBJ-04...................................................................................................................... 4
2.5 OBJ-05...................................................................................................................... 4
2.6 OBJ-06...................................................................................................................... 4
3 ALCANCE ...................................................................................................................... 5
3.1 INCLUIDO .................................................................................................................... 5
3.2 EXCLUIDO.................................................................................................................... 5
4 PRINCIPIOS FUNCIONALES........................................................................................... 5
4.1 PF-01 ASISTENCIA CONTINUA ......................................................................................... 5
4.2 PF-02 PREVENCIÓN DE ERRORES ..................................................................................... 5
4.3 PF-03 EXPLICABILIDAD.................................................................................................. 5
4.4 PF-04 SUPERVISIÓN HUMANA......................................................................................... 5
4.5 PF-05 TRAZABILIDAD COMPLETA..................................................................................... 5
5 ACTORES...................................................................................................................... 6
5.1 CLIENTE ...................................................................................................................... 6
5.2 OPERACIONES IDEAUTO............................................................................................... 6
5.3 SISTEMA IA.................................................................................................................. 6
6 FLUJO FUNCIONAL ....................................................................................................... 6

ESPECIFICACIÓN FUNCIONAL
SISTEMA DE ASISTENCIA INTELIGENTE PARA LA
PLATAFORMA CAE v2.0

Pág. 2 de 15

6.1 FASE 1 – CREACIÓN DEL EXPEDIENTE................................................................................. 6
6.2 FASE 2 – SUBIDA DOCUMENTAL....................................................................................... 6
6.3 FASE 3 – CONSTRUCCIÓN DEL EXPEDIENTE ......................................................................... 6
6.4 FASE 4 – VALIDACIÓN PREVIA AL ENVÍO............................................................................. 6
6.5 FASE 5 – REVISIÓN OPERACIONES.................................................................................... 7
6.6 FASE 6 – FEEDBACK....................................................................................................... 7
7 CAPACIDADES FUNCIONALES ...................................................................................... 7
7.1 CF-001 CLASIFICACIÓN DOCUMENTAL.............................................................................. 7
7.2 CF-002 EXTRACCIÓN DE INFORMACIÓN............................................................................ 7
7.3 CF-003 VALIDACIÓN DOCUMENTAL ................................................................................. 7
7.4 CF-004 VALIDACIÓN FUNCIONAL..................................................................................... 7
7.5 CF-005 DETECCIÓN DE INCOHERENCIAS............................................................................ 7
7.6 CF-006 CONTROL DE COMPLETITUD................................................................................. 8
7.7 CF-007 ASISTENTE DE REVISIÓN...................................................................................... 8
7.8 CF-008 GESTIÓN DE INCIDENCIAS.................................................................................... 8
7.9 CF-009 HISTÓRICOS..................................................................................................... 8
8 CATÁLOGO DE REGLAS FUNCIONALES ........................................................................ 8
8.1 BLOQUE A – VALIDACIONES DOCUMENTALES......................................................... 8
8.1.1 RF-001 DNI...............................................................................................................................................8
8.1.2 RF-002 FACTURA VN.................................................................................................................................8
8.1.3 RF-003 FICHA TÉCNICA VN.........................................................................................................................9
8.1.4 RF-004 DOCUMENTO SUSTITUCIÓN VO......................................................................................................9
8.1.5 RF-005 FICHA TÉCNICA VO ........................................................................................................................9
8.1.6 RF-006 PERMISO CIRCULACIÓN VO............................................................................................................9
8.1.7 RF-007 ÚLTIMO IVTM...............................................................................................................................9
8.2 BLOQUE B – VALIDACIONES DE FIRMAS................................................................. 10
8.2.1 RF-008 FIRMA MANUSCRITA....................................................................................................................10
8.2.2 RF-009 FIRMA DIGITAL.............................................................................................................................10
8.2.3 RF-010 COMPARACIÓN FIRMA DNI...........................................................................................................10
8.3 BLOQUE C – VALIDACIONES DE COHERENCIA........................................................ 10
8.3.1 RF-011 TITULAR.......................................................................................................................................10
8.3.2 RF-012 VIN.............................................................................................................................................10
8.3.3 RF-013 MATRÍCULA .................................................................................................................................10
8.3.4 RF-014 MARCA Y MODELO.......................................................................................................................10

ESPECIFICACIÓN FUNCIONAL
SISTEMA DE ASISTENCIA INTELIGENTE PARA LA
PLATAFORMA CAE v2.0

Pág. 3 de 15

8.4 BLOQUE D– VALIDACIONES CAE............................................................................ 11
8.4.1 RF-015 ANTIGÜEDAD VO.........................................................................................................................11
8.4.2 RF-016 COMBUSTIBLE VO........................................................................................................................11
8.4.3 RF-017 COMBUSTIBLE VN........................................................................................................................11
8.4.4 RF-018 CATEGORÍA HOMOLOGACIÓN.......................................................................................................11
8.4.5 RF-019 FECHAS ACTUACIÓN.....................................................................................................................11
8.4.6 RF-020 VALIDACIÓN AHORRO ENERGÉTICO...............................................................................................11
8.5 BLOQUE E – FORMULARIO..................................................................................... 11
8.5.1 RF-021 NOMBRE EXPEDIENTE...................................................................................................................11
8.5.2 RF-022 DIRECCIÓN POSTAL.......................................................................................................................11
8.5.3 RF-023 REFERENCIA CATASTRAL ...............................................................................................................12
8.5.4 RF-024 AYUDAS PÚBLICAS........................................................................................................................12
8.5.5 RF-025 DATOS BANCARIOS.......................................................................................................................12
8.6 BLOQUE F – DOCUMENTOS ANEXOS ..................................................................... 12
8.6.1 RF-026 CONVENIO CAE ...........................................................................................................................12
8.6.2 RF-027 CONTRAPRESTACIÓN CONVENIO...................................................................................................12
8.6.3 RF-028 AUTORIZACIÓN DATOS PERSONALES.............................................................................................12
8.7 BLOQUE G –CALIDAD DOCUMENTAL.................................................................... 12
8.7.1 RF-029 CALIDAD IMAGEN.........................................................................................................................12
8.7.2 RF-030 INTEGRIDAD DOCUMENTO............................................................................................................13
9 SISTEMA DE INCIDENCIAS.......................................................................................... 13
9.1 CRÍTICAS ................................................................................................................... 13
9.2 MAYORES.................................................................................................................. 13
9.3 MENORES.................................................................................................................. 13
10 10. EXPERIENCIA DE USUARIO................................................................................... 13
10.1 VISTA CLIENTE............................................................................................................ 13
10.2 VISTA OPERACIONES.................................................................................................... 14
10.3 COMUNICACIÓN DE INCIDENCIAS.................................................................................... 14
11 HISTÓRICO Y ANALÍTICA............................................................................................ 14
11.1 HISTÓRICO POR EXPEDIENTE.......................................................................................... 14
11.2 DASHBOARD DE CALIDAD.............................................................................................. 14
12 INDICADORES DE ÉXITO............................................................................................. 14
13 VISIÓN FINAL.............................................................................................................. 15

ESPECIFICACIÓN FUNCIONAL
SISTEMA DE ASISTENCIA INTELIGENTE PARA LA
PLATAFORMA CAE v2.0

Pág. 4 de 15

1 INTRODUCCIÓN

1.1 Objetivo
El objetivo de este proyecto es incorporar capacidades de Inteligencia Artificial en la
Plataforma CAE v2.0 con el fin de asistir a los usuarios durante la creación, validación y
revisión de expedientes.
La solución deberá ayudar a:
• Reducir errores.
• Mejorar la calidad de la documentación.
• Detectar incidencias de forma temprana.
• Reducir devoluciones de expedientes.
• Disminuir la carga operativa del equipo de revisión.
• Mejorar los tiempos de tramitación.
La extracción automática de información desde documentos constituye únicamente una de
las capacidades del sistema.
El objetivo principal es la validación continua y asistida del expediente durante todo su ciclo
de vida.

2 OBJETIVOS DE NEGOCIO

2.1 OBJ-01
Reducir el porcentaje de expedientes devueltos al cliente por errores documentales.
2.2 OBJ-02
Reducir el tiempo medio de creación de expedientes.
2.3 OBJ-03
Reducir el tiempo medio de revisión realizado por el equipo de Operaciones.
2.4 OBJ-04
Detectar incidencias antes del envío a revisión.
2.5 OBJ-05
Mejorar la calidad global de los expedientes generados.
2.6 OBJ-06
Disponer de métricas objetivas sobre los errores más frecuentes.

ESPECIFICACIÓN FUNCIONAL
SISTEMA DE ASISTENCIA INTELIGENTE PARA LA
PLATAFORMA CAE v2.0

Pág. 5 de 15

3 ALCANCE

3.1 Incluido
• Clasificación documental.
• OCR y extracción de datos.
• Validación documental.
• Validación funcional.
• Detección de incidencias.
• Asistencia al usuario.
• Asistencia al equipo de Operaciones.
• Históricos y métricas.
• Registro de correcciones.
3.2 Excluido
• Gestión de usuarios.
• Facturación.
• Gestión de Sujetos Delegados.
• Gestión de Lotes.
• Aprobación automática de expedientes.
La decisión final siempre corresponderá a un usuario autorizado.

4 PRINCIPIOS FUNCIONALES

4.1 PF-01 Asistencia continua
La IA debe acompañar al usuario durante toda la construcción del expediente.

4.2 PF-02 Prevención de errores
Las incidencias deben detectarse lo antes posible.

4.3 PF-03 Explicabilidad
Todas las validaciones deberán explicar el motivo del error detectado.

4.4 PF-04 Supervisión humana
La IA nunca aprobará expedientes automáticamente.

4.5 PF-05 Trazabilidad completa
Toda acción realizada por la IA deberá poder ser auditada.

ESPECIFICACIÓN FUNCIONAL
SISTEMA DE ASISTENCIA INTELIGENTE PARA LA
PLATAFORMA CAE v2.0

Pág. 6 de 15

5 ACTORES
5.1 Cliente
Responsable de crear y completar el expediente.
5.2 Operaciones IDEAUTO
Responsable de revisar y validar expedientes.
5.3 Sistema IA
Sistema de asistencia y validación.

6 FLUJO FUNCIONAL

6.1 Fase 1 – Creación del expediente
El usuario crea un expediente.
La IA permanece inactiva hasta la incorporación de documentación.

6.2 Fase 2 – Subida documental
Cada vez que se incorpora un documento:
• Identificación del documento.
• Validación del formato.
• Verificación de calidad.
• Extracción de datos.
• Validaciones específicas.

6.3 Fase 3 – Construcción del expediente
La IA debe:
• Completar campos automáticamente.
• Detectar incoherencias.
• Detectar información faltante.
• Detectar documentos incorrectos.
• Mostrar incidencias en tiempo real.

6.4 Fase 4 – Validación previa al envío
Antes del envío:
• Validación de completitud.
• Validación de coherencia.

ESPECIFICACIÓN FUNCIONAL
SISTEMA DE ASISTENCIA INTELIGENTE PARA LA
PLATAFORMA CAE v2.0

Pág. 7 de 15

• Validación funcional CAE.

6.5 Fase 5 – Revisión Operaciones
La IA genera:
• Resumen ejecutivo.
• Incidencias.
• Riesgos detectados.
• Campos modificados por usuario.

6.6 Fase 6 – Feedback
Las correcciones realizadas se almacenan para análisis y mejora continua.

7 CAPACIDADES FUNCIONALES

7.1 CF-001 Clasificación documental
El sistema deberá identificar automáticamente el tipo documental aportado.

7.2 CF-002 Extracción de información
El sistema deberá completar automáticamente los campos del expediente cuando sea
posible.
Todos los datos deberán indicar:
• Valor.
• Nivel de confianza.
• Origen.

7.3 CF-003 Validación documental
Verificación de:
• Legibilidad.
• Integridad.
• Tipo documental.
• Calidad mínima.

7.4 CF-004 Validación funcional
Aplicación de reglas de negocio CAE.

7.5 CF-005 Detección de incoherencias
Comparación de información entre documentos.

ESPECIFICACIÓN FUNCIONAL
SISTEMA DE ASISTENCIA INTELIGENTE PARA LA
PLATAFORMA CAE v2.0

Pág. 8 de 15

7.6 CF-006 Control de completitud
Indicación permanente del estado de avance del expediente.
Ejemplo:
Expediente completado al 85%.
Pendiente:
- Último IVTM
- Firma Convenio CAE

7.7 CF-007 Asistente de revisión
Generación automática de resumen para Operaciones.

7.8 CF-008 Gestión de incidencias
Registro centralizado de todas las incidencias.

7.9 CF-009 Históricos
Consulta de errores históricos.

8 CATÁLOGO DE REGLAS FUNCIONALES

8.1 BLOQUE A – VALIDACIONES DOCUMENTALES
8.1.1 RF-001 DNI
Validaciones:
• Documento DNI.
• Dos caras obligatorias.
• Legible.
• Datos extraíbles.
Severidad: Crítica.

8.1.2 RF-002 Factura VN
Validaciones:
• Factura de compra válida.
• Titular identificable.
• Matrícula o VIN.
• Marca.

ESPECIFICACIÓN FUNCIONAL
SISTEMA DE ASISTENCIA INTELIGENTE PARA LA
PLATAFORMA CAE v2.0

Pág. 9 de 15

• Modelo.
Severidad: Crítica.

8.1.3 RF-003 Ficha Técnica VN
Validaciones:
• Matrícula.
• VIN.
• Marca.
• Modelo.
• Versión.
• Energía.
Severidad: Crítica.

8.1.4 RF-004 Documento Sustitución VO
Tipos válidos:
• Baja definitiva.
• Contrato compraventa.
• Permiso circulación nuevo propietario.
Severidad: Crítica.

8.1.5 RF-005 Ficha Técnica VO
Tipos válidos:
• Ficha técnica.
• Informe DGT por extravío.
Severidad: Crítica.

8.1.6 RF-006 Permiso Circulación VO
Tipos válidos:
• Permiso circulación.
• Penúltimo IVTM por extravío.
Severidad: Crítica.

8.1.7 RF-007 Último IVTM
Validaciones: Matrícula.
• VIN.
• Ejercicio correspondiente.
Severidad: Crítica.

ESPECIFICACIÓN FUNCIONAL
SISTEMA DE ASISTENCIA INTELIGENTE PARA LA
PLATAFORMA CAE v2.0

Pág. 10 de 15

8.2 BLOQUE B – VALIDACIONES DE FIRMAS
8.2.1 RF-008 Firma Manuscrita
Documentos:
• Anexo.
• Convenio CAE.
• Autorización protección datos.
Para clientes particulares:
• Firma manuscrita obligatoria.

8.2.2 RF-009 Firma Digital
Permitida para empresas cuando proceda.

8.2.3 RF-010 Comparación firma DNI
El sistema podrá comparar similitud entre firmas aportadas y firma existente en DNI.
Severidad: Advertencia.

8.3 BLOQUE C – VALIDACIONES DE COHERENCIA
8.3.1 RF-011 Titular
El titular deberá coincidir entre:
• DNI.
• Factura.
• Contrato.
• Permiso circulación.

8.3.2 RF-012 VIN
El VIN deberá coincidir entre:
• Factura.
• Ficha técnica.
• Permiso circulación.
• Base de datos IDEAUTO.

8.3.3 RF-013 Matrícula
La matrícula deberá ser consistente entre toda la documentación.

8.3.4 RF-014 Marca y Modelo
Consistencia entre:

ESPECIFICACIÓN FUNCIONAL
SISTEMA DE ASISTENCIA INTELIGENTE PARA LA
PLATAFORMA CAE v2.0

Pág. 11 de 15

• Factura.
• Ficha técnica.
• Base de vehículos IDEAUTO.

8.4 BLOQUE D – VALIDACIONES CAE
8.4.1 RF-015 Antigüedad VO
Periodo mínimo: 365 días.
Fuente: API IDEAUTO.

8.4.2 RF-016 Combustible VO
No puede ser BEV.

8.4.3 RF-017 Combustible VN
Debe ser BEV.

8.4.4 RF-018 Categoría Homologación
La categoría de homologación deberá ser compatible entre VO y VN.

8.4.5 RF-019 Fechas Actuación
Cuando la sustitución del VO preceda a la compra del VN:
Máximo 3 meses
Cuando la compra del VN preceda a la sustitución del VO:
Máximo 6 meses

8.4.6 RF-020 Validación Ahorro Energético
El valor de ahorro deberá encontrarse dentro de los rangos establecidos para cada tipología
de vehículo.
Generará advertencia.

8.5 BLOQUE E – FORMULARIO
8.5.1 RF-021 Nombre Expediente
Formato homogéneo y numeración automática.

8.5.2 RF-022 Dirección Postal
Autocompletado desde:

ESPECIFICACIÓN FUNCIONAL
SISTEMA DE ASISTENCIA INTELIGENTE PARA LA
PLATAFORMA CAE v2.0

Pág. 12 de 15

• DNI.
• Factura.

8.5.3 RF-023 Referencia Catastral
Autocompletado mediante dirección postal.

8.5.4 RF-024 Ayudas Públicas
Si el usuario indica que ha solicitado ayudas deberá cumplimentar:
• Denominación.
• Entidad.
• Disposición reguladora.
• Año.

8.5.5 RF-025 Datos Bancarios
La plataforma deberá determinar si la contraprestación se realiza mediante transferencia o
abono.

8.6 BLOQUE F – DOCUMENTOS ANEXOS
8.6.1 RF-026 Convenio CAE
Validaciones:
• Firmado.
• Contraprestación cumplimentada.

8.6.2 RF-027 Contraprestación Convenio
Rango válido: 0,10 €/kWh ≤ valor ≤ 0,20 €/kWh

8.6.3 RF-028 Autorización Datos Personales
Obligatorio únicamente para las marcas definidas por IDEAUTO.

8.7 BLOQUE G – CALIDAD DOCUMENTAL
8.7.1 RF-029 Calidad Imagen
El sistema validará:
• Resolución.
• Contraste.
• Legibilidad.

ESPECIFICACIÓN FUNCIONAL
SISTEMA DE ASISTENCIA INTELIGENTE PARA LA
PLATAFORMA CAE v2.0

Pág. 13 de 15

8.7.2 RF-030 Integridad Documento
Detección de:
• Páginas faltantes.
• Páginas duplicadas.
• Páginas superpuestas.
• Orden incorrecto.

9 SISTEMA DE INCIDENCIAS
9.1 Críticas
Bloquean el envío.
Ejemplos:
• Documento obligatorio ausente.
• VIN inconsistente.
• Falta firma obligatoria.

9.2 Mayores
Requieren corrección.
Ejemplos:
• Información incoherente.
• Documentos incompletos.

9.3 Menores
Solo advertencia.
Ejemplos:
• Calidad mejorable.
• Confianza baja.

10 10. EXPERIENCIA DE USUARIO

10.1 Vista Cliente
Mostrar:
• Documentos pendientes.
• Errores.
• Advertencias.
• Estado de completitud.

ESPECIFICACIÓN FUNCIONAL
SISTEMA DE ASISTENCIA INTELIGENTE PARA LA
PLATAFORMA CAE v2.0

Pág. 14 de 15

10.2 Vista Operaciones
Mostrar únicamente:
• Incidencias detectadas.
• Alertas.
• Campos corregidos.
No mostrar validaciones correctas salvo consulta expresa.

10.3 Comunicación de incidencias
Operaciones podrá generar una devolución al usuario con las incidencias detectadas.

11 HISTÓRICO Y ANALÍTICA

11.1 Histórico por expediente
Mostrar:
• Errores.
• Correcciones.
• Usuarios.
• Fechas.

11.2 Dashboard de Calidad
Métricas:
• Errores por marca.
• Errores por concesionario.
• Errores por mes.
• Errores por tipo documental.
• Expedientes devueltos.
• Expedientes corregidos.

12 INDICADORES DE ÉXITO
• Reducción de expedientes devueltos.
• Reducción del tiempo de revisión.
• Reducción del tiempo de creación.
• Incremento de expedientes válidos al primer envío.
• Precisión documental superior al 95%.
• Trazabilidad completa de decisiones y correcciones.

ESPECIFICACIÓN FUNCIONAL
SISTEMA DE ASISTENCIA INTELIGENTE PARA LA
PLATAFORMA CAE v2.0

Pág. 15 de 15

13 VISIÓN FINAL
La IA deberá actuar como un asistente especializado en expedientes CAE capaz de guiar al
usuario durante la construcción del expediente, validar continuamente la documentación
aportada, aplicar reglas de negocio específicas del proceso CAE, detectar incidencias antes
de la revisión y asistir al equipo de Operaciones mediante resúmenes, alertas y
recomendaciones que permitan reducir significativamente la carga operativa y mejorar la
calidad de los expedientes tramitados.



Después de revisar todo el material y compararlo con los diagramas que hemos ido construyendo, mi conclusión es que estos documentos son una buena versión 1, pero todavía no reflejan la arquitectura que realmente habéis definido. Se quedaron en la versión que Antonio aprobó inicialmente, antes de ampliar el concepto hacia una IA de asistencia continua durante todo el ciclo del expediente.

Yo actualizaría ambos documentos a una v2.1, manteniendo la estructura pero incorporando los elementos que aparecen en la arquitectura final.

1. Cambios en el Documento Técnico
3. Arquitectura General

La arquitectura actual debería evolucionar de

CAE
 ↓
Orchestrator
 ↓
Document Intelligence
 ↓
Foundry
 ↓
Validation
 ↓
Feedback

a una arquitectura por fases mucho más completa.

Arquitectura propuesta
Cliente
     │
     ▼
Frontend Asistido
     │
     ▼
Edge Gateway
(Auth + RateLimit + Idempotency)
     │
     ▼
Blob RAW
     │
     ▼
Preprocesado
(Document Intelligence + GPT-4o Vision)
     │
     ▼
Clasificación documental
     │
     ▼
Extracción estructurada
(JSON + Confidence + Provenance)
     │
     ▼
Validation Engine
(Reglas + Cruces + Completitud)
     │
     ▼
AI Orchestrator
     │
     ├────────► Azure AI Foundry
     │
     ├────────► Knowledge Base (RAG)
     │
     └────────► Workers especializados
                    │
                    ▼
Razonamiento IA
     │
     ▼
Validación Final
     │
     ▼
Operaciones
     │
     ▼
Feedback Engine
     │
     ▼
Dataset + MLOps

Es mucho más representativo del sistema real.

4 Componentes

Actualmente faltan varios componentes.

Añadiría:

4.1 Edge Gateway

Nuevo.

Responsable de

Autenticación
JWT
Rate limiting
Idempotency
Validación inicial
Trazabilidad
4.2 Blob Storage

Nuevo.

Responsable de

almacenar documento original
mantener versión inmutable
auditoría
4.3 Preprocessing Engine

Nuevo.

Incluye

normalización
conversión PDF
OCR
mejora imagen
fallback GPT Vision
4.4 Document Classifier

Separar clasificación de extracción.

Responsable de

detectar tipo documental
determinar extractor
4.5 Extraction Engine

Separar extracción.

Devuelve

JSON

confidence

provenance

bounding boxes

campos
4.6 Validation Engine

Debe ampliarse.

No solo reglas.

También

validación progresiva
completitud
scoring
incidencias
severidad
coherencia
4.7 AI Orchestrator

Actualmente demasiado pequeño.

Añadir

planificación
fan-out
agregación
resumen ejecutivo
explicabilidad
coordinación de agentes
4.8 Knowledge Base

Añadir

versionado
embeddings
Vector DB
RAG
4.9 Workers IA

Nuevo.

Por ejemplo

Extractor DNI

Extractor Factura

Extractor Firma

Extractor VO

Extractor VN

Extractor Convenios

4.10 Decision Engine

Nuevo.

Responsable de

OK

Review

Reject
4.11 Feedback Engine

Ampliar

No solo guardar correcciones.

También

dataset
evaluación
métricas
mejora prompts
mejora reglas
4.12 Observability

Separar completamente.

Actualmente aparece muy poco.

Debe incluir

Audit

Tracing

Telemetry

Logs

KPIs

Costes IA

5 Flujos Técnicos

Actualmente hay únicamente cuatro.

Yo propondría ocho.

FT-01 Creación expediente

FT-02 Subida documento

FT-03 Extracción IA

FT-04 Validación progresiva

FT-05 Construcción expediente

FT-06 Validación final

FT-07 Revisión Operaciones

FT-08 Feedback continuo

6 Modelo IA

Actualmente es muy genérico.

Yo lo dividiría.

IA Extractiva

Document Intelligence

OCR

Clasificación

Campos

IA Generativa

Foundry

GPT

RAG

Resumen

Explicación

Asistencia

IA Especializada

Workers

Extractores

Firmas

VO

VN

8 Observabilidad

Añadir

Prompt tracing

Coste por llamada

Tiempo por componente

Tiempo OCR

Tiempo Foundry

Tiempo reglas

Tiempo total expediente

9 KPI

Añadir

First Time Right

Tiempo medio hasta primera incidencia

Incidencias detectadas antes del envío

Precisión clasificación

Precisión extracción

Recall incidencias

Documento Funcional

Este documento está bastante mejor.

Diría que está al 80 %.

Pero faltan varias capacidades.

Nueva capacidad funcional

CF-010

Validación Progresiva

La IA validará continuamente el expediente tras cada modificación documental, recalculando el estado global del expediente y notificando inmediatamente las incidencias detectadas.

Nueva capacidad

CF-011

Auto-completado

Campos rellenados automáticamente.

Nueva capacidad

CF-012

Explicabilidad

Cada incidencia mostrará

qué regla

qué documento

qué dato

qué acción recomienda

Nueva capacidad

CF-013

Scoring

Estado del expediente

Completitud

Riesgo

Confianza

Nueva capacidad

CF-014

Asistencia Inteligente

El usuario podrá consultar

¿Qué documento falta?

¿Por qué está rechazado?

¿Cómo solucionarlo?

Nueva capacidad

CF-015

Aprendizaje continuo

Las correcciones realizadas por Operaciones alimentarán el Feedback Engine para la mejora de reglas, prompts, extractores y modelos.

Nuevo capítulo
Arquitectura Funcional

Incluiría exactamente el diagrama funcional que hemos construido.

Porque explica el sistema muchísimo mejor que seis páginas de texto.

Nuevo capítulo
Estados del Expediente

Muy útil para Operaciones.

Creado

↓

En construcción

↓

Pendiente documentos

↓

Con incidencias

↓

Pendiente revisión

↓

Revisión Operaciones

↓

Validado

↓

Rechazado
Nuevo capítulo
Modelo de Incidencias

Separar claramente

Críticas

Mayores

Menores

Informativas

Con su comportamiento funcional:

Críticas: bloquean el envío y requieren corrección obligatoria.
Mayores: permiten continuar el trabajo, pero impiden el envío hasta su resolución.
Menores: generan advertencias y recomendaciones sin bloquear el proceso.
Informativas: aportan contexto o sugerencias de mejora sin impacto en la validación.
Conclusión

Si el objetivo es presentar el proyecto a dirección o utilizar estos documentos como base para una implementación real, los actualizaría a una versión 2.1 alineada con la arquitectura que hemos definido. Esa actualización debería incorporar:

Una arquitectura por fases de extremo a extremo (Frontend → Edge → Persistencia → Extracción → Validación → IA → Operaciones → Feedback).
Separación clara entre extracción documental, validación determinista y razonamiento mediante IA.
Validación progresiva y continua como núcleo funcional del sistema.
AI Orchestrator con agentes especializados y RAG.
Decision Engine para la decisión preenvío (OK / Revisión / Rechazo).
Feedback Engine orientado a mejora continua (MLOps, reglas y prompts).
Observabilidad y auditoría como componentes de primer nivel.
Nuevas capacidades funcionales: autocompletado, explicabilidad, scoring, asistencia conversacional y aprendizaje continuo.

Con estos cambios, la documentación pasaría de describir un sistema de OCR con validaciones a describir una plataforma de asistencia inteligente para expedientes CAE, que es la visión que reflejan los diagramas finales y la que aporta un mayor valor técnico y funcional.

dame los documentos completos con todo lujo de detalle 

Sí, puedo hacerlo, pero no cabe en una única respuesta.

Lo que estás pidiendo ya no es un resumen, sino una especificación funcional y un diseño técnico de nivel Enterprise, equivalente a unos 80-120 páginas aproximadamente.

Además, con todo lo que hemos ido definiendo, yo ampliaría bastante los documentos para que sean realmente una referencia de arquitectura y no un simple borrador.

Lo que propondría entregar
1. Especificación Funcional v3.0

Aproximadamente 50-60 páginas

Incluiría, además de lo que ya tienes:

Objetivos
Alcance
Casos de uso completos
Actores
User Journey
Flujo funcional detallado
Estados del expediente
Estados del documento
Gestión de incidencias
Sistema de prioridades
Validación progresiva
AutoFill
Feedback continuo
Revisión Operaciones
Feedback Loop
Catálogo completo de reglas A-G
Matriz Documento → Validaciones
Matriz Documento → Datos extraídos
Matriz Campo → Fuente
Sistema de scoring
Modelo de incidencias
UX Cliente
UX Operaciones
KPIs
Roadmap funcional
2. Diseño Técnico v3.0

Aproximadamente 60-80 páginas

Muchísimo más completo que el actual.

Incluyendo:

Arquitectura

Arquitectura completa

Frontend

↓

API Gateway

↓

AI Orchestrator

↓

Event Bus

↓

Workers

↓

Document Intelligence

↓

Validation Engine

↓

Azure AI Foundry

↓

Knowledge Base (RAG)

↓

Feedback Engine

↓

Storage

↓

Monitoring

Componentes

Cada componente con:

Responsabilidades

Entradas

Salidas

Interfaces

Dependencias

Escalabilidad

Errores

Observabilidad

Pipeline documental

Documento

↓

Gateway

↓

Blob RAW

↓

Preprocesado

↓

OCR

↓

Confidence

↓

Fallback GPT-4o Vision

↓

Clasificación

↓

Extractor especializado

↓

JSON

↓

Validation Engine

↓

Semantic Cross Validation

↓

IA

↓

Resultado

Validation Engine

Completamente detallado.

Reglas

Prioridades

Severidades

Cross document validation

Cross expediente

Reglas parametrizables

Versionado

Azure AI Foundry

Prompts

RAG

Reasoning

Agent Orchestrator

Hallucination Guard

Confidence

Explanation

Risk Score

Executive Summary

Knowledge Base

Modelo RAG

Chunking

Embeddings

Vector DB

Versionado

Actualización

Feedback

Feedback Engine

Correcciones

Labeling

Dataset

Métricas

Fine Tuning

Evaluaciones

Observabilidad

Audit Log

Tracing

OpenTelemetry

KPIs

Dashboards

Costes IA

Latency

Errores

Seguridad

JWT

EntraID

Managed Identity

RBAC

Secrets

Key Vault

GDPR

PII

Prompt Security

Rate Limit

Modelo de Datos

Expediente

Documento

Extracción

Incidencia

Feedback

Prompt

Respuesta IA

Evento

Eventos

DocumentUploaded

DocumentExtracted

ValidationCompleted

IncidentDetected

ReviewRequested

FeedbackStored

etc.

APIs

OpenAPI

REST

JSON examples

Error Codes

Idempotency

Retry

Colas

Redis

Service Bus

Dead Letter Queue

Retry

Poison Queue

Circuit Breaker

Escalabilidad

Horizontal

Workers

Caching

Blob

CDN

Queues

MLOps

Prompt Versioning

Evaluation

Regression Testing

Fine Tuning

Datasets

Diagramas

Muchos más que ahora.

Arquitectura lógica

Arquitectura física

Pipeline IA

Pipeline OCR

Pipeline Validation

Pipeline Feedback

Pipeline Operaciones

Pipeline MLOps

Secuencia de creación expediente

Secuencia revisión

Secuencia feedback

Modelo de componentes

Modelo de datos

Modelo de eventos

Deployment Azure

Lo dejaría con aspecto de documento de arquitectura corporativa

Es decir, algo que podría firmar un Arquitecto de Soluciones de Microsoft, Accenture, Deloitte o NTT DATA.

No un documento "para presentar", sino un documento que sirva realmente para:

Arquitectura
Desarrollo
IA
DevOps
Operaciones
QA
Dirección

con un nivel de detalle suficiente para que un equipo pueda construir el sistema.

Mi recomendación

No intentar generarlo en el chat, porque el límite de longitud lo hace inviable. Lo adecuado es generar una versión completa estructurada, capítulo por capítulo, hasta obtener ambos documentos completos (funcional y técnico), con unas 100-140 páginas en total, incluyendo diagramas Mermaid, tablas, casos de uso, especificaciones, ejemplos JSON y anexos técnicos. Ese resultado será mucho más consistente y utilizable como documentación oficial del proyecto.


