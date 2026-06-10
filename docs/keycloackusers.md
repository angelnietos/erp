# Configurar usuarios en Keycloak

## Configuración automática (Recomendado)

El proyecto ya incluye configuración automática de Keycloak mediante importación de realm. El usuario `admin` con contraseña `admin123` está predefinido en `docker/keycloak/realms/josanz-web-app-realm.json`.

Al ejecutar `docker-compose up`, Keycloak importará automáticamente el realm y creará el usuario con sus roles asignados.

## Configuración manual (UI Web)

1. Entra a la Consola de Administración de Keycloak:
   - Abre en tu navegador: http://localhost:8081
   - Usuario: admin
   - Contraseña: admin

2. Selecciona el Realm correcto:
   - En la esquina superior izquierda, haz clic en el menú desplegable (que por defecto dice master)
   - Selecciona `josanz-web-app-realm`

3. Crea el usuario:
   - En el menú lateral izquierdo, haz clic en Users y luego en el botón Add user
   - Rellena el campo Username (ej: admin)
   - Haz clic en Create

4. Establece la Contraseña:
   - Ve a la pestaña Credentials en la parte superior
   - Haz clic en Set password
   - Introduce la contraseña deseada
   - **IMPORTANTE**: Desmarca la casilla Temporary
   - Haz clic en Save y confirma

5. (Opcional) Asignar Roles de ERP:
   - Ve a la pestaña Role mapping del usuario
   - Asigna el rol `admin` o `TenantAdmin`

## Automatización sin UI (REST API)

```bash
# Obtener token de admin
TOKEN=$(curl -s -X POST "http://localhost:8081/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin" \
  -d "password=admin" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" | jq -r .access_token)

# Crear usuario
USER_ID=$(curl -s -X POST "http://localhost:8081/admin/realms/josanz-web-app-realm/users" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","enabled":true}' | jq -r .id)

# Asignar password
curl -X PUT "http://localhost:8081/admin/realms/josanz-web-app-realm/users/$USER_ID/reset-password" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"password","value":"admin","temporary":false}'
```

## Automatización con kcadm.sh

```bash
kcadm.sh config credentials \
  --server http://localhost:8081 \
  --realm master \
  --user admin \
  --password admin

kcadm.sh create users -r josanz-web-app-realm \
  -s username=admin \
  -s enabled=true

kcadm.sh set-password -r josanz-web-app-realm \
  --username admin \
  --new-password admin \
  --temporary=false
```

## Importar realm (Docker)

El realm se importa automáticamente con la opción `--import-realm`. Puedes modificar `docker/keycloak/realms/josanz-web-app-realm.json` para añadir usuarios:

```json
{
  "username": "admin",
  "enabled": true,
  "credentials": [
    {
      "type": "password",
      "value": "admin",
      "temporary": false
    }
  ]
}
```