# BIPASS - Backend API

Servicio Backend en .NET para la plataforma BIPASS. Este componente gestiona el catálogo de entradas, precios, disponibilidades y la conectividad requerida por la aplicación web.

---

## Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de contar con las siguientes herramientas instaladas:

- .NET SDK (Versión 8.0 o superior)
- Git
- Un entorno de desarrollo como Visual Studio 2022 o Visual Studio Code

---

## Configuración e Instalación

1. Clonar el repositorio:
   git clone https://github.com/tu-usuario/tu-repo-backend.git

2. Navegar a la carpeta raíz del proyecto:
   cd tu-repo-backend

3. Restaurar los paquetes NuGet y dependencias:
   dotnet restore

4. Compilar la solución para verificar que no existan errores:
   dotnet build

---

## Ejecución del Servidor

Para iniciar la API en entorno de desarrollo local, ejecuta:

dotnet run

Una vez iniciada, la consola mostrará la URL local en la que está escuchando la API (por ejemplo: https://localhost:7000 o http://localhost:5000).

---

## Verificación de Puntos de Enlace (Endpoints)

- Si el proyecto incluye Swagger/OpenAPI, puedes acceder a la documentación interactiva en el navegador navegando a:
  https://localhost:7000/swagger
- El endpoint de prueba de conexión utilizado por el frontend responde en la ruta base o en el controlador configurado para validación de estado (health check).
