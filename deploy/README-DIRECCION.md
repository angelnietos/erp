# Despliegue — lectura para dirección

## Documentos

| Documento | Contenido |
|-----------|-----------|
| [Comparativa SSH vs PaaS](../docs/deploy/comparativa-ssh-vs-paas.md) | Coste, atraso operativo vs Railway/Vercel/Azure |
| [Guía interna vs deploy GitHub](../docs/deploy/guia-interna-vs-deploy-github.md) | Clave por dev **y servidor distinto** al de `DEPLOY_HOST` en Actions |

Resumen: el VPS ahorra poco en factura; el deploy por GitHub **no debería** exigir SSH manual a cada desarrollador.

Documentación operativa (infra SSH obligatoria):

- [Guía SSH servidores](../docs/deploy/ssh-servers.md)
- [README técnico de deploy](./README.md)
