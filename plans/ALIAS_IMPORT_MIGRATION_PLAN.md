# Plan de Migracion de Imports a Alias (`@josanz-erp/*`)

## Objetivo

Unificar todo el monorepo para que **todas las libs y apps importen por alias** (`@josanz-erp/...`) y eliminar imports relativos frágiles (`../../..`), mejorando mantenibilidad, refactors y consistencia arquitectónica.

## Alcance

- `apps/*`
- `libs/*`
- Código TypeScript (`.ts`, `.tsx`) y Angular standalone/modules.
- Incluye backend, frontend y verifactu.

## Regla Final (DoD)

- No se permiten imports relativos entre proyectos Nx (apps/libs).
- Todos los imports cross-project usan alias `@josanz-erp/<project>`.
- Solo se aceptan imports relativos **dentro del mismo proyecto** y carpeta cercana.

---

## Fase 1: Inventario y Contrato de Alias

1. Revisar `tsconfig.base.json` y completar `compilerOptions.paths` para **todos** los proyectos.
2. Estandarizar convención:
   - `@josanz-erp/<dominio>-api`
   - `@josanz-erp/<dominio>-data-access`
   - `@josanz-erp/<dominio>-feature`
   - `@josanz-erp/<dominio>-shell`
   - `@josanz-erp/<dominio>-core`
   - `@josanz-erp/<dominio>-adapters`
3. Cada proyecto debe tener `src/index.ts` como punto de entrada público.

### Checklist Fase 1

- [ ] Todos los `project` tienen alias en `tsconfig.base.json`
- [ ] Todos exponen `index.ts` con exports públicos
- [ ] No hay imports a rutas internas privadas de otro proyecto

---

## Fase 2: Migracion de Imports (codigo)

1. Reemplazar imports relativos cross-project por alias.
2. Evitar deep imports no públicos. Ejemplo:
   - ✅ `@josanz-erp/verifactu-adapters`
   - ❌ `@josanz-erp/verifactu-adapters/src/lib/...`
3. Ajustar barrels (`index.ts`) cuando falten exports.
4. Ejecutar build por app después de cada bloque de cambios.

### Orden recomendado

1. Frontend libs (`api`, `data-access`, `feature`, `shell`)
2. Backend módulos con core/adapters (`budget`, `inventory`, `identity`, `clients`)
3. Verifactu (`core`, `adapters`, `api`, `feature`, `shell`)
4. Resto (`rentals`, `delivery`, `fleet`) cuando tengan lógica real

---

## Fase 3: Enforcement (para que no vuelva a pasar)

Agregar reglas de lint para bloquear imports relativos prohibidos:

1. Mantener `@nx/enforce-module-boundaries`.
2. Añadir `no-restricted-imports` con patrones:
   - `../..`
   - `../../*`
   - `../../../*`
   - (ajustar para permitir relativos locales cortos dentro de la misma lib/app)
3. Definir `tags` en `project.json` (`scope`, `type`, `layer`) y constraints Nx:
   - `type:feature -> type:data-access|api`
   - `type:data-access -> type:api|core`
   - `type:adapters -> type:core`
   - `apps -> libs` (no apps entre sí salvo gateway explícito)

---

## Fase 4: Validacion CI

Pipeline mínimo:

1. `nx affected -t lint`
2. `nx affected -t build`
3. `nx affected -t test`

Y gate de PR:

- Si hay import relativo cross-project => falla lint.
- Si se usa deep import a ruta privada => falla lint.

---

## Tareas Tecnicas Concretas

1. Completar aliases faltantes en `tsconfig.base.json`.
2. Verificar `tsconfig.json` por proyecto (especialmente `libs/verifactu/*`) para resolución IDE/linter.
3. Exportar símbolos faltantes en `src/index.ts`.
4. Reemplazo masivo controlado de imports relativos por alias.
5. Añadir reglas ESLint de restricción.
6. Ejecutar build/lint completo y corregir.

---

## Riesgos y Mitigaciones

- **Riesgo:** romper imports por barrels incompletos.  
  **Mitigación:** completar exports antes del reemplazo masivo.

- **Riesgo:** ciclos entre libs al elevar imports.  
  **Mitigación:** apoyarse en puertos (`core`) + adapters y revisar graph Nx.

- **Riesgo:** falsos positivos de lint en relativos internos válidos.  
  **Mitigación:** patrones de excepción por proyecto y pruebas incrementales.

---

## Entregables

- `tsconfig.base.json` con aliases completos.
- `index.ts` públicos por proyecto.
- Código migrado a alias `@josanz-erp/*`.
- Reglas ESLint/Nx de enforcement activas.
- Build/lint/test verdes en CI.

---

## Comandos de apoyo

Auditar imports relativos potencialmente problemáticos:

```bash
rg "from ['\"]\\.{2}/\\.{2}" apps libs
```

Auditar deep imports a `src/lib`:

```bash
rg "@josanz-erp/.*/src/" apps libs
```

Validar workspace:

```bash
npx nx graph
npx nx run-many -t lint,build --all
```

---

## Criterio de Cierre

Se considera completado cuando:

1. No hay imports relativos cross-project en `apps/` y `libs/`.
2. Todos los imports entre proyectos usan alias `@josanz-erp/*`.
3. Lint/build/test pasan sin excepciones manuales.

