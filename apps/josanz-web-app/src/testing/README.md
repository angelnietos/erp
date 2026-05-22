# Testing josanz-web-app

Estructura recomendada:

- `*.spec.ts`: pruebas unitarias de servicios, componentes y configuración pura.
- `*.integration.spec.ts`: pruebas que conectan varias piezas Angular (Router, guards, servicios reales).
- `src/testing/*`: helpers compartidos solo para tests.

Ejecutar:

```bash
pnpm exec nx test josanz-web-app --configuration=ci
```
