import express from 'express';
import cors from 'cors';
import apiRouter from './src/routes/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(cors());

// Ruta raíz de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: '¡El servidor está funcionando correctamente!' });
});

// Rutas de la API
app.use('/api', apiRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Cannot GET ${req.originalUrl}` });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
