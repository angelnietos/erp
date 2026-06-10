Cómo configurar el usuario en Keycloak (Paso a Paso):
Entra a la Consola de Administración de Keycloak:

Abre en tu navegador: http://localhost:8081.
Inicia sesión con las credenciales de administrador (definidas en tu docker-compose.yml):
Usuario: admin
Contraseña: admin
Selecciona el Realm correcto:

En la esquina superior izquierda, haz clic en el menú desplegable (que por defecto dice master) y selecciona josanz-web-app-realm.
Crea el usuario:

En el menú lateral izquierdo, haz clic en Users y luego en el botón Add user.
Rellena el campo Username con admin (o el usuario que prefieras).
Haz clic en Create.
Establece la Contraseña:

Una vez creado el usuario, ve a la pestaña Credentials en la parte superior.
Haz clic en Set password.
Introduce la contraseña deseada (por ejemplo, admin o la que prefieras).
IMPORTANTE: Desmarca la casilla Temporary (para evitar que te pida cambiar la contraseña en el primer inicio de sesión).
Haz clic en Save y confirma.
(Opcional) Asignar Roles de ERP:

Si quieres que el usuario tenga permisos de administrador en el ERP, ve a la pestaña Role mapping del usuario.
Asigna el rol admin o TenantAdmin (los cuales están mapeados en el ERP para otorgar el rol clientAdmin y sus permisos).
Una vez hecho esto, vuelve a intentar el acceso en el login del ERP y debería autenticarte exitosamente contra Keycloak.