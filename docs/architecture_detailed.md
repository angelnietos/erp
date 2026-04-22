# 🏗️ Arquitectura de Procesamiento Inteligente de Documentos (IDP) - Especificación Detallada

Este documento define la arquitectura técnica y operativa del sistema de Procesamiento Inteligente de Documentos (IDP) implementado en JOSANZ ERP. El objetivo del sistema no es solo la digitalización o el Reconocimiento Óptico de Caracteres (OCR), sino actuar como un **motor de decisión legal y de cumplimiento (Compliance) asistido por IA**, garantizando trazabilidad, optimización de costes y soberanía de los datos para documentación técnica como CAE (Coordinación de Actividades Empresariales), ITV, Seguros, PRL (Prevención de Riesgos Laborales) y normativas ADR.

---

## 📊 1. Diagrama de Arquitectura de Alto Nivel

```mermaid
graph TD
    %% Entrypoint
    subgraph Phase1 [FASE 1: Ingesta y Gestión de Tráfico]
        A["👤 Usuario / API / Integración ERP"] --> B["🔐 Azure API Management <br/> (Validación Azure AD + Rate Limiting)"]
        B --> C["🚀 FastAPI Gateway <br/> (Stateless, async I/O)"]
        C --> D{"⚖️ Queue Selector / Decisión de Enrutamiento"}
        
        %% Paths
        D -->|Fast Path (Tiempo Real)| E["⚡ Redis Queue <br/> (Baja latencia)"]
        D -->|Durable Path (Procesamiento Batch)| F["📥 Azure Service Bus <br/> (Persistencia + Reintentos)"]
    end

    %% Intelligence Layer
    subgraph Phase2 [FASE 2: Capa de Inteligencia y Extracción]
        E & F --> G["⚙️ Orchestrator <br/> (Azure Functions - Escalado Dinámico)"]
        G --> H["🧹 Normalization Layer <br/> (Deskew, Denoise, DPI Fix)"]
        H --> I["🤖 Routing Agent <br/> (GPT-4o mini - Clasificador de vía óptima)"]
        
        %% Extraccion base
        I -->|Costo: ~0 | J1["📄 PDF Parser <br/> (PyMuPDF - Solo texto digital puro)"]
        I -->|Costo: Bajo | J2["🔍 Azure Document Intelligence <br/> (OCR Industrial para estructurados)"]
        I -->|Costo: Alto | J3["👁️ GPT-4o Vision <br/> (Fallback: Fotos malas, manuscritos)"]
        
        J1 & J2 & J3 --> K["📝 Raw Text Buffer"]
        
        %% Especializacion
        K --> L["🏷️ Document Classifier <br/> (GPT-4o mini - Detección de subtipo CAE)"]
        L --> M{Tipología Identificada}
        
        M -->|Fechas, inspector| M1["🛠️ ITV Extractor"]
        M -->|Coberturas, recibos| M2["🛡️ Insurance Extractor"]
        M -->|Certificados, aptitud| M3["👷 PRL Extractor"]
        M -->|Materias peligrosas| M4["🚚 ADR Extractor"]
        M -->|Sin plantilla| M5["📦 Generic/Other Extractor"]
    end

    %% Compliance Layer
    subgraph Phase3 [FASE 3: Compliance y Riesgo (Filtro Legal)]
        M1 & M2 & M3 & M4 & M5 --> N["📦 Structured JSON <br/> (Datos unificados)"]
        N --> O["⚖️ Python Rules Engine <br/> (Lógica determinista/legal estricta)"]
        O --> P["🧠 Semantic Validator <br/> (GPT-4o mini - Incoherencias y fraude)"]
        P --> Q["🎯 Risk Scoring Engine <br/> (Ponderación de fallos)"]
    end

    %% Decision & Audit
    subgraph Phase4 [FASE 4: Decisión, HITL y Auditoría]
        Q --> R{Decisión de Score}
        
        %% Resultados
        R -->|GREEN (Puntuación Óptima)| S["✅ Approved - Proceso Automático"]
        R -->|AMBER (Dudas/Excepciones)| T["🙋 Human Review Queue <br/> (HITL Interface)"]
        R -->|RED (Incumplimiento Claro)| U["🚫 Blocked - Rechazo Automático"]
        
        %% HITL y Aprendizaje
        T --> V["💎 Gold Dataset <br/> (Correcciones verificadas por humanos)"]
        V -->|Mejora de Prompts| I
        V -->|Refinamiento de OCR/Reglas| L
        
        %% Auditoria
        S & T & U --> Y[("🗄️ Cosmos DB <br/> (Audit Log Inmutable)")]
    end

    %% Estilos de las cajas
    style Phase1 fill:#f0f8ff,stroke:#005a9c,stroke-width:2px
    style Phase2 fill:#fff8dc,stroke:#b8860b,stroke-width:2px
    style Phase3 fill:#f5fffa,stroke:#2e8b57,stroke-width:2px
    style Phase4 fill:#fff0f5,stroke:#dc143c,stroke-width:2px
```

---

## 🛠️ Detalles Fase por Fase

### 🏗️ FASE 1: Ingesta y Gestión de Tráfico (Entrypoint)
El objetivo de esta fase es asegurar la entrada, proteger el sistema de saturaciones inadvertidas o ataques, y derivar la carga de trabajo eficientemente.

1.  **Azure API Management (APIM) + Azure AD:**
    *   **¿Qué hace?**: Es la puerta de entrada principal. Autentica las llamadas utilizando Azure Active Directory (Azure AD) para confirmar la identidad del sistema o usuario y el origen (el "tenant" en un entorno multi-cliente de ERP).
    *   **Rate Limiting**: Configurado para limitar peticiones (ej. 100 requests/minuto por cliente). Esto es *crítico* porque procesar documentos con IA tiene un coste por token/petición. Sin APIM, un bucle infinito en un script del cliente podría generar una factura gigante en servicios cognitivos en horas.
    *   **Trazabilidad Financiera**: Permite asignar costes de llamadas a la API (y en consecuencia de LLM) a un cliente específico.

2.  **FastAPI Backend (Gateway Asíncrono):**
    *   **¿Qué hace?**: Un servicio muy ligero construido en Python (FastAPI).
    *   **Responsabilidad estricta**: Recibe el archivo binario, lo valida rápidamente (tamaño, mime-type), genera un identificador único de trazabilidad (`document_id`), sube el archivo original (Raw Data) a un Azure Blob Storage y delega el procesamiento.
    *   **Decisión de Diseño**: La elección de FastAPI se debe a que es *async*. Una operación de Input/Output (como subir un archivo o esperar a la nube) no bloquea la recepción de nuevas peticiones concurrentes. **El backend nunca procesa la IA.**

3.  **Selector de Colas (Redis vs Service Bus):**
    *   **El Problema**: A veces un usuario sube una ITV y está esperando que la pantalla del ERP le diga "Aceptado" casi instantáneamente. Otras veces, un administrador sube un archivo ZIP con 500 historiales de aseguradoras que no corre prisa.
    *   **Redis (Fast Path)**: Baja latencia. Si el documento requiere una respuesta bloqueante para la UI (síncrona para el usuario), va en memoria mediante Redis.
    *   **Azure Service Bus (Durable Path)**: Procesos batch masivos. Garantiza que si el sistema de IA se cae temporalmente por mantenimiento, no se pierdan los eventos de procesamiento, con reintentos automáticos tras backoffs progresivos.


### 🧠 FASE 2: Capa de Inteligencia y Extracción Híbrida
Esta es la fase de ingenia inversa o de desestructuración, donde la magia se equilibra milimétricamente con el presupuesto ("FinOps para IA").

4.  **Capa de Normalización (Normalization Layer):**
    *   **El Problema**: "Basura entra, basura sale" (Garbage in, garbage out). La IA o los sistemas de OCR fallan miserablemente si reciben un PDF de 2GB compuesto por fotos torcidas y mal iluminadas tomadas con un Nokia de 2012.
    *   **¿Qué hace?**: Utiliza algoritmos de visión por ordenador estándar (mucho más rápidos/baratos que IA) antes de siquiera mirar el contenido. Si detecta ficheros de Apple (`.heic`), los convierte a `.jpg`. Ejecuta rutinas de **Deskew** (enderezar horizontes de fotos) y limpieza general mejorando resoluciones a 300 DPI recomendados.
    *   **Impacto**: Un escaneo torcido que iba a fallar el primer intento y forzar a que el caro modelo Vision lo lea entero, ahora puede ser parseado por un OCR estructurado mucho más económico. Un ahorro que escala dramáticamente.

5.  **Routing Agent (GPT-4o mini): El "Enrutador Económico":**
    *   **¿Qué hace?**: Antes de lanzar el archivo a un parser, un modelo rápido de OpenAI evalúa los metadatos o una previsualización diminuta del documento para decidir **cuál es el camino más barato en dólares para leerlo correctamente**.
    *   **PDF Parser (PyMuPDF)**: ¿Es un PDF generado directamente por software (ej. un certificado firmado digitalmente)? Se envía aquí. Coste: Esencialmente 0. Precisión: 100% de los caracteres.
    *   **Azure Document Intelligence (OCR)**: ¿Es un escaneo plano bien encuadrado de un formulario estándar (como casi todo formato legal español)? Se envía al OCR industrial de Azure. Coste: Centavos. Formato: Bueno deduciendo tablas.
    *   **GPT-4o Vision (Fallback)**: ¿Están mezclados 4 tickets arrugados en una foto a contraluz? *Solamente* estos casos se escalan al modelo Vision multimodal. Coste: 10x-50x más caro que el OCR.

6.  **Clasificador y Extractores Especializados:**
    *   **Document Classifier**: Una vez tenemos texto plano/bruto (`Raw Text`), un agente clasifica qué es: Póliza de Seguro, Recibo, Documento ITV, Certificado PRL.
    *   **Sub-Agentes Especializados**: Una de las peores prácticas en la Ingeniería de Prompts es darle a un LLM un prompt de 5 páginas. En Josanz ERP, tenemos "Micro-Extractores". Si sabemos que es una tarjeta de la ITV, el texto va a un *ITV Extractor* con un único objetivo: devolver un JSON estricto con `plate` (matrícula), `issue_date` y `expiry_date`.
    *   **Resultado**: Al pedir JSONs con campos pequeños con prompts muy restrictivos a modelos rápidos (`gpt-4o-mini`), minimizamos las alucinaciones al máximo.

### ⚖️ FASE 3: Capa de Compliance (El Núcleo del Negocio)
Hasta ahora, hemos capturado texto. La FASE 3 da el veredicto de ese texto basado en normativas (CAE, inspecciones de trabajo).

7.  **Engine de Reglas de Python (Rules Engine):**
    *   **¿Qué hace?**: Lógica condicional de programación pura y dura (`if / else`).
    *   **La Regla de Oro Legal**: **La IA jamás toma la decisión de denegar el acceso a un trabajador al recinto.** Un LLM puede alucinar o estar sesgado; un código Python indicando `if today > expiration_date: return False` no alucina.
    *   Si los datos del JSON están, el motor dicta si cumplen los pre-requisitos puramente formales y cronológicos.

8.  **Validador Semántico IA (Semantic Validator):**
    *   **El Problema**: Algo puede cuadrar numéricamente, pero fallar lógicamente ("Fecha de nacimiento: 2026", o un nombre en un seguro que es del contratista pero no de la empresa principal).
    *   **¿Qué hace?**: La IA de validación busca incoherencias lógicas o signos de manipulación de OCR que un `if/else` no conciba. Revisa el cruce de datos contra los tenantes del ERP.

9.  **Risk Scoring Engine (Ponderación unificada):**
    *   **¿Qué hace?**: Unifica la dureza matemática del motor Python y las observaciones laxas del Validador Semántico para generar un *Score* de riesgo total.

### 👤 FASE 4: Human in the Loop (HITL), Decisión y Automejora
Este pipeline nunca se cierra, sino que es un ciclo iterativo.

10. **Toma de Decisiones y El HITL Interface:**
    *   El Score de riesgo anterior se evalúa contra tres umbrales configurables por la empresa:
        *   **GREEN (Vía Libre)**: Puntuación perfecta, cero warnings semánticos. El documento se aprueba y se sincroniza en el módulo CAE de Josanz ERP "sin haber sido tocado por manos humanas". 
        *   **RED (Rechazo Radical)**: Fecha ITV caducada hace 1 año. Queda bloqueado.
        *   **AMBER (Cola de Revisión)**: (Ejemplo: *Nombre de la empresa un 80% similar por un error ortográfico en la escritura.*). El documento se deposita en una cola especial donde un operario humano de la plataforma lo verifica.
    *   La herramienta HITL (Human In The Loop) en el ERP le muestra la imagen del doc, los campos JSON extraídos que la IA ha dudado, y le permite aplicar la lógica humana fina.

11. **Gold Dataset y Auditoría Constante:**
    *   **El Feedback Loop**: Las métricas generadas por las decisiones de las personas cuando corrigen un "AMBER" a un rechazo, o a una aprobación manual, son enviadas para su posterior perfeccionamiento de OCR (fine-tuning del sistema). El error disminuye mes a mes por puro redentrenamiento de datos limpios.
    *   **Auditoría Eterna en Cosmos DB**: La responsabilidad legal (sobre quién aprobó que camión de materias peligrosas entrase a obra) está protegida. Cada iteración, petición a IA, log JSON y timestamp cae en Cosmos DB de manera inmutable. Si viene una inspección, JOSANZ ERP puede sacar el JSON completo y decir qué reglas evaluó y el "por qué" de su autorización legal.

## 🚀 Resumen del Valor de Arquitectura
Tu sistema está construido bajo la principal premisa que separa los juguetes basados en API LLM's del software empresarial: **Control de responsabilidades**.
Tu IA hace lo que se le da bien (interpretar patrones variables), tu código de backend hace lo estricto e infalible (evaluar vigencia, caducidades e ids), tu base de datos audita cada transacción asegurando Compliance técnico y el operario es llamado la menor cantidad de veces posibles, garantizando máxima escalabilidad sin pérdida de calidad.
