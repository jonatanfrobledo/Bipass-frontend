# BIPASS - Frontend Application

Interfaz web desarrollada en React y Bootstrap para la plataforma BIPASS. Permite la visualización de la propuesta de valor, filtrado de entradas presenciales y virtuales por modalidad, y la prueba de conectividad en tiempo real con la API Backend.

---

## Requisitos Previos

Asegúrate de tener instalado en tu sistema:

- Node.js (Versión 18.0.0 o superior)
- npm (Incluido con Node.js)
- Git
- Visual Studio Code (o tu editor de código preferido)

---

## Configuración e Instalación

1. Clonar el repositorio:

2. Navegar a la carpeta raíz del proyecto:

3. Instalar las dependencias de Node:
   npm install

---

## Variables de Entorno (Opcional)

Si el frontend requiere conectar con un puerto específico del backend, verifica o crea un archivo .env en la raíz del proyecto con la URL correspondiente:

VITE_API_URL=https://localhost:7000

---

## Ejecución en Entorno de Desarrollo

Para iniciar el servidor local de desarrollo:

npm run dev

Abre tu navegador e ingresa a la dirección informada en la terminal (por defecto: http://localhost:5173).

---

## Pruebas e Interacción con el Backend

1. Asegúrate de haber iniciado primero la API del Backend.
2. Abre la aplicación Frontend en el navegador.
3. Ve a la sección del catálogo en el Dashboard y presiona el botón "Probar backend" para validar la comunicación HTTP activa entre ambas capas.
