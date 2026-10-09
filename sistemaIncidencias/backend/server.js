import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import apiRouter from './src/routes/index.js';
import pool from './config/db.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(
  morgan((tokens, req, res) => {
    const timestamp = new Date().toISOString();
    const method = tokens.method(req, res);
    const endpoint = tokens.url(req, res);
    const status = tokens.status(req, res);
    const responseTime = tokens["response-time"](req, res);

    return `${timestamp} [TFI-PROG-4] ${method} ${endpoint} ${status} ${responseTime} ms`;
  }),
);
app.use(express.static("public"));

// Ruta raíz de prueba
app.get("/healtcheck", (req, res) => {
  res.json({ mensaje: "¡El servidor está funcionando correctamente!" });
});

// ---------------------------------------------------------------------
// -------------------------------------------------- EMPLEADO MUNICIPAL
// ---------------------------------------------------------------------

// TODO: El get del controller hace lo mismo y esta completa la respuesta con los joins-
// BROWSE: OBTIENE TODOS LOS ARTICULOS.
// app.get("/api/articulos", async (req, res) => {
//   try {
//     const sql = "SELECT * FROM public.articulos;";
//     const { rows } = await pool.query(sql);

//     console.log("Articulos obtenidos:", rows);
//     res.status(200).json({ articulos: rows });
//   } catch (error) {
//     console.log(`Paso algo -> ${error}`);
//     res.status(500).json({ error: "Error interno." });
//   }
// });

// READ: OBTIENE UN SOLO ARTICULO.
// app.get("/api/articulos/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const sql = "SELECT * FROM public.articulos WHERE id_articulo = $1";
//     const { rows } = await pool.query(sql, [id]);

//     if (rows.length === 0) {
//       console.log(`Articulo con id ${id} no encontrado.`);
//       return res.status(404).json({ error: "Articulo no encontrado." });
//     }

//     console.log(`Articulo con id ${id} obtenido:`, rows[0]);
//     res.status(200).json(rows[0]);
//   } catch (error) {
//     console.log(`Paso algo -> ${error}`);
//     res.status(500).json({ error: "Error interno." });
//   }
// });

// ---------------------------------------------------------------------

// TODO: Se comenta pq ya esta el metodo http en el controller. 
// FIXME: Agregar logica de filtro ahi(CREADO_POR=4)-
// BROWSE: OBTIENE TODAS LAS INCIDENCIAS DEL USUARIO.
// app.get("/api/incidencias", async (req, res) => {
//   try {
//     const sql = `SELECT 
//                     *
//                 FROM 
//                     public.incidencias
//                 WHERE
//                     creado_por = 4;`;
//     const { rows } = await pool.query(sql);

//     console.log("Incidencias obtenidas:", rows);
//     res.status(200).json({ incidencias: rows });
//   } catch (error) {
//     console.log(`Paso algo -> ${error}`);
//     res.status(500).json({ error: "Error interno." });
//   }
// });

// EDIT: ACTUALIZA UNA INCIDENCIA:
// app.patch("/api/incidencias/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log("🚀 ~ id:", id)
//     const { id_estado } = req.body;
//     console.log("🚀 ~ id_estado:", id_estado)

//     const sql = `
//             UPDATE 
//               public.incidencias 
//             SET 
//               id_estado = $1
//             WHERE 
//               id_incidencia = $2
//             RETURNING *;`;

//     const values = [id_estado, id];

//     const { rows } = await pool.query(sql, values);

//     if (rows.length === 0) {
//       console.log(`Incidencia con id ${id} no encontrada.`);
//       return res.status(404).json({ error: "Incidencia no encontrada" });
//     }

//     console.log(`Incidencia con id ${id} actualizada:`, rows[0]);
//     return res.status(200).json({
//       mensaje: "Incidencia actualizada con éxito",
//       incidencia: rows[0],
//     });
//   } catch (error) {
//     console.log(`Paso algo -> ${error}`);
//     res.status(500).json({ error: "Error al actualizar la incidencia" });
//   }
// });

// ADD: CREA UNA NUEVA INCIDENCIA
// Trasladamos al controller el callback
// FIXME:  Como mejora esto tiene que ir al controller y tener una transaction
// app.post("/api/incidencias", async (req, res) => {
//   try {
//     const {
//       id_articulo,
//       id_estado,
//       creado_por,
//       asignado_a,
//       creado,
//       prioridad,
//       descripcion_pedido,
//       descripcion_resolucion,
//     } = req.body;

//     const sql = `INSERT INTO 
//                   public.incidencias 
//                   (id_articulo, id_estado, creado_por, asignado_a, creado, prioridad, descripcion_pedido, descripcion_resolucion) 
//                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`;

//     const values = [
//       id_articulo,
//       id_estado,
//       creado_por,
//       asignado_a,
//       creado,
//       prioridad,
//       descripcion_pedido,
//       descripcion_resolucion,
//     ];

//     const { rows } = await pool.query(sql, values);

//     res.status(200).json({ incidencias: rows });
//   } catch (error) {
//     console.log(`Paso algo -> ${error}`);
//     res.status(500).json({ error: "Error interno." });
//   }
// });

// ---------------------------------------------------------------------

// Rutas de la API
app.use("/api", apiRouter);

app.use ('/api-docs', 
  swaggerUi.serve , 
  swaggerUi.setup (swaggerSpec)
); // Aquí van las rutas de tu aplicación... app.listen (port, () => { console.log ( ` El servidor se está ejecutando en el puerto ${port} ` ); });


// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Cannot GET ${req.originalUrl}` });
});

// Iniciar el servidor
try {
  await pool.query("SELECT 1"); // Si responde está conectado
  console.log("Conexión exitosa a la base de datos ✅");

  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
} catch (error) {
  console.error("❌ Error al conectar con la base de datos");
  console.error(error.message);
  process.exit(1);
}
