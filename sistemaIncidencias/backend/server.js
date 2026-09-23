import express from 'express';
import cors from 'cors';
import apiRouter from './src/routes/index.js';
import morgan from 'morgan';
<<<<<<< HEAD

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


// Ruta raíz de prueba
app.get('/healtcheck', (req, res) => {
  res.json({ mensaje: '¡El servidor está funcionando correctamente!' });
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