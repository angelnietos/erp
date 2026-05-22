# Agente del generador de documentos — memoria y Postgres (opcional)

## Comportamiento actual (frontend)

- **Skills genéricas** y **skills de usuario**, **perfil** y **notas de memoria** se guardan en **IndexedDB** (`josanz-document-agent`) vía Dexie en el navegador.
- El **system prompt** del redactor IA concatena esas instrucciones (ver `AgentPersonaService` y `DocumentAiService`).

## Base de datos en servidor (preparación)

Para equipos que necesiten **memoria compartida** o backup centralizado:

1. Copia variables si quieres contraseña distinta:

   `DOCUMENT_AGENT_DB_PASSWORD` (opcional; por defecto `josanz_agent_dev` en el compose).

2. Levanta Postgres:

   ```bash
   docker compose -f deploy/document-agent/docker-compose.yml up -d
   ```

3. Puerto host **5439** → Postgres **5432** en el contenedor. Base: `josanz_document_agent`, usuario: `josanz_agent`.

4. El script `init.sql` crea tablas `agent_profiles`, `agent_user_skills`, `agent_memory_notes`. **Aún no hay API Nest** que las consuma; el siguiente paso sería un módulo ligero con sync opcional y clave de usuario (SSO / API key).

## Enlace con la app

Hasta que exista backend: la UI en `/documents/settings/agent` solo usa IndexedDB. Cuando añadas API, puedes:

- Sincronizar al iniciar sesión (`external_user_key` = id estable del usuario).
- Mantener Dexie como caché offline.
