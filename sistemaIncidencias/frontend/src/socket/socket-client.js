import { io } from 'socket.io-client';

// Cliente de tiempo real compartido por toda la app.
// Se autentica con el mismo JWT que usa la API REST: el token viaja en el handshake,
// asi el backend puede validar el rol y decidir a que sala (room) pertenece el socket.

const API_URL = import.meta.env.VITE_API_URL;

// Nombres de los eventos emitidos por el backend.
export const EVENTOS = Object.freeze({
    CONECTADO: 'conectado',
    INCIDENCIA_CREADA: 'incidencia:creada',
    INCIDENCIA_ACTUALIZADA: 'incidencia:actualizada',
    INCIDENCIA_FINALIZADA: 'incidencia:finalizada',
    INCIDENCIA_ASIGNADA: 'incidencia:asignada',
    INCIDENCIA_CANCELADA: 'incidencia:cancelada',
    // Evento dirigido solo al empleado de sistemas que recibio la asignacion
    INCIDENCIA_RECIBIDA: 'incidencia:recibida'
});

// Instancia unica compartida por todas las paginas que la importan.
let socket = null;

const obtenerToken = () => sessionStorage.getItem('token');

// Crea (o reutiliza) la conexion con el backend.
// Devuelve null si no hay token: en ese caso no se abre ninguna conexion.
export function conectarSocket() {
    if (socket) return socket;

    const token = obtenerToken();
    if (!token) {
        console.warn('[socket] no hay token en sessionStorage: no se abre la conexion en tiempo real');
        return null;
    }

    socket = io(API_URL, {
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        auth: { token },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000
    });

    socket.on('connect_error', (error) => {
        console.warn('[socket] error de conexion:', error.message);
    });

    socket.on('disconnect', (motivo) => {
        console.warn(`[socket] desconectado: ${motivo}`);
    });

    return socket;
}

// Registra un listener para un evento del backend.
// Devuelve una funcion para quitar el listener (util para limpiar al desmontar).
export function escucharEvento(evento, handler) {
    const conexion = conectarSocket();
    if (!conexion) return () => {};

    conexion.on(evento, handler);
    return () => conexion.off(evento, handler);
}

// Cierra la conexion (se usa al cerrar sesion).
export function desconectarSocket() {
    if (!socket) return;
    socket.disconnect();
    socket = null;
}

// Devuelve la conexion actual sin crearla.
export function obtenerSocket() {
    return socket;
}
