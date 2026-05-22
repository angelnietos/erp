# Feature Testing

Las apps prueban ensamblaje (rutas raíz, guards globales, shell). Las feature libs prueban el comportamiento de cada módulo.

Convención:

- `*.spec.ts`: unitarios de componentes, helpers, rutas y mapeos puros.
- `*.integration.spec.ts`: flujo Angular con `Router`, formularios, servicios reales o varios componentes colaborando.
- Evitar duplicar tests de shell en la app. Si la lógica vive en `libs/browser/feature/...`, el test debe vivir junto a esa feature.

Comandos útiles desde la raíz:

```bash
pnpm test:features
pnpm test:features:josanz
pnpm test:josanz-web-app
pnpm test:affected
```
