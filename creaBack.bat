@echo off
chcp 65001 > nul
echo ===================================================
echo Creando estructura del proyecto Backend (Node.js)
echo ===================================================

:: 1. Crear carpetas principales
mkdir src\config
mkdir src\controllers
mkdir src\routes
mkdir src\middlewares
mkdir src\docs

echo [+] Carpetas creadas correctamente.

:: 2. Crear archivos dentro de src/config
echo /* ^| Nombre: supabase.js ^| Finalidad: Inicializa y exporta el cliente de Supabase para la conexión a la BD y Auth. */ > src\config\supabase.js

:: 3. Crear archivos dentro de src/controllers
echo /* ^| Nombre: authController.js ^| Finalidad: Gestiona la lógica de registro, inicio de sesión y perfiles de usuario. */ > src\controllers\authController.js
echo /* ^| Nombre: bookController.js ^| Finalidad: Gestiona la obtención del catálogo de libros y archivos digitales. */ > src\controllers\bookController.js
echo /* ^| Nombre: orderController.js ^| Finalidad: Controla la creación de órdenes de compra y subida de comprobantes. */ > src\controllers\orderController.js
echo /* ^| Nombre: adminController.js ^| Finalidad: Maneja las acciones administrativas como aprobar pagos y generar facturas. */ > src\controllers\adminController.js

:: 4. Crear archivos dentro de src/routes
echo /* ^| Nombre: authRoutes.js ^| Finalidad: Define las rutas HTTP para autenticación y gestión de cuentas. */ > src\routes\authRoutes.js
echo /* ^| Nombre: bookRoutes.js ^| Finalidad: Define las rutas HTTP para consultar y gestionar el catálogo de libros. */ > src\routes\bookRoutes.js
echo /* ^| Nombre: orderRoutes.js ^| Finalidad: Define las rutas HTTP para el proceso de órdenes y subida de pagos. */ > src\routes\orderRoutes.js
echo /* ^| Nombre: adminRoutes.js ^| Finalidad: Define las rutas HTTP protegidas exclusivas para el rol de administrador. */ > src\routes\adminRoutes.js

:: 5. Crear archivos dentro de src/middlewares
echo /* ^| Nombre: authMiddleware.js ^| Finalidad: Valida tokens JWT y restringe accesos según el rol (cliente/admin). */ > src\middlewares\authMiddleware.js

:: 6. Crear archivos dentro de src/docs
echo /* ^| Nombre: swagger.js ^| Finalidad: Configura las opciones y esquemas de documentación de la API con Swagger. */ > src\docs\swagger.js

:: 7. Crear archivos raíz en src
echo /* ^| Nombre: app.js ^| Finalidad: Configura la aplicación Express, middlewares globales, rutas y Swagger. */ > src\app.js
echo /* ^| Nombre: server.js ^| Finalidad: Arranca el servidor HTTP escuchando en el puerto configurado. */ > src\server.js

echo [+] Archivos y comentarios iniciales creados con éxito.
echo ===================================================
echo ¡Estructura lista! Ahora inicializa npm y las dependencias.
echo ===================================================
pause