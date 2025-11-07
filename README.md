# Muro de Comentarios Anónimos

## Tecnologías Utilizadas

- **Backend**: Node.js con Express
- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **Base de Datos**: MongoDB

## Características

- ✅ Comentarios anónimos
- ✅ API REST para gestionar comentarios
- ✅ Base de datos MongoDB

## Requisitos Previos

- **Docker y Docker Compose instalados** (recomendado) **O**
- Node.js y MongoDB instalados localmente

## Instalación

### Opción 1: Usando Docker Compose (Recomendado) 🐳

Esta opción levanta tanto la aplicación como MongoDB en contenedores Docker.

1. Construir y levantar todos los servicios:

   ```bash
   docker-compose up -d --build
   ```

   Esto construirá la imagen de la aplicación y levantará MongoDB y la app en contenedores.

2. Abrir en el navegador:
   ```
   http://localhost:3000
   ```

¡Listo! La aplicación estará corriendo completamente dockerizada.

### Opción 2: MongoDB Local (Sin Docker)

1. Instalar MongoDB:

   - **Windows/Mac**: Descargar desde [mongodb.com](https://www.mongodb.com/try/download/community)
   - **Linux**: `sudo apt-get install mongodb` o usar el método oficial

2. Iniciar MongoDB:

   ```bash
   # Windows (si está en el PATH)
   mongod
   ```

3. Instalar dependencias del proyecto:

```bash
npm install
```

4. (Opcional) Configurar URI de MongoDB:

   - Por defecto usa: `mongodb://localhost:27017`
   - Para usar otra URI, crear archivo `.env`:

   ```
   MONGODB_URI=mongodb://localhost:27017
   ```

   - O exportar variable de entorno:

   ```bash
   export MONGODB_URI=mongodb://localhost:27017
   ```

5. Iniciar el servidor:

```bash
npm start
```

6. Abrir en el navegador:

```
http://localhost:3000
```

## Estructura del Proyecto

```
proyecto-integrador/
├── server.js          # Servidor Express y API
├── package.json       # Dependencias del proyecto
├── jest.config.js     # Configuración de Jest para tests
├── Dockerfile         # Configuración para dockerizar la app
├── docker-compose.yml # Configuración de servicios (app + MongoDB)
├── .dockerignore      # Archivos a ignorar en la imagen Docker
├── src/               # Código fuente
│   └── utils.js       # Utilidades (normalización, validación)
├── tests/           # Tests automatizados
│   ├── utils.test.js           # Tests unitarios
│   └── api.integration.test.js # Tests de integración
├── public/            # Archivos estáticos
│   ├── index.html     # Página principal
│   ├── style.css      # Estilos
│   └── script.js      # Lógica del frontend
└── README.md          # Este archivo
```

## API Endpoints

- `GET /api/comentarios` - Obtener todos los comentarios
- `POST /api/comentarios` - Crear un nuevo comentario
  - Body: `{ "nombre": "string (opcional)", "mensaje": "string (requerido)" }`

## Base de Datos

- **Base de datos**: `muro_comentarios`
- **Colección**: `comentarios`
- Se crea automáticamente al insertar el primer comentario
- Estructura del documento:
  ```json
  {
    "_id": "ObjectId",
    "nombre": "string",
    "mensaje": "string",
    "fecha": "Date"
  }
  ```

## Testing

La aplicación incluye pruebas automatizadas usando Jest:

### Ejecutar Tests

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch (se re-ejecutan al cambiar archivos)
npm run test:watch

# Ejecutar tests con cobertura
npm run test:coverage
```

### Estructura de Tests

- **Tests Unitarios** (`tests/utils.test.js`):
  - Prueban funciones de utilidad (normalización de nombres, validación de mensajes)
  - 3 suites de tests con múltiples casos
- **Tests de Integración** (`tests/api.integration.test.js`):
  - Prueban los endpoints de la API
  - Verifican la interacción con MongoDB
  - 4 tests de integración

### Requisitos para Tests

Los tests de integración requieren MongoDB corriendo. Puedes usar:

- MongoDB local: `mongodb://localhost:27017`
- O configurar `MONGODB_URI_TEST` para usar otra instancia

## Dockerización

La aplicación está completamente dockerizada:

- **Dockerfile**: Define cómo construir la imagen de la aplicación Node.js
- **docker-compose.yml**: Orquesta múltiples servicios:
  - `app`: Contenedor de la aplicación Node.js (puerto 3000)
  - `mongodb`: Contenedor de MongoDB (puerto 27017)
- Los servicios se comunican a través de una red Docker interna
- La app espera a que MongoDB esté saludable antes de iniciar (healthcheck)

## Notas

- La base de datos y colección se crean automáticamente al insertar el primer comentario
- Los comentarios se ordenan por fecha (más recientes primero)
- Si no se proporciona un nombre, se usa "Anónimo" por defecto
- Los datos de MongoDB se persisten en un volumen de Docker llamado `mongodb_data`
- En Docker Compose, la app se conecta a MongoDB usando el nombre del servicio: `mongodb://mongodb:27017`
- Para desarrollo local sin Docker, usa `mongodb://localhost:27017`
- Para usar MongoDB Atlas (cloud), configura la URI en la variable de entorno `MONGODB_URI` en docker-compose.yml
