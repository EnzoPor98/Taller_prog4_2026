<<<<<<< HEAD
import express from 'express';
import cors from 'cors';
import apiRouter from './src/routes/index.js';
import morgan from 'morgan';
<<<<<<< HEAD
=======
import express from "express";
import cors from "cors";
import { pool } from "./config/database.js";
>>>>>>> origin/Enzo

=======
import pool from './config/db.js';
>>>>>>> origin/main
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(cors());
app.use(
  morgan((tokens, req, res) => {
    const timestamp = new Date().toISOString();
    const method = tokens.method(req, res);
    const endpoint = tokens.url(req, res);
    const status = tokens.status(req, res);
    const responseTime = tokens['response-time'](req, res);

    return `${timestamp} [TFI-PROG-4] ${method} ${endpoint} ${status} ${responseTime} ms`;
  })
);
<<<<<<< HEAD
=======
app.use(express.static('public'));
>>>>>>> origin/main

<<<<<<< HEAD

// Ruta raíz de prueba
app.get('/healtcheck', (req, res) => {
  res.json({ mensaje: '¡El servidor está funcionando correctamente!' });
=======
// Ruta de prueba básica
app.get("/", (req, res) => {
  res.json({ mensaje: "¡El servidor está funcionando correctamente!" });
});

// ---------------------------------------------------------------------
// -------------------------------------------------- EMPLEADO MUNICIPAL
// ---------------------------------------------------------------------

// BROWSE: OBTIENE TODOS LOS ARTICULOS.
app.get("/src/pages/empleadoMunicipal/Articulos", async (req, res) => {
  try {
    const sql = "SELECT * FROM public.articulos;";
    const { rows } = await pool.query(sql);

    console.log(rows);

    res.status(200).json({ articulos: rows });
  } catch (error) {
    console.log(`Paso algo -> ${error}`);
    res.status(500).json({ error: "Error interno." });
  }
});

// READ: OBTIENE UN SOLO ARTICULO.
app.get("/src/pages/empleadoMunicipal/Articulos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const sql = "SELECT * FROM public.articulos WHERE id_articulo  = $1";
    const { rows } = await pool.query(sql, [id]);

    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error interno." });
  }
});

// LISTA LAS INCIDENCIAS DEL USUARIO.
app.get("/src/pages/empleadoMunicipal/Incidencias", async (req, res) => {
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

app.get("/src/pages/empleadoMunicipal/Perfil", async (req, res) => {
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
>>>>>>> origin/Enzo
});

// Rutas de la API
app.use('/api', apiRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Cannot GET ${req.originalUrl}` });
<<<<<<< HEAD
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
=======
>>>>>>> origin/main
});

try {

  await pool.query('SELECT 1'); //Si responde esta conectado
  console.log('Conexión exitosa a la base de datos ✅ ');

  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
} catch (error) {
  console.error('❌ Error al conectar con la base de datos');
  console.error(error.message);
  process.exit(1);
}