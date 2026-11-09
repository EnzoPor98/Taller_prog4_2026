import 'dotenv/config';
import http from 'node:http';
import app from './server.js';
import { inicializarSocket } from './src/socket/socket.js';

const PORT = process.env.PORT || 3000;

// Socket.IO necesita un servidor HTTP real (no alcanza con el app de Express).
const servidor = http.createServer(app);

// Se inicializa el servidor de tiempo real sobre el mismo puerto que la API.
inicializarSocket(servidor);

servidor.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
