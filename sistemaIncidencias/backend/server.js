import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para leer datos en formato JSON
app.use(express.json());
app.use(cors());


// Ruta de prueba básica
app.get('/', (req, res) => {
  res.json({ mensaje: '¡El servidor está funcionando correctamente!' });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
