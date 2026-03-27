ERP
Josanz Audivisuales

Definición Funcional
12 Marzo 2026

Datos Cliente:
JOSANZ AUDIOVISUALES S.L.
C/Alonso Núñez 3 - Izq
28039, Madrid

1 de 10

Babooni Technologies · www.babooni.com

ERP
Definición Funcional

Índice
1 Descripción Funcional 3
1.1 Plataforma ERP 3
1.1.1 Aplicación Propuesta 3
1.1.2 Secciones 3
1.1.2.1 Acceso usuarios: 3
1.1.2.2 Gestión de Usuarios: 3
1.1.2.2.1 Listado de Usuarios: 3
1.1.2.2.2 Perfil de Usuario: 4
1.1.2.3 Gestión de Clientes: 4
1.1.2.3.1 Listado de Clientes: 4
1.1.2.3.2 Perfil de Cliente: 4
1.1.2.4 Gestión de Presupuestos: 4
1.1.2.4.1 Listado de Presupuestos: 4
1.1.2.4.2 Detalle del Presupuesto: 5
1.1.2.5 Gestión de Albaranes: 5
1.1.2.5.1 Listado de Albaranes: 5
1.1.2.5.2 Detalle del Albarán: 5
1.1.2.6 Gestión de Productos (stock): 6
1.1.2.6.1 Listado de Productos o lotes: 6
1.1.2.6.2 Listado de Productos en alquiler: 6
1.1.2.6.3 Ficha del Producto: 7
1.1.2.7 Gestión de Flotas/Conductores: 7
1.1.2.7.1 Listado de Conductores: 7
1.1.2.7.2 Detalle del Conductor: 7
1.1.2.8 Gestión de Facturación: 7
1.1.2.8.1 Listado de Facturas: 8
1.1.2.8.2 Detalle de la Factura: 8
1.1.2.9 Flujo del proceso 8
1.2 Arquitectura 9
1.3 Fases de Implantación 9
1.4 Tecnologías propuestas 10
1.5 Garantía 10

2 de 10

Babooni Technologies · www.babooni.com

ERP
Definición Funcional

1 Descripción Funcional
A continuación se indican las características funcionales del proyecto para la
implementación de un ERP (Planificación de Recursos Empresariales) a medida. Se
incluirá el diseño gráfico y desarrollo técnico del sistema tal como se describe en este
documento.
1.1 Plataforma ERP

1.1.1 Aplicación Propuesta
Incluye el desarrollo de una Plataforma web responsive capaz de gestionar las
secciones que se muestran a continuación y sus funcionalidades correspondientes
detalladas a continuación. Toda la información gestionada/visualizada en tablas debe
ser exportable en formato Excel.

1.1.2 Secciones
La aplicación incluirá las siguientes características y secciones:
1.1.2.1 Acceso usuarios:

- Incluye el desarrollo de un sistema de acceso a través de login que se realizará
  mediante usuario y contraseña.
- Se incluirá un sistema de registro de usuarios mediante validación por email
- En caso de que un usuario olvide su contraseña, el sistema contendrá la
  funcionalidad de recordar contraseña mediante envío por email.

  1.1.2.2 Gestión de Usuarios:
  1.1.2.2.1 Listado de Usuarios:

- El listado dispondrá de paginación para optimizar su visualización
- Desde cada registro del listado, se accede al perfil de cada usuario.
- El listado dispondrá de un filtrado textual
- El listado contendrá las siguientes columnas de datos: nombre, apellidos,
  email, empresa y rol

3 de 10

Babooni Technologies · www.babooni.com

ERP
Definición Funcional

1.1.2.2.2 Perfil de Usuario:

- El perfil de usuario contendrá los siguientes datos: nombre, apellidos, email,
  contraseña, empresa, rol e imagen de perfil.
- Se crearán 3 roles de administración de usuarios diferenciados:
  o Superadministrador: podrá realizar todas las acciones disponibles en el
  sistema.
  o Administradores: podrá realizar todas las acciones disponibles
  (pendientes de acordar con el cliente)
  o Usuarios: podrán realizar todas las acciones del sistema que le permita
  su rol.
  1.1.2.3 Gestión de Clientes:

  1.1.2.3.1 Listado de Clientes:

- El listado dispondrá de paginación para optimizar su visualización
- Desde cada registro del listado, se accede al perfil de cada cliente.
- El listado dispondrá de un filtrado textual
- El listado contendrá las siguientes columnas de datos: nombre, descripción,
  sector, empresa, contacto.
  Los administradores podrán crear, editar y eliminar clientes.

  1.1.2.3.2 Perfil de Cliente:

- El perfil de cliente contendrá los siguientes datos (a definir con el cliente).
- Se incluye el registro/histórico de email enviados al cliente para poder tener el
  seguimiento de la cuenta. Este servicio será integrado con Outlook.

  1.1.2.4 Gestión de Presupuestos:
  1.1.2.4.1 Listado de Presupuestos:

- El listado dispondrá de paginación para optimizar su visualización
- Desde cada registro del listado, se accede al detalle de cada presupuesto.
- El listado dispondrá de un filtrado textual
- El listado contendrá las siguientes columnas de datos:
  o No de Identificación

4 de 10

Babooni Technologies · www.babooni.com

ERP
Definición Funcional

o Descripción
o Importe
o Fecha envío
o Fecha vencimiento
o Estado
o Etc (pendiente definir con el cliente)

- Los presupuestos se podrán exportar en formato PDF y enviar al cliente
  mediante un enlace o similar.
- Se dispondrá de un botón para “añadir”, “editar” y “eliminar” presupuestos en
  el sistema

  1.1.2.4.2 Detalle del Presupuesto:

- El detalle del presupuesto contendrá todos sus datos (pendientes de definir
  con el cliente)
- El presupuesto se generará sobre una plantilla predefinida

  1.1.2.5 Gestión de Albaranes:
  1.1.2.5.1 Listado de Albaranes:

- El listado dispondrá de paginación para optimizar su visualización
- Desde cada registro del listado, se accede al detalle de cada albarán.
- El listado dispondrá de un filtrado textual
- El listado contendrá las columnas de datos a definir con el cliente
- El albarán contendrá el listado de productos/servicios ofrecidos por el cliente
- Los albaranes se podrán exportar en formato PDF
- Se dispondrá de un botón para “añadir”, “editar” y “eliminar” albaranes en el
  sistema

  1.1.2.5.2 Detalle del Albarán:

- El detalle del albarán contendrá todos sus datos (pendientes de definir con el
  cliente)
- El albarán se generará sobre una plantilla predefinida

5 de 10

Babooni Technologies · www.babooni.com

ERP
Definición Funcional

1.1.2.6 Gestión de Productos (stock):
1.1.2.6.1 Listado de Productos o lotes:

- El listado dispondrá de paginación para optimizar su visualización
- Desde cada registro del listado, se accede al perfil/ficha de cada producto.
- El listado dispondrá de un filtrado textual
- El listado contendrá las siguientes columnas de datos:
  o No de Identificación
  o Descripción
  o Tipo (producto, lote de productos)
  o Unidades
  o Precio
  o Estado
  o Etc (pendiente definir con el cliente)
- Se dispondrá de un botón para “añadir”, “editar” y “eliminar” productos en el
  sistema.

  1.1.2.6.2 Listado de Productos en alquiler:

- El listado se compondrá de los productos que se ofrezcan en alquiler y se
  podrá controlar su estado mediante estados
- El listado contendrá las siguientes columnas de datos:
  o No de Identificación
  o Descripción
  o Unidades
  o Precio
  o Fecha alquiler
  o Fecha devolución
  o Estado
  o Etc (pendiente definir con el cliente)
- Se dispondrá de un botón para “añadir”, “editar” y “eliminar” productos en el
  sistema.

6 de 10

Babooni Technologies · www.babooni.com

ERP
Definición Funcional

1.1.2.6.3 Ficha del Producto:

- La ficha del producto contendrá todos sus datos (pendiente de definir con el
  cliente)

  1.1.2.7 Gestión de Flotas/Conductores:
  El objetivo de esta sección es controlar o fichar el movimiento de los conductores
  para identificar qué vehículos se han utilizado y su histórico.
  1.1.2.7.1 Listado de Conductores:

- El listado dispondrá de paginación para optimizar su visualización
- Desde cada registro del listado, se accede al detalle de cada conductor.
- El listado dispondrá de un filtrado textual
- El listado contendrá las siguientes columnas de datos:
  o Conductor
  o Marca
  o Modelo
  o Matrícula
  o Año
  o Estado
  o Etc.

  1.1.2.7.2 Detalle del Conductor:

- El detalle del conductor contendrá los datos e imágenes a definir con el
  cliente.

  1.1.2.8 Gestión de Facturación:
  Este apartado incluye la gestión y seguimiento de las facturas generadas a un cliente.
  Se solicitará la planificación de las facturas a emitir para que el sistema pueda llevar el
  seguimiento de las mismas y sus administradores puedan revisar el momento de
  emisión de cada una de ellas. Así mismo el sistema enviará las facturas al cliente por
  email mediante un enlace o con el archivo descargable.
  Incluye la integración del sistema de facturación con Verifactu.

7 de 10

Babooni Technologies · www.babooni.com

ERP
Definición Funcional

1.1.2.8.1 Listado de Facturas:

- El listado dispondrá de paginación para optimizar su visualización
- Desde cada registro del listado, se accede al detalle de cada factura.
- El listado dispondrá de un filtrado textual
- El listado contendrá las siguientes columnas de datos:
  o No de factura
  o Fecha de emisión
  o Fecha de caducidad
  o Descripción
  o Empresa
  o Importe
  o Estado (emitida, pendiente, cancelada)
  o Tipo (normal, rectificativa)
  o Etc. (pendiente de definir con el cliente).
  Los administradores podrán crear, editar y eliminar facturas.

  1.1.2.8.2 Detalle de la Factura:

- El detalle de la factura contendrá los siguientes datos (a definir con el cliente).
- La factura se generará sobre una plantilla predefinida y se podrá visualizar en
  formato completo o abreviado.

  1.1.2.9 Flujo del proceso

- Elaboración de presupuesto
- Elaboración de albarán
- Inventario de todo el material audiovisual
- Registro de personal y flota
- Factura

8 de 10

Babooni Technologies · www.babooni.com

ERP
Definición Funcional

1.2 Arquitectura
En el diagrama que se muestra a continuación, se muestra la arquitectura general del
sistema la cual se encuentra diferenciada en varias secciones.
La plataforma completa, se compondrá de una API que contendrá la lógica del
sistema y se comunicará tanto con la base de datos, como con la App u otros
sistemas externos que necesitásemos conectar a dicho plataforma

1.3 Fases de Implantación
A continuación se indica las fases de implantación del proyecto recomendadas en
base a la estructura del mismo.

En el diagrama anterior podemos observar que el proyecto se compone de 4 fases
diferenciadas. Su organización y planificación se realizará en la fase 1 en base al
análisis establecido.

9 de 10

Babooni Technologies · www.babooni.com

ERP
Definición Funcional

1.4 Tecnologías propuestas
En la fase de implementación (desarrollo software) se utilizará una arquitectura y
tecnologías que permitan el buen entendimiento del código entregado y la posible
escalabilidad del proyecto para futuras evoluciones del mismo. Para ello utilizaremos
una arquitectura sencilla en la que generaremos una API que nos permita separar el
backend del frontend.
De esta manera generaremos un interfaz de comunicación entre los sistemas que nos
permita aislar toda la parte visual para poder evolucionarla en cualquier momento
pensando en el futuro. Como tecnología principal de backend de la plataforma, se
propone utilizar Node.js de código abierto. Está será utilizada para la implementación
de, la lógica data, la interconexión de datos y los sistemas de conexión API entre los
sistemas involucrados. Para la implementación del frontend de la plataforma se
propone utilizar React.js, que son lenguajes de código abierto basados en javascript.
En referencia a la base de datos a utilizar, se propone utilizar postgreSQL o similar.

1.5 Garantía
El proveedor garantiza el correcto funcionamiento del software desarrollado durante
un periodo de 2 meses desde la fecha de entrega y aceptación del proyecto. Durante
este periodo, el proveedor se compromete a corregir errores o defectos de
programación (bugs), así como cualquier incidencia que suponga un incumplimiento
de las funcionalidades especificadas en el contrato o que derive directamente del
código entregado. Quedan expresamente excluidos de esta garantía el desarrollo de
nuevas funcionalidades, modificaciones o ampliaciones de requisitos no
contemplados inicialmente, así como incidencias derivadas de cambios en sistemas
externos, servicios de terceros o APIs.

Tiempo estimado: 3 semanas de diseño + 4,5 meses de desarrollo aprox.
