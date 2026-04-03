
Josanz ERP: Libro Blanco de Arquitectura y Escalabilidad
Versión: 4.0 (Full-Stack Enterprise) | Framework: Nx Monorepo

1. El Núcleo: Arquitectura Hexagonal (Puertos y Adaptadores)
El backend de cada dominio en libs/<dominio>/ no es una simple API; es un sistema desacoplado que protege la lógica de negocio de la tecnología.

1.1 Capa de Dominio (core/domain)
Es el nivel más interno y es TypeScript Puro (100%).

Entidades y Value Objects: Definición de objetos de negocio con validaciones intrínsecas (ej. un TaxId que se valida a sí mismo al instanciarse).

Domain Services: Lógica que no pertenece a una sola entidad.

Ports (Interfaces): Contratos que definen qué necesita el dominio (ej. IUserRepository, IEmailProvider). El dominio no sabe si los datos vienen de PostgreSQL o de un archivo Excel.

1.2 Capa de Aplicación (core/application)
Casos de Uso (Use Cases): Orquestadores que ejecutan una acción atómica (ej. RegisterSaleUseCase). Reciben DTOs de la api, llaman al domain y guardan los cambios a través de los Ports.

1.3 Capa de Infraestructura (backend/infrastructure)
Es la capa externa que implementa los adaptadores técnicos.

Framework: NestJS (Controladores, Guards, Interceptors).

Persistencia: Implementaciones de los interfaces del dominio usando Prisma ORM y PostgreSQL.

Adapters: Conexiones reales con Verifactu, Stripe, AWS S3 o servicios de Email.

2. Frontend: Component-Driven y Smart/Dumb
El frontend replica esta limpieza separando la "belleza" de la "inteligencia".

2.1 shared/ui-kit (Componentes Dumb)
Naturaleza: Presentación pura.

Responsabilidad: Botones, inputs, layouts de tablas, modales. Solo aceptan @Input y emiten @Output.

Escala: Al estar en shared, cualquier cambio visual (ej. rebranding) se aplica a todos los módulos simultáneamente.

2.2 libs/<dominio>/feature (Componentes Smart)
Responsabilidad: Se conectan al data-access para obtener el estado (Signals).

Orquestación: Toman componentes del ui-kit y les inyectan los datos y la lógica de negocio necesaria para la vista actual.

3. Matriz de Librerías y Entornos
Librería	Entorno	Tecnología	Responsabilidad
api	Isomórfico	TS Puro	Contrato Único (SSOT): Interfaces y DTOs compartidos.
core	Isomórfico	TS Puro	Dominio y Casos de Uso (Agnóstico). Sin frameworks.
backend	Node	NestJS	Controladores y Adaptadores de Infraestructura (Prisma).
data-access	Browser	Angular	Gestión de estado (Signals) y clientes HTTP.
ui-kit	Browser	Angular	Dumb Components. Sistema de diseño transversal.
feature	Browser	Angular	Smart Components. Orquestación de pantallas y lógica UI.
shell	Browser	Angular	Routing y configuración de entrada (Lazy Loading).
4. Estrategia de Escalabilidad: De Monolito a Microservicios
Josanz ERP nace como un Monolito Modular, pero su ADN es de microservicios.

4.1 Fase 1: Escalamiento Horizontal (Actual)
Gracias al diseño multi-tenant, podemos replicar la instancia del backend tras un balanceador de carga (Nginx/Cloudflare). El tenant_id asegura que cada petición sepa a qué datos acceder en la DB compartida.

4.2 Fase 2: Extracción de Microservicios (The Strangler Pattern)
Cuando un dominio (ej. Facturación o Verifactu) requiere más recursos que el resto, el proceso de extracción es quirúrgico:

Aislamiento de Código: Como ya tenemos el dominio en librerías core y api separadas, creamos una nueva app en el monorepo Nx dedicada exclusivamente a ese dominio.

Comunicación: Introducimos un API Gateway. El frontend sigue apuntando a una URL, pero el Gateway redirige el tráfico de /billing al nuevo microservicio.

Base de Datos: El microservicio puede seguir usando la DB principal o migrar a una propia si necesita alta disponibilidad extrema.

4.3 Fase 3: Comunicación Asíncrona (Event-Driven)
Para evitar el acoplamiento entre microservicios, introducimos un Message Broker (RabbitMQ o Redis):

Cuando se crea un cliente en el servicio de Clients, este emite un evento ClientCreated.

El servicio de Billing escucha ese evento y crea el perfil de facturación de forma asíncrona.

Resultado: Si el servicio de facturación cae, el sistema sigue funcionando; los mensajes se procesarán cuando vuelva a estar online.

5. El Modelo de Negocio como Plugin
La arquitectura permite crear Plugins de Negocio dinámicos:

Modularidad de Mercado: Podemos activar/desactivar dominios completos para un cliente desde un panel de control (Feature Flags).

Time-to-Market: Desarrollar un nuevo vertical (ej. "Módulo de Taller") consiste en generar las carpetas del hexágono, usar el ui-kit existente y conectarlo al shell. El 70% del código (infraestructura, UI común, seguridad) ya está escrito.

6. Conclusión
Josanz ERP está blindado contra la obsolescencia técnica. El uso de TypeScript Agnóstico en el Core y la Arquitectura Hexagonal en el Backend permiten que la transición a microservicios sea una decisión de negocio y no una pesadilla técnica de refactorización.

"Diseñamos un monolito hoy, para poder tener una galaxia de microservicios mañana, sin cambiar la lógica que hace que el ERP funcione."  