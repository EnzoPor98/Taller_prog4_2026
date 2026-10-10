# Sistema de Incidencias

Proyecto del taller de **Programación 4**. Es una app web para que los empleados municipales puedan reportar incidencias, y para que el equipo de sistemas las gestione, asigne y les haga seguimiento.

Tiene dos partes:

- **`/backend`** → API en Node.js + Express, conecta a PostgreSQL.
- **`/frontend`** → UI en HTML/CSS/JS con Vite.

---

## 🧱 Stack

| Capa       | Tecnología                                    |
| ---------- | --------------------------------------------- |
| Backend    | Node.js, Express, `pg`, `jsonwebtoken`, Swagger |
| Frontend   | Vite, Bootstrap, Bootstrap Icons, Font Awesome |
| Base datos | PostgreSQL                                    |

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
│   │   ├── controllers/        # Lógica de cada recurso
│   │   ├── middleware/         # Auth + validaciones
│   │   ├── routes/             # Rutas Express
│   │   └── utils/
│   └── uploads/                # Archivos subidos
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── pages/
│       │   ├── registro/       # Alta de usuarios
│       │   ├── empleadoMunicipal/  # Inicio, Incidencias, Articulos, Perfil
│       │   ├── empleadoSistemas/   # Incidencias, Articulos, Categorias
│       │   └── directorSistemas/   # Dashboard, Asignar, Reportes
│       └── components/         # Navbar y Footer
│
├── incidencias_db.sql          # Dump de la base de datos
└── README.md                   # Este archivo
```

---

## 🚀 Cómo levantarlo

### 1. Base de datos

Necesitás una Postgres corriendo. En el dump `incidencias_db.sql` están las tablas (áreas, artículos, categorías, incidencias, usuarios, archivos, etc.).

Si querés ver la base desde una UI web, en [`backend/config/run.txt`](backend/config/run.txt) está el comando de `pgweb` con Docker.

### 2. Backend

```bash
cd backend
npm install
npm run dev
```

Levanta el servidor en `http://localhost:3000` (configurable con la variable `PORT`).

La API está documentada en **Swagger** en `http://localhost:3000/api-docs`.

Las rutas principales cuelgan de `/api`:

- `/auth` → registro y login (devuelve JWT)
- `/areas`
- `/articulos`
- `/categories`
- `/incidencias`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite te abre la app (por defecto en `http://localhost:5173`).

---

## 🔐 Roles

El sistema maneja 3 roles:

- **Empleado Municipal** → carga y consulta sus propias incidencias.
- **Empleado de Sistemas** → ve todas las incidencias, artículos y categorías.
- **Director de Sistemas** → además asigna incidencias y ve reportes.

---

## 🧪 Endpoints útiles

| Método | Ruta                  | Para qué sirve            |
| ------ | --------------------- | ------------------------- |
| POST   | `/api/auth/register`  | Registrar un usuario nuevo |
| POST   | `/api/auth/login`     | Login (devuelve token)    |
| GET    | `/api/incidencias`    | Listar incidencias        |
| POST   | `/api/incidencias`    | Crear incidencia          |
| GET    | `/api/articulos`      | Listar artículos          |
| GET    | `/api/categories`     | Listar categorías         |
| GET    | `/api/areas`          | Listar áreas              |

---

## 📝 Notas

- Las contraseñas se guardan hasheadas con `pgcrypto` (extensión de Postgres).
- Los endpoints de `/api/*` (salvo `/auth/login` y `/auth/register`) requieren token JWT en el header `Authorization: Bearer <token>`.