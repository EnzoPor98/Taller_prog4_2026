import 'dotenv/config';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { ROLES } from '../utils/roles.js';

const JWT_SECRET = process.env.JWT_SECRET;

// Salas (rooms) por las que se difunden los eventos.
// Cada socket se une a la sala de su rol y a una sala personal (usuario:<id>).
export const SALAS = Object.freeze({
    DIRECTOR: 'rol:director',
    MUNICIPAL: 'rol:municipal',
    SISTEMAS: 'rol:sistemas'
});

// Todas las salas de rol: se usa para los cambios de incidencia que
// interestan a toda la aplicacion (crear, actualizar, finalizar, asignar, cancelar).
export const SALAS_TODAS = Object.freeze([
    SALAS.DIRECTOR,
    SALAS.MUNICIPAL,
    SALAS.SISTEMAS
]);

// Nombres de los eventos emitidos al frontend.
export const EVENTOS = Object.freeze({
    CONECTADO: 'conectado',
    INCIDENCIA_CREADA: 'incidencia:creada',
    INCIDENCIA_ACTUALIZADA: 'incidencia:actualizada',
    INCIDENCIA_FINALIZADA: 'incidencia:finalizada',
    INCIDENCIA_ASIGNADA: 'incidencia:asignada',
    INCIDENCIA_CANCELADA: 'incidencia:cancelada',
    INCIDENCIA_RECIBIDA: 'incidencia:recibida'
});

// Sala personal de un usuario concreto.
export const salaUsuario = (idUsuario) => `usuario:${idUsuario}`;

// Instancia global del servidor de sockets. Queda en null hasta que se inicializa.
let io = null;

const salaPorRol = (rol) => {
    switch (Number(rol)) {
        case ROLES.DIRECTOR:
            return SALAS.DIRECTOR;
        case ROLES.MUNICIPAL:
            return SALAS.MUNICIPAL;
        case ROLES.SISTEMAS:
            return SALAS.SISTEMAS;
        default:
            return null;
    }
};

// Monta Socket.IO sobre el servidor HTTP de Express.
// La autenticacion se hace con el mismo JWT que usa la API REST:
// el cliente envia el token en el handshake (auth.token o query.token).
export const inicializarSocket = (servidorHttp, opciones = {}) => {
    io = new Server(servidorHttp, {
        path: '/socket.io',
        cors: {
            origin: opciones.origin ?? '*',
            methods: ['GET', 'POST'],
            credentials: false
        },
        // La validacion del token se hace en el middleware io.use(), no aqui
        allowRequest: (req, callback) => callback(null, true)
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth?.token
            || socket.handshake.query?.token;

        if (!token) {
            return next(new Error('Token no proporcionado'));
        }

        try {
            const payload = jwt.verify(token, JWT_SECRET);
            socket.usuario = {
                id: payload.id,
                usuario: payload.usuario,
                rol: payload.rol
            };
            return next();
        } catch {
            return next(new Error('Token invalido o expirado'));
        }
    });

    io.on('connection', (socket) => {
        const { id, usuario, rol } = socket.usuario;

        // Sala personal: permite targeted events (ej: avisarle solo a un usuario)
        socket.join(salaUsuario(id));

        // Sala del rol: el Director recibe los cambios de incidencias
        const sala = salaPorRol(rol);
        if (sala) {
            socket.join(sala);
        }

        socket.emit(EVENTOS.CONECTADO, { id, usuario, rol });

        socket.on('disconnect', (motivo) => {
            console.log(`[socket] usuario ${usuario} (rol ${rol}) desconectado: ${motivo}`);
        });
    });

    console.log('[socket] servidor de tiempo real inicializado en /socket.io');
    return io;
};

// Permite a los servicios/controllers emitir eventos sin conocer la instancia de Socket.IO.
// Si el servidor de sockets todavia no se inicializo, no rompe la peticion HTTP.
export const emitirEvento = (evento, payload, sala = SALAS.DIRECTOR) => {
    if (!io) {
        console.warn(`[socket] evento "${evento}" descartado: el servidor de sockets no esta inicializado`);
        return false;
    }

    io.to(sala).emit(evento, payload);
    console.log(`[socket] evento "${evento}" emitido en "${sala}"`);
    return true;
};

// Emite el mismo evento a varias salas (por ejemplo, Director y Sistemas).
export const emitirEventoEnSalas = (evento, payload, salas) => {
    if (!io) {
        console.warn(`[socket] evento "${evento}" descartado: el servidor de sockets no esta inicializado`);
        return false;
    }

    for (const sala of salas) {
        io.to(sala).emit(evento, payload);
    }
    console.log(`[socket] evento "${evento}" emitido en ${salas.join(', ')}`);
    return true;
};

// Emite un evento solo a un usuario concreto (usa la sala personal "usuario:<id>").
// Se usa, por ejemplo, para avisarle al empleado de sistemas que recibio una asignacion.
export const emitirEventoAUsuario = (evento, payload, idUsuario) => {
    if (!io) {
        console.warn(`[socket] evento "${evento}" descartado: el servidor de sockets no esta inicializado`);
        return false;
    }

    if (!idUsuario) {
        console.warn(`[socket] evento "${evento}" descartado: no hay usuario destino`);
        return false;
    }

    const sala = salaUsuario(idUsuario);
    io.to(sala).emit(evento, payload);
    console.log(`[socket] evento "${evento}" emitido al usuario ${idUsuario} (${sala})`);
    return true;
};

// Permite a las pruebas o al cierre del servidor liberar la instancia.
export const obtenerIo = () => io;
