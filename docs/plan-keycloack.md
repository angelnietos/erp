lan: Integración de Keycloak con Pantalla de Login Actual y Fallback
Este plan detalla cómo habilitar el inicio de sesión con Keycloak utilizando los campos de entrada de la pantalla de login actual (email y contraseña), de modo que primero se intente iniciar sesión contra Keycloak (Direct Grant) y, en caso de fallo, se realice un fallback transparente al inicio de sesión antiguo/tradicional.

User Review Required
IMPORTANT

Compatibilidad de Firmas de Token (JWKS): Dado que Keycloak firma los tokens con algoritmos de clave pública (RS256) y el ERP actual usa un secreto simétrico local (JWT_SECRET), el backend (HybridJwtStrategy) fallará al validar la firma de los tokens de Keycloak a menos que se configure dinámicamente el proveedor de claves (jwks-rsa). Modificaremos HybridJwtStrategy para consultar el endpoint certs de Keycloak cuando detecte un token de Keycloak.

NOTE

Requisitos de Keycloak: Para que el login Direct Grant funcione en Keycloak:

El cliente josanz-web-app-spa en Keycloak debe tener habilitado el flujo de Direct Access Grants (Direct Grant Flow).
Los usuarios deben estar registrados en Keycloak o sincronizados (de lo contrario, fallará la validación en Keycloak y se recurrirá al fallback tradicional).
Proposed Changes
Componente: Frontend Configurations & Services
[MODIFY] 
environment.ts
Añadir la configuración de Keycloak para el entorno de desarrollo:

typescript

  keycloak: {
    url: 'http://localhost:8081',
    realm: 'josanz-web-app-realm',
    clientId: 'josanz-web-app-spa',
    enabled: true,
  },
[MODIFY] 
environment.prod.ts
Añadir la configuración correspondiente para producción:

typescript

  keycloak: {
    url: '',
    realm: 'josanz-web-app-realm',
    clientId: 'josanz-web-app-spa',
    enabled: false,
  },
[MODIFY] 
auth.service.ts
Modificar el método login para que si environment.keycloak?.enabled es true, intente realizar una petición POST al endpoint de token de Keycloak usando el flujo de Direct Grant (grant_type=password).
Decodificar el token obtenido usando el ayudante decodeJwtPayload y mapear los roles y permisos del token de Keycloak a los roles de Josanz ERP (platformAdmin / clientAdmin) de la misma forma que lo hace el backend.
Si la autenticación con Keycloak falla, atrapar el error mediante catchError y realizar una llamada de fallback al endpoint tradicional /api/auth/login.
Componente: Backend Strategy Validation
[MODIFY] 
hybrid-jwt.strategy.ts
Modificar la definición de HybridJwtStrategy para pasar un secretOrKeyProvider dinámico en lugar de secretOrKey.
El secretOrKeyProvider decodificará el token entrante sin verificarlo para comprobar si el emisor (iss) contiene /realms/.
Si es un token de Keycloak, se utilizará passportJwtSecret de jwks-rsa apuntando al endpoint de certificados de Keycloak (http://localhost:8081/realms/josanz-web-app-realm/protocol/openid-connect/certs) para obtener la clave pública dinámica y verificar la firma RS256.
Si no es un token de Keycloak, se resolverá utilizando la clave simétrica local JWT_SECRET.
Verification Plan
Automated Tests
Ejecutar el build de frontend y backend para asegurar que compilan al 100%:
bash

npx nx build backend
npx nx build frontend
Manual Verification
Levantar la base de datos, Redis y Keycloak en Docker:
bash

docker compose up -d
Iniciar el backend y el frontend:
bash

npm run dev:backend
npm run dev:frontend
Probar el inicio de sesión con credenciales registradas en Keycloak (ej: admin/admin o usuario registrado manualmente en http://localhost:8081). El login debe tener éxito usando el flujo de Keycloak.
Probar el inicio de sesión con un usuario existente en la BD local del ERP pero no en Keycloak. Keycloak Direct Grant fallará, y la aplicación debe iniciar sesión correctamente haciendo uso del fallback tradicional.