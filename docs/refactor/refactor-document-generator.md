C:\Users\amuni\Desktop\josanz-proyect\josanz-erp\apps\document-generator

C:\Users\amuni\Desktop\josanz-proyect\josanz-erp\libs


necesito crear una lib especifica para la app de docs etc y montar router y estrucutra como en el resto de apps el app docs deberia actuar como un shell necesito que examines todo y me des plan md para ejecutar refactor

por ejemplo deberian funcionar como estas apps

C:\Users\amuni\Desktop\josanz-proyect\josanz-erp\apps\frontend
C:\Users\amuni\Desktop\josanz-proyect\josanz-erp\apps\josanz-web-app
El usuario quiere crear una librería específica para la app de documentos y montar router y estructura similar a otras apps. Necesito examinar el workspace actual para entender la estructura existente. Vamos a explorar:

La app document-generator existente
La estructura de libs
Las apps frontend y josanz-web-app como referencia
Primero, déjame cargar la skill de nx-workspace para entender mejor el workspace, y luego explorar las estructuras.

Voy a examinar la estructura actual del workspace para entender cómo están organizadas las apps y libs, y desarrollar un plan de refactor.

Ahora voy a explorar el workspace para entender la estructura de las apps existentes.

Command
nx show projects --json
Output
["feature-list","josanz-events-feature-list","inventory-data-access","josanz-stock-feature-list","josanz-users-feature-list","verifactu-data-access","delivery-data-access","identity-data-access","projects-data-access","billing-data-access","clients-data-access","document-generator-backend","rentals-data-access","budget-data-access","fleet-data-access","shell","ai-insights-feature","shared-integrations-storage","document-generator-feature","josanz-stock-shell","josanz-users-shell","dashboard-feature","inventory-feature","shared-integrations-email","verifactu-feature","delivery-feature","identity-feature","projects-feature","receipts-feature","services-feature","settings-feature","verifactu-adapters","billing-feature","clients-feature","rentals-feature","reports-feature","budget-feature","inventory-backend","inventory-core","verifactu-core","audit-feature","dashboard-shell","delivery-backend","delivery-core","fleet-feature","identity-backend","identity-core","inventory-shell","projects-backend","projects-core","receipts-backend","receipts-core","services-backend","services-core","verifactu-shell","billing-backend","billing-core","clients-backend","clients-core","delivery-shell","identity-shell","inventory-api","projects-shell","receipts-shell","rentals-backend","rentals-core","services-shell","settings-shell","verifactu-api-lib","billing-shell","budget-backend","budget-core","clients-shell","delivery-api","identity-api","projects-api","receipts-api","rentals-shell","reports-shell","services-api","billing-api","budget-shell","clients-api","events-shell","fleet-backend","fleet-core","rentals-api","shared-data-access","shared-infrastructure","audit-shell","babooni-ui","budget-api","fleet-shell","fleet-api","josanz-ui","shared-config","shared-events","shared-model","shared-ui-shell","shared-utils","events-feature","ui-kit","theme-manager","ai-core","shared-cqrs","document-generator","josanz-web-app-e2e","verifactu-worker","josanz-web-app","saas-platform","verifactu-api","frontend-e2e","storybook-static","frontend","backend","@josanz-erp/source"]
Ahora necesito examinar las apps de referencia (frontend, josanz-web-app) y el document-generator actual para entender la estructura. También necesito ver cómo están organizadas las libs.

Let me examine the document-generator app structure, and compare it with the frontend and josanz-web-app apps to understand the desired pattern.

Ahora necesito ver la estructura del src de document-generator y comparar con frontend y josanz-web-app.

Ahora veamos las apps de referencia - frontend y josanz-web-app - para entender la estructura de shell/feature que debo seguir.

Ahora veamos la estructura del frontend y josanz-web-app para entender el patrón shell.

Ahora veo que frontend es un shell simple sin mucha lógica en su propio código. Veamos josanz-web-app para comparar también.

Now let me check the libs structure to understand how shell and feature libs are organized. Let me look at some shell libs and feature libs to understand the pattern.

Déjame examinar más archivos de la app document-generator para entender su estructura actual, y también los shells existentes para entender el patrón que debo seguir.

Veo que document-generator tiene su propio código de UI. Ahora necesito ver cómo están estructuradas las shell apps (frontend, josanz-web-app) y sus dependencias. Vamos a ver las rutas y estructura de frontend.

Ahora veamos los archivos de configuración de la app, el app.config.ts y el main-app-shell.component.ts

File not found
C:\Users\amuni\Desktop\josanz-proyect\josanz-eps\apps\document-generator\src\app\app.config.ts
Tengo un error de tipeo. Déjame corregir la ruta.

Ahora necesito ver la estructura de una shell app para entender el patrón. Voy a revisar una shell existente como dashboard-shell o inventory-shell.

Ahora veamos los shells existentes para entender la arquitectura:

El frontend tiene una estructura más minimalista. Veamos los shell apps para entender el patrón:

Ahora veo el patrón. Las apps como frontend usan el patrón shell + feature. Voy a examinar una shell para entender la estructura.

Ahora necesito ver la estructura de los shell existentes para entender el patrón. Voy a revisar los archivos de un shell existente como projects-shell.

Let me search for shell patterns in the workspace.

Let me look at the shell structure in libs to understand the pattern better.

Command
nx show projects --type lib --json | jq -r '.[]' | Where-Object { $_ -match 'shell$' }
Output
jq : El t�rmino 'jq' no se reconoce como nombre de un cmdlet, funci�n, archivo de script o programa ejecutable. 
Compruebe si escribi� correctamente el nombre o, si incluy� una ruta de acceso, compruebe que dicha ruta es correcta e 
int�ntelo de nuevo.
En l�nea: 1 Car�cter: 38
+ nx show projects --type lib --json | jq -r '.[]' | Where-Object { $_  ...
+                                      ~~
    + CategoryInfo          : ObjectNotFound: (jq:String) [], CommandNotFoundException
    + FullyQualifiedErrorId : CommandNotFoundException
 
jq no está disponible, usaré PowerShell nativo.

Command
nx show projects --type lib --json
Output
["feature-list","josanz-events-feature-list","inventory-data-access","josanz-stock-feature-list","josanz-users-feature-list","verifactu-data-access","delivery-data-access","identity-data-access","projects-data-access","billing-data-access","clients-data-access","document-generator-backend","rentals-data-access","budget-data-access","fleet-data-access","shell","ai-insights-feature","shared-integrations-storage","document-generator-feature","josanz-stock-shell","josanz-users-shell","dashboard-feature","inventory-feature","shared-integrations-email","verifactu-feature","delivery-feature","identity-feature","projects-feature","receipts-feature","services-feature","settings-feature","verifactu-adapters","billing-feature","clients-feature","rentals-feature","reports-feature","budget-feature","inventory-backend","inventory-core","verifactu-core","audit-feature","dashboard-shell","delivery-backend","delivery-core","fleet-feature","identity-backend","identity-core","inventory-shell","projects-backend","projects-core","receipts-backend","receipts-core","services-backend","services-core","verifactu-shell","billing-backend","billing-core","clients-backend","clients-core","delivery-shell","identity-shell","inventory-api","projects-shell","receipts-shell","rentals-backend","rentals-core","services-shell","settings-shell","verifactu-api-lib","billing-shell","budget-backend","budget-core","clients-shell","delivery-api","identity-api","projects-api","receipts-api","rentals-shell","reports-shell","services-api","billing-api","budget-shell","clients-api","events-shell","fleet-backend","fleet-core","rentals-api","shared-data-access","shared-infrastructure","audit-shell","babooni-ui","budget-api","fleet-shell","fleet-api","josanz-ui","shared-config","shared-events","shared-model","shared-ui-shell","shared-utils","events-feature","ui-kit","theme-manager","ai-core","shared-cqrs","storybook-static"]
Ahora veo que hay varios tipos de libs:

document-generator-feature - parece ser la feature existente
document-generator-backend - backend
shell - parece ser un shell genérico
document-* - document generator related
Necesito examinar una estructura de shell existente para entender el patrón.

File not found
C:\Users\amuni\Desktop\josanz-proyect\josanz-erp\libs\browser\shared\shell\src\index.ts
Let me find the correct path for the shell library.

Veo que hay una estructura de shells existente. Vamos a examinar uno de ellos para entender la arquitectura de shells.

Ahora veo la estructura de los shell. Los shell son librerías, no apps. Vamos a ver la estructura de un shell típico (projects-shell) para entender cómo están organizados.

Ahora veamos el contenido de este archivo de rutas del shell y el index para entender la estructura.

Now I understand the pattern. Let me examine more shell patterns and the document-generator-feature to understand what needs to be extracted.

Ahora entiendo la estructura. Los shells son librerías que solo exportan rutas y no tienen componentes propios. Son wrappers para los features. Ahora necesito ver la estructura de una feature para entender mejor el patrón.

Ahora voy a ver la estructura del document-generator-feature que ya existe para entender qué contenido tiene.

File not found
C:\Users\amuni\Desktop\josanz-proyect\josanz-erp\libs\browser\feature\document-generator\feature\project.json
Let me check the document-generator related libs that already exist.

Ahora tengo una imagen más clara. Hay:

document-generator-backend (libs/node/backend/document-generator-backend) - un backend para generación de PDF
document-generator-feature (libs/browser/feature/document-generator) - una feature para documentos
document-generator (apps/document-generator) - la app standalone actual
Pero falta document-generator-shell - una lib de tipo shell para la app.

Voy a examinar más la estructura de la document-generator-feature para entender cómo está organizada.

Ahora entiendo la estructura. Ya existe un document-generator-feature pero NO un document-generator-shell. Vamos a ver qué contiene la feature actual y cómo está estructurada.

Ahora necesito ver la estructura de los feature de otros módulos para comparar. Voy a revisar el projects-feature como ejemplo.

Let me check the projects feature structure to understand the typical pattern better.

Let me search for the projects feature to understand the structure

Let me check the directory structure for the projects feature more carefully.

Command
Get-ChildItem -Path "libs\browser\feature" -Directory | Select-Object -First 20
Output


    Directorio: C:\Users\amuni\Desktop\josanz-proyect\josanz-erp\libs\browser\feature


Mode                 LastWriteTime         Length Name                                                                 
----                 -------------         ------ ----                                                                 
d-----        08/04/2026      3:27                ai-insights                                                          
da----        07/04/2026     15:03                audit                                                                
da----        07/04/2026     15:03                billing                                                              
da----        23/05/2026      0:54                budget                                                               
da----        23/05/2026      0:54                clients                                                              
da----        07/04/2026     15:03                dashboard                                                            
da----        23/05/2026      0:54                delivery                                                             
d-----        23/05/2026      0:54                document-generator                                                   
d-----        23/05/2026      0:54                events                                                               
da----        07/04/2026     15:03                fleet                                                                
da----        07/04/2026     15:03                identity                                                             
da----        07/04/2026     15:03                inventory                                                            
da----        07/04/2026     15:03                projects                                                             
da----        07/04/2026     15:03                receipts                                                             
da----        07/04/2026     15:03                rentals                                                              
da----        07/04/2026     15:03                reports                                                              
da----        07/04/2026     15:03                services                                                             
da----        07/04/2026     15:03                settings                                                             
d-----        27/05/2026     15:59                staff                                                                
d-----        23/05/2026      0:54                stock                                                                


Ahora entiendo la estructura. Los features están en libs/browser/feature/<name> y los shells en libs/browser/shell/<name>/shell. Veamos un ejemplo de feature y shell para entender mejor el patrón.

Let me look at the structure of the projects feature to understand the pattern better.

Command
Get-ChildItem -Path "libs\browser\feature\projects" -Recurse -File | Select-Object -First 30
Output


    Directorio: C:\Users\amuni\Desktop\josanz-proyect\josanz-erp\libs\browser\feature\projects\feature


Mode                 LastWriteTime         Length Name                                                                 
----                 -------------         ------ ----                                                                 
-a----        29/05/2026     15:35            745 jest.config.cts                                                      
-a----        23/05/2026      0:54            735 project.json                                                         
-a----        07/04/2026     16:03            784 tsconfig.json                                                        
-a----        07/04/2026     15:07            403 tsconfig.lib.json                                                    
-a----        07/04/2026     15:07            397 tsconfig.spec.json                                                   


    Directorio: C:\Users\amuni\Desktop\josanz-proyect\josanz-erp\libs\browser\feature\projects\feature\src


Mode                 LastWriteTime         Length Name                                                                 
----                 -------------         ------ ----                                                                 
-a----        09/04/2026     19:45             35 index.ts                                                             
-a----        09/04/2026     19:45            179 test-setup.ts                                                        


    Directorio: C:\Users\amuni\Desktop\josanz-proyect\josanz-erp\libs\browser\feature\projects\feature\src\lib


Mode                 LastWriteTime         Length Name                                                                 
----                 -------------         ------ ----                                                                 
-a----        23/05/2026      0:54            793 lib.routes.ts                                                        


    Directorio: 
    C:\Users\amuni\Desktop\josanz-proyect\josanz-erp\libs\browser\feature\projects\feature\src\lib\projects-detail


Mode                 LastWriteTime         Length Name                                                                 
----                 -------------         ------ ----                                                                 
-a----        23/05/2026      0:54          18579 projects-detail.component.ts                                         


    Directorio: 
    C:\Users\amuni\Desktop\josanz-proyect\josanz-erp\libs\browser\feature\projects\feature\src\lib\projects-list


Mode                 LastWriteTime         Length Name                                                                 
----                 -------------         ------ ----                                                                 
-a----        23/05/2026      0:54          28916 projects-list.component.ts                                           


Ahora entiendo la estructura. Las features están en libs/browser/feature/{name}/feature/. Voy a examinar una feature completa para entender la estructura de routes.

Ahora entiendo la estructura. Veo que:

Los shell son librerías que solo tienen rutas y exportan un archivo index.ts
Los feature tienen los componentes y la lógica
Ahora necesito ver la estructura del document-generator en apps y entender qué componentes están ahí para poder extraerlos a una lib de tipo feature o shell.

Voy a revisar la estructura del document-generator-feature existente y ver qué hay en app/document-generator.routes.ts

Ahora entiendo la estructura. El document-generator.routes.ts contiene las rutas específicas del feature, pero está dentro de la app. En el patrón estándar, las rutas del feature deberían estar en una librería separada (document-generator-feature).

Voy a revisar más detalles:

El document-generator-feature - ¿qué contiene exactamente?
La estructura del projects-shell vs el document-generator-backend
El layout actual
Necesito ver el archgivo del feature actual y también cómo está el document-generator-backend.

Now I have a good understanding of the architecture. Let me look at a few more things to understand the data access layer and check the nx.json for the workspace-level configuration.

Ahora tengo una buena comprensión de la estructura. Voy a revisar el app.html y algunos archivos de layout para entender mejor la estructura actual:

Ahora voy a revisar el frontend app.ts para ver cómo está estructurado también:

Ahora tengo una buena visión del estado actual. Voy a examinar más detalles sobre:

La estructura de los shells existentes
Los layouts
El document-generator-layout component actual
Ahora tengo una buena comprensión de la estructura. Voy a examinar más detalles para completar el plan de refactor:

La app document-generator tiene routing y componentes dentro de apps/document-generator/src/app/
Existe ya una lib document-generator-feature pero está vacía (solo tiene un component dummy)
La estructura de shell es: libs/browser/shell/{scope}/{shell}/ con lib.routes.ts que exporta las rutas
Necesito revisar:

El estructo de las demás shells
Qué componentes deben ir a la feature vs al shell
La estructura de layout y app
Ahora tengo una imagen más clara de la arquitectura. Necesito ver más ejemplos de shell para entender mejor el patrón. También quiero ver los archivos de layout y la estructura del document-generator app para hacer el plan completo.

Ahora entiendo mejor la arquitectura. El identity-shell tiene un componente Shell. Déjame ver más ejemplos de shell con layout.

Ahora tengo una imagen clara de la estructura. Voy a examinar el identity-shell más a fondo para ver cuál es la estructura completa.

Ahora entiendo mejor la estructura. El identity-shell tiene rutas separadas para identity y users.

Voy a ver el archivo identity.routes.ts y también examine más a fondo la estructura de carpetas en libs.

Ahora tengo una imagen clara de la arquitectura. Voy a examinar más archivos para entender completamente el patrón.

Ahora tengo una vista más clara. Veo que:

identity-shell exporta identityRoutes y usersRoutes desde lib/identity.routes.ts
El shell component es básicamente un wrapper vacío
Ahora necesito ver la estructura del shared-ui-shell para entender mejor el patrón de shell:

File not found
C:\Users\amuni\Desktop\josanz-proyect\josanz-erp\libs\browser\shell\shared-ui\shell\project.json
Ahora tengo una buena comprensión de la arquitectura. Voy a generar un plan de refactor completo.

Ahora tengo una visión clara de la arquitectura. Voy a crear el plan de refactor.

Ahora tengo toda la información necesaria. Voy a crear un plan de refactor completo basado en el patrón arquitectónico del workspace.

Resumen de lo que he encontrado:

Arquitectura actual de document-generator app:
App standalone con toda la lógica en apps/document-generator/src/app/
Rutas definidas en app.routes.ts y document-generator.routes.ts
Layout propio con header/navigation en document-generator-layout.component.ts
Feature document-generator-feature existe pero está vacío (solo componente vacío)
Backend document-generator-backend para el API
Patrón de arquitectura del workspace:
Las apps son "shells" que orquestan features
Cada dominio tiene: shell + feature + data-access + api + backend + core
Ejemplo: projects → projects-shell + projects-feature + projects-data-access + projects-api + projects-backend + projects-core
Los shells tienen solo routing (lib.routes.ts) que delega en features
Los features tienen los componentes y lógica de negocio
Estructura esperada para document-generator:
document-generator-shell → routing que delega en document-generator-feature
document-generator-feature → componentes y rutas actuales (document-generator.routes.ts)
document-generator-data-access → servicios de estado/persistencia
document-generator-api → cliente HTTP
document-generator-core → modelos de dominio
document-generator-backend → ya existe ✓
App document-generator debería ser un shell puramente:
Solo orquestar el shell de document-generator
Layout compartido o propio minimalista
Routing similar a frontend app (pero solo para document-generator)
El refactor implica migrar los componentes y rutas actuales a la nueva estructura de feature, crear los shells correspondientes, establecer las dependencias adecuadas entre capas y actualizar la app para que actúe como coordinador del nuevo flujo de navegación.

Ahora tengo toda la información necesaria. Aquí tienes el plan de refactor completo para la app document-generator:

📋 Plan de Refactor: document-generator
🎯 Objetivo
Transformar document-generator app en un shell de routing siguiendo la arquitectura modular del workspace, separando:

Shell → solo routing y composición
Feature → componentes y lógica de negocio actuales
Data Access → servicios de estado y persistencia
API → cliente HTTP para comunicación backend
📁 Estructura Actual vs Objetivo
Actual:
apps/document-generator/
├── src/app/
│   ├── app.routes.ts          ← rutas con toda la lógica
│   ├── document-generator.routes.ts ← rutas del feature
│   ├── document-generator-layout.component.ts
│   ├── document-*.component.ts (20+ componentes)
│   ├── services/*.ts (12 servicios)
│   ├── guards/
│   └── ... (todo mezclado)

libs/browser/feature/document-generator/  ← feature vacío (solo stub)
libs/node/backend/document-generator-backend/ ← API backend (OK)
Objetivo:
libs/browser/shell/document-generator/
└── src/lib/lib.routes.ts      ← solo routing del shell

libs/browser/feature/document-generator/
└── src/lib/
    ├── document-generator.routes.ts ← rutas actuales
    ├── + page components (de apps/)
    └── + services (de apps/)

libs/browser/data-access/document-generator/
└── src/lib/
    └── + servicios de estado/persistencia

libs/browser/api/document-generator/
└── src/lib/
    └── + cliente HTTP (apis)

libs/isomorphic/core/document-generator/
└── src/lib/
    └── + modelos de dominio

apps/document-generator/
├── src/app/
│   ├── app.routes.ts          ← shell entry point
│   ├── main-app-shell.component.ts (simplificado)
│   └── app.config.ts (limpio)
🔄 Pasos de Refactor
Fase 1: Crear libs nuevas
Librería	Tipo	Tags	Acción
document-generator-shell	library	scope:document-generator, type:shell	Generar con Nx
document-generator-data-access	library	scope:document-generator, type:data-access	Generar con Nx (opcional, si hay estado)
document-generator-api	library	scope:document-generator, type:api	Generar con Nx (opcional)
document-generator-core	library	scope:document-generator, type:core	Generar con Nx (opcional)
Fase 2: Migración de código
Mover document-generator.routes.ts a feature
De: apps/document-generator/src/app/
A: libs/browser/feature/document-generator/src/lib/document-generator.routes.ts
Mover componentes a feature
document-create/ (editor, toolbar, canvas, etc.)
document-list/
document-preview/
document-analysis/
document-ai-settings/
document-agent-settings/
floating-assistant/
guards/* (excepto auth guards genéricos)
Mover servicios a feature o data-access
Servicios de UI (tema, render, pdf): feature
Servicios de datos/persistencia: data-access
Crear rutas del shell
document-generator-shell/src/lib/lib.routes.ts:
export const documentGeneratorShellRoutes: Route[] = [
  { path: '', loadChildren: () => import('@josanz-erp/document-generator-feature').then(m => m.documentGeneratorRoutes) }
];
Fase 3: Actualizar app shell
app.routes.ts (shell puro):

import { Route } from '@angular/router';
import { MainAppShellComponent } from './main-app-shell.component';
import { NotFoundComponent } from './not-found.component';

export const appRoutes: Route[] = [
  { path: '', redirectTo: 'documents', pathMatch: 'full' },
  {
    path: 'documents',
    component: MainAppShellComponent,
    children: [
      { path: '', loadChildren: () => import('@josanz-erp/document-generator-shell').then(m => m.documentGeneratorShellRoutes) }
    ]
  },
  { path: 'not-found', component: NotFoundComponent },
  { path: '**', redirectTo: '/not-found' }
];
app.config.ts (limpiar):

Mantener: interceptors genéricos, lucide icons, verifactu API
Quitar: iconos específicos del feature (dejar en feature)
Fase 4: Actualizar project.json
Agregar implicitDependencies:

"implicitDependencies": [
  "document-generator-shell",
  "document-generator-feature",
  "document-generator-data-access",
  "document-generator-api",
  "document-generator-core"
]
Fase 5: Cleanup app
Eliminar componentes/pages movidos
Mantener solo: main.ts, app.ts, app.config.ts, app.routes.ts, main-app-shell.component.ts (simplificado)
Mantener environments/
🛠 Comandos Nx para generar libs
# Shell
npx nx generate @nx/angular:library \
  --name=document-generator-shell \
  --directory=browser/shell/document-generator \
  --prefix=lib \
  --style=css \
  --standalone=true

# Feature (actualizar package.json existente)
# No generar, usar libs/browser/feature/document-generator existente

# Data Access
npx nx generate @nx/angular:library \
  --name=document-generator-data-access \
  --directory=browser/data-access/document-generator \
  --prefix=lib \
  --style=none

# API
npx nx generate @nx/angular:library \
  --name=document-generator-api \
  --directory=browser/api/document-generator \
  --prefix=lib \
  --style=none
⚠️ Consideraciones
Layout: El DocumentGeneratorLayoutComponent puede quedarse en feature (es específico del feature) o moverse a shared-ui-shell si se reusa
Guard openAssistantRedirectGuard: Mover a feature (específico del document-generator)
Servicios de theme: Evaluar si mover a shared/theme-manager o mantener en feature
Imports actuales: Verificar todos los imports @josanz-erp/document-generator-* y actualizar rutas
📊 Comparativa con otras apps
App	Arquitectura
frontend	Shell → shell libs (projects-shell, dashboard-shell, etc.) → feature libs
josanz-web-app	Similar a frontend pero con estructura diferente
document-generator (actual)	Todo en app, feature vacío
document-generator (objetivo)	Shell → document-generator-shell → document-generator-feature
¿Quieres que ejecute este refactor o prefieres revisar algún punto específico antes?

quiero el documento md con todo el refactor para ejecutar por pasos primero tenerlo en algun lugar guardado
El usuario quiere que guarde el plan de refactor en un archivo MD. Como soy read-only, no puedo escribir archivos. Necesito indicarle esto y sugerirle que lo guarde manualmente o que use un agente que pueda escribir.

No puedo guardar archivos en este entorno (soy read-only). Necesitas que el plan se guarde manualmente. Aquí tienes las opciones:

Opción 1: Copiar y pegar
Puedes copiar el contenido del plan y guardarlo en:

docs/refactor-document-generator.md (recomendado)
.kilo/plans/document-generator-refactor.md
Opción 2: Usar un agente con permisos de escritura
Si deseas ejecutar el refactor, necesitas cambiar a un agente que sí pueda escribir archivos.

Resumen rápido del plan:
El refactor implica 5 fases:

Crear librerías: document-generator-shell, data-access, api, core
Migrar código: Mover componentes y servicios de apps/document-generator/src/app/ a las librerías correspondientes
Actualizar app: Dejar solo el shell en la app (app.routes.ts, main-app-shell.component.ts)
Actualizar dependencies: Modificar project.json con implicitDependencies
Cleanup: Eliminar código duplicado/migrado
Comandos listos para ejecutar (cuando tengas un agente con permisos):
# 1. Generar shell
npx nx generate @nx/angular:library --name=document-generator-shell --directory=browser/shell/document-generator --prefix=lib --standalone=true

# 2. Generar data-access  
npx nx generate @nx/angular:library --name=document-generator-data-access --directory=browser/data-access/document-generator --prefix=lib

# 3. Generar api
npx nx generate @nx/angular:library --name=document-generator-api --directory=browser/api/document-generator --prefix=lib