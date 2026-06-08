





Plataforma CAE v2.0 Desarrollo IA 
Ideauto


Definición Funcional
1 Junio 2026





Datos Cliente:

INSTITUTO DE ESTUDIOS DE AUTOMOCION S.L.
C/ OQUENDO 23
28006 - Madrid
B82101809 


Índice
1 Descripción Funcional	3
1.1 Funcionamiento de la IA	3
1.1.1 Funcionamiento propuesto 	3
1.1.2 Pipeline de IA	4
1.2 Flujo del Cliente - Edición del expediente	4
1.2.1 Descripción general	4
1.2.2 Estados del expediente	5
1.3 Flujo de Ideauto - Revisión del expediente	5
1.3.1 Descripción general	5
1.3.2 Acciones de revisión	5
1.3.3 Flujo Detallado — "Revisado corregido"	6
1.4 Trazabilidad y Feedback al Modelo de IA	6
1.4.1 Datos que el Sistema Registra por Expediente	6
1.4.2 Uso del feedback	6
2 Planteamiento técnico del proyecto	7
2.1.1 Estructura propuesta	7
2.1.2 Desglose de cada fase	7
2.2 Fases de Implantación	7
3 Tecnologías propuestas	8



Descripción Funcional
El presente documento recoge la definición funcional detallada del proyecto de automatización mediante Inteligencia Artificial integrado en la Plataforma CAE v2.0 desarrollada para Ideauto.
El objetivo principal es automatizar la captura, validación y tratamiento de información a partir de documentos aportados por el usuario, reduciendo significativamente la introducción manual de datos, mejorando la calidad de la información y proporcionando mecanismos de trazabilidad y control durante todo el ciclo de vida del expediente.
La solución incorpora capacidades de extracción documental, validación mediante reglas de negocio y mecanismos de evaluación de confianza para asistir tanto al cliente como al equipo de Ideauto durante la gestión de expedientes.
El presente documento recoge la definición funcional detallada del proyecto de automatización mediante Inteligencia Artificial integrado en la Plataforma CAE v2.0 desarrollada para Ideauto.
El objetivo principal es automatizar la captura y validación de información a partir de documentos subidos por el usuario (formato PDF), reduciendo de forma significativa la escritura manual en la cumplimentación de formularios y garantizando la validez y completitud de la documentación gestionada en el sistema.






Funcionamiento de la IA 
Funcionamiento propuesto 
La solución se basa en el procesamiento automatizado de documentos PDF e imágenes mediante tecnologías de Inteligencia Artificial y OCR avanzado.
El sistema está compuesto por tres capas funcionales principales:

Capa
Objetivo
Extracción documental
Obtención automática de datos estructurados desde documentos
Validación
Aplicación de reglas de negocio y coherencia de la información
Evaluación de confianza
Determinación de la fiabilidad de cada dato extraído

El objetivo es automatizar la captura de información a partir de documentos y reducir la escritura manual en la cumplimentación de formularios, manteniendo al mismo tiempo un control sobre la validez de los documentos. 
El alcance se limita exclusivamente al módulo de Expedientes, con dos objetivos concretos:
Edición por el cliente: una vez que el cliente sube el documento, la IA lo revisa para validarlo y rellena automáticamente el formulario del expediente con la información que corresponda, el cliente puede revisar y corregir cualquier campo incorrecto antes de enviarlo a revisión a Ideauto.
Revisión por Ideauto: el equipo de Ideauto puede marcar cada expediente como "Revisado correcto" o "Revisado corregido", capturando los valores correctos de los campos que la IA no extrajo bien. Este feedback alimenta tanto a los desarrolladores como al ciclo de mejora del modelo de IA.
Fuera del alcance:
Alcance funcional
El alcance se limita exclusivamente al módulo de Expedientes, con los siguientes objetivos:
Edición por el cliente
Una vez que el cliente sube la documentación requerida:
El sistema identifica el tipo documental.
Extrae automáticamente la información relevante.
Valida la calidad y legibilidad del documento.
Completa automáticamente los campos correspondientes del expediente.
Indica el nivel de confianza de los datos obtenidos.
El cliente puede revisar, modificar o completar cualquier dato antes de enviar el expediente a revisión.
Revisión por Ideauto
El equipo de Ideauto podrá:
Revisar la información extraída.
Validar los documentos aportados.
Corregir datos incorrectos.
Aprobar o devolver expedientes.
Toda corrección realizada será registrada para su posterior análisis y mejora del sistema.
Fuera del alcance
Módulo de Usuarios.
Módulo de Clientes.
Módulo de Lotes.
Módulo de Acceso.
Entrenamiento automático de modelos en producción.




Los cambios en diseño se limitan exclusivamente al módulo de Expedientes.

El resto de módulos de la plataforma (Usuarios, Clientes, Lotes, Acceso) no se modifican.
Los cambios de diseño se limitan exclusivamente al módulo de Expedientes descrito aquí.



Pipeline de IA 
El motor de IA actúa en el momento en que el cliente sube un documento PDF dentro del expediente. El flujo completo es el siguiente:

El motor de IA actúa en el momento en que el cliente sube documentación dentro del expediente.
El flujo completo es el siguiente:
Paso
Acción
Responsable
1
Subida de documento PDF o imagen
Cliente
2
Validación inicial de formato y calidad
Sistema
3
Identificación del tipo documental
IA
4
OCR y extracción de información estructurada
IA
5
Normalización de datos al modelo interno
Sistema
6
Aplicación de reglas de negocio
Sistema
7
Cálculo de nivel de confianza por campo
IA
8
Determinación del resultado de procesamiento
Sistema
9
Precarga automática del expediente
Sistema
10
Revisión y corrección por el cliente
Cliente
11
Envío a revisión
Cliente
12
Validación final
Ideauto




Paso
Acción
Responsable
1
El cliente sube un documento PDF en el formulario del expediente
Cliente
2
La IA extrae los datos relevantes y evalúa la validez/legibilidad del tipo de documento
IA
3
El sistema rellena automáticamente los campos del formulario con los datos extraídos y confirma que el documento es válido
Sistema
4
Normalización de datos
IA
5
El cliente revisa los campos, corrige los incorrectos, firma los documentos y envía a Ideauto
Cliente
6
Ideauto revisa el expediente y marca "Revisado correcto" o "Revisado corregido"
Ideauto
7
Si todo es correcto, Ideauto envía el expediente 
Ideauto
8
Si hay documentación errónea, el expediente se devuelve al cliente para que corrija la documentación
Ideauto
9
Tras la validación del expediente, se guarda en BBDD y se procesa
Sistema



Flujo del Cliente - Edición del expediente
Descripción general 
1.2 Flujo del Cliente - Edición del expediente
1.2.1 Descripción general
Cuando el cliente crea un expediente y sube documentación, el sistema procesa automáticamente los documentos aportados.
Los datos obtenidos se utilizan para cumplimentar los campos correspondientes del expediente, reduciendo la introducción manual de información.
El cliente puede:
Revisar todos los datos extraídos.
Modificar cualquier valor incorrecto.
Completar información faltante.
Firmar la documentación requerida.
Enviar el expediente a revisión.
Una vez enviado, el expediente queda bloqueado para edición.
Si Ideauto detecta incidencias documentales, el expediente podrá devolverse al cliente para su corrección.

1.2.2 Estados del expediente
Estado
Descripción
Editable
Borrador
Expediente en cumplimentación por el cliente
Sí
Enviado a revisión
Expediente remitido a Ideauto
No
Revisado correcto
Expediente validado correctamente
No
Revisado corregido
Expediente corregido y aprobado por Ideauto
No
Devuelto al cliente
Requiere corrección documental
Sí


1.3 Flujo de Ideauto - Revisión del expediente
1.3.1 Descripción general
Cuando el cliente envía un expediente, Ideauto accede a la ficha correspondiente para revisar la documentación y la información extraída.
El sistema proporciona información adicional de apoyo a la revisión:
Nivel de confianza de cada campo.
Campos modificados por el cliente.
Alertas de validación detectadas.
Historial de cambios.

1.3.2 Acciones de revisión
Acción
Cuándo usarla
Datos capturados
Efecto
Revisado correcto
Todos los datos son correctos
Usuario y fecha de revisión
El expediente se envía para procesamiento
Revisado corregido
Existen errores subsanables
Valores corregidos por campo
El expediente se aprueba y genera feedback
Devolver al cliente
La documentación es incorrecta o insuficiente
Motivo de devolución
El expediente vuelve al cliente


1.3.3 Flujo detallado — Revisado corregido
Cuando Ideauto selecciona la opción Revisado corregido:
El sistema resalta automáticamente:
Campos con baja confianza.
Campos modificados por el cliente.
Campos con incidencias de validación.
Ideauto corrige los valores detectados.
El sistema registra:
Valor extraído por la IA.
Valor introducido por el cliente.
Valor corregido por Ideauto.
Usuario responsable.
Fecha y hora de la corrección.
El expediente pasa a estado validado.
La información se incorpora automáticamente al proceso de análisis y mejora continua.
Cuando el cliente crea un expediente y sube documentación, la IA revisa el documento y valida tanto la calidad del documento como el contenido y cuando es necesario rellena automáticamente los campos del formulario. El cliente puede editar o rellenar cualquier campo incorrecto o vacío antes de enviarlo a revisión de Ideauto. Una vez enviado, el expediente queda bloqueado para el cliente. Si el expediente es devuelto por falta de documentación, el cliente deberá corregir el documento y luego enviarlo nuevamente a Ideauto. 



Estados del expediente
Estado 
Descripción
Editable
Borrador
El expediente está siendo cumplimentado por el cliente. La IA ha rellenado los campos pero aún no se ha enviado a revisión.
Sí
Enviado a revisión
El cliente ha enviado el expediente a Ideauto.
No
Revisado correcto
Ideauto ha validado el expediente. Se envía para su valoración
No
Revisado corregido
Ideauto ha detectado campos incorrectos (datos), ha introducido los valores correctos y envía al ministerio.
No
Devuelto al cliente
Ideauto ha detectado que la documentación no es correcta. El cliente recibe una notificación indicando qué documentación debe corregir.
Sí



Flujo de Ideauto - Revisión del expediente
Descripción general 
Cuando el cliente envía un expediente, Ideauto accede a la ficha para revisarlo. Ideauto puede revisar toda la información y documentación subida. Según el resultado, el expediente se envía para que sea procesado o se devuelve al cliente.

Acciones de revisión 

Acción
Cuándo usarla
Datos que se capturan
Efecto en el sistema
Revisado correcto
Todos los campos son correctos.
Fecha y usuario de Ideauto que realizó la revisión.
El expediente se envía. Se registra como caso de éxito para las métricas del modelo IA.
Revisado corregido
Ideauto detecta campos con valor incorrecto pero el expediente es subsanable.
Para cada campo incorrecto: el valor correcto según Ideauto.
Ideauto corrige los valores, el expediente se envía al ministerio. Las correcciones alimentan el feedback del modelo IA
Devolver al cliente para corrección
La documentación no es correcta.
Motivo de la devolución.
El expediente pasa a estado "Correcciones". El cliente debe actualizar  la información incorrecta o faltante



Flujo Detallado — "Revisado corregido"

Cuando Ideauto hace clic en "Revisado corregido":
El sistema resalta automáticamente los campos con confianza baja y los que el cliente modificó, como punto de partida para la revisión.
Ideauto selecciona el/los campo(s) incorrecto(s) e introduce el valor correcto directamente en la celda correspondiente.
Opcionalmente, Ideauto puede añadir una observación libre a nivel de expediente.
Al confirmar, el sistema registra: campo afectado, valor IA original, valor cliente, valor correcto Ideauto, y fecha/usuario de la revisión.
El expediente se envía.
Los datos de corrección se envían automáticamente al pipeline de feedback para alimentar la mejora del modelo.

Trazabilidad y Feedback al Modelo de IA
1.4 Trazabilidad y Feedback al Modelo de IA
1.4.1 Datos que el sistema registra por expediente
Para cada expediente se almacenan:
Documento original.
Tipo documental identificado.
Datos extraídos.
Nivel de confianza por campo.
Resultado de validaciones.
Modificaciones realizadas por el cliente.
Correcciones realizadas por Ideauto.
Fechas y usuarios intervinientes.
Versión del modelo utilizada.

1.4.2 Uso del feedback
El feedback obtenido durante la revisión no se utiliza para entrenar modelos directamente en producción.
Su finalidad es:
Analizar errores recurrentes.
Mejorar reglas de validación.
Ajustar umbrales de confianza.
Obtener métricas de calidad.
Preparar futuras fases de mejora del sistema.


Datos que el Sistema Registra por Expediente
Uso del feedback



Planteamiento técnico del proyecto
Estructura propuesta





















ESTE FASE 9 IDEAUTO FITNESS APPROVAL… 
EL TEXTO DEL 21 DEBE SER ÚNICAMENTE Feedback Loop (NO HAY DOCUMENT INTELLIGENCE TRAINING)


2.1.2 Desglose de cada fase
Fase 1 – Upload Document
El usuario selecciona y envía el documento.
Se genera un identificador único de procesamiento.
Fase 2 – Validación Inicial
Validación de:
Formato permitido.
Tamaño máximo.
Calidad mínima.
Integridad del archivo.
Fase 3 – Verificación documental previa
Comprobación de si el documento o expediente ya ha sido procesado previamente para reutilizar información existente cuando proceda.
Fase 4 – Clasificación documental
Identificación automática del tipo documental mediante IA.
Fase 5 – Extracción de datos
Aplicación de OCR y extracción estructurada de información.
Fase 6 – Mapeo al modelo de datos
Conversión de la información obtenida al modelo interno de expedientes.
Fase 7 – Validación y Confidence Engine
Aplicación de reglas de negocio y cálculo del nivel de confianza de cada dato.
Fase 8 – Persistencia y envío
Almacenamiento de la información y envío a revisión.

Fase 9 – Ideauto Fitness Approval
Validación funcional realizada por el equipo de Ideauto.
Fase 10 – Procesamiento del expediente
Procesamiento final del expediente y cierre del flujo operativo.
Fase 21 – Feedback Loop
Registro y consolidación de correcciones realizadas durante el proceso de revisión para análisis de calidad y mejora continua.
No incluye entrenamiento automático de modelos en producción.

[Cliente sube PDF] ↓ [La IA extrae los datos] ↓ [FASE 9: Fitness Approval] ──> El humano de Ideauto comprueba si los datos son APTOS. ↓ [FASE 21: Feedback Loop] ──> Si el humano corrigió algo, el sistema REGISTRA el error para mejorar la IA en el futuro. 


2.2 Fases de Implantación
A continuación se indican las fases recomendadas para la implantación del proyecto.
Fase
Alcance
Fase 1 - MVP
Pipeline documental completo y procesamiento básico
Fase 2 - Expansión
Incorporación de nuevos tipos documentales
Fase 3 - Optimización
Mejora de precisión y reducción de intervención manual
Fase 4 - Escalabilidad
Optimización de rendimiento y costes



Fase
Alcance y Objetivos
Timeline Real (2 Devs)
Fase 1: MVP
Configuración de la infraestructura en Azure, creación del pipeline documental base para DNI/documento principal, lógica de estados del expediente (Borrador/Enviado) y precarga del formulario.
4 semanas (1 mes)
Fase 2: Expansión
Integración de los nuevos tipos documentales, desarrollo del motor de reglas de negocio para validar los datos extraídos y mapeo definitivo a la base de datos de la Plataforma CAE v2.0.
3 semanas
Fase 3: Optimización
Desarrollo de la pantalla de revisión de Ideauto (Fase 9: Fitness Approval), lógica visual para resaltar campos modificados o con baja confianza, e implementación del registro de datos para el Feedback Loop (Fase 21).
3 semanas
Fase 4: Escalabilidad
Pruebas de carga, manejo de excepciones (PDFs corruptos o ilegibles), optimización de costes en Azure y despliegue controlado en producción.
2 semanas



3. Tecnologías propuestas
Capa
Tecnología
Almacenamiento
Azure Blob Storage
Mensajería
Azure Service Bus
Procesamiento
Azure Functions
Inteligencia Documental
Azure Document Intelligence
Validación
Rules Engine
Confidence Scoring
Confidence Engine
Base de Datos
Azure SQL Database
Monitorización
Azure Application Insights
IA Generativa (opcional)
Azure OpenAI

Desglose de cada fase 

Describir brevemente las fases → enriquecer.

Fase 1: se sube el documento a través del selector de archivos y se envía
Fase 2: Validar llamada, validar documento.
Fase 3: Valorar si el documento para el vehículo había sido validado previamente (si ya disponemos de esos datos)
Fase 4: Validar tipo de documento -> entrenar IA para tipo de documento ofrecido.
Fase 5: extracción de datos del documento 
Fase 6: Mapeo de datos extraidos del documento al objeto a rellenar
Fase 7: Validación de datos rellenados en el objeto o modelo de datos.
Fase 8: Guardar y encolar objeto relleno para su envío a Ideauto
Fase 9: Validación por parte de Ideauto.
Fase 10: Procesamiento del expediente y encolado del mismo para entrenamiento de IA

Fases de Implantación 
A continuación se indican las fases de implantación del proyecto recomendadas en base a la estructura del mismo. 

En el diagrama anterior podemos observar que el proyecto se compone de 4 fases diferenciadas. Su organización y planificación se realizará en la fase 1 en base al análisis establecido.

Dedicación estimada para cada fase: 



Los plazos establecidos son los siguientes:

Análisis y Diseño:                                entrega semana 
Desarrollo, pruebas y migración:      entrega final 

Tecnologías propuestas 


La solución propuesta permitirá:
Reducir significativamente el tiempo de cumplimentación de expedientes.
Incrementar la calidad de la información registrada.
Disponer de trazabilidad completa de todas las decisiones realizadas por el sistema.
Facilitar la supervisión y validación por parte de Ideauto.
Escalar el procesamiento documental de forma eficiente mediante servicios cloud nativos.


