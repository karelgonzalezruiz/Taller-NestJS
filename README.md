# Álbum de Fotos API con NestJS

Desarrollo de una API REST utilizando Node.js y NestJS para la gestión de un álbum de fotos.

El proyecto implementa un servidor HTTP organizado en módulos, controladores y servicios, que expone un CRUD completo con rutas para listar, consultar, crear, actualizar y eliminar fotos, respondiendo siempre en formato JSON con los códigos de estado HTTP correspondientes. Por ahora, los datos se guardan en un arreglo en memoria dentro del servicio, que funciona como una "base de datos" temporal.

A diferencia de una API hecha directamente con Express, NestJS ya trae resueltas varias tareas: interpreta el cuerpo JSON de las peticiones, valida parámetros con *pipes* y convierte las excepciones en respuestas HTTP con el código y el mensaje adecuados.

## Tecnologías utilizadas

- **Node.js** como entorno de ejecución de JavaScript del lado del servidor.
- **NestJS 12** para la creación del servidor, la definición de módulos, controladores y servicios, y la inyección de dependencias.
- **TypeScript 6** para tipar las entidades, los parámetros y las respuestas.
- **ES Modules** (`"type": "module"`), por lo que las importaciones relativas terminan en `.js`.
- **Nest CLI** (`nest start --watch`) para reiniciar el servidor automáticamente al guardar cambios.
- **curl** para probar las rutas de la API desde la terminal.

## Estructura del proyecto

```text
album-api/
├─ src/
│  ├─ fotos/
│  │  ├─ entities/
│  │  │  └─ foto.entity.ts      # Interfaz Foto: forma de cada foto
│  │  ├─ fotos.controller.ts    # Define las rutas /fotos y recibe las peticiones
│  │  ├─ fotos.service.ts       # Lógica del negocio y datos en memoria
│  │  └─ fotos.module.ts        # Agrupa el controlador y el servicio de fotos
│  │
│  ├─ app.module.ts             # Módulo raíz: importa FotosModule
│  └─ main.ts                   # Crea la app, define el prefijo /api e inicia el servidor
│
├─ .vscode/settings.json        # Hace que VS Code use el TypeScript del proyecto
├─ nest-cli.json                # Configuración del Nest CLI
├─ tsconfig.json                # Configuración de TypeScript
├─ package.json                 # Dependencias y scripts del proyecto
└─ .gitignore                   # Excluye node_modules y dist del repositorio
```

## Rutas de la API

| Método | Ruta             | Descripción                  | Respuestas posibles |
| ------ | ---------------- | ---------------------------- | ------------------- |
| `GET`  | `/api/fotos`     | Lista todas las fotos        | `200`               |
| `GET`  | `/api/fotos/:id` | Obtiene una foto por su `id` | `200`, `400`, `404` |
| `POST` | `/api/fotos`     | Crea una nueva foto          | `201`               |
| `PATCH`  | `/api/fotos/:id` | Actualiza solo los campos enviados | `200`, `400`, `404` |
| `DELETE` | `/api/fotos/:id` | Elimina una foto                   | `204`, `400`, `404` |

Cada foto tiene la siguiente forma:

```json
{
  "id": 1,
  "titulo": "Foto 1",
  "descripcion": "Descripción de la foto 1",
  "calificacion": 5
}
```

## Qué hice en el proyecto

### Parte 1: proyecto base

- **Creación del proyecto:**

  Se generó el proyecto con el Nest CLI. El proyecto trabaja con ES Modules, por lo que todas las importaciones relativas usan la extensión `.js` aunque los archivos sean `.ts`.

- **Prefijo global:**

  En `src/main.ts` se creó la aplicación con `NestFactory.create(AppModule)` y se agregó `app.setGlobalPrefix('api')`, de modo que todas las rutas comienzan con `/api`. El servidor escucha en el puerto definido por la variable de entorno `PORT`, o en el `3000` si no existe.

- **Limpieza del módulo raíz:**

  Se eliminaron el controlador y el servicio de ejemplo que trae el proyecto (`app.controller` y `app.service`), y `AppModule` quedó importando únicamente a `FotosModule`.

### Parte 2: módulo de fotos

- **Entidad:**

  En `entities/foto.entity.ts` se definió la interfaz `Foto` con `id`, `titulo`, `descripcion` (opcional) y `calificacion`. Se importa con `import type`, ya que solo se usa para tipar y no existe en tiempo de ejecución.

- **Módulo:**

  `FotosModule` registra a `FotosController` como controlador y a `FotosService` como proveedor, para que Nest pueda inyectar el servicio dentro del controlador.

### Parte 3: servicio

- **Datos en memoria:**

  `FotosService` está marcado con `@Injectable()` y guarda el arreglo privado `fotos` con tres fotos de ejemplo.

- **Métodos:**

  - `findAll()` devuelve el arreglo completo.
  - `findOne(id)` busca la foto con `find()`. Si no existe, lanza `NotFoundException` con el mensaje `Foto X no encontrada`, y Nest la convierte automáticamente en una respuesta `404`.
  - `create(datos)` recibe todos los campos menos el `id` (`Omit<Foto, 'id'>`), le asigna como `id` el mayor `id` existente más uno, la agrega al arreglo y la devuelve.

### Parte 4: controlador y validación del id

- **Rutas:**

  `FotosController` usa `@Controller('fotos')` y recibe el servicio por el constructor. Define `@Get()` para listar, `@Get(':id')` para consultar una foto, `@Post()` para crear, `@Patch(':id')` para actualizar y `@Delete(':id')` para eliminar, tomando el cuerpo con `@Body()`.

- **Validación del parámetro:**

  El `id` se lee con `@Param('id', ParseIntPipe)`. El *pipe* convierte el texto de la URL a número y, si no es un entero, responde `400` con el mensaje `Validation failed (numeric string is expected)` sin llegar a ejecutar el método.

- **Códigos de estado:**

  Nest responde `200` en los `GET` y `PATCH` y `201` en el `POST` sin necesidad de indicarlo. El `DELETE` responde `204` gracias a `@HttpCode(204)` (ver la parte 6).

### Parte 5: errores encontrados y cómo se resolvieron

- **Decorador incompleto:** en `fotos.service.ts` quedó un `@` suelto sin el nombre del decorador, lo que impedía a TypeScript leer el archivo. Se completó con `@Injectable()`.
- **Importaciones a archivos eliminados:** `app.module.ts` seguía importando `app.controller.js` y `app.service.js` después de borrarlos. Se quitaron esas importaciones.
- **"Cannot find module './entities/foto.entity.js'" solo en el editor:** el compilador encontraba el archivo, pero VS Code usaba su propia versión de TypeScript. Se agregó `.vscode/settings.json` con `typescript.tsdk` apuntando a `node_modules/typescript/lib`, y desde la paleta de comandos se eligió **TypeScript: Select TypeScript Version → Use Workspace Version** y luego **TypeScript: Restart TS Server**.
- **Llave de cierre de más:** una `}` después de `findOne` cerraba la clase antes de tiempo y dejaba el método `create` fuera de `FotosService`. Se eliminó esa llave.

### Parte 6: CRUD completo

- **Actualización parcial:**

  Se agregó `update(id, datos)` en `FotosService`. Primero llama a `findOne(id)`, así que si la foto no existe el `404` sale sin escribir código extra. Luego copia sobre la foto únicamente los campos que vienen en `datos` con `Object.assign`; los que no se envían conservan su valor. El `id` se descarta aunque venga en el cuerpo, para que no se pueda modificar. En el controlador se expone con `@Patch(':id')`, que responde `200` con la foto actualizada.

- **Eliminación:**

  Se agregó `remove(id)`, que también reutiliza `findOne(id)` para el `404`. Después obtiene la posición de la foto con `indexOf` y la saca del arreglo con `splice(indice, 1)`. En el controlador se expone con `@Delete(':id')`.

- **Respuesta 204:**

  Por defecto Nest responde `200` en un `DELETE`. Con el decorador `@HttpCode(204)` la ruta responde `204 No Content`, es decir, sin cuerpo, que es lo habitual al eliminar.

- **Corrección del id al crear:**

  Antes, `create` calculaba el nuevo `id` como la cantidad de fotos más uno. Con la eliminación eso repetía ids: con tres fotos, al borrar la `2` quedaban dos, y la siguiente foto recibía el `id 3`, que ya existía. Ahora el nuevo `id` es el mayor `id` existente más uno, por lo que nunca se repite.

### Parte 7: persistencia de los datos

Como el arreglo `fotos` vive dentro del servicio, en la memoria del proceso de Node.js, cada vez que el servidor se reinicia (por ejemplo, al guardar un archivo con `start:dev`) la lista vuelve a las tres fotos iniciales y se pierden las fotos creadas, modificadas o eliminadas. Esto se resolverá usando una base de datos real.

### Verificación del funcionamiento

Con el servidor en ejecución, se probaron las rutas desde PowerShell usando `curl.exe`:

```powershell
# Listar todas las fotos -> 200
curl.exe -s -w " -> %{http_code}\n" http://localhost:3000/api/fotos

# Foto que no existe -> 404
curl.exe -s -w " -> %{http_code}\n" http://localhost:3000/api/fotos/9

# Id que no es número -> 400
curl.exe -s -w " -> %{http_code}\n" http://localhost:3000/api/fotos/abc

# Crear una foto -> 201
curl.exe --% -s -w " -> %{http_code}\n" -X POST -H "Content-Type: application/json" -d "{\"titulo\":\"Cerro\",\"calificacion\":5}" http://localhost:3000/api/fotos

# Actualizar solo la calificación de la foto 1 -> 200
curl.exe --% -s -w " -> %{http_code}\n" -X PATCH -H "Content-Type: application/json" -d "{\"calificacion\":2}" http://localhost:3000/api/fotos/1

# Actualizar una foto que no existe -> 404
curl.exe --% -s -w " -> %{http_code}\n" -X PATCH -H "Content-Type: application/json" -d "{\"titulo\":\"Nuevo\"}" http://localhost:3000/api/fotos/9

# Eliminar la foto 2 -> 204
curl.exe -s -w " -> %{http_code}\n" -X DELETE http://localhost:3000/api/fotos/2

# Eliminar otra vez la foto 2 -> 404
curl.exe -s -w " -> %{http_code}\n" -X DELETE http://localhost:3000/api/fotos/2
```

> En PowerShell se usa `curl.exe` en lugar de `curl`, y `--%` en las peticiones con cuerpo JSON para que las comillas lleguen intactas.

Las rutas `GET` también se pueden abrir directamente en el navegador.

## Ejecución del proyecto

Con Node.js y npm instalados, abrir una terminal dentro de la carpeta del proyecto.

Instalar las dependencias:

```bash
npm install
```

Iniciar el servidor de desarrollo:

```bash
npm run start:dev
```

La API queda disponible en:

```text
http://localhost:3000/api/fotos
```

La terminal debe permanecer abierta mientras se utiliza la API.

> La raíz `http://localhost:3000/` responde `404`, ya que no tiene una ruta definida. Las rutas de la API comienzan con `/api`.

> Como los datos se guardan en memoria, al reiniciar el servidor la lista vuelve a las tres fotos iniciales.

## Autor

Proyecto desarrollado como práctica de Node.js y NestJS.
