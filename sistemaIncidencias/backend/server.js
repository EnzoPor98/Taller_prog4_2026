import express from "express";
import cors from "cors";
import { pool } from "./config/database.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para leer datos en formato JSON
app.use(express.json());
app.use(cors());

// Ruta de prueba básica
app.get("/", (req, res) => {
  res.json({ mensaje: "¡El servidor está funcionando correctamente!" });
});

// ---------------------------------------------------------------------
// -------------------------------------------------- EMPLEADO MUNICIPAL
// ---------------------------------------------------------------------

// BROWSE: OBTIENE TODOS LOS ARTICULOS.
app.get("/api/articulos", async (req, res) => {
  try {
    const sql = "SELECT * FROM public.articulos;";
    const { rows } = await pool.query(sql);

    res.status(200).json({ articulos: rows });
  } catch (error) {
    res.status(500).json({ error: "Error interno." });
  }
});

// READ: OBTIENE UN SOLO ARTICULO.
app.get("/api/articulos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const sql = "SELECT * FROM public.articulos WHERE id_articulo = $1";
    const { rows } = await pool.query(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Articulo no encontrado." });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error interno." });
  }
});

// BROWSE: LISTA LAS INCIDENCIAS DEL USUARIO.
app.get("/api/incidencias", async (req, res) => {
  try {
    const sql = `SELECT 
                    *
                FROM 
                    public.incidencias
                WHERE
                    creado_por = 4;`;
    const { rows } = await pool.query(sql);

    console.log(rows);

    res.status(200).json({ incidencias: rows });
  } catch (error) {
    console.log(`Paso algo -> ${error}`);
    res.status(500).json({ error: "Error interno." });
  }
});

// READ: OBTIENE DATOS DEL USUARIO.
app.get("/api/perfil", async (req, res) => {
  try {
    const sql = `SELECT 
                    id_usuario,
                    id_area,
                    nombres,
                    apellidos,
                    usuario,

                    rol
                FROM 
                    public.usuarios
                WHERE
                    id_usuario = 4;`;
    const { rows } = await pool.query(sql);

    console.log(rows);

    res.status(200).json({ usuario: rows });
  } catch (error) {
    console.log(`Paso algo -> ${error}`);
    res.status(500).json({ error: "Error interno." });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
