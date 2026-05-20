# Backend Testing

Las apps backend prueban bootstrap, módulos raíz y wiring de infraestructura. Las libs bajo `libs/node/backend/**` prueban la lógica propia de cada bounded context.

Convención:

- `*.spec.ts`: unitarios de services, controllers, mappers y repositorios con mocks.
- `*.integration.spec.ts`: integración de módulo Nest, repositorio contra test DB o flujo con varios providers reales.
- `src/lib/**/__tests__/fixtures.ts` o `src/testing/*`: factories y mocks reutilizables del contexto.
- Evitar tocar bases reales en unitarios. Si una prueba necesita Prisma real, debe ser `*.integration.spec.ts` y documentar setup/env.

Comandos útiles desde la raíz:

```bash
pnpm test:backend:libs
pnpm test:backend:clients
pnpm test:backend:affected
pnpm test:backend
```
