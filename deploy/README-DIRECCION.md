# Despliegue — lectura para dirección

## Documentos

| Documento | Contenido |
|-----------|-----------|
| [Lo que perdemos sin PaaS](../docs/deploy/lo-que-perdemos-sin-paas.md) | **Rollback, logs, previews, manual vs auto** — gaps del modelo actual |
| [Servidor único — SSH + GitHub Actions](../docs/deploy/servidor-unico-ssh-y-cicd.md) | Plan para un solo VPS: claves del equipo + `DEPLOY_HOST` al mismo host |
| [Comparativa SSH vs PaaS](../docs/deploy/comparativa-ssh-vs-paas.md) | Coste, atraso operativo vs Railway/Vercel/Azure |
| [Guía interna vs deploy GitHub](../docs/deploy/guia-interna-vs-deploy-github.md) | Por qué hoy hay dos servidores / dos procedimientos |

Resumen: el VPS ahorra poco en factura; el deploy por GitHub **no debería** exigir SSH manual a cada desarrollador.

Documentación operativa (infra SSH obligatoria):

- [Guía SSH servidores](../docs/deploy/ssh-servers.md)
- [README técnico de deploy](./README.md)
