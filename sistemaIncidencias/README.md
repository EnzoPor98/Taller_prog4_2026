# Sistema de Incidencias

Proyecto del taller de **Programación 4**. Es una app web para que los empleados municipales puedan reportar incidencias, y para que el equipo de sistemas las gestione, asigne y les haga seguimiento.

Tiene dos partes:

- **`/backend`** → API en Node.js + Express, conecta a PostgreSQL.
- **`/frontend`** → UI en HTML/CSS/JS con Vite.

---

## 🧱 Stack

| Capa       | Tecnología                                    |
| ---------- | --------------------------------------------- |
| Backend    | Node.js, Express, `pg`, `jsonwebtoken`, `express-validator`, Morgan, Multer, Swagger |
| Reportes y mails | Handlebars (plantillas), Puppeteer (PDF), Nodemailer (mails, SMTP) |
| Frontend   | Vite, Bootstrap, Bootstrap Icons, Chart.js     |
| Base datos | PostgreSQL en Supabase (dev), o local          |
| Mails dev  | Mailpit (Docker)                               |

---

## 📂 Estructura

```
sistemaIncidencias/
├── backend/
│   ├── server.js               # Entry point del servidor
│   ├── swagger.js              # Documentación de la API
│   ├── config/
│   │   ├── db.js               # Conexión a Postgres (usa .env)
│   │   └── run.txt             # Comandos útiles (ej: docker pgweb)
│   ├── src/
│   │   ├── routes/             # Rutas Express + validaciones + docs Swagger
│   │   ├── controllers/        # Reciben la request y arman la respuesta
│   │   ├── services/           # Reglas de negocio, transacciones, mails y PDF
│   │   ├── repositories/       # Consultas SQL
│   │   ├── middleware/         # Auth (token y roles), validaciones, upload
│   │   ├── templates/          # Plantillas Handlebars (emails/ y reportes/)
│   │   └── utils/              # Constantes (roles, estados), fechas, errores
│   └── .env-example            # Variables de entorno necesarias
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── pages/
│       │   ├── registro/       # Alta de usuarios
│       │   ├── empleadoMunicipal/  # Inicio, Incidencias, Articulos, Perfil
│       │   ├── empleadoSistemas/   # Incidencias, Articulos, Categorias
│       │   └── directorSistemas/   # Dashboard, Incidencias (asignar/cancelar), Reportes
│       └── components/         # Navbar y Footer
│
└── README.md                   # Este archivo
```

---

## 🚀 Cómo levantarlo

### 1. Base de datos

En desarrollo se usa la base **compartida en Supabase**: definir `DATABASE_URL` en `backend/.env` con la cadena de conexión del proyecto (pedírsela al equipo, no se sube al repo). Con `DATABASE_URL` definida, [`backend/config/db.js`](backend/config/db.js) se conecta a Supabase con SSL e ignora las variables `DB_*`.

```env
DATABASE_URL=postgresql://usuario:password@host:6543/postgres
```

#### Alternativa: PostgreSQL local (sin `DATABASE_URL`)

Si no tenés la `DATABASE_URL` de Supabase, podés levantar la base en tu Postgres local importando el dump que está en la raíz del proyecto. Trae la extensión `pgcrypto`, todas las tablas y datos de prueba.

1. Crear la base e importar el dump:

   ```bash
   createdb -U postgres incidencias_db
   psql -U postgres -d incidencias_db -f incidencias_db.sql
   ```

   > `incidencias_db_export.sql` es el mismo dump pero hace `DROP` de las tablas antes de crearlas. Usalo si querés reimportar sobre una base que ya existe (se pierden los datos que tenga).
   >
   > Si `psql` tira error con la línea `\restrict`, actualizá el cliente de PostgreSQL o borrá las líneas `\restrict` y `\unrestrict` del archivo.

2. En `backend/.env`, dejar `DATABASE_URL` comentada o sin definir y completar los datos de conexión:

   ```env
   # DATABASE_URL=...
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=tu_password
   DB_NAME=incidencias_db
   ```

Si querés ver la base local desde una UI web, en [`backend/config/run.txt`](backend/config/run.txt) está el comando de `pgweb` con Docker.

### 2. Mailpit (mails de desarrollo)

Los mails (por ejemplo, el aviso al cancelar una incidencia) se capturan con **Mailpit** en Docker, así no salen a casillas reales:

```bash
cd backend
docker compose up -d        # levanta el contenedor incidencias-mailpit
```

- Bandeja web: http://localhost:8025
- SMTP: `localhost:1025`, sin usuario ni contraseña (ya viene así en `.env-example`).

Para ver logs o apagarlo:

```bash
docker compose logs -f mailpit
docker compose down
```

### 3. Backend

```bash
cd backend
cp .env-example .env      # y completar los valores
npm install
npx puppeteer browsers install chrome   # una sola vez: descarga el Chrome que usa el reporte PDF
npm run dev
```

Levanta el servidor en `http://localhost:3000` (configurable con la variable `PORT`).

La API está documentada en **Swagger** en `http://localhost:3000/api-docs`.

Las rutas principales cuelgan de `/api`:

- `/auth` → registro y login (devuelve JWT)
- `/areas`
- `/articulos`
- `/categorias`
- `/incidencias`
- `/usuarios`

### 4. Frontend

```bash
cd frontend
cp .env-example .env      # VITE_API_URL=http://localhost:3000
npm install
npm run dev
```

Vite te abre la app (por defecto en `http://localhost:5173`).

---

## 🔐 Roles

El sistema maneja 3 roles (columna `usuarios.rol`):

| Rol | Valor | Qué puede hacer |
| --- | ----- | --------------- |
| **Director de Sistemas** | 1 | Dashboard, asigna incidencias a empleados de sistemas, cancela incidencias pendientes y genera el reporte PDF. |
| **Empleado Municipal** | 2 | Lista artículos, carga incidencias, consulta las propias y cancela las propias pendientes. |
| **Empleado de Sistemas** | 3 | Ve las incidencias asignadas, las finaliza y administra artículos y categorías. |

Estados de una incidencia: `1` Pendiente → `2` En Proceso (al asignarla) → `3` Resuelta, o `4` Cancelada (solo desde Pendiente). Cada cambio queda registrado en `incidencias_estados`.

---

## 🧪 Endpoints útiles

| Método | Ruta                  | Para qué sirve            |
| ------ | --------------------- | ------------------------- |
| POST   | `/api/auth/register`  | Registrar un usuario nuevo |
| POST   | `/api/auth/login`     | Login (devuelve token)    |
| GET    | `/api/incidencias`    | Listar incidencias        |
| POST   | `/api/incidencias`    | Crear incidencia          |
| GET    | `/api/articulos`      | Listar artículos          |
| GET    | `/api/categorias`     | Listar categorías         |
| GET    | `/api/areas`          | Listar áreas              |

### Endpoints del Director (rol 1)

| Método | Ruta | Para qué sirve |
| ------ | ---- | -------------- |
| GET    | `/api/incidencias/datos-dashboard?desde=&hasta=` | Totales por estado, incidencias por día (30 días por defecto) y prioritarias abiertas |
| GET    | `/api/incidencias/informe?desde=&hasta=&estado=` | Reporte estadístico en PDF (Handlebars + Puppeteer) |
| PUT    | `/api/incidencias/:id/asignar` | Asignar a un empleado de sistemas (`{ "asignado_a": 2 }`); pasa a En Proceso |
| PUT    | `/api/incidencias/:id/cancelar` | Cancelar una incidencia pendiente y avisar por mail al creador (también la usa el empleado municipal con las propias) |
| GET    | `/api/usuarios?rol=3` | Empleados de sistemas activos para asignar |

---

## 📝 Notas

- Las contraseñas se guardan hasheadas con `pgcrypto` (extensión de Postgres).
- Los endpoints de `/api/*` (salvo `/auth/login` y `/auth/register`) requieren token JWT en el header `Authorization: Bearer <token>`.
- El token incluye el rol del usuario y el middleware `autorizarUsuarios([...])` controla qué roles pueden usar cada ruta. Si se inició sesión con una versión anterior, hay que volver a loguearse.
- Asignar y cancelar se ejecutan en una transacción (`BEGIN`/`COMMIT`) y bloquean la incidencia con `SELECT ... FOR UPDATE`; el mail se envía después del `COMMIT`.
- Los mails se envían por SMTP con Nodemailer (variables `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`). En desarrollo se usa Mailpit (ver [paso 2](#2-mailpit-mails-de-desarrollo)). Si el envío falla, la operación se guarda igual y la respuesta indica `notificado: false`.